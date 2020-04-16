import { Vector2, Raycaster, OrthographicCamera, Scene} from 'three';
import globalDispatcher from './EventDispatcher';
export default class Interaction{
    mouse: Vector2 = new Vector2();
    INTERSECTED: any;
    raycaster: Raycaster = new Raycaster;
    camera: OrthographicCamera;
    scene: Scene;
    domElement: HTMLCanvasElement;
    constructor(scene: any, camera: any, renderer: any){
        this.scene = scene;
        this.camera = camera;
        this.domElement = renderer;
        document.addEventListener('mousemove', event=>this.onDocumentMouseMove(event), false);
        document.addEventListener("click",event=>this.onDocumentMouseClick(event),false);
    }
    onDocumentMouseMove(event: any){
        event.preventDefault();
		this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }
    onDocumentMouseClick(event: any){
        event.preventDefault();
		this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse,this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children,true);
        if(intersects.length > 0){
            if(this.INTERSECTED){
                globalDispatcher.dispatch({type:"click", object: this.INTERSECTED.id});
             } 
        }
    }
    render(){
        this.raycaster.setFromCamera(this.mouse,this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        if(intersects.length > 0){
            if(this.INTERSECTED != intersects[0].object){
                // reset object if needed
                if(this.INTERSECTED){}

                // set settings
                this.INTERSECTED = intersects[0].object;
                this.domElement.style.cursor = (intersects[0].object as Polytopia.Objects.Dynamic.IDynamicBlock).cursor;
            }
        }else{
            if(this.INTERSECTED){} 
            this.INTERSECTED = null;
            this.domElement.style.cursor = "default";
        }
    }

}