import type Engine from "../core/Engine";
import type { Position, Tribe, UUID } from "../core/types";
import type AssetLoader from "../loaders/AssetLoader";
import type World from "./World";
import type { VariantGLTF } from "../loaders/KHR_Variants";
import InstancedObject from "./rendered/InstancedObject";
import { Color } from "three";
import {SystemEvents, UnitEvent, ObjectEvents} from '../events/systemEvents';
import { nanoid } from "nanoid";
import type { SystemEventListener } from "../core/EventEmitter";
import EventEmitter from "../core/EventEmitter";
import { Unit } from "./Unit";
import { chebyshev_distance } from "../../utils/math";
import type PlayerController from "../managers/PlayerController";

export default class UnitController implements SystemEventListener {
    private readonly ACCELERATOR: number = 4.5;
    public events: EventEmitter = new EventEmitter();
    private mesh_movement: InstancedObject;
    private mesh_attack: InstancedObject;
    constructor(private engine: Engine, private assets: AssetLoader, private world: World, private player: PlayerController){
        this.events.onId<SystemEvents,ObjectEvents>({name: SystemEvents.INTERACTION, id: ObjectEvents.RESET }, this.eventHide);
        this.events.on(SystemEvents.UNIT,event=>{
            switch (event.id) {
                case UnitEvent.ATTACK:
                    return this.eventAttack(event);
                case UnitEvent.MOVE:
                   return this.eventMove(event);
                case UnitEvent.GENERATE:
                    return this.eventGenerate(event);
                case UnitEvent.HIDE_SELECTOR: 
                    return this.eventHide();
                default:
                    break;
            }
        });
    }
    private eventAttack(event: any){
        const attacker = this.world.units.get(event.data.attacker);
        const defender = this.world.units.get(event.data.defender);
        if(!attacker || !defender) return;
      //  console.log("ATTACK",event.data, attacker,defender);

        const defenderTile = this.world.level.get(defender.position.row,defender.position.col);
        if(!defenderTile) return;

        /**
         * @see https://frothfrenzy.github.io/polytopiacalculator/
         * @summary uses the same formula posted by the developer on the game wikia forums some time ago.
         */
        const attackForce = attacker.attack * (attacker.health / attacker.maxHealth);
        const defenseForce = defender.defence * (defender.health / defender.maxHealth) * defenderTile.terrainBouns();
        const totalDamage = attackForce + defenseForce;

        const attackResult = Math.round((attackForce / totalDamage) * attacker.attack * this.ACCELERATOR);
        const defenseResult = Math.round((defenseForce / totalDamage) * defender.defence * this.ACCELERATOR);
        
   
        const defenderHealth = defender.health - defenseResult;

        if(defenderHealth <= 0) {
            console.log("Kill unit");
            const pos = defender.position;
            this.destoryUnit(defender.uuid)
            this.moveUnit(attacker.uuid,pos);
        } else {
            defender.health = defenderHealth;
            attacker.health -= attackResult;
        }
   
       // console.log("Attack Result", attackResult, "Health", attacker.health, "Defense Result",defenseResult, "Health",defender.health);
        attacker.hasAttacked = true;
        this.events.emit<SystemEvents,ObjectEvents>({type: SystemEvents.INTERACTION, id: ObjectEvents.RESET, data: { uuid: null } });
        this.events.emit<SystemEvents,ObjectEvents>({ type: SystemEvents.INTERACTION, id: ObjectEvents.DESELECTION, data: { unit_deselection: true } });
    }
    private eventMove(event: any){
        this.moveUnit(event.data.unit,event.data.to);
        this.events.emit<SystemEvents,ObjectEvents>({type: SystemEvents.INTERACTION, id: ObjectEvents.RESET, data: { uuid: null } });
        this.events.emit<SystemEvents,ObjectEvents>({ type: SystemEvents.INTERACTION, id: ObjectEvents.DESELECTION, data: { unit_deselection: true } });
    }
    private eventGenerate(event: any){
        const unit = this.world.units.get(event.data.unit);
        if(!unit) return;
        if(unit.tribe !== this.player.activePlayer) return;

        this.generateMovementArea(event.data.unit);
        this.generateAttackArea(unit.position,unit.range,unit.uuid);
    }
    private eventHide = () => {
        this.hideMovement();
        this.hideAttack();
    }
    public async init(): Promise<void> {
        try {
            const data = await this.assets.getVarient("SELECTOR") as VariantGLTF;
    
            const mesh = data.scene.children[0].clone() as THREE.Mesh;

            data.functions.copyVariantMaterials(mesh,data.scene.children[0] as THREE.Mesh);
            await data.functions.selectVariant(mesh,"UnitSelector");

            let movement_mat = (mesh.material as THREE.MeshPhongMaterial).clone();
            movement_mat.color = new Color("blue");

            let attack_mat = (mesh.material as THREE.MeshPhongMaterial).clone();
            attack_mat.color = new Color("red")

            this.mesh_movement = new InstancedObject("SELECTOR_MOVEMENT",mesh.geometry,movement_mat,[]);
            this.mesh_attack = new InstancedObject("SELECTOR_ATTACK",mesh.geometry, attack_mat,[]);
            this.engine.scene.add(this.mesh_movement,this.mesh_attack);
        } catch (error) {
            console.error(error);
        }
    }
    public destoryUnit(id: UUID){
        const unit = this.world.units.get(id);
        if(!unit) return;
        this.world.level.get(unit.position.row,unit.position.col).setUnit();
        unit.destory();
        this.world.units.delete(id);
    }
    public async createUnit(tribe: Tribe, type: string, position: Position){
        const unit = Unit.createNew(this.engine,this.assets,this.world.players, { type, tribe, position });
        this.world.units.set(unit.uuid,unit);
        const tile = this.world.level.get(position.row,position.col).setUnit(unit.uuid);
        await unit.render(tile.uuid);
        return unit;
    }
    public moveUnit(id: UUID, pos: Position) {
        const unit = this.world.units.get(id);
        if(!unit) return;
        const tile = this.world.level.get(pos.row,pos.col);
        tile.setUnit(unit.uuid);
        this.world.level.get(unit.position.row,unit.position.col).setUnit(null);
        unit.setPostion(tile.uuid,pos);
        unit.hasMoved = true;
    }
    /**
     *
     * @see https://polytopia.fandom.com/wiki/Movement
     * @param {UUID} unit_uuid
     * @memberof UnitController
     */
    public generateMovementArea(unit_uuid: UUID){
        /** 
        @see https://polytopia.fandom.com/wiki/Movement#Terrain
        Certain types of terrain impact movement. 
        Forests without roads and mountains block movement. 
        Units cannot move through them (they can move onto them, but no further in the same turn). 
        Also, units cannot move into clouds (the fog of war).

        Most land units moving into a port will be turned into Boats and will be unable to perform actions for the rest of that turn, 
        even if they had excess movement points or had not attacked. 
        However, units with the float or Fly skills are not affected. 
        */

        const unit = this.world.units.get(unit_uuid);
        if(!unit || !unit.canMove()) return;
        const center = unit.position;
        const unitOnRoad = this.world.level.get(unit.position.row,unit.position.col).road;
    
        //reset
        this.hideMovement();
        this.mesh_movement.removeAll();

        for(let i = 0; i <= this.world.level.size; i++) {
            for(let j = 0; j <= this.world.level.size; j++){
                const data = this.world.level.isValid(i, j);
                if(!data) continue;
                let roadModifer = 1;
                // only works on a frendly or nuture road
                if(data.road && unitOnRoad && (data.owning_tribe === null || data.owning_tribe === unit.tribe)) roadModifer  = 0.5;

                const dis = chebyshev_distance(center,{row: i, col: j}) * roadModifer ;

                if(!(dis <= 1) || (dis === 0) || data.unit || !unit.vaild_terrian.includes(data.base.type)) continue;

                
                this.mesh_movement.createInstance({
                    index: 0,
                    id: nanoid(10),
                    owner: data.uuid,
                    rotation: 0,
                    shown: true,
                    type: "tile",
                    x: i,
                    z: j,
                    y: 0
                });
                this.world.level.get(i,j).override = {
                    type: SystemEvents.UNIT,
                    id: UnitEvent.MOVE,
                    data: {
                        to: { row: i , col: j},
                        unit: unit_uuid
                    }
                };
    
            }
        }

        this.mesh_movement.visible = true;
    }
    public generateAttackArea(center: Position, range: number, unit_uuid: UUID){
        const self = this.world.units.get(unit_uuid);
        if(!self || !self.canAttack()) return;

        this.hideAttack();
        this.mesh_attack.removeAll();

        for(let i = -range; i <= range; i++) {
            for(let j = -range; j <= range; j++){
                let row = center.row + i;
                let col = center.col + j;
                const data = this.world.level.isValid(row, col);
                // 0,0 is the center
                if(!data || (i === 0 && j === 0) || !data.unit ) continue;

                const enemy = this.world.units.get(data.unit);
                if(!enemy) continue;

                if(enemy.tribe !== self.tribe) {
                    this.mesh_attack.createInstance({
                        index: 0,
                        id: nanoid(10),
                        owner: data.uuid,
                        rotation: 0,
                        shown: true,
                        type: "tile",
                        x: row,
                        z: col,
                        y: 0
                    });
                    this.world.level.get(row,col).override = {
                        type: SystemEvents.UNIT,
                        id: UnitEvent.ATTACK,
                        data: {
                            attacker: self.uuid,
                            defender: enemy.uuid
                        }
                    };
                }
            }
        }

        this.mesh_attack.visible = true;
    }
    public hideMovement(){
        this.mesh_movement.visible = false;
    }
    public hideAttack(){
        this.mesh_attack.visible = false;
    }
}