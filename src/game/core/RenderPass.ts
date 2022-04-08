import { Pass } from "three/examples/jsm/postprocessing/Pass";
import { type Camera, Color, type Material, type Scene } from 'three';

export default class RenderPass<S extends Scene, C extends Camera> extends Pass {
    public clearAlpha: number;
    public clear = true;
    public clearDepth = false;
	public needsSwap = false;
	private _oldClearColor = new Color();
	constructor(public scene: S, public camera: C, public overrideMaterial: Material | undefined, public clearColor: Color | undefined, clearAlpha: number | undefined ) {
        super();
        this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 0;
      
    } 

    public render( renderer: THREE.WebGLRenderer, writeBuffer: any, readBuffer: any) {

    }
}