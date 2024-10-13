import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, containerMesh;
let containerSize = [10, 10, 10];
let items = [];
let occupiedSpaces = []; // Tracks occupied space in the container
let packedVolume = 0;
let currentY = -containerSize[1] / 2; // Start from the bottom

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

    animate(); // Call the animation loop
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop to render the scene
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function canFitAtPosition(x, y, z, width, height, depth) {
    // Ensure box is within container bounds
    if (x + width / 2 > containerSize[0] / 2 || x - width / 2 < -containerSize[0] / 2 ||
        y + height / 2 > containerSize[1] / 2 || y - height / 2 < -containerSize[1] / 2 ||
        z + depth / 2 > containerSize[2] / 2 || z - depth / 2 < -containerSize[2] / 2) {
        return false;
    }

    // Check for overlap with existing boxes
    for (let space of occupiedSpaces) {
        if (!(x + width / 2 <= space.x - space.width / 2 || x - width / 2 >= space.x + space.width / 2 ||
              y + height / 2 <= space.y - space.height / 2 || y - height / 2 >= space.y + space.height / 2 ||
              z + depth / 2 <= space.z - space.depth / 2 || z - depth / 2 >= space.z + space.depth / 2)) {
            return false;
        }
    }

    // Check gravity (must be on the floor or supported by another box)
    if (y - height / 2 === -containerSize[1] / 2) {
        return true; // On the floor
    }

    // Otherwise, check for support below
    for (let space of occupiedSpaces) {
        if (Math.abs(x - space.x) <= space.width / 2 &&
            Math.abs(z - space.z) <= space.depth / 2 &&
            Math.abs((y - height / 2) - (space.y + space.height / 2)) < 0.01) {
            return true; // Supported by a box directly underneath
        }
    }

    return false; // No support beneath, would be floating
}

// Find position for a new box
function findPositionForBox(width, height, depth) {
    const step = 1;
    for (let x = -containerSize[0] / 2; x <= containerSize[0] / 2; x += step) {
        for (let y = -containerSize[1] / 2; y <= containerSize[1] / 2; y += step) {
            for (let z = -containerSize[2] / 2; z <= containerSize[2] / 2; z += step) {
                if (canFitAtPosition(x, y, z, width, height, depth)) {
                    return { x, y, z };
                }
            }
        }
    }
    return null;
}

// Add a box to the container
function addBox(width, height, depth) {
    if (width <= 0 || height <= 0 || depth <= 0) {
        showError("Box dimensions must be greater than zero.");
        return;
    }
    if (width > containerSize[0] || depth > containerSize[2] || height > containerSize[1]) {
        showError("Box exceeds container dimensions.");
        return;
    }

    const position = findPositionForBox(width, height, depth);

    if (position === null) {
        showError("No available space. Box is too big.");
        return;
    }

    const boxGeometry = new THREE.BoxGeometry(width, height, depth);
    const boxMaterial = new THREE.MeshBasicMaterial({ color: getRandomColor() });
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    boxMesh.position.set(position.x, position.y, position.z);

    scene.add(boxMesh);
    items.push(boxMesh);
    occupiedSpaces.push({ x: position.x, y: position.y, z: position.z, width, height, depth });

    updateFeedback(); // Update feedback after adding a box
}

// Show an error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.innerText = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 3000);
}

// Generate a random color
function getRandomColor() {
    return Math.floor(Math.random() * 0xffffff);
}

// Clear all items from the scene
function clearItems() {
    items.forEach(item => {
        scene.remove(item);
        item.geometry.dispose();
        item.material.dispose();
    });
    items = [];
    occupiedSpaces = [];
    currentY = -containerSize[1] / 2;
}

// Reset the container to default size and clear items
function resetContainer() {
    containerSize = [10, 10, 10];
    currentY = -containerSize[1] / 2;
    occupiedSpaces = [];

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

    updateFeedback();
}

// Set the container dimensions based on user input and update the scene
function setContainerDimensions(width, height, depth) {
    containerSize = [width, height, depth];
    currentY = -containerSize[1] / 2;
    clearItems();

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

    updateFeedback();
}

// Update feedback on the page when container reset or box is added
function updateFeedback() {
    // Ensure containerSize is defined and has valid dimensions
    if (!containerSize || containerSize.length !== 3 || containerSize.some(dim => dim <= 0)) {
        console.error('Invalid container size');
        return;
    }

    const totalVolume = containerSize[0] * containerSize[1] * containerSize[2];

    // Ensure totalVolume is not zero to avoid division by zero
    if (totalVolume === 0) {
        console.error('Total volume is zero');
        return;
    }

    const packedVolume = items.reduce((sum, item) => sum + (item.width * item.height * item.depth), 0);
    const remainingVolume = totalVolume - packedVolume;
    const spaceUtilization = (packedVolume / totalVolume) * 100;

    document.getElementById('spaceUtilization').innerText = `${spaceUtilization.toFixed(2)}%`;
    document.getElementById('itemsPacked').innerText = items.length;
    document.getElementById('remainingSpace').innerText = remainingVolume.toFixed(2);
}

// Event listeners
document.getElementById("setBinDimensions").addEventListener("click", () => {
    const width = parseFloat(document.getElementById("binWidth").value);
    const height = parseFloat(document.getElementById("binHeight").value);
    const depth = parseFloat(document.getElementById("binDepth").value);
    setContainerDimensions(width, height, depth);
});

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
