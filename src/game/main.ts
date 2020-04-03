import * as THREE from 'three';




class Polytopia extends THREE.Scene{}
export let scene: Polytopia;

export function init(context: WebGL2RenderingContext , canvas:HTMLCanvasElement){
    const SCREEN_WIDTH = window.innerWidth;
	const SCREEN_HEIGHT = window.innerHeight;
    const aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    const frustumSize = 600;
    
    scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer( { canvas, context, antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
    const camera = new THREE.OrthographicCamera( 0.5 * frustumSize * aspect / - 2, 0.5 * frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 150, 1000 );

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );


    function animate() {
        requestAnimationFrame( animate );
        renderer.render( scene, camera );
    }
    animate();
}
export function destory(){}