import { nanoid } from "nanoid";
import type Engine from "../core/Engine";
import type AssetLoader from "../loaders/AssetLoader";
import type {Position, Tribe, UUID, Skill, UnitType, TileBase, Sterilizable, Renderable, Construable } from "../core/types";
import type PlayerController from "../managers/PlayerController";

interface IUnit {
    type: UnitType;
    tribe: Tribe;
    position: Position;
    orgin: UUID;
}

export enum UnitNames {
    WARRIOR = "WARRIOR"
}
export interface UnitJson {
    position: Position;
    tribe: Tribe,
    type: UnitType;
    health: number;
    is_veteran: boolean;
} 
export class Unit implements Sterilizable<UnitJson>, Renderable, Construable<Unit,UnitJson> {
    static createFromJson(engine: Engine, asset: AssetLoader, players: PlayerController, json: UnitJson): Unit {
        return new Unit(engine,asset,players).jsonConstructor(json);
    }
    static createNew(engine: Engine, asset: AssetLoader,players: PlayerController, data: IUnit): Unit {
        return new Unit(engine,asset,players).defaultConstructor(data);
    }
    static readonly UNIT_MODEL_ID: { [tribe: string]: number } = {
        "imperius": 0,
        "bardur": 1, 
        "xin-xi": 2, 
        "oumaji": 3, 
        "kickoo": 4, 
        "zebasi": 5
    };
    static readonly UNIT_DATA: { [type: string]: { defence: number, attack: number, maxHealth: number, movement: number, range: number, skills: Skill[] } } = {
        "WARRIOR": {
            defence: 2,
            attack: 2,
            maxHealth: 10,
            movement: 1,
            range: 1,
            skills: ["DASH"]
        }
    };
    public readonly uuid: UUID = nanoid(8);
    public orgin: UUID;
    public position: Position;
    public tribe: Tribe;
    public type: UnitType;
    public movement: number = 1;
    public range: number = 1;
    public isVeteran: boolean = false;
    public skills: Skill[] = ["DASH"];
    public attack: number = 2;
    public defence: number = 2;
    public health: number = 10;
    public hasMoved: boolean = false;
    public hasAttacked: boolean = false;
    public maxHealth: number = 10;
    private _visable: boolean = true;
    private constructor(private engine: Engine, private asset: AssetLoader, private players: PlayerController){
        this.engine.scenes.unit.insertUnit(this);
    }   
    public get model_id(): string {
        return `${this.type}_${this.tribe.toUpperCase()}`;
    } 
    private get model_index(): number {
        return Unit.UNIT_MODEL_ID[this.tribe];
    }
    public defaultConstructor(data: IUnit): this {
        this.position = data.position;
        this.type = data.type;
        this.tribe = data.tribe;
        this.orgin = data.orgin;

        const { range, maxHealth, movement, skills, defence, attack } = Unit.UNIT_DATA[this.type];
        this.movement = movement;
        this.range = range;
        this.skills = skills;
        this.attack = attack;
        this.defence = defence;
        this.health = maxHealth;
        this.maxHealth = maxHealth;


         // use the commented part when we have models to use for the diffenent tribes and unit types.
        return this;
    }
    public jsonConstructor(json: UnitJson): this {
        this.position = json.position;
        this.type = json.type;
        this.tribe = json.tribe;
        this.isVeteran = json.is_veteran;
        this.health = json.health;
        const {range,movement,skills,defence,attack} = Unit.UNIT_DATA[this.type];
        this.movement = movement;
        this.range = range;
        this.skills = skills;
        this.defence = defence;
        this.attack = attack;

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
    get vaild_terrian(): TileBase[] {
        //TODO: rework how vaild tiles are selected
        if(this.skills.includes("FLOAT")) {
            if(this.players.playerHasTech(this.tribe,"navigation")) {
                return ["WATER","OCEAN"];
            }
            return ["WATER"];
        }
        if(this.players.playerHasTech(this.tribe,"climbing")){
            return ["LAND","FOREST","MOUNTAIN","CITY"];
        }
        return ["LAND","FOREST","CITY"];
    }
    public heal(amount: number): void {
        this.health += amount;
        if(this.health > this.maxHealth) this.health = this.maxHealth;
    }
    public setPostion(next_tile_owner: UUID, postion: Position){
        const model = this.engine.scenes.unit.getObject(this.model_id);
        if(!model) return;

        this.position = postion;
        model.editInstance(this.uuid,{
            x: postion.row,
            z: postion.col,
            owner: next_tile_owner
        });
    }
    public set visible(show: boolean) {
        const model = this.engine.scenes.unit.getObject(this.model_id);
        if(!model) throw new Error(`Failed to set visablity on non-existint object for Unit: (${this.tribe}_${this.type} | ${this.uuid}) `);

        this._visable = show;
        model.setVisibility(this.uuid,show);
    }
    public get visible(): boolean {
        return this._visable;
    }
    public reset(): void {
        this.hasMoved = false;
        this.hasAttacked = false;
    }
    public destory(): void {
        const model = this.engine.scenes.unit.getObject(this.model_id);
        if(!model) throw new Error(`Failed to destory non-existint object for Unit: (${this.tribe}_${this.type} | ${this.uuid}) `);
        model.removeInstance(this.uuid);
        this.engine.scenes.unit.removeUnit(this.uuid);
    }
    public canMove(): boolean {
        return !this.hasAttacked && !this.hasMoved;
    }
    public canAttack(): boolean {
        if(!this.hasAttacked && this.hasMoved && this.skills.includes("DASH")){
            return true;
        }
        return !this.hasAttacked && !this.hasMoved;
    }
    public async setTribe(tribe: Tribe){
        if(this.tribe === tribe) return;

        const unit = this.engine.scenes.unit.getObject(this.model_id);
        if(!unit) throw new Error(`Failed to get object for model with id of ${this.model_id}`);

        const data = unit.getItem(this.uuid);

        if(!data) throw new Error(`Failed to get instanced data for unit (${this.uuid})`);

        this.tribe = tribe;

        unit.removeInstance(this.uuid);

        await this.render(data.owner);
    }
    public async render(tile_owner: UUID){
        try {
            if(!this.engine || !this.asset ) throw new Error(`Unit was not init correctly`);
            
            let model = this.engine.scenes.unit.getObject(this.model_id);
            if(!model) {
                const asset = await this.asset.getAsset(this.type,this.model_index,"gltf");
                model = this.engine.scenes.unit.createObjectInstance(this.model_id,asset.geometry,asset.material);
            }

            model.createInstance({
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