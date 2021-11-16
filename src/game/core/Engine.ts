import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import CameraControls from 'camera-controls';
import { WebGLRenderer, OrthographicCamera, Fog,
    MathUtils, MOUSE, Quaternion, Vector2 , Vector3, Vector4, Spherical, Matrix4, Raycaster, Box3, Sphere, TextureLoader,
    Group, HemisphereLight, DirectionalLight } from 'three';
import EventEmitter, { SystemEventListener } from '../core/EventEmitter';

import WorldScene from '../world/rendered/Scene';

import { isMobile } from '../../utils/mobile';
import TouchTap from './TouchTap';

import type InstancedObject from '../world/rendered/InstancedObject';

export default class Engine implements SystemEventListener {
    private controls: CameraControls;
    private renderer: WebGLRenderer;
    private composer: EffectComposer;
    private camera: OrthographicCamera;
    private raycaster: Raycaster = new Raycaster();
    private textureLoader: TextureLoader = new TextureLoader();
    private frustumSize: number = 1000;
    private touch: TouchTap | null = null;
    private hover: {
        INTERSECTION: any
        pointer: Vector2
    } = {
        INTERSECTION: null,
        pointer: new Vector2()
    };
    private readonly is_mobile: boolean = isMobile();
    public level: string = "overworld";
    public scene: WorldScene;
    public events: EventEmitter = new EventEmitter();
    constructor(public canvas: HTMLCanvasElement){
        CameraControls.install( { 
            THREE: { MOUSE, MathUtils, Quaternion, Spherical, Vector2, Vector3, Vector4, Matrix4, Raycaster, Box3, Sphere }
        });
    }
    public init(){
        this.renderer = new WebGLRenderer({ 
            antialias: true, 
            canvas: this.canvas,
        });
        this.scene = new WorldScene();

        const aspect = window.innerWidth / window.innerHeight;

        this.camera = new OrthographicCamera( 
            this.frustumSize * aspect / - 2, 
            this.frustumSize * aspect / 2, 
            this.frustumSize / 2, 
            this.frustumSize / - 2, 
            1, 
            1000 
        );

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene,this.camera));
        this.composer.setSize(window.innerWidth,window.innerHeight);
        this.composer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth,window.innerHeight, true);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.controls = new CameraControls(this.camera,this.renderer.domElement);
        this.controls.setPosition(0,0,5);

        const background = this.textureLoader.load(this.is_mobile ? "/background/mobile_bg.jpg" : "/background/desktop_bg.jpg");

        this.scene.background = background;
        this.scene.fog = new Fog(0x000000);

        document.addEventListener("resize",this.resize,true);
        this.renderer.domElement.addEventListener("pointermove",this.onMouseMove,true);

        if(this.is_mobile){
            this.touch = new TouchTap(this.renderer.domElement);
            this.renderer.domElement.addEventListener("touchtap",this.selection_mobile,true);
        } else {
            this.renderer.domElement.addEventListener("click",this.selection_normal,true);    
        }

        const lightGroup = new Group();
        lightGroup.name = "Lights";

        const heimiLight = new HemisphereLight();
        heimiLight.position.set(0,50,0);
        lightGroup.add(heimiLight);

        const dirLight = new DirectionalLight();
        dirLight.position.set(-1,1.75,1);
        dirLight.position.multiplyScalar(30);
        lightGroup.add(dirLight);

        this.scene.add(lightGroup);

        this.renderer.setAnimationLoop(this.animationLoop);
    }

    public destory(){
        document.removeEventListener("resize",this.resize);
        this.renderer.domElement.removeEventListener("pointermove",this.onMouseMove);
        this.renderer.domElement.removeEventListener("touchtap",this.selection_mobile);
        this.renderer.domElement.removeEventListener("click",this.selection_normal);
        this.touch?.dispose(this.renderer.domElement);
        this.renderer.dispose();
    }
    public getActiveLevel(): THREE.Group | undefined {
        return this.scene.getObjectByName(this.level) as (THREE.Group | undefined)
    }
    private selection_handler(pointer: Vector2) {
        this.raycaster.setFromCamera(pointer,this.camera);

        const scene = this.scene.getObjectByName(this.level);
        if(!scene) {
            console.error("Selection: Failed to find World Group");
            return;
        }

        const intersects = this.raycaster.intersectObjects(scene.children);

        if (!(intersects.length > 0) ) {
            //this.events.send(SystemEvents.SELECTION,SelectionEventID.Deselection);
            return;
        }

        let object = intersects[0];

        if((object.object as InstancedObject)?.isInstancedMesh){
          //  this.events.send(SystemEvents.SELECTION,SelectionEventID.Selected,{ ref: (object.object as InstancedTile).data[object.instanceId as number], type: object.object.userData });
            return;
        }

       // this.events.send(SystemEvents.SELECTION,SelectionEventID.Selected,{});

    }
    private selection_mobile = (event: any) => {
        this.selection_handler(
            new Vector2(
                (event.customData.touchX / window.innerWidth ) * 2 - 1,
                -( event.customData.touchY / window.innerHeight ) * 2 + 1)
            );
    }
    private selection_normal = (event: MouseEvent) => {
        this.selection_handler(
            new Vector2(
                (event.clientX / window.innerWidth ) * 2 - 1, 
                -( event.clientY / window.innerHeight ) * 2 + 1)
            );
    }
    private onMouseMove = (event: PointerEvent) => {
        this.hover.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
		this.hover.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    private resize = () => {
        const aspect = window.innerWidth / window.innerHeight;

        this.camera.left = -this.frustumSize * aspect / 2;
        this.camera.right = this.frustumSize * aspect / 2;
        this.camera.top = this.frustumSize / 2;
        this.camera.bottom = -this.frustumSize / 2;

        this.composer.setSize(window.innerWidth,window.innerHeight);
        this.composer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth,window.innerHeight, true);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.camera.updateProjectionMatrix();
    }

    private hoverUpdate() {
        this.raycaster.setFromCamera(this.hover.pointer,this.camera);

        const scene = this.scene.getObjectByName(this.level);
        if(!scene) return;

        const intersects = this.raycaster.intersectObjects(scene.children);

        if (intersects.length > 0) {
            if (this.hover.INTERSECTION != intersects[0].object){
                this.hover.INTERSECTION = intersects[0].object; 
                this.renderer.domElement.style.cursor = "pointer";
            }
        }else {
            if (this.hover.INTERSECTION) this.renderer.domElement.style.cursor = "default";
            this.hover.INTERSECTION = null;
        }
    }

    private animationLoop = (time: number) => {
        this.controls.update(time);
        this.composer.render(time);
        if(this.is_mobile) this.hoverUpdate();
    }
}