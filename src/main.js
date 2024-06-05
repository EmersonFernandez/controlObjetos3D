import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {floor} from './building_floor'



// Configuración inical de la escena, cámara y renderizado
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 3000);
camera.position.set(-100.44349096447223, 170.57522619912615, 160.22600034340923); // Ajusta la posición de la cámara para estar más cerca del modelo
camera.fog = new THREE.Fog(0xe6e6e6, 5); // Niebla 

//-117.44349096447223
//139.57522619912615
//134.22600034340923

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Habilitar las sombras en el renderizador
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Tipo de sombras suaves
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

// Añadir luz hemisferica
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444);
hemisphereLight.position.set(0, 20, 0);
scene.add(hemisphereLight);

// Anadir luz direccional (sol)
const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(10, 80, 40);
directionalLight.castShadow = true; // Habilitar sombras en la luz direccional

// Configurar las sombras de la luz direccional
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 100; // Incrementar el valor far
directionalLight.shadow.camera.left = -100; // Ajustar los límites de la cámara
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
directionalLight.shadow.camera.bottom = -100;

scene.add(directionalLight);
const textureLoader = new THREE.TextureLoader();

// Anadir suelo
const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xe6e6e6 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = - Math.PI / 2;
plane.position.y = -1;
plane.receiveShadow = true; // Permitir que el suelo reciba sombras
scene.add(plane);

// Cargar la textura de fondo
textureLoader.load('./assets/vignette.jpg', function (texture) {
    scene.background = texture;
});


// Añadir controles
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

// Raycaster y mouse vector
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector3();


//Title 
const boxTitle = document.createElement('div');
const title1 = document.createElement('p');
const title2 = document.createElement('p');
document.body.appendChild(boxTitle);
boxTitle.classList.add('title');
boxTitle.appendChild(title1);
boxTitle.appendChild(title2);
boxTitle.style.display = 'none';
boxTitle.style.position = 'absolute';
boxTitle.style.top = 0;
boxTitle.style.left = '50%';
boxTitle.style.transform = 'translate(-50%)'
boxTitle.style.textAlign = 'center';
boxTitle.style.color = '#3498db'
boxTitle.style.margin = '10px 0';
title1.style.fontSize = '2.0rem';
title1.style.fontWeight = 'bold'
title2.style.fontSize = '1.5rem';
title1.style.margin = 0;
title1.style.padding = 0;
title2.style.margin = 0;
title2.style.padding = 0;
title1.textContent = 'GEOTECTURAS';
title2.textContent = 'TECNOLOGÍA PARA LA GESTIÓN URBANA';


// Tooltip
const tooltip = document.createElement('div');
tooltip.classList.add('div-tooltip');
tooltip.style.position = 'absolute';
// tooltip.style.backgroundColor = 'transparent';
tooltip.style.color = 'white';
tooltip.style.padding = '5px';
tooltip.style.borderRadius = '5px';
tooltip.style.display = 'none';
tooltip.style.textAlign = 'center';
tooltip.style.top = '20px';
tooltip.style.right = '20px';
tooltip.style.width = '300px'; // Ancho del tooltip como porcentaje del ancho de la ventana
tooltip.style.maxWidth = '300px'; // Ancho máximo absoluto para grandes pantallas
document.body.appendChild(tooltip);

const h1 =  document.createElement('p');
const p1 = document.createElement('p');
const p2 = document.createElement('p');
const footer = document.createElement('p');

tooltip.appendChild(h1);
tooltip.appendChild(p1);
tooltip.appendChild(p2);
tooltip.appendChild(footer);

// Logo
const logo = document.createElement('img');
const logoBackground = document.createElement('div');
logoBackground.appendChild(logo);
logo.src = './assets/logo.png'; // Comillas corregidas
logo.alt = 'Logo';
logoBackground.style.position = 'absolute';
logoBackground.style.bottom = '20px';
logoBackground.style.right = '20px';
logoBackground.style.display = 'none';
logo.style.width = '320px'; // Ancho del logo como porcentaje del ancho de la ventana
logo.style.maxWidth = '200px'; // Ancho máximo absoluto para grandes pantallas
logo.style.height = 'auto'; // Altura automática para mantener la relación de aspecto
document.body.appendChild(logoBackground);





// Buildings
let previousIntersected = null;
const originalColors = new Map();
let selectedElement = null;

