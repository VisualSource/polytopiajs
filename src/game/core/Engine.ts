import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import type { Pass } from 'three/examples/jsm/postprocessing/Pass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { BehaviorSubject } from 'rxjs';
import CameraControls from 'camera-controls';
import { WebGLRenderer, OrthographicCamera, Fog,
    MathUtils, MOUSE, Quaternion, Vector2 , Vector3, 
    Vector4, Spherical, Matrix4, Raycaster, Box3, Sphere, TextureLoader,
    Group, HemisphereLight, DirectionalLight, Color } from 'three';

import EventEmitter from '../core/EventEmitter';
import { ObjectEvents, SystemEvents } from '../events/systemEvents';

import UIScene from '../world/scences/UIScene';
import TileScene from '../world/scences/TileScene';
import UnitScene from '../world/scences/UnitScene';
import SelectorScene from '../world/scences/SelectorScene';

import { isMobile } from '../../utils/mobile';
import TouchTap from './TouchTap';

import type { SystemEventListener } from '../core/EventEmitter';
import type InstancedObject from '../world/rendered/InstancedObject';
import type CityTile from '../world/rendered/CityTile';
import type { CameraPosition } from './types';


interface Scenes {
    unit: UnitScene,
    ui: UIScene,
    tile: TileScene,
    selector: SelectorScene
}

interface Renders {
    [key: string]: {
        composer: EffectComposer;
        effects: {
            [key: string]: Pass
        }
    }
}

interface Hover {
    INTERSECTION: any; 
    pointer: Vector2;
}

interface SceneOptions { 
    lights?: boolean; 
    rootScene?: boolean;
    ffaa?: boolean;
    outline?: boolean;
}

export default class Engine implements SystemEventListener {
    private controls: CameraControls;
    private renderer: WebGLRenderer;
    private renders: Renders = {};
    private camera: OrthographicCamera;
    private raycaster: Raycaster = new Raycaster();
    private textureLoader: TextureLoader = new TextureLoader();
    private touch: TouchTap | null = null;
    private hover: Hover = {
        INTERSECTION: null,
        pointer: new Vector2()
    };
    private readonly is_mobile: boolean = isMobile();
    public events: EventEmitter = new EventEmitter();
    public scenes: Scenes;
    public level: BehaviorSubject<string> = new BehaviorSubject("overworld");
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
        // Create renderer
        this.renderer = new WebGLRenderer({ 
            antialias: true, 
            canvas: this.canvas,
        });
        // Create Scenes
        this.scenes = {
            tile: new TileScene(this.level),
            ui: new UIScene(this.level),
            unit: new UnitScene(this.level),
            selector: new SelectorScene(this.level)
        }
        // create camera
        this.camera = new OrthographicCamera( 
            window.innerWidth / -200,
            window.innerWidth / 200,
            window.innerHeight / 200,
            window.innerHeight / -200,
            1, 
            1000 
        );

        // Effect composer setup
        this.renderer.setSize(window.innerWidth,window.innerHeight, true);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.camera.position.set(0,0,100);

        this.initControls();
        this.createPass("tile",this.scenes.tile,{ lights: true, rootScene: true, ffaa: true });
        this.createPass("unit",this.scenes.unit,{ lights: true, ffaa: true });
        this.createPass("selector",this.scenes.selector,{ lights: true, ffaa: true });
        this.createPass("ui",this.scenes.ui,{});
      
