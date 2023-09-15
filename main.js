import * as THREE from 'three';
// import { OrbitControls } from '/jsm/controls/OrbitControls.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// global variables
let scene;
let camera;
let renderer;
const canvas = document.querySelector('.webgl');

// scene setup
scene = new THREE.Scene();

// camera setup
const fov = 60;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 1000;

camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 30;
scene.add(camera);

// renderer setup
renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1);
renderer.autoClear = false;
renderer.setClearColor(0x000000, 0.0);

// orbit control setup
const controls = new OrbitControls(camera, renderer.domElement);

// earth geometry
const earthGeometry = new THREE.SphereGeometry(10, 128, 128);

const earthTexture = new THREE.TextureLoader().load('public/texture/4kice.jpg' );
const beBop = new THREE.TextureLoader().load('public/texture/4kbump.jpg' );
// earth material
const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthTexture,
    bumpMap: beBop,
});

// earth mesh
const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earthMesh);


// cloud Geometry
const cloudGeometry = new THREE.SphereGeometry(10.01, 128, 128);

const cloudTexture = new THREE.TextureLoader().load('public/texture/earthCloud.png');

// cloud metarial
const cloudMaterial = new THREE.MeshPhongMaterial({
    map: cloudTexture,
    transparent: true,
});

// cloud mesh
const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
scene.add(cloudMesh);


// galaxy geometry
const starGeometry = new THREE.SphereGeometry(400, 128, 128);

const galaxyTexture = new THREE.TextureLoader().load('public/texture/galaxy.png')

// galaxy material
const starMaterial = new THREE.MeshBasicMaterial({
    map : galaxyTexture,
    side: THREE.BackSide
});

// galaxy mesh
const starMesh = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starMesh);

// ambient light
const ambientlight = new THREE.AmbientLight(0xedd59e, 0.15);
scene.add(ambientlight);

const pointLight = new THREE.PointLight( 0xedd59e, 50000, 1000 );
pointLight.position.set( 49, 49, 49 );
scene.add( pointLight );

const sphereSize = 1;

// handling resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}, false);

// spinning animation
const animate = () => {
    requestAnimationFrame(animate);
    starMesh.rotation.y -= 0.0003;
    earthMesh.rotation.y -= 0.00022;
    cloudMesh.rotation.y -= 0.00021;
    controls.update();
    render();
};

// rendering
const render = () => {
    renderer.render(scene, camera);
}

animate();