import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import CameraControls from 'camera-controls';
import { Water} from './objects/dynamicBlocks';
import Interaction from './Interaction';
import globalDispatcher from './EventDispatcher';


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
export function init(context: WebGL2RenderingContext, canvas:HTMLCanvasElement){
    CameraControls.install({THREE: THREE});
    scene = new Polytopia();
    scene.background = new THREE.Color( 0xf0f0f0 );
    const SCREEN_WIDTH = window.innerWidth;
	const SCREEN_HEIGHT = window.innerHeight;
    const aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    const frustumSize = 200;
    const clock = new THREE.Clock();
    const renderer = new THREE.WebGLRenderer( { canvas, context, antialias: true} );
    const composer = new EffectComposer( renderer );
    const camera = new THREE.OrthographicCamera(frustumSize * aspect / - 2,  frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 1000 );
    camera.position.set( 0, 0, 5 );
    composer.addPass( new RenderPass( scene, camera ) );

    const cameraControls = new CameraControls(camera, canvas);
  
    scene.add(new Water({}));
    //scene.add(new DynamicBlock({position:{x:5, y:2,z:3}}));
    scene.add(createlights());
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
        const delta = clock.getDelta();
        cameraControls.update( delta );
        requestAnimationFrame( animate );
        interaction.render();
        composer.render();

    }
    window.addEventListener("resize", handleResizeFunc, false);
    renderer.setSize(SCREEN_WIDTH,SCREEN_HEIGHT);
    renderer.setPixelRatio( window.devicePixelRatio );
    composer.setSize(SCREEN_WIDTH,SCREEN_HEIGHT);
    composer.setPixelRatio( window.devicePixelRatio );
    animate();

}
export function destory(){
    window.removeEventListener("resize",handleResizeFunc, false);
    globalDispatcher.removeAllListeners();
    scene.delete();
}

function createlights(): THREE.Group{
    const lights = new THREE.Group();
    lights.name = "lights";

    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
	hemiLight.color.setHSL( 0.6, 1, 0.6 );
    hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
	hemiLight.position.set( 0, 50, 0 );
    lights.add( hemiLight );
    
    const dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
	dirLight.color.setHSL( 0.1, 1, 0.95 );
	dirLight.position.set( - 1, 1.75, 1 );
	dirLight.position.multiplyScalar( 30 );
    lights.add( dirLight );
    
    return lights;
}