import type Engine from "../core/Engine";
import type { Position, UUID } from "../core/types";
import type AssetLoader from "../loaders/AssetLoader";
import type World from "./World";
import type { VariantGLTF } from "../loaders/KHR_Variants";
import InstancedObject from "./rendered/InstancedObject";
import { Color } from "three";
import {SystemEvents, UnitEvent, ObjectEvents} from '../events/systemEvents';
import { nanoid } from "nanoid";
import type { SystemEventListener } from "../core/EventEmitter";
import EventEmitter from "../core/EventEmitter";

export default class UnitController implements SystemEventListener {
    public events: EventEmitter = new EventEmitter();
    private mesh_movement: InstancedObject;
    private mesh_attack: InstancedObject;
    constructor(private engine: Engine, private assets: AssetLoader, private world: World){
        this.events.onId<SystemEvents,ObjectEvents>({name: SystemEvents.INTERACTION, id: ObjectEvents.RESET }, (event)=>{
            this.hideMovement();
            this.hideAttack();
        });
        // handle unit movement and unit attacks here
        this.events.on(SystemEvents.UNIT,event=>{
            switch (event.id) {
                case UnitEvent.ATTACK:{
                    console.log("ATTACK",event.data);
                    break;
                }
                case UnitEvent.MOVE:{
                    this.world.level.get(event.data.from.row,event.data.from.col).setUnit();
                    this.world.level.get(event.data.to.row,event.data.to.col).setUnit(event.data.unit);
                    this.events.emit<SystemEvents,ObjectEvents>({type: SystemEvents.INTERACTION, id: ObjectEvents.RESET, data: { uuid: null } });
                    this.events.emit<SystemEvents,ObjectEvents>({ type: SystemEvents.INTERACTION, id: ObjectEvents.DESELECTION, data: { unit_deselection: true } });
                    const id = this.world.level.get(event.data.to.row,event.data.to.col);
                    this.world.units.get(event.data.unit)?.setPostion(id.uuid,id.position);
                    console.log("MOVE",event.data);
                    break;
                }
                case UnitEvent.GENERATE: {
                    const unit = this.world.units.get(event.data.unit);
                    if(!unit) break;
                    this.generateMovementArea(unit.position,unit.vaild_terrian,unit.uuid,unit.movement);
                    break;
                }
                case UnitEvent.HIDE_SELECTOR: {
                    this.hideMovement();
                    break;
                }
                default:
                    break;
            }
        });
    }
    async init(): Promise<void> {
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
    public generateMovementArea(center: Position, vaild_terrian: string[], unit_uuid: UUID, range: number){

        this.hideMovement();

        this.mesh_movement.removeAll();

       // debugger;

        for(let i = -range; i <= range; i++) {
            for(let j = -range; j <= range; j++){
                let row = center.row + i;
                let col = center.col + j;
                const data = this.world.level.isValid(row, col);

                // 0,0 is the center
                if(!data || (i === 0 && j === 0) ) continue;

                if(vaild_terrian.includes(data.base.type)){
                    this.mesh_movement.createInstance({
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
                        id: UnitEvent.MOVE,
                        data: {
                            from: center,
                            to: {col,row},
                            unit: unit_uuid
                        }
                    };
                }
            }
        }


        this.mesh_movement.visible = true;
    }
    public generateAttackArea(center: Position, range: number, unit_uuid: UUID){
        const self = this.world.units.get(unit_uuid);
        if(!self) return;

        for(let i = -range; i < range; i++) {
            for(let j = -range; j < range; j++){
                let row = center.row + i;
                let col = center.col + j;
                const data = this.world.level.isValid(row, col);
                // 0,0 is the center
                if(!data || (i === 0 && j === 0) || !data.unit ) continue;

                const unit = this.world.units.get(data.unit);
                if(!unit) continue;

                if(unit.tribe !== self.tribe) {
                    this.mesh_movement.createInstance({
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
                            defender: unit.uuid
                        }
                    };
                }
            }
        }
    }
    public hideMovement(){
        this.mesh_movement.visible = false;
    }
    public hideAttack(){
        this.mesh_attack.visible = false;
    }
}