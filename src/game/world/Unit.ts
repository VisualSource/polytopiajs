import { nanoid } from "nanoid";
import type Engine from "../core/Engine";
import type AssetLoader from "../loaders/AssetLoader";
import type {Position, Tribe, UUID} from "../core/types";
import type PlayerController from "../managers/PlayerController";

interface IUnit {
    type: string;
    tribe: Tribe;
    position: Position;
}
export interface UnitJson {
    position: Position;
    tribe: Tribe,
    type: string;
    health: number;
    is_veteran: boolean;
} 

export class Unit {
    static createFromJson(engine: Engine, asset: AssetLoader, players: PlayerController, json: UnitJson): Unit {
        return new Unit(engine,asset,players).initFromJson(json);
    }
    static createNew(engine: Engine, asset: AssetLoader,players: PlayerController, data: IUnit): Unit {
        return new Unit(engine,asset,players).initDefault(data);
    }
    public readonly uuid: UUID = nanoid(8);
    public position: Position;
    public tribe: Tribe;
    public type: string;
    public movement: number = 1;
    public range: number = 1;
    public isVeteran: boolean = false;
    public skills: any[] = [];
    public attack: number = 2;
    public defence: number = 2;
    public health: number = 10;
    public ap: number = 1;
    public maxHealth: number = 10;
    private model_id: string;
    constructor(private engine: Engine, private asset: AssetLoader, private players: PlayerController){}    
    public initDefault(data: IUnit): this {
        this.position = data.position;
        this.type = data.type;
        this.tribe = data.tribe;
         // use the commented part when we have models to use for the diffenent tribes and unit types.
        this.model_id = "UNIT"; /*`${data.tribe}_${this.type}`*/;
        return this;
    }
    public initFromJson(json: UnitJson): this {
        this.position = json.position;
        this.type = json.type;
        this.tribe = json.tribe;
        this.isVeteran = json.is_veteran;
        this.health = json.health;
        this.model_id = "UNIT"; /*`${data.tribe}_${this.type}`*/;
        return this;
    }
    public toJSON(): UnitJson {
        return {
            position: this.position,
            tribe: this.tribe,
            type: this.type,
            health: this.health,
            is_veteran: this.isVeteran,
        }
    }
    get vaild_terrian(): string[] {
        if(this.players.playerHasTech(this.tribe,"climbing")){
            return ["LAND","FOREST","MOUNTAIN"];
        }
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
    public set visible(show: boolean) {
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
            if(!this.engine || !this.asset ) throw new Error(`Unit was not init correctly`);
            
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