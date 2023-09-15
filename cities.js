import * as THREE from 'three';
// import { OrbitControls } from '/jsm/controls/OrbitControls.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';



const canvas = document.querySelector('.webgl');
let width = window.innerWidth;
let height = window.innerHeight;
var mouse = new THREE.Vector2(), INTERSECTED;
let renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
});

// coordinates 37.773972, -122.431297

let points = [
  {
  	title: 'San Fran',
  	lat: 37.773972,
  	long: -122.43129
  }
]

renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
renderer.setSize(width, height);
var camera = new THREE.PerspectiveCamera(40, width / height, 1, 1000);


// SCENE
let scene = new THREE.Scene();

let group = new THREE.Group();
scene.add(group);
camera.position.set(0, 0, 100);
camera.lookAt(10, 20, 30);
var controls = new OrbitControls(camera, renderer.domElement);

var light = new THREE.AmbientLight( 0x404040,3 ); // soft white light
scene.add( light );

var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
scene.add( directionalLight );


function randn_bm() {
  var u = 0, v = 0;
  while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

function calcPosFromLatLonRad(lat,lon,radius) {
	
  var phi   = (90-lat)*(Math.PI/180);
  var theta = (lon+180)*(Math.PI/180);

  let x = -((radius) * Math.sin(phi)*Math.cos(theta));
  let z = ((radius) * Math.sin(phi)*Math.sin(theta));
  let y = ((radius) * Math.cos(phi));
    
    
  console.log([x,y,z]);
  return [x,y,z];
}


// DO SOMETHING

const earthTexture = new THREE.TextureLoader().load('public/texture/4kice.jpg' );
const beBop = new THREE.TextureLoader().load('public/texture/4kbump.jpg' );


var geometry = new THREE.SphereGeometry( 25, 132, 132 );
var material = new THREE.MeshPhongMaterial( {
  map: earthTexture,
  displacementMap: beBop,
  displacementScale: 0.5,
  // wireframe: true
} );
var sphere = new THREE.Mesh( geometry, material );
group.add( sphere );

// cloud Geometry
const cloudGeometry = new THREE.SphereGeometry(25.05, 128, 128);

const cloudTexture = new THREE.TextureLoader().load('public/texture/earthCloud.png');

// cloud metarial
const cloudMaterial = new THREE.MeshPhongMaterial({
    map: cloudTexture,
    transparent: true,
});

// cloud mesh
const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
group.add(cloudMesh);

// galaxy geometry
const starGeometry = new THREE.SphereGeometry(300, 128, 128);

const galaxyTexture = new THREE.TextureLoader().load('public/texture/galaxy.png')

// galaxy material
const starMaterial = new THREE.MeshBasicMaterial({
    map : galaxyTexture,
    side: THREE.BackSide
});

// galaxy mesh
const starMesh = new THREE.Mesh(starGeometry, starMaterial);
group.add(starMesh);

// ambient light
const ambientlight = new THREE.AmbientLight(0xedd59e, 0.15);
group.add(ambientlight);

const pointLight = new THREE.PointLight( 0xedd59e, 125000, 1000 );
pointLight.position.set( 125, 125, 125 );
group.add( pointLight );



let R = 25.5;
let planes = [];

points.forEach(p => {

  let pos = calcPosFromLatLonRad(p.lat,p.long,R);
  let geometry = new THREE.PlaneGeometry( 1,1 );
  let material = new THREE.MeshBasicMaterial( {
	  color: 0x00ff00,
	  side: THREE.DoubleSide,

	  // wireframe: true
  } );
  let material1 = new THREE.RawShaderMaterial( {
    uniforms: {
      time: {value: 0},
      hover: {value: 0}
    },
    transparent: true,
    vertexShader: document.getElementById('vertexShader').textContent,
	fragmentShader: document.getElementById('fragmentShader').textContent
  } );
  let plane = new THREE.Mesh(geometry,material1);




  plane.position.x = pos[0];
  plane.position.y = pos[1];
  plane.position.z = pos[2];


  group.add(plane);
  planes.push(plane);


});


let time = 0;
function Render() {
  time++;
  // group.rotation.x = time/100;
  planes.forEach(e => {
  	let conj = new THREE.Quaternion();
  	conj.copy(group.quaternion);
  	conj.conjugate();

  	e.quaternion.multiplyQuaternions(
  		conj,
  		camera.quaternion
  	);

  	// e.quaternion.copy(camera.quaternion);
  });
  renderer.render(scene, camera);
  window.requestAnimationFrame(Render);
}
Render();