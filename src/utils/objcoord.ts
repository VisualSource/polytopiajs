import { Vector3, type WebGLRenderer, type Camera, type Object3D, } from "three";
import { Projector } from 'three/examples/jsm/renderers/Projector';

export class ObjCoord {
    static INSTANCE: ObjCoord | null = null;
    static getInstance(): ObjCoord {
        return new ObjCoord();
    }
    private projector = new Projector();
    private constructor(){
        if(ObjCoord.INSTANCE) return ObjCoord.INSTANCE;
        ObjCoord.INSTANCE = this;
    }
    public screenPosition<T extends Object3D>(object: T, camera: Camera) {
        const pos = this.worldPosition(object);
        return this.convertWorldToScreenSpace(pos,camera);
    }
    public worldPosition<T extends Object3D>(object: T): Vector3 {
        object.updateMatrixWorld();
        const worldMatrix = object.matrixWorld;
        const worldPos = new Vector3().setFromMatrixPosition(worldMatrix);
        return worldPos;
    }
    public cssPosition<T extends Object3D>(object: T, renderer: WebGLRenderer, camera: Camera) {
        const pos = this.screenPosition(object,camera)
        pos.x = (pos.x/2 + 0.5) * renderer.domElement.width / renderer.getPixelRatio();
        pos.y = (1 - (pos.y/2 + 0.5)) * renderer.domElement.height / renderer.getPixelRatio();
        return pos;
    }
    private convertWorldToScreenSpace(worldPosition: Vector3, camera: Camera): Vector3 {
       const screenPos = worldPosition.clone().project(camera);
       return screenPos; 
    }
}