export interface Position {
    row: number;
    col: number;
}

export type Tribe = "xin-xi" | "imperius" | "bardur" | "oumaji" | "kickoo" | "zebasi";
export type Tech = "climbing" | "fishing" | "hunting" | "organization" | "riding" | "archery" | "farming" | "forestry" | "free_spirit" | "meditation" | "mining" | "roads" | "sailing" | "shields" | "whaling" | "aquatism" | "chivalry" | "construction" | "mathematics" | "navigation" | "smithery" | "spiritualism" | "trade" | "philosophy";
export type TileBase = "LAND" | "WATER" | "OCEAN" | "FOREST" | "MOUNTAIN" | "CITY";
export type Skill = "CARRY" | "CONVERT" | "DASH" | "ESCAPE" | "FLOAT" | "FORTIFY" | "HEAL" | "PERSIST" | "SCOUT" | "BOOST" | "FLY" | "INDEPENDENT" | "NAVIGATE" | "SPLASH" | "SURPRISE";
export type UnitType = "WARRIOR" | "ARCHER" | "DEFENDER" | "RIDER" | "MIND_BENDER" | "SWORDSMAN" | "CATAPULT" | "KNIGHT" | "GIANT";

export type UUID = string;

export abstract class Constructable {
    public abstract defaultConstructor(...params: any[]): this;
    public abstract jsonConstructor(...params: any[]): this;
}