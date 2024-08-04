import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';

// Your existing code for handling the start button, video, and audio
const beginButton = document.querySelector('.begin-button');
const beginContainer = document.querySelector('.begin-container');
const video = document.getElementById('intro-video');
const audio = document.getElementById('bg-music');
const loadingScreen = document.getElementById('loading-screen');
const pageSections = document.querySelectorAll('.page-section');

// Hide the page sections initially
pageSections.forEach(section => {
    section.style.display = 'none';
});

window.addEventListener('load', function() {
    // Ensure the START button appears after the pulse effect ends
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        beginContainer.style.display = 'flex';
    }, 7000); // Show the START button after the pulse effect ends
});

beginButton.addEventListener('click', () => {
    console.log('START button clicked');
    beginContainer.style.display = 'none';
    document.querySelector('.video-container').style.display = 'block';
    video.play();
    audio.play().catch(error => {
        console.log('Audio play was prevented:', error);
    });
});

// Function to fade out audio
function fadeOutAudio(audio, duration) {
    console.log('Fading out audio...');
    let volume = audio.volume;
    const step = volume / (duration / 50);

    const fadeAudio = setInterval(() => {
        if (volume > 0) {
            volume -= step;
            if (volume < 0) volume = 0;
            audio.volume = volume;
        } else {
            clearInterval(fadeAudio);
            audio.pause();
            audio.currentTime = 0; // Reset the audio
            console.log('Audio fade out complete.');
        }
    }, 50);
}

// Function to handle the transition after the video ends
function handleTransition() {
    console.log('Video ended, transitioning now...');

    fadeOutAudio(audio, 2000); // Fade out audio over 2 seconds

    // Fade out video
    video.style.transition = 'opacity 2s ease';
    video.style.opacity = 0;

    setTimeout(() => {
        console.log('Video fade out complete, starting 3.js scene...');
        document.querySelector('.video-container').style.display = 'none'; // Hide the video container
        document.body.style.overflow = 'auto'; // Allow scrolling

        // Show page sections after video ends
        pageSections.forEach(section => {
            section.style.display = 'block';
        });

        startThreeJS(); // Start the 3.js scene
    }, 2000); // Wait for the fade-out to complete before transitioning
}

// Event listener for when the video ends
video.addEventListener('ended', handleTransition);

// Function to start the Three.js scene
function startThreeJS() {
    console.log('Starting 3.js scene...');

    // Minimal Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg') });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Set tone mapping and exposure
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.65;

    // Add orbit controls to rotate around the torus knot
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Create the twisting torus knot geometry
    const geometry = new THREE.TorusKnotGeometry(1.0, 0.4, 100, 16);
    const material = new THREE.MeshStandardMaterial({
        metalness: 0.2,
        roughness: 0.0,
        envMapIntensity: 1.0,
    });

    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    // Add lightings
    const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    camera.position.z = 5;

    // Load environment map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const exrLoader = new EXRLoader();
    exrLoader.load('textures/piz_compressed.exr', function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
        torusKnot.material.envMap = exrCubeRenderTarget.texture;
        torusKnot.material.needsUpdate = true;
        scene.background = texture;
    });

    // Scroll-based animations
    const animationScripts = [];

    animationScripts.push({
        start: 0,
        end: 40,
        func: () => {
            camera.lookAt(torusKnot.position);
            camera.position.set(0, 1, 2);
            torusKnot.position.z = lerp(-10, 0, scalePercent(0, 40));
        },
    });

    animationScripts.push({
        start: 40,
        end: 60,
        func: () => {
            camera.lookAt(torusKnot.position);
            camera.position.set(0, 1, 2);
            torusKnot.rotation.z = lerp(0, Math.PI, scalePercent(40, 60));
        },
    });

    animationScripts.push({
        start: 60,
        end: 80,
        func: () => {
            camera.position.x = lerp(0, 5, scalePercent(60, 80));
            camera.position.y = lerp(1, 5, scalePercent(60, 80));
            camera.lookAt(torusKnot.position);
        },
    });

    animationScripts.push({
        start: 80,
        end: 101,
        func: () => {
            torusKnot.rotation.x += 0.01;
            torusKnot.rotation.y += 0.01;
        },
    });

    function lerp(x, y, a) {
        return (1 - a) * x + a * y;
    }

    function scalePercent(start, end) {
        return (scrollPercent - start) / (end - start);
    }

    let scrollPercent = 0;

    document.body.onscroll = () => {
        scrollPercent =
            ((document.documentElement.scrollTop || document.body.scrollTop) /
                ((document.documentElement.scrollHeight || document.body.scrollHeight) -
                    document.documentElement.clientHeight)) *
            100;
    };

    function playScrollAnimations() {
        animationScripts.forEach((a) => {
            if (scrollPercent >= a.start && scrollPercent < a.end) {
                a.func();
            }
        });
    }

    function animate() {
        requestAnimationFrame(animate);
        playScrollAnimations();
        controls.update();
        renderer.render(scene, camera);
    }

    animate();
}

// Ensure the Three.js scene starts after the video ends
startThreeJS();
