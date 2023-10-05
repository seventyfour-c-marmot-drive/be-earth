import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
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


let globalUniforms = {
  time: { value: 0 }
};


let rotationStepG = 0.0004;
let rotationStepE = 0.0002;

let points = [
  {
  	title: 'Los Angeles',
  	lat: 34.052235,
  	long: -118.243683,
    textTitle: 'Los Angeles, Amerikas förenta stater',
    description: 'Los Angeles (ofta förkortat L.A., även kallad City of Angels, från sp. "Änglarna") är den största staden i delstaten Kalifornien och den näst största i USA. Los Angeles ligger i södra Kalifornien i sydvästra delen av USA och är huvudort i Los Angeles County. Los Angeles grundades av spanjorer den 4 september 1781 som El Pueblo de Nuestra Señora la Reina de los Ángeles del Río de Porciúncula – "Vår frus änglarnas drottnings stad vid floden Porciuncula". Platsen låg på mexikanskt område fram till 1846, då den kom att tillhöra USA.',
    linkUp: 'https://sv.wikipedia.org/wiki/Los_Angeles'
  },
  {
    title: 'Bilbao',
    lat: 43.262985,
    long: -2.935013,
    textTitle: 'Bilbao, Spanien',
    description: 'Bilbao (baskiska: Bilbo) är en kommun, spansk hamn- och industristad i provinsen Biscaya i Baskien, cirka 12 km innanför floden Nervións mynning i Biscayabukten. Med förstäder har Bilbao cirka en miljon invånare. Bilbao är en av Spaniens viktigaste industristäder med järn- och stålindustri. Hamnen är Spaniens näst största. År 1997 invigdes Guggenheimmuseet i Bilbao, ett nytt konstmuseum där själva byggnaden har en mycket intressant arkitektur signerad Frank Gehry.',
    linkUp: 'https://sv.wikipedia.org/wiki/Bilbao'
  },
  {
    title: 'Nairobi',
    lat: -1.286389,
    long: 36.817223,
    textTitle: 'Nairobi, Kenya',
    description: 'Nairobi är huvudstad i Kenya och har drygt 3 miljoner invånare. Staden ligger 1 700 meter över havet, på ena randen av det Östafrikanska gravsänkesystemet.[3] Inom stadsgränsen ligger viltreservatet Nairobi nationalpark. Nairobi grundades 1899 i samband med byggnationen av Ugandiska järnvägen från kuststaden Mombasa till Uganda. Nairobi blev 1907 huvudstad i Brittiska Östafrika och är sedan självständigheten 1963 huvudstad i Kenya.',
    linkUp: 'https://sv.wikipedia.org/wiki/Nairobi'
  }
]

renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
renderer.setSize(width, height);
var camera = new THREE.PerspectiveCamera(40, width / height, 1, 1000);

let scene = new THREE.Scene();
let group = new THREE.Group();
let group2 = new THREE.Group();

camera.position.set(49, 49, 49);
camera.lookAt(0, 0, 0);
// var controls = new OrbitControls(camera, renderer.domElement);

var light = new THREE.AmbientLight( 0x303030,3 ); // soft white light
scene.add( light );

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
    
  return [x,y,z];
}

const earthTexture = new THREE.TextureLoader().load('public/texture/4kice.jpg' );
const beBop = new THREE.TextureLoader().load('public/texture/4kbump.jpg' );


var geometry = new THREE.SphereGeometry( 25, 132, 132 );
var material = new THREE.MeshPhongMaterial( {
  map: earthTexture,
  displacementMap: beBop,
  displacementScale: 0.5,
} );
var sphere = new THREE.Mesh( geometry, material );
group.add( sphere );

// cloud Geometry
const cloudGeometry = new THREE.SphereGeometry(25.05, 128, 128);

const cloudTexture = new THREE.TextureLoader().load('public/texture/earthCloud.png');

// cloud material
const cloudMaterial = new THREE.MeshPhongMaterial({
    map: cloudTexture,
    transparent: true,
});

// cloud mesh
const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
group.add(cloudMesh);

// galaxy geometry
const starGeometry = new THREE.SphereGeometry(200, 64, 64);

const galaxyTexture = new THREE.TextureLoader().load('public/texture/8k_stars.jpg')

// galaxy material
const starMaterial = new THREE.MeshBasicMaterial({
    map : galaxyTexture,
    side: THREE.BackSide
});

// galaxy mesh
const starMesh = new THREE.Mesh(starGeometry, starMaterial);
group2.add(starMesh);

// ambient light
const ambientlight = new THREE.AmbientLight(0xfde5be, 0.15);
group2.add(ambientlight);

const pointLight = new THREE.PointLight( 0xfde5be, 220000, 1000 );
pointLight.position.set( 120, 70, 200 );
group2.add( pointLight );

let R = 25.5;
let planes = [];
let i = 0;
let lContain = document.getElementById('leftContainer');
let rContain = document.getElementById('rightContainer');


const markerCount = points.length + 1;

