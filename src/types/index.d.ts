declare namespace Polytopia{
    interface QueryParams{
        saved?: boolean;
        mp?: boolean;
    }
    type IFaction = "Xin-xi" | "Imperius" | "Bardur" | "Oumaji" | null;
    type IMouseEvent = "click" | "mouseover";
    interface IClickEvent{
        type: IClickEvent;
        object: number;
    }
    namespace Objects{
        interface ICord{
            x: number;
            y: number;
            z: number;
        }
        namespace Blocks{
            interface IWaterParams extends Dynamic.IDynamicBlockParams{} 
        }
        type Block = "Field" | "Ocean" | "Water" | "Forest" | "Mountain" | "City" | "Village";
        type Resource = "game" | "crop" | "fruit" | "fish" | "whale" | "metal" | null;
        namespace Dynamic{
            interface IDynamicBlock extends THREE.Mesh{
                cursor: "pointer" | "crosshair" | "default";
                blockType: Block;
                variation: number;
                faction: IFaction;
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
            interface IStaticBlock extends THREE.Mesh{}
            interface IStaticBlockParams{
                geometry?: THREE.Geometry | THREE.BufferGeometry | undefined
                material?: THREE.Material | THREE.Material[] | undefined
            }
        }
    }
}