import EventEmitter from '../../core/EventEmitter';
import type { SystemEventListener } from '../../core/EventEmitter';
import type { VariantGLTF } from '../../loaders/KHR_Variants';
import { ObjectEvents, SystemEvents } from '../../events/systemEvents';
export default class SelectorTile implements SystemEventListener {
    public events: EventEmitter = new EventEmitter();
    public mesh: THREE.Mesh;
    private style = "TileSelector";
    constructor(private asset: VariantGLTF){
        this.mesh = asset.scene.children[0] as THREE.Mesh;
        this.mesh.visible = false;
        this.mesh.name = "Selector";
        this.events.on(SystemEvents.INTERACTION,(event)=>{
            switch (event.id) {
                case ObjectEvents.DESELECTION: {
                    this.hide();
                    break;
                }
                case ObjectEvents.SELECTION: {
                    this.setStyle("TileSelector");
                    this.setVisible();
                    if( (this.mesh.position.x === (event.data.world.row * 4) ) && (this.mesh.position.z === (event.data.world.col * 4)) ) return;
                    this.mesh.position.set(event.data.world.row * 4,0,event.data.world.col * 4);
                    break;
                }
                case ObjectEvents.RESET: {
                    this.setVisible();
                    break;
                }
                case ObjectEvents.UNIT_SELECT: {
                    this.setStyle("UnitSelector"); 
                    break;
                }
                default:
                    break;
            }
        });
    }
    private setVisible(){
        if(!this.mesh.visible) this.mesh.visible = true;
    }
    private hide(){
        if(this.mesh.visible) this.mesh.visible = false;
    }
    public async setStyle(key: string){
        if(key === this.style) return;
        this.style = key;
        // add check to see if the current material is already is this variant
        await this.asset.functions.selectVariant(this.mesh,key);
    }
}