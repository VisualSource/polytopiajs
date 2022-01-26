import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import CameraControls from 'camera-controls';
import { WebGLRenderer, OrthographicCamera, Fog,
    MathUtils, MOUSE, Quaternion, Vector2 , Vector3, 
    Vector4, Spherical, Matrix4, Raycaster, Box3, Sphere, TextureLoader,
    Group, HemisphereLight, DirectionalLight, Color } from 'three';

import EventEmitter from '../core/EventEmitter';
import {ObjectEvents,SystemEvents} from '../events/systemEvents';

import WorldScene from '../world/rendered/Scene';

import { isMobile } from '../../utils/mobile';
import TouchTap from './TouchTap';

import type { SystemEventListener } from '../core/EventEmitter';
import type InstancedObject from '../world/rendered/InstancedObject';
import type CityTile from '../world/rendered/CityTile';

export default class Engine implements SystemEventListener {
    private fxaa: ShaderPass;
    private outlinePass: OutlinePass;
    private controls: CameraControls;
    private renderer: WebGLRenderer;
    private composer: EffectComposer;
    private camera: OrthographicCamera;
    private raycaster: Raycaster = new Raycaster();
    private textureLoader: TextureLoader = new TextureLoader();
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
            THREE: { 
                MOUSE, 
                MathUtils, 
                Quaternion, 
                Spherical, 
                Vector2, 
                Vector3, 
                Vector4, 
                Matrix4, 
                Raycaster, 
                Box3, 
                Sphere 
            }
        });
    }
    public init(){
        this.renderer = new WebGLRenderer({ 
            antialias: true, 
            canvas: this.canvas,
        });
        this.scene = new WorldScene();

        this.camera = new OrthographicCamera( 
            window.innerWidth / -200,
            window.innerWidth / 200,
            window.innerHeight / 200,
            window.innerHeight / -200,
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
        this.camera.position.set(0,0,100);

        // Effects
        this.outlinePass = new OutlinePass(
            new Vector2(window.innerWidth,window.innerHeight), this.scene, this.camera
        );
        this.outlinePass.visibleEdgeColor = new Color('#ffffff');
        this.outlinePass.hiddenEdgeColor = new Color('#190a05');
        this.outlinePass.edgeStrength = 3;
        this.outlinePass.edgeGlow = 1;
        this.outlinePass.edgeThickness = 1;
        this.outlinePass.pulsePeriod = 0;
        this.outlinePass.usePatternTexture = false;

        this.composer.addPass(this.outlinePass);

        this.fxaa = new ShaderPass(FXAAShader);

        const pixelRatio = this.renderer.getPixelRatio();

        this.fxaa.material.uniforms['resolution'].value.x = 1 / (this.renderer.domElement.offsetWidth * pixelRatio);
        this.fxaa.material.uniforms['resolution'].value.y = 1 / (this.renderer.domElement.offsetHeight * pixelRatio);
        this.composer.addPass(this.fxaa);

        this.controls = new CameraControls(this.camera,this.renderer.domElement);
        this.controls.polarAngle = 0.8726646259971647;
        this.controls.azimuthAngle = 3.9269908169872414;
        this.controls.maxZoom = 0.40;
        this.controls.minZoom = 0.16;
        this.controls.zoom(0.38,false);
        this.controls.setBoundary(new Box3(new Vector3(-20,-20,-20),new Vector3(20,20,20)))
        this.controls.mouseButtons.left = CameraControls.ACTION.TRUCK;
        this.controls.mouseButtons.right = CameraControls.ACTION.NONE;
        this.controls.mouseButtons.middle = CameraControls.ACTION.NONE;
        this.controls.touches.one = CameraControls.ACTION.TOUCH_TRUCK;
        this.controls.touches.two = CameraControls.ACTION.TOUCH_ZOOM;
        this.controls.touches.three = CameraControls.ACTION.NONE;

        const background = this.textureLoader.load(`${import.meta.env.BASE_URL}${this.is_mobile ? `background/mobile_bg.jpg` : "background/desktop_bg.jpg"}`);

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
    public addOutline(object: THREE.Object3D) {
        this.outlinePass.selectedObjects.push(object);
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
            const data = (object as InstancedObject).getIndex(instanceId as number);
            if(!data) {
                console.error("Invaild instance id");
                return;
            }
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
        //const aspect = window.innerWidth / window.innerHeight;

        this.camera.left = window.innerWidth / -200;
        this.camera.right =  window.innerWidth / 200;
        this.camera.top = window.innerHeight / 200;
        this.camera.bottom = window.innerHeight / -200;

        /*this.camera.left = -this.frustumSize * aspect / 2;
        this.camera.right = this.frustumSize * aspect / 2;
        this.camera.top = this.frustumSize / 2;
        this.camera.bottom = -this.frustumSize / 2;*/

        this.composer.setSize(window.innerWidth,window.innerHeight);
        this.composer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth,window.innerHeight, true);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.camera.updateProjectionMatrix();

        const pixelRatio = this.renderer.getPixelRatio();

        this.fxaa.material.uniforms['resolution'].value.x = 1 / (this.renderer.domElement.offsetWidth * pixelRatio);
        this.fxaa.material.uniforms['resolution'].value.y = 1 / (this.renderer.domElement.offsetHeight * pixelRatio);
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
    set setCameraPos(data: { target: { x: number, y: number, z: number }, zoom: number }) {
        this.controls.setTarget(data.target.x,data.target.y,data.target.z,false);
        this.controls.zoomTo(data.zoom,false);
        this.controls.polarAngle = 0.8726646259971647;
        this.controls.azimuthAngle = 3.9269908169872414;
    }
    get getCameraPos(): { target: { x: number, y: number, z: number }, zoom: number } {
        const target = new Vector3();
        this.controls.getTarget(target);
        return {
            target,
            //@ts-ignore
            zoom: this.controls._zoom
        };
    }
}