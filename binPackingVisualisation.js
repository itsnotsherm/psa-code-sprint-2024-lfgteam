import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, containerMesh;
let containerSize = [10, 10, 10];
let items = [];
let currentY = -containerSize[1] / 2;

// Initialize the 3D scene
function initScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xffffff); // White background
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("container").appendChild(renderer.domElement);
    camera.position.set(20, 20, 50);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    window.addEventListener('resize', onWindowResize);
    animate();
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Set container dimensions and update scene
function setContainerDimensions(width, height, depth) {
    containerSize = [width, height, depth];
    currentY = -containerSize[1] / 2;
    clearItems(); // Clear items when resetting container

    if (containerMesh) {
        scene.remove(containerMesh);
        containerMesh.geometry.dispose();
        containerMesh.material.dispose();
    }

    const containerGeometry = new THREE.BoxGeometry(width, height, depth);
    const containerMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
    containerMesh = new THREE.Mesh(containerGeometry, containerMaterial);
    scene.add(containerMesh);

    renderer.render(scene, camera);
}

// Update addBox function to handle size checks and display corresponding error messages
function addBox(width, height, depth) {
    // Check for positive dimensions
    if (width <= 0 || height <= 0 || depth <= 0) {
        showError("Box dimensions must be greater than zero.");
        return;
    }

    // Check if the box would exceed the container's width or depth
    if (width > containerSize[0] || depth > containerSize[2]) {
        showError("Box exceeds container width or depth.");
        return;
    }

    // If no items exist, initialize currentY from the container base
    if (items.length === 0) {
        currentY = -containerSize[1] / 2; // Reset to the bottom of the container
    }

    // Check if the new box would exceed the bin's height limit
    if (currentY + height > containerSize[1] / 2) {
        showError("Box exceeds container height.");
        return;
    }

    // Create and position the box
    const boxGeometry = new THREE.BoxGeometry(width, height, depth);
    const boxMaterial = new THREE.MeshBasicMaterial({ color: getRandomColor() });
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);

    // Position and add the box
    currentY += height / 2; // Center box at the currentY position
    boxMesh.position.set(0, currentY, 0);
    currentY += height / 2; // Update currentY for the next box

    scene.add(boxMesh);
    items.push(boxMesh);
}

// Function to show an error message for 3 seconds
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.innerText = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 3000);
}


// Generate a random color for each new box
function getRandomColor() {
    return Math.floor(Math.random() * 0xffffff);
}

// Clear all items (boxes) from the scene
function clearItems() {
    items.forEach(item => {
        scene.remove(item);
        item.geometry.dispose();
        item.material.dispose();
    });
    items = [];
    currentY = -containerSize[1] / 2;
}

// Function to reset the container to default size and clear items
function resetContainer() {
    containerSize = [10, 10, 10];
    currentY = -containerSize[1] / 2; // Reset stacking to the bottom of the container

    document.getElementById('binWidth').value = 10;
    document.getElementById('binHeight').value = 10;
    document.getElementById('binDepth').value = 10;

    clearItems();

    if (containerMesh) {
        scene.remove(containerMesh);
        containerMesh.geometry.dispose();
        containerMesh.material.dispose();
    }

    const containerGeometry = new THREE.BoxGeometry(...containerSize);
    const containerMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
    containerMesh = new THREE.Mesh(containerGeometry, containerMaterial);
    scene.add(containerMesh);

    renderer.render(scene, camera);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Event listeners
document.getElementById("setBinDimensions").addEventListener("click", () => {
    const width = parseFloat(document.getElementById("binWidth").value);
    const height = parseFloat(document.getElementById("binHeight").value);
    const depth = parseFloat(document.getElementById("binDepth").value);
    setContainerDimensions(width, height, depth);
});

// Event listener to add a box with dimension constraints
document.getElementById("addBox").addEventListener("click", () => {
    const width = parseFloat(document.getElementById("boxWidth").value);
    const height = parseFloat(document.getElementById("boxHeight").value);
    const depth = parseFloat(document.getElementById("boxDepth").value);
    addBox(width, height, depth);
});

document.getElementById("resetbutton").addEventListener("click", resetContainer);

// Initialize the scene
initScene();
setContainerDimensions(containerSize[0], containerSize[1], containerSize[2]);
