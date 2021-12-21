import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import CameraControls from 'camera-controls';
import { WebGLRenderer, OrthographicCamera, Fog,
    MathUtils, MOUSE, Quaternion, Vector2 , Vector3, Vector4, Spherical, Matrix4, Raycaster, Box3, Sphere, TextureLoader,
    Group, HemisphereLight, DirectionalLight } from 'three';
import EventEmitter from '../core/EventEmitter';
import {ObjectEvents,SystemEvents} from '../events/systemEvents';

import WorldScene from '../world/rendered/Scene';

import { isMobile } from '../../utils/mobile';
import TouchTap from './TouchTap';

import type { SystemEventListener } from '../core/EventEmitter';
import type InstancedObject from '../world/rendered/InstancedObject';
import type CityTile from '../world/rendered/CityTile';

export default class Engine implements SystemEventListener {
    private controls: CameraControls;
    private renderer: WebGLRenderer;
    private composer: EffectComposer;
    private camera: OrthographicCamera;
    private raycaster: Raycaster = new Raycaster();
    private textureLoader: TextureLoader = new TextureLoader();
    private frustumSize: number = 1000;
    private touch: TouchTap | null = null;
    private hover: { INTERSECTION: any; pointer: Vector2; } = {
        INTERSECTION: null,
        pointer: new Vector2()
    };
    private readonly is_mobile: boolean = isMobile();
    public scene: WorldScene;
    public events: EventEmitter = new EventEmitter();
    constructor(public canvas: HTMLCanvasElement){
        // install the camera controls lib
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
        
        // Effect composer setup
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene,this.camera));
        this.composer.setSize(window.innerWidth,window.innerHeight);
        this.composer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth,window.innerHeight, true);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.camera.lookAt(this.scene.position);

        this.controls = new CameraControls(this.camera,this.renderer.domElement);
        this.controls.setPosition(0,0,5);
        this.controls.maxZoom = 30;
        this.controls.minZoom = 10;
        this.controls.zoom(10,false);
        this.controls.azimuthAngle = 3.913;
        this.controls.polarAngle = 0.825;
       // this.controls.setBoundary(new Box3(new Vector3(-50,-50,-50),new Vector3(50,10,50)))
        this.controls.mouseButtons.left = CameraControls.ACTION.TRUCK;
        this.controls.mouseButtons.right = CameraControls.ACTION.NONE;
        this.controls.mouseButtons.middle = CameraControls.ACTION.NONE;
        this.controls.touches.one = CameraControls.ACTION.TOUCH_TRUCK;
        this.controls.touches.two = CameraControls.ACTION.TOUCH_ZOOM;
        this.controls.touches.three = CameraControls.ACTION.NONE;

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
    private selection_handler(pointer: Vector2) {
        this.raycaster.setFromCamera(pointer,this.camera);

        const scene = this.scene.getActiveLevel();
        if(!scene) {
            console.error("Selection: Failed to find World Group");
            return;
        }

        const intersects = this.raycaster.intersectObjects(scene.children);

        if (!(intersects.length > 0) ) {
            this.events.emit<SystemEvents,ObjectEvents>({ type: SystemEvents.INTERACTION, id: ObjectEvents.DESELECTION, data: {} });
            return;
        }

        let {object, instanceId } = intersects[0];

        if((object as InstancedObject)?.isInstancedMesh){
            const data = (object as InstancedObject).getItem(instanceId as number);
            this.events.emit<SystemEvents,ObjectEvents>({ type: SystemEvents.INTERACTION, id: ObjectEvents.TILE_SELECT, data: { type: data.type, owner: data.owner, id: data.id } });
            return;
        }

        if(!(object as CityTile)?.isGameObject) return;

        this.events.emit<SystemEvents,ObjectEvents>({ type: SystemEvents.INTERACTION, id: ObjectEvents.TILE_SELECT, data: { type: "tile", owner: (object as CityTile).tile_owner, id: object.uuid } });
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
        if(this.is_mobile) return;
        this.raycaster.setFromCamera(this.hover.pointer,this.camera);

        const scene = this.scene.getActiveLevel();
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
        this.hoverUpdate();
    }
    public moveCameraTo(row: number, col: number) {
        this.controls.moveTo(row * 4, 0, col * 4, true);
    }
}