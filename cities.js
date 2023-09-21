import * as THREE from 'three';
// import { OrbitControls } from '/jsm/controls/OrbitControls.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';



const canvas = document.querySelector('.webgl');
let width = window.innerWidth;
let height = window.innerHeight;
var mouse = new THREE.Vector2(), INTERSECTED;
let renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
});


let rotationStepG = 0.0008;
let rotationStepE = 0.0004;


let points = [
  {
  	title: 'San Francisco',
  	lat: 37.773972,
  	long: -122.43129
  },
  {
    title: 'Barcelona',
    lat: 41.390205,
    long: 2.154007
  },
  {
    title: 'Cape Town',
    lat: -33.918861,
    long: 18.423300
  }
]

renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
renderer.setSize(width, height);
var camera = new THREE.PerspectiveCamera(40, width / height, 1, 1000);


// SCENE
let scene = new THREE.Scene();

let group = new THREE.Group();
let group2 = new THREE.Group();


scene.add(group);
scene.add(group2);
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
group2.add(starMesh);

// ambient light
const ambientlight = new THREE.AmbientLight(0xedd59e, 0.15);
group2.add(ambientlight);

const pointLight = new THREE.PointLight( 0xedd59e, 250000, 1000 );
pointLight.position.set( 200, 200, 200 );
group2.add( pointLight );



let R = 25.5;
let planes = [];
let i = 0;
let bcontain = document.getElementById('bcontainer');

points.forEach(p => {
  i++;
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


          const element = document.createElement( 'div' );
          element.className = 'place';
          element.style.backgroundColor = 'rgba(0,127,127,0.75 )';

          const symbol = document.createElement( 'div' );
          symbol.className = 'symbol';
          symbol.textContent = p.title;
          
          symbol.addEventListener( 'click', function () {

            camera.position.set(4 * plane.position.x, 4 * plane.position.y, 4 * plane.position.z);
            camera.lookAt(plane.position.x, plane.position.y, plane.position.z);
            rotationStepE = 0;
            rotationStepG = 0.0004;

          } );


          element.appendChild( symbol );

          bcontain.appendChild(element);

  group.add(plane);
  planes.push(plane);

});

let time = 0;
function Render() {
  time++;

  group.rotation.y -= rotationStepE;
  group2.rotation.y -= rotationStepG;

  planes.forEach(e => {
  	let conj = new THREE.Quaternion();
  	conj.copy(group.quaternion);
    conj.copy(group2.quaternion);
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