function onMouseMove(event) {
    // Convertir coordenadas del mouse a coordenadas normalizadas del dispositivo
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Actualizar raycaster
    raycaster.setFromCamera(mouse, camera);

    // Verificar si el modelo está cargado
    if (loadedModel) {
        // Calcular objetos intersectados
        const intersects = raycaster.intersectObject(loadedModel, true);
        if (intersects.length > 0) {
            const intersected = intersects[0].object;

            // Restaurar el color del objeto previamente intersectado
            if (previousIntersected && previousIntersected !== intersected) {
                const originalColor = originalColors.get(previousIntersected.uuid);
                if (originalColor) {
                    previousIntersected.material.color.set(originalColor);
                }
            }

            // Cambiar el color del objeto intersectado a amarillo
            if (intersected.parent.parent.parent.name == 'Buildings') {
                if (!originalColors.has(intersected.uuid)) {
                    originalColors.set(intersected.uuid, intersected.material.color.clone());
                }
                intersected.material.color.set(0xffff00); // Color amarillo
                previousIntersected = intersected;
                // Ocultamos el tooltip
                tooltip.style.display = 'none';

                // Almacenar información del elemento intersectado
                selectedElement = {
                    name: intersected.name,
                    parentName: intersected.parent.parent.name,
                    object:intersected
                };
            }

        } else {
            // Restaurar el color del objeto previamente intersectado
            if (previousIntersected) {
                const originalColor = originalColors.get(previousIntersected.uuid);
                if (originalColor) {
                    previousIntersected.material.color.set(originalColor);
                }
                previousIntersected = null;
            }

            // Ocultar tooltip
            tooltip.style.display = 'none';
            selectedElement = null;
        }
    }
}

// Función para manejar el clic del mouse
function onMouseClick(event) {
    if (selectedElement) {
        const key = selectedElement.parentName;
        const dataKey = floor[key];
        tooltip.style.display = 'block';
        h1.innerHTML  = `PLAN PARCIAL PARQUE DE SAN ANTONIO MODELACIÓN PLAN DE MASAS`;
        p1.innerHTML  = `Número de piso : <strong> ${dataKey.number} </strong>`;
        p2.innerHTML  = `Tipo de Oferta: <strong> ${dataKey.offer} </strong> `;
        footer.innerHTML  = `Unidad de Actuación Urbanística <strong> ${dataKey.UrbanPlanning} </strong>`;
    }
}

// Escuchar eventos de movimiento del mouse
window.addEventListener('mousemove', onMouseMove);
// Escuchar eventos de clic del mouse
window.addEventListener('click', onMouseClick);

let loadedModel;

// Función para cargar el HDR y el modelo FBX
function loadScene() {
    return new Promise((resolve, reject) => {
        // Cargar entorno HDR
        new RGBELoader()
            .setPath('./assets/')
            .load('MR_INT-005_WhiteNeons_NAD.hdr', function (texture) {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                scene.environment = texture; // Solo usar como entorno para reflejos

                // Cargar modelo FBX
                const loader = new FBXLoader();
                loader.load('./assets/ControlObjetos.fbx', function (object) {
                    console.log(object);
                    // Ajuste de la escala, posición y rotación del modelo
                    object.position.set(-20, -1477, 90);
                    object.rotation.set(-Math.PI / 2, 0, Math.PI / 8); // Ajuste de rotación en radianes
                    object.castShadow = true; // Habilitar sombras en el modelo

                    object.traverse(function (child) {
                        if (child.isMesh) {
                            child.castShadow = true; // Habilitar sombras en cada malla del modelo
                            child.receiveShadow = true; // Permitir que cada malla reciba sombras
                        }
                    });
                    scene.add(object);
                    loadedModel = object; // Guardar referencia al modelo cargado
                    resolve(); // Resolver la promesa una vez que todo se haya cargado
                }, undefined, function (error) {
                    reject(error); // Rechazar la promesa si hay un error
                });
            }, undefined, function (error) {
                reject(error); // Rechazar la promesa si hay un error
            });
    });
}


// Funciones 
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    console.log(camera);
}

// Iniciar la cargar de la escena
loadScene().then(() => {
    // Ocultar el spinner y el texto de carga una vez que todo se haya cargado
    document.getElementById('loader-container').style.display = 'none';
    logoBackground.style.display = 'block';
    boxTitle.style.display = 'block';
    animate();
}).catch((error) => {
    console.error('Error loading scene : ', error);
    alert('Error loading scene. Check the console for details');
});


// Función para manejar el redimensionamiento de la ventana del navegador
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Escuchar eventos de redimensionamiento de ventana
window.addEventListener('resize', onWindowResize);
