import { type Object3D, type Camera, Matrix4, Vector3 } from "three";

export const Transparency = {
    init: <T extends Object3D & { material: { transparent: boolean, depthWrite: boolean } }>(objects: T[]): void => {
        for(const object of objects) {
            if(object.material){
                object.material.transparent = true;
                object.material.depthWrite = false;
            }
        }
    },  
    update: <T extends Object3D>(objects: T[], camera: Camera): void => {
        camera.updateMatrixWorld();
        camera.matrixWorldInverse.invert();

        const screenMatrix = new Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
        const pos = new Vector3();
        for(const object of objects) {
            object.updateMatrixWorld();
            pos.setFromMatrixPosition(object.matrixWorld);
            pos.applyMatrix4(screenMatrix);

            object.renderOrder = -pos.z;
        }
    }
};