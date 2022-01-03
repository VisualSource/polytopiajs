import { capitalize } from "../../utils/strings";
import { ActionEvent } from "../events/systemEvents";
import type TileController from "../world/TileController";
import type { City } from "../world/Tile";
import type { Tech } from "./types";
import type { Unit } from "../world/Unit";
import type World from "../world/World";

const REQUIRED_TECH: { [key: string]: Tech } = {
    "GAME": "hunting",
    "FRUIT": "organization",
    "FISH": "fishing"
}

export default class UI {
    private ctr: TileController | null = null;
    private ctxU: Unit | null = null;
    constructor(private world: World){}
    private hasUnit(): boolean {
        return Boolean(this.ctr?.unit && (this.ctr.selected === 1));
    }
    public setContext(row: number, col: number): void {
        const ctr = this.world.level.get(row,col);
        if(!ctr) {
            this.ctr = null;
            return;
        }
        this.ctr = ctr;
        this.ctxU = null;
        if(this.ctr.unit){
            const unit = this.world.units.get(this.ctr.unit);
            if(!unit) return;
            this.ctxU = unit;
        }
    }
    public ignore(){
        this.ctr = null;
        this.ctxU = null;
    }
    public getActions(): {id: ActionEvent, data: { [key: string]: any }}[] {
        if(!this.ctr) return [];
        
        if(this.hasUnit()){
            if(!this.ctxU || this.world.players.activePlayer !== this.ctxU.tribe) return [];
            let action = [];
            if(this.ctxU.health < this.ctxU.maxHealth) {
                action.push({ id: ActionEvent.RECOVER, data: { unit: this.ctr.unit, tile: this.ctr.uuid } });
            }
            if(this.world.players.activePlayerHas("free_spirit")) {
                action.push({ id: ActionEvent.DISBAND, data: { unit: this.ctr.unit, tile: this.ctr.uuid } });
            }

            if(this.ctxU.type === "MIND_BENDER") {
                action.push({ id: ActionEvent.HEAL, data: { unit: this.ctr.unit, tile: this.ctr.uuid } });
            }

            return action;
        } else if((this.ctr.base as City)?.isCity && this.world.players.activePlayer === this.ctr.owning_tribe){
            let actions = [];

            actions.push({ id: ActionEvent.SPAWN, data: { tile: this.ctr.uuid, type: "WARRIOR" } });

            return actions;
        } 

        let actions = [];
        
        if(this.ctr?.top && ["GAME","FRUIT"].includes(this.ctr.top.type) ){
            actions.push({ id: ActionEvent.GATHER, data: { tile: this.ctr.uuid } });
        }

        return actions;
    }
    public getIcon(): string[] {
        if(!this.ctr) return [];
        if(this.hasUnit()) {
            if(!this.ctxU) return [];
            return [this.ctxU.model_id];
        } 
       
        let icon = [this.ctr.getBaseModalName()];

        const top = this.ctr.getTopModalName();
        if(top && !(this.ctr.base as City)?.isCity) icon.push(top);

        return icon;
    }
    public getDescription(): string {
        if(!this.ctr) return "";

        if((this.ctr.base as City)?.isCity) return this.world.players.activePlayer === this.ctr.owning_tribe ? "Choose a unit to produce" : "Move a unit here to capture this city!";

        if(this.ctr.top) {
           
            if(this.ctr.top.type === "RUIN") return "Move a unit here and examine these ancient ruins.";
            if(this.ctr.top.type === "VILLAGE") return "Move a unit here to capture this city!";
            if(["GAME","FRUIT","FISH"].includes(this.ctr.top.type)) {
                const tech_need = REQUIRED_TECH[this.ctr.top.type];
                if(this.ctr.owning_tribe !== this.world.players.activePlayer) return "This resource is outside of your empire";
                return this.world.players.activePlayerHas(tech_need) ? "Extract this resource to upgrade your city." : `You need to research ${capitalize(tech_need)} to extract this resource.`;
            }
        }

        if(this.ctr.base.type === "MOUNTAIN" && !this.world.players.activePlayerHas("climbing")) return "You need to research Climbing to be able to move here.";

        return "";
    }
    public getTitle(): string {
        if(!this.ctr) return "Tile";
        if(this.hasUnit()){
            if(!this.ctxU) return "Unit";
            return `${capitalize(this.ctxU.tribe)} ${this.ctxU.type.toLowerCase()}`;
        }

        if(this.ctr?.top && ["RUIN","VILLAGE"].includes(this.ctr.top.type)) return capitalize(this.ctr.top.type);

        if((this.ctr.base as City)?.isCity) return (this.ctr.base as City).uiName;
        return `${capitalize(this.ctr.base.type)}${this.ctr.top ? `, ${this.ctr.top.type.toLowerCase()}` : ""}${this.ctr.road ? ", roads" : ""} `;
    }
}