import EventEmitter from '../../core/EventEmitter';
import type { SystemEventListener } from '../../core/EventEmitter';
import type { VariantGLTF } from '../../loaders/KHR_Variants';
import { ObjectEvents, SystemEvents, UnitEvent } from '../../events/systemEvents';
import type Engine from '../../core/Engine';
import { RenderOrder } from '../../core/renderOrder';

/**
 * @listens INTERACTION
 *
 * @export
 * @class SelectorTile
 * @implements {SystemEventListener}
 */
export default class SelectorTile implements SystemEventListener {
    public events: EventEmitter = new EventEmitter();
    public mesh: THREE.Mesh;
    private style = "TileSelector";
    constructor(private asset: VariantGLTF){
        this.mesh = asset.scene.children[0].clone(true) as THREE.Mesh;
        asset.functions.copyVariantMaterials(this.mesh,asset.scene.children[0] as THREE.Mesh);
        this.mesh.visible = false;
        this.mesh.name = "Selector";
        this.mesh.renderOrder = RenderOrder.SELECTOR;
        this.events.on(SystemEvents.INTERACTION,(event)=>{
            switch (event.id) {
                case ObjectEvents.DESELECTION: {
                    this.hide();
                    this.events.emit<SystemEvents,UnitEvent>({ type: SystemEvents.UNIT, id: UnitEvent.HIDE_SELECTOR, data: {} });
                    break;
                }
                case ObjectEvents.SELECTION: {
                    if(event.data.type === "unit") {
                        this.setStyle("UnitSelector"); 
                    } else {
                        this.setStyle("TileSelector");
                    }
                    this.setVisible();
                    if( (this.mesh.position.x === (event.data.world.row * 4) ) && (this.mesh.position.z === (event.data.world.col * 4)) ) return;
                    this.mesh.position.set(event.data.world.row * 4,0,event.data.world.col * 4);
                    break;
                }
                case ObjectEvents.RESET: {
                    this.setVisible();
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
    public async render(engine: Engine){
        // Don't add the selector to the level group.
        // this stops the ray from hitting it so,
        // we don't need to worry about having to deal with it.
        engine.scene.add(this.mesh);
    }
}