let gMarker = new THREE.PlaneGeometry();
let mMarker = new THREE.MeshBasicMaterial({
  color: 0xffca07,
  onBeforeCompile: (shader) => {
    shader.uniforms.time = globalUniforms.time;
    shader.vertexShader = `
      attribute float phase;
      varying float vPhase;
      ${shader.vertexShader}
    `.replace(
      `#include <begin_vertex>`,
      `#include <begin_vertex>
        vPhase = phase; // de-synch of ripples
      `
    );
    //console.log(shader.vertexShader);
    shader.fragmentShader = `
      uniform float time;
      varying float vPhase;
      ${shader.fragmentShader}
    `.replace(
      `vec4 diffuseColor = vec4( diffuse, opacity );`,
      `
      vec2 lUv = (vUv - 0.5) * 2.;
      float val = 0.;
      float lenUv = length(lUv);
      val = max(val, 1. - step(0.25, lenUv)); // central circle
      val = max(val, step(0.4, lenUv) - step(0.5, lenUv)); // outer circle
      
      float tShift = fract(time * 0.5 + vPhase);
      val = max(val, step(0.4 + (tShift * 0.6), lenUv) - step(0.5 + (tShift * 0.5), lenUv)); // ripple
      
      if (val < 0.5) discard;
      
      vec4 diffuseColor = vec4( diffuse, opacity );`
    );
    //console.log(shader.fragmentShader)
  }
});
mMarker.defines = { USE_UV: " " }; // needed to be set to be able to work with UVs
let markers = new THREE.InstancedMesh(gMarker, mMarker, markerCount);

let phase = [];
let dummy = new THREE.Object3D();

points.forEach(p => {
  i++;
  let pos = calcPosFromLatLonRad(p.lat,p.long,R);
//  let geometry = new THREE.SphereGeometry( 0.4,16,16 );
//  let material = new THREE.MeshBasicMaterial( {
//    side: THREE.DoubleSide,
//  } );
//  let material1 = new THREE.RawShaderMaterial( {
//    uniforms: {
//      time: {value: 0},
//      hover: {value: 0}
//    },
//    transparent: true,
//    vertexShader: document.getElementById('vertexShader').textContent,
//    fragmentShader: document.getElementById('fragmentShader').textContent
//  } );
// <Markers>


  dummy.position.x = pos[0];
  dummy.position.y = pos[1];
  dummy.position.z = pos[2];
  

  dummy.position.setLength(R + 0.1);
  dummy.lookAt(dummy.position.clone().setLength(R + 1));
  dummy.updateMatrix();
  markers.setMatrixAt(i, dummy.matrix);
  phase.push(Math.random());

  const symbol = document.createElement( 'div' );
  symbol.className = 'symbol';
  symbol.textContent = p.title;
  symbol.style.backgroundColor = '#0b0b0b';
  
  symbol.addEventListener( 'click', function(event) {

    if ( event.target.classList.contains('activeInfo') ) {
      event.target.classList.remove('activeInfo');
      rContain.innerHTML='';
      camera.position.setLength(84.87)
      rotationStepG = 0.0004;
      rotationStepE = 0.0002;

      return;
    }

    const divs = document.querySelectorAll('.activeInfo');

    divs.forEach((element) => {
      element.classList.remove('activeInfo');
    });

    camera.position.set(4 * pos[0], 4 * pos[1], 4 * pos[2]);
    camera.lookAt(pos[0], pos[1], pos[2]);
    group.rotation.y = 0;
    group2.rotation.y = 0;
    rotationStepE = 0;
    rotationStepG = 0.0002;

    rContain.innerHTML='';
    const info = document.createElement( 'div' );
    info.className = 'informationBox';
    info.style.backgroundColor = '#0b0b0b';

    const info0 = document.createElement( 'div' );
    info0.className = 'informationBoxTitle';
    info0.textContent = p.textTitle;

    const info1 = document.createElement( 'div' );
    info1.className = 'informationBoxDescription';
    info1.textContent = p.description;

    const info2 = document.createElement( 'a' );
    info2.className = 'informationBoxDescription';
    info2.href = p.linkUp;
    info2.textContent = p.linkUp;
    info2.target="_blank";

    info.appendChild(info0);
    info.appendChild(info1);
    info.appendChild(info2);

    rContain.appendChild(info);

    event.target.classList.add('activeInfo');

  } );

  lContain.appendChild(symbol);

});

gMarker.setAttribute(
 "phase",
 new THREE.InstancedBufferAttribute(new Float32Array(phase), 1)
);

group.add(markers);
planes.push(markers);

scene.add(group);
scene.add(group2);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

let clock = new THREE.Clock();

function Render() {
  let t = clock.getElapsedTime();
  globalUniforms.time.value = t;

  group.rotation.y -= rotationStepE;
  group2.rotation.y -= rotationStepG;

//  markers.forEach(e => {
//  	let conj = new THREE.Quaternion();
//  	conj.copy(group.quaternion);
//    conj.copy(group2.quaternion);
//  	conj.conjugate();
//
//  	e.quaternion.multiplyQuaternions(
//  		conj,
//  		camera.quaternion
//  	);
//  });
  renderer.render(scene, camera);
  window.requestAnimationFrame(Render);
}

Render();