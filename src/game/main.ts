import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import CameraControls from 'camera-controls';
//import { Interaction } from '../game/interaction/three.interaction.module';
import {DynamicBlock} from './objects/dynamicBlocks';
import Interaction from './interaction/Interaction';


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

export function init(context: WebGL2RenderingContext, canvas:HTMLCanvasElement){
    CameraControls.install({THREE: THREE});
    scene = new Polytopia();
    const SCREEN_WIDTH = window.innerWidth;
	const SCREEN_HEIGHT = window.innerHeight;
    const aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    const frustumSize = 10;
    const clock = new THREE.Clock();
    const renderer = new THREE.WebGLRenderer( { canvas, context, antialias: true} );
    const composer = new EffectComposer( renderer );
    const camera = new THREE.OrthographicCamera(frustumSize * aspect / - 2,  frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 1000 );
    camera.position.set( 0, 0, 5 );
    composer.addPass( new RenderPass( scene, camera ) );

    const cameraControls = new CameraControls(camera, canvas);
    const interaction = new Interaction(renderer, scene, camera);

    
    const mesh = new DynamicBlock({});
       
    scene.add( mesh );
 

    const gridHelper = new THREE.GridHelper( 10, 10 );
    scene.add( gridHelper );

    const animate = () => {
        const delta = clock.getDelta();
        cameraControls.update( delta );
        requestAnimationFrame( animate );
        composer.render();

    }
    renderer.setSize(SCREEN_WIDTH,SCREEN_HEIGHT);
    renderer.setPixelRatio( window.devicePixelRatio );
    composer.setSize(SCREEN_WIDTH,SCREEN_HEIGHT);
    composer.setPixelRatio( window.devicePixelRatio );
    animate();
}
export function destory(){
    scene.delete();
}