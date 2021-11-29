export interface Position {
    row: number;
    col: number;
}

export type Tribe = "xin-xi" | "imperius" | "bardur" | "oumaji" | "kickoo" | "zebasi";
export type Tech = "climbing" | "fishing" | "hunting" | "organization" | "riding" | "archery" | "farming" | "forestry" | "free_spirit" | "meditation" | "mining" | "roads" | "sailing" | "shields" | "whaling" | "aquatism" | "chivalry" | "construction" | "mathematics" | "navigation" | "smithery" | "spiritualism" | "trade" | "philosophy";
export type TileBase = "LAND" | "WATER" | "OCEAN" | "FOREST" | "MOUNTAIN" | "CAPITAL";

export type UUID = string;