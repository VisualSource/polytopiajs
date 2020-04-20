import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import {FXAAShader} from 'three/examples/jsm/shaders/FXAAShader';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass';
import CameraControls from 'camera-controls';
import Interaction from './Interaction';
import globalDispatcher from './EventDispatcher';

import Stats from 'stats.js';
const stats = new Stats();
class Polytopia extends THREE.Scene{
    constructor(){
        super();
        this.name = "polytopia";
    }
    delete(){
        this.children.forEach(group=>{
            this.remove(group);
        });
        this.dispose();
    }
}
export let scene: Polytopia;
let handleResizeFunc: any;
let frameId: number;
export function init(context: WebGL2RenderingContext, canvas:HTMLCanvasElement){
    document.body.appendChild(stats.dom);
    CameraControls.install({THREE: THREE});
    scene = new Polytopia();
    scene.background = new THREE.Color( 0xf0f0f0 );
    const SCREEN_WIDTH = window.innerWidth;
	const SCREEN_HEIGHT = window.innerHeight;
    const aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    const frustumSize = 200;
    const clock = new THREE.Clock();
    const renderer = new THREE.WebGLRenderer( { canvas, context, antialias: true} );
    renderer.shadowMap.enabled = true;
    const composer = new EffectComposer( renderer );
    const camera = new THREE.OrthographicCamera(frustumSize * aspect / - 2,  frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 0.1, 1000 );
    camera.position.set( 0, 3, 25 );
    composer.addPass( new RenderPass( scene, camera ) );
    
    const FXAA = new ShaderPass(FXAAShader);
    (FXAA as any).uniforms["resolution"].value.set(1/SCREEN_WIDTH,1/SCREEN_HEIGHT);
    composer.addPass(FXAA);

    const cameraControls = new CameraControls(camera, canvas);
    scene.add(createlights());
    //scene.add(new Water({}));
    //scene.add(new Ocean({position:{z:2, x:2, y:2}}))
    
    const handleResize = ()=>{
        const newAspect = window.innerWidth / window.innerHeight;
        camera.left = - frustumSize * newAspect / 2;
		camera.right = frustumSize * newAspect / 2;
		camera.top = frustumSize / 2;
		camera.bottom = - frustumSize / 2;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth,window.innerHeight);
        composer.setSize(window.innerWidth,window.innerHeight);
        renderer.setPixelRatio( window.devicePixelRatio );
        composer.setPixelRatio( window.devicePixelRatio );
    }
    handleResizeFunc = handleResize;
    const interaction = new Interaction(scene, camera, canvas);
    const animate = () => {
        stats.begin();
        const delta = clock.getDelta();
        cameraControls.update( delta );
        frameId = requestAnimationFrame( animate );
        interaction.render();
        composer.render();
        stats.end();

    }
    window.addEventListener("resize", handleResizeFunc, false);
    renderer.setSize(SCREEN_WIDTH,SCREEN_HEIGHT);
    renderer.setPixelRatio( window.devicePixelRatio );
    composer.setSize(SCREEN_WIDTH,SCREEN_HEIGHT);
    composer.setPixelRatio( window.devicePixelRatio );
    animate();

}
export function destory(){
    cancelAnimationFrame(frameId);
    window.removeEventListener("resize",handleResizeFunc, false);
    globalDispatcher.removeAllListeners();
    stats.dom.remove();
    scene?.delete();
}

function createlights(): THREE.Group{
    const lights = new THREE.Group();
    lights.name = "lights";
    const directionalLight = new THREE.DirectionalLight(0xddffdd, 0.6);
    directionalLight.position.set(0,200,0);
    directionalLight.rotation.set(25,0,0);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    lights.add(directionalLight);
    const hemisphere = new THREE.HemisphereLight();
    lights.add(hemisphere);
    lights.add(new THREE.AmbientLight(0xaaaaaa, 0.2));
    
    return lights;
}