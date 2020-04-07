import {EventDispatcher, WebGLRenderer, Scene, OrthographicCamera, Vector2, Raycaster} from 'three';
export default class Interaction extends EventDispatcher{
    private mouse: Vector2;
    private raycaster: Raycaster;
    private camera: OrthographicCamera;
    private scene: Scene;
    private INTERSECTED: any | null;
    renderer: WebGLRenderer;
    constructor(renderer: WebGLRenderer, scene: Scene, camera: OrthographicCamera){
        super();
        this.camera = camera;
        this.mouse = new Vector2(0,0);
        this.raycaster = new Raycaster();
        this.renderer = renderer;
        this.scene = scene;
        this.INTERSECTED = null;
        this.init();

    }
    init(){
        const test = this.onMouseMove.bind(this);
        document.addEventListener("mousemove",test,false);
        
    }
    onMouseMove(event: MouseEvent){
        event.preventDefault();
        this.mouse.x = (event.clientX/window.innerWidth) * 2 - 1;
        this.mouse.y = (event.clientY/window.innerHeight) * 2 + 1

    }

    render(){
        this.raycaster.setFromCamera(this.mouse,this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children,true);
        
        if(intersects.length > 0){
            console.log(!Object.is(this.INTERSECTED,intersects[0].object));
            
            if(!Object.is(this.INTERSECTED,intersects[0].object)){
                     this.INTERSECTED = intersects[0].object;
                     this.renderer.domElement.style.cursor = "pointer";
                     this.INTERSECTED.material.wireframe = false;
                     console.log(intersects[0].object);
            }
        }else{
            this.INTERSECTED = null;
            this.renderer.domElement.style.cursor = "default";
           
        }
    }

}