        this.renderer.setAnimationLoop(this.animationLoop);
    }
    private createPass<T extends THREE.Scene>(key: string, scene: T, opt: SceneOptions) {
        const composer = new EffectComposer(this.renderer);
        composer.addPass(new RenderPass(scene,this.camera));

        this.renders[key] = {
            composer,
            effects: {}
        }

        if(opt?.ffaa) {
            const fxaa = new ShaderPass(FXAAShader);
            const pixelRatio = this.renderer.getPixelRatio();
            
            fxaa.material.uniforms['resolution'].value.x = 1 / (this.renderer.domElement.offsetWidth * pixelRatio);
            fxaa.material.uniforms['resolution'].value.y = 1 / (this.renderer.domElement.offsetHeight * pixelRatio);
            composer.addPass(fxaa);
            this.renders[key].effects["ffaa"] = fxaa;
        }
        if(opt?.outline) {
            const outlinePass = new OutlinePass(
                new Vector2(window.innerWidth,window.innerHeight), scene, this.camera
            );
            outlinePass.visibleEdgeColor = new Color('#ffffff');
            outlinePass.hiddenEdgeColor = new Color('#190a05');
            outlinePass.edgeStrength = 3;
            outlinePass.edgeGlow = 1;
            outlinePass.edgeThickness = 1;
            outlinePass.pulsePeriod = 0;
            outlinePass.usePatternTexture = false;
    
            composer.addPass(outlinePass);
            this.renders[key].effects["outline"] = outlinePass;
        }

        this.initScene(scene,opt?.lights,opt?.rootScene);

    }
    private initControls(){
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

        document.addEventListener("resize",this.resize,true);
        this.renderer.domElement.addEventListener("pointermove",this.onMouseMove,true);

        if(this.is_mobile){
            this.touch = new TouchTap(this.renderer.domElement);
            this.renderer.domElement.addEventListener("touchtap",this.selection_mobile,true);
        } else {
            this.renderer.domElement.addEventListener("click",this.selection_normal,true);    
        }
    }
    private initScene<T extends THREE.Scene>(scene: T, lights: boolean = false, root: boolean = false): void {
        if(root){
            const background = this.textureLoader.load(`${import.meta.env.BASE_URL}${this.is_mobile ? `background/mobile_bg.jpg` : "background/desktop_bg.jpg"}`);
            scene.background = background;
            scene.fog = new Fog(0x000000);
        }
        if(lights){
            // lights
            const lightGroup = new Group();
            lightGroup.name = "Lights";
    
            const heimiLight = new HemisphereLight();
            heimiLight.position.set(0,50,0);
            lightGroup.add(heimiLight);
    
            const dirLight = new DirectionalLight();
            dirLight.position.set(-1,1.75,1);
            dirLight.position.multiplyScalar(30);
            lightGroup.add(dirLight);
    
            scene.add(lightGroup);
        }
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

        const scene = this.scenes.tile.getLevel();
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

        if(!(object as CityTile)?.isGameObject || !object.visible) return;

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

        //this.composer.setSize(window.innerWidth,window.innerHeight);
       // this.composer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth,window.innerHeight, true);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.camera.updateProjectionMatrix();

        //const pixelRatio = this.renderer.getPixelRatio();

       // this.fxaa.material.uniforms['resolution'].value.x = 1 / (this.renderer.domElement.offsetWidth * pixelRatio);
       // this.fxaa.material.uniforms['resolution'].value.y = 1 / (this.renderer.domElement.offsetHeight * pixelRatio);
    }
    private hoverUpdate() {
        if(this.is_mobile) return;
        this.raycaster.setFromCamera(this.hover.pointer,this.camera);

        const scene = this.scenes.tile.getLevel();
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
        this.hoverUpdate();

      /*  this.renders["tile"].composer.render(time);
        this.renderer.autoClear = false;
        this.renderer.clearDepth();

        this.renders["selector"].composer.render(time);
        this.renderer.clearDepth();*/

        // tile layer   
        this.renderer.render(this.scenes.tile,this.camera);
        this.renderer.autoClear = false;
        this.renderer.clearDepth();

        // building layer


        // selector layer
        this.renderer.render(this.scenes.selector,this.camera);
        this.renderer.clearDepth();
        // unit layer
        this.renderer.render(this.scenes.unit,this.camera);
        this.renderer.clearDepth();
        // ui layer
        this.renderer.render(this.scenes.ui,this.camera);
        this.renderer.autoClear = true;
        
       // Transparency.update(this.scene.children as any, this.camera);
    }
    set setCameraPos(data: CameraPosition) {
        this.controls.setTarget(data.target.x,data.target.y,data.target.z,false);
        this.controls.zoomTo(data.zoom,false);
        this.controls.polarAngle = 0.8726646259971647;
        this.controls.azimuthAngle = 3.9269908169872414;
    }
    get getCameraPos(): CameraPosition {
        const target = new Vector3();
        this.controls.getTarget(target);
        return {
            target,
            //@ts-ignore
            zoom: this.controls._zoom
        };
    }
}