import { nanoid } from "nanoid";
import type Engine from "../core/Engine";
import type AssetLoader from "../loaders/AssetLoader";
import type {Position, Tribe, UUID} from "../core/types";

interface IUnit {
    type: string;
    tribe: Tribe;
    position: Position;
}

export class Unit {
    public readonly uuid: UUID = nanoid(8);
    public position: Position;
    public tribe: Tribe;
    public type: string;
    public movement: number = 1;
    public range: number = 1;
    public isVeteran: boolean = false;
    public skills: any[] = [];
    private _health: number = 1;
    private _defence: number = 0;
    private model_id: string;
    constructor(private engine: Engine, private asset: AssetLoader, data: IUnit){
        this.position = data.position;
        this.type = data.type;
        this.tribe = data.tribe;
        // use the commented part when we have models to use for the diffenent tribes and unit types.
        this.model_id = "UNIT"; /*`${data.tribe}_${this.type}`*/;
    }    
    get canMove(): boolean {
        return true;
    }
    get canAttack(): boolean {
        return false;
    }
    get vaild_terrian(): string[] {
        return ["LAND","FOREST"];
    }
    public setPostion(next_tile_owner: UUID, postion: Position){
        const model = this.engine.scene.getObjectInstance(this.model_id);
        if(!model) return;

        this.position = postion;
        model.editInstance(this.uuid,{
            x: postion.row,
            z: postion.col,
            owner: next_tile_owner
        });
    }
    public set visable(show: boolean) {
        const model = this.engine.scene.getObjectInstance(this.model_id);
        if(!model) throw new Error(`Failed to set visablity on non-existint object for Unit: (${this.tribe}_${this.type} | ${this.uuid}) `);

        model.editInstance(this.uuid,{
            shown: show
        });
    }
    public destory(){
        const model = this.engine.scene.getObjectInstance(this.model_id);
        if(!model) throw new Error(`Failed to destory non-existint object for Unit: (${this.tribe}_${this.type} | ${this.uuid}) `);
        model.removeInstanceById(this.uuid);
    }
    public async setTribe(tribe: Tribe){
        if(this.tribe === tribe) return;

        const unit = this.engine.scene.getObjectInstance(this.model_id);
        if(!unit) throw new Error(`Failed to get object for model with id of ${this.model_id}`);

        const data = unit.getItemById(this.uuid);

        if(!data) throw new Error(`Failed to get instanced data for unit (${this.uuid})`);

        this.tribe = tribe;
        this.model_id = "UNIT";/*`${tribe}_${this.type}`*/

        unit.removeInstanceById(this.uuid);

        await this.render(data.owner);
    }
    public async render(tile_owner: UUID){
        try {
            let model = this.engine.scene.getObjectInstance(this.model_id);
            if(!model) {
                const asset = await this.asset.getAsset(this.model_id,0,"gltf");
                model = this.engine.scene.createObjectInstance(this.model_id,asset.geometry,asset.material);
            }

            model.createInstance({
                index: 0,
                id: this.uuid,
                owner: tile_owner,
                rotation: 0,
                shown: true,
                x: this.position.row,
                z: this.position.col,
                y: 0,
                type: "unit"
            });

        } catch (error) {
            console.error("Failed to render Unit type: ",this.model_id," with id of ",this.uuid);
        }
    }
}