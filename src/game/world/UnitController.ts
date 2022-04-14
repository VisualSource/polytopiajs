import InstancedObject from "./rendered/InstancedObject";
import { Color } from "three";
import {SystemEvents, UnitEvent, ObjectEvents, ActionEvent} from '../events/systemEvents';
import { nanoid } from "nanoid";
import EventEmitter from "../core/EventEmitter";
import { Unit } from "./Unit";
import { chebyshev_distance } from "../../utils/math";

import type { Position, Tribe, UUID, UnitType } from "../core/types";
import type { VariantGLTF } from "../loaders/KHR_Variants";
import type { SystemEventListener } from "../core/EventEmitter";
import type Game from "../core/Game";

export default class UnitController implements SystemEventListener {
    private readonly ACCELERATOR: number = 4.5;
    public events: EventEmitter = new EventEmitter();
    private mesh_movement: InstancedObject;
    private mesh_attack: InstancedObject;
    constructor(private game: Game){
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
        const attacker = this.game.engine.scenes.unit.getUnit(event.data.attacker);
        const defender = this.game.engine.scenes.unit.getUnit(event.data.defender);
        if(!attacker || !defender) return;
      //  console.log("ATTACK",event.data, attacker,defender);

        const defenderTile = this.game.world.level.get(defender.position.row,defender.position.col);
        if(!defenderTile) return;

        /**
         * @see <https://frothfrenzy.github.io/polytopiacalculator/>
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
        const unit = this.game.engine.scenes.unit.getUnit(event.data.unit);
        if(!unit) return;
        if(unit.tribe !== this.game.players.active.value.tribe) return;

        this.generateMovementArea(event.data.unit);
        this.generateAttackArea(unit.position,unit.range,unit.uuid);
    }
    private eventHide = () => {
        this.hideMovement();
        this.hideAttack();
    }
    public async init(): Promise<void> {
        try {
            const data = this.game.assets.getVarient("SELECTOR") as VariantGLTF;
    
            const mesh = data.scene.children[0].clone() as THREE.Mesh;

            data.functions.copyVariantMaterials(mesh,data.scene.children[0] as THREE.Mesh);
            await data.functions.selectVariant(mesh,"UnitSelector");

            let movement_mat = (mesh.material as THREE.MeshPhongMaterial).clone();
            movement_mat.color = new Color("blue");

            let attack_mat = (mesh.material as THREE.MeshPhongMaterial).clone();
            attack_mat.color = new Color("red")

            this.mesh_movement = new InstancedObject("SELECTOR_MOVEMENT",mesh.geometry,movement_mat,[]);
            this.mesh_attack = new InstancedObject("SELECTOR_ATTACK",mesh.geometry, attack_mat,[]);
            this.game.engine.scenes.selector.add(this.mesh_movement,this.mesh_attack);
        } catch (error) {
            console.error(error);
        }
    }
    public destoryUnit(id: UUID){
        const unit = this.game.engine.scenes.unit.getUnit(id);
        if(!unit) return;
        this.game.world.level.get(unit.position.row,unit.position.col).setUnit();
        unit.destory();
    }
    public async createUnit(tribe: Tribe, type: UnitType, position: Position, orgin: UUID){
        const unit = Unit.createNew(this.game.engine,this.game.assets,this.game.players, { type, tribe, position, orgin });
        const tile = this.game.world.level.get(position.row,position.col).setUnit(unit.uuid);
        await unit.render(tile.uuid);
        return unit;
    }
    public moveUnit(id: UUID, pos: Position) {
        const unit = this.game.engine.scenes.unit.getUnit(id);
        if(!unit) return;
        const tile = this.game.world.level.get(pos.row,pos.col);
        tile.setUnit(unit.uuid);
        this.game.world.level.get(unit.position.row,unit.position.col).setUnit(null);
        unit.setPostion(tile.uuid,pos);
        unit.hasMoved = true;

        const range = unit.skills.includes("SCOUT") ? 2 : 1;

        for(let i = -range; i <= range; i++) {
            for(let j = -range; j <= range; j++) {
                let row = pos.row + i;
                let col = pos.col + j;
                const data = this.game.world.level.isValid(row,col);

                if(!data || data.visible ) continue;

                this.game.fog.updateFog(row,col,1);
            }
        }
    }
    public healUnit(id: UUID): void {
        const unit = this.game.engine.scenes.unit.getUnit(id);
        if(!unit || !(unit.health > unit.maxHealth) ) return;

        let healRate = 2;
        if(this.game.world.level.get(unit.position.row,unit.position.col).owning_tribe === unit.tribe) {
            healRate = 4;
        }
        unit.heal(healRate);
    }
    public generateBootArea(center: Position, range: number, unit_uuid: UUID, bootID: ActionEvent) {
        const self = this.game.engine.scenes.unit.getUnit(unit_uuid);
        if(!self) return;

        // hide tiles
        // remove past tile data

        for(let i = -range; i <= range; i++) {
            for(let j = -range; j <= range; j++) {
                let row = center.row + i;
                let col = center.col + j;
                const data = this.game.world.level.isValid(row,col);

                if(!data || (i === 0 && j === 0) || !data.unit || !data.visible ) continue;

                const friend = this.game.engine.scenes.unit.getUnit(data.unit);
                if(!friend || (friend.tribe !== self.tribe) ) continue;

                // generate mesh.

                this.game.world.level.get(row,col).override = {
                    type: SystemEvents.ACTION,
                    id: bootID,
                    data: {
                        tile: this.game.world.level.get(row,col).uuid
                    }
                };

            }
        }

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

        const unit = this.game.engine.scenes.unit.getUnit(unit_uuid);
        if(!unit || !unit.canMove()) return;
        const center = unit.position;
        const unitOnRoad = this.game.world.level.get(unit.position.row,unit.position.col).road;
    
        //reset
        this.hideMovement();
        this.mesh_movement.removeAll();

        for(let i = 0; i <= this.game.world.level.size; i++) {
            for(let j = 0; j <= this.game.world.level.size; j++){
                const data = this.game.world.level.isValid(i, j);
                if(!data || !data.visible) continue;
                let roadModifer = 1;
                // only works on a frendly or nuture road
                if(data.road && unitOnRoad && (data.owning_tribe === null || data.owning_tribe === unit.tribe)) roadModifer  = 0.5;

                const dis = chebyshev_distance(center,{row: i, col: j}) * roadModifer;

                if(!(dis <= 1) || (dis === 0) || data.unit || !unit.vaild_terrian.includes(data.base.type)) continue;

                this.mesh_movement.createInstance({
                    id: nanoid(10),
                    owner: data.uuid,
                    rotation: 0,
                    shown: true,
                    type: "tile",
                    x: i,
                    z: j,
                    y: 0
                });
                this.game.world.level.get(i,j).override = {
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
        const self = this.game.engine.scenes.unit.getUnit(unit_uuid);
        if(!self || !self.canAttack()) return;

        this.hideAttack();
        this.mesh_attack.removeAll();

        for(let i = -range; i <= range; i++) {
            for(let j = -range; j <= range; j++){
                let row = center.row + i;
                let col = center.col + j;
                const data = this.game.world.level.isValid(row, col);
                // 0,0 is the center
                if(!data || (i === 0 && j === 0) || !data.unit || !data.visible ) continue;

                const enemy = this.game.engine.scenes.unit.getUnit(data.unit);
                if(!enemy || (enemy.tribe === self.tribe) ) continue;

                
                this.mesh_attack.createInstance({
                    id: nanoid(10),
                    owner: data.uuid,
                    rotation: 0,
                    shown: true,
                    type: "tile",
                    x: row,
                    z: col,
                    y: 0
                });
                this.game.world.level.get(row,col).override = {
                    type: SystemEvents.UNIT,
                    id: UnitEvent.ATTACK,
                    data: {
                        attacker: self.uuid,
                        defender: enemy.uuid
                    }
                };
                
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
    public setUnitVisibility(id: UUID, visable: boolean){
        const unit = this.game.engine.scenes.unit.getUnit(id);
        if(!unit) {
            console.error(`No unit with id (${id}) exists`);
            return;
        }
        unit.visible = visable;
    }
}