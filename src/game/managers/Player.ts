import type { Tribe, UUID } from "../core/types";

interface ITech {
    climbing: boolean;
    fishing: boolean;
    hunting: boolean;
    organization: boolean;
    riding: boolean;
    archery: boolean;
    farming: boolean;
    forestry: boolean;
    free_spirit: boolean;
    meditation: boolean;
    mining: boolean;
    roads: boolean;
    sailing: boolean;
    shields: boolean;
    whaling: boolean;
    aquatism: boolean;
    chivalry: boolean;
    construction: boolean;
    mathematics: boolean;
    navigation: boolean;
    smithery: boolean;
    spiritualism: boolean;
    trade: boolean;
    philosophy: boolean;
}

export default class Player {
    public tech: ITech = {
        climbing: false,
        fishing: false,
        hunting: false,
        organization: false,
        riding: false,
        archery: false,
        farming: false,
        forestry: false,
        free_spirit: false,
        meditation: false,
        mining: false,
        roads: false,
        sailing: false,
        shields: false,
        whaling: false,
        aquatism: false,
        chivalry: false,
        construction: false,
        mathematics: false,
        navigation: false,
        smithery: false,
        spiritualism: false,
        trade: false,
        philosophy: false
    };
    public score: number = 0;
    public stars: number = 5;
    public star_gain: number = 2;
    public citys: number = 1;
    public capital_uuid: UUID;
    public camera: { target: { x: number, y: number, z: number }, zoom: number } | null = null;
    public fog_map: any = null;
    constructor(public tribe: Tribe, public uuid: UUID | null){
        switch (tribe) {
            case "bardur":
                this.tech.hunting = true;
                break;
            case "imperius":
                this.tech.organization = true;
                break;
            case "kickoo":
                this.tech.fishing = true;
                break;
            case "oumaji": 
                this.tech.riding = true;
                break;
            case "xin-xi":
                this.tech.climbing = true;
                break;
            case "zebasi":
                this.tech.farming = true;
                break;
            default:
                break;
        }
    }
    public toJSON(){
        return {
            capital_uuid: this.capital_uuid,
            score: this.score,
            citys: this.citys,
            star_gain: this.star_gain,
            stars: this.stars,
            tribe: this.tribe,
            uuid: this.uuid,
            tech: this.tech,
            camera: this.camera
        }
    }
}