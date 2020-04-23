declare namespace Polytopia{
    type UUID = string;
    interface QueryParams{
        saved?: boolean; // is a saved map
        mp?: boolean; // is multiplayer game
        id?: number;
        local?: boolean; // is a local game
        players?: string[],
        opp?: number;
        uuid?: string; // The id of the map
    }
    type IFaction = "Xin-xi" | "Imperius" | "Bardur" | "Oumaji" | 'Polaris' | null;
    type ITech = "climbing" | "organization" | "hunting"| "riding" | "fishing" | "roads" | "trade"| "free_spirit" | "chivalry" | "farming" | "construction" | "shields" | "mining" | "smithery" | "meditation" | "philosophy" | "sailing" | "navigation" | "whaling" | "aquatism"| "spirtualism"| "archery" | "forestry" | "mathematics";
    type IMouseEvent = "click" | "mouseover";
    interface IPlayerObject{
        faction: IFaction;
        id: string;
        tech: ITech[];
        citys: number;
        stars: number;
        starsPerTurn: number;
        score: number;
        ai: boolean;
    }
    interface IClickEvent{
        type: string;
        object: number;
    }
    namespace Objects{
        interface ICord{
            x: number;
            y: number;
            z: number;
        }
        namespace Blocks{
            interface IWaterParams extends Dynamic.IDynamicBlockParams{
                fish?: boolean;
                ruin?: boolean;
            } 
            interface IOceanParams extends Dynamic.IDynamicBlockParams{
                whale?: boolean;
                ruin?: boolean;
            }
            interface IFieldParams extends Dynamic.IDynamicBlockParams{
                ruin?: boolean;
                fruit?: boolean;
                crop?: boolean;
            }
            interface IMountainParams extends Dynamic.IDynamicBlockParams{
                ruin?: boolean;
                metal?: boolean;
            }
            interface IForestParams extends Dynamic.IDynamicBlockParams{
                wild_animal?: boolean;
                ruin?: boolean;
            }
            interface IVillageParams extends Dynamic.IDynamicBlockParams{}
            interface ICityParams extends Dynamic.IDynamicBlockParams{
                capital?: boolean;
            }

            interface IFruitParams extends Static.IStaticBlockParams{}
            interface IWildAnimalParams extends Static.IStaticBlockParams{}
        }
        type Block = "Field" | "Ocean" | "Water" | "Forest" | "Mountain" | "City" | "Village";
        type Resource = "wild_animal" | "crop" | "fruit" | "fish" | "whale" | "metal" | "ruin" | null;
        namespace Dynamic{
            interface IDynamicBlock extends THREE.Mesh{
                cursor: "pointer" | "crosshair" | "default";
                blockType: Block;
                variation: number;
                faction: IFaction;
                resource: Resource;
                onClick(data: IClickEvent);
            }
            interface IDynamicBlockParams {
                position?: ICord;
                geometry?: THREE.Geometry | THREE.BufferGeometry | undefined;
                material?: THREE.Material | THREE.Material[] | undefined;
                type?: Block;
                faction?: IFaction;
                variation?: number;
                rotation?: number;
                resource?: Resource
            }
        }
        namespace Static{
            interface IStaticBlock extends THREE.Mesh{
                variation: number;
                getType: Resource;
            }
            interface IStaticBlockParams{
                variation?: number;
                type?: Resource;
                geometry?: THREE.Geometry | THREE.BufferGeometry | undefined;
                material?: THREE.Material | THREE.Material[] | undefined;
            }
        }
    }
}