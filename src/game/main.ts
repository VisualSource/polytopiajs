import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import CameraControls from 'camera-controls';

class Polytopia extends THREE.Scene{}
export let scene: Polytopia;

export function init(context: WebGL2RenderingContext , canvas:HTMLCanvasElement){
    const SCREEN_WIDTH = window.innerWidth;
	const SCREEN_HEIGHT = window.innerHeight;
    const aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    const frustumSize = 600;

    CameraControls.install({THREE});
    scene = new THREE.Scene();
    const clock = new THREE.Clock();
    const renderer = new THREE.WebGLRenderer( { canvas, context, antialias: false } );
    const composer = new EffectComposer( renderer );
    const camera = new THREE.PerspectiveCamera( 75, aspect, 0.1, 1000 );

    
    composer.addPass( new RenderPass( scene, camera ) );

    const cameraControls = new CameraControls(camera, canvas);


    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.set(0,0,0);
    scene.add( cube );

    camera.position.z = 5;


    const gridHelper = new THREE.GridHelper( 10, 10 );
    scene.add( gridHelper );

    function animate() {
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
export function destory(){}