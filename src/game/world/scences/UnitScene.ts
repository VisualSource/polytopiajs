import type { UUID } from "../../core/types";
import type { Unit } from "../Unit";
import BaseScene from "./BaseScene";

export default class UnitScene extends BaseScene {
    public name: string = "UnitScene";
    private units: Map<UUID, Unit> = new Map();
    public getUnit(uuid: UUID): Unit | null {
        const unit = this.units.get(uuid);
        if(unit) return unit;
        return null;
    }
    /**
     * @throws Error
     * @param {Unit} unit
     * @memberof UnitScene
     */
    public insertUnit(unit: Unit): void {
        if(this.units.has(unit.uuid)) throw new Error(`Unit with UUID (${unit.uuid}) already exists`);
        this.units.set(unit.uuid,unit);
    }
    public removeUnit(uuid: UUID): void {
        this.units.delete(uuid);
    }
    public unitsToJson(): any[] {
        return [];
    }
    public forUnit(cb: (value: Unit, key: string, map: Map<string, Unit>) => void): void {
        this.units.forEach(cb);
    }
}