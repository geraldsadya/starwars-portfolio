import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Your existing code for handling the start button, video, and audio
const beginButton = document.querySelector('.begin-button');
const beginContainer = document.querySelector('.begin-container');
const video = document.getElementById('intro-video');
const audio = document.getElementById('bg-music');
const loadingScreen = document.getElementById('loading-screen');
const pageSections = document.querySelectorAll('.page-section');

// Add this function to your script.js

const GLYPHS = 'ラドクリフマラソンわたしワタシんょンョたばこタバコとうきょうトウキョウ0123456789±!@#$%^&*()_+ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function applyEffect() {
    const text = 'START';
    const speed = 5;

    beginButton.innerHTML = text.split('').map((char, index) =>
        `<span data-char="${char}"
        style="--index: ${index}; --char-1: '${GLYPHS[Math.floor(Math.random() * GLYPHS.length)]}'; --char-2: '${GLYPHS[Math.floor(Math.random() * GLYPHS.length)]}'; --char-3: '${GLYPHS[Math.floor(Math.random() * GLYPHS.length)]}';">
        ${char}
        </span>`
    ).join('');

    beginButton.classList.add('animate');

    setTimeout(() => {
        beginButton.classList.remove('animate');
    }, speed * 1000);
}

window.addEventListener('load', function() {
    // Ensure the START button appears after the pulse effect ends
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        beginContainer.style.display = 'flex';
        applyEffect(); // Apply the effect immediately when the button appears
        setInterval(applyEffect, 5000); // Repeat the effect every 5 seconds
    }, 7000); // Show the START button after the pulse effect ends
});


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

    // Add orbit controls to rotate around the object
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Load the GLTF plane model
    const loader = new GLTFLoader();
    loader.load('TieFighter/scene.gltf', (gltf) => {
        const plane = gltf.scene;
        plane.scale.set(2, 2, 2);  // Adjust the scale if necessary
        plane.position.set(0, -3, 0);
        scene.add(plane);

        // Scroll-based animations
        const animationScripts = [];

        animationScripts.push({
            start: 0,
            end: 40,
            func: () => {
                camera.lookAt(plane.position);
                camera.position.set(0, 2, 8);
                plane.position.z = lerp(-10, 0, scalePercent(0, 40));
            },
        });

        animationScripts.push({
            start: 40,
            end: 60,
            func: () => {
                camera.lookAt(plane.position);
                camera.position.set(0, 2, 8);
                plane.rotation.y = lerp(0, Math.PI, scalePercent(40, 60));
            },
        });

        animationScripts.push({
            start: 60,
            end: 80,
            func: () => {
                camera.position.x = lerp(0, 5, scalePercent(60, 80));
                camera.position.y = lerp(2, 5, scalePercent(60, 80));
                camera.lookAt(plane.position);
            },
        });

        animationScripts.push({
            start: 80,
            end: 101,
            func: () => {
                plane.rotation.x += 0.01;
                plane.rotation.y += 0.01;
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
            animateStars();
            controls.update();
            renderer.render(scene, camera);
        }

        animate();
    });

    // Add basic lighting
    const ambientLight = new THREE.AmbientLight(0xaaaaaa, 50); // Soft white light
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    camera.position.z = 8;

    // Add star background
    const stars = [];
    function addStars() {
        for (let z = -2000; z < 1000; z += 10) {
            const starGeometry = new THREE.SphereGeometry(0.5, 32, 32);
            const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const star = new THREE.Mesh(starGeometry, starMaterial);

            star.position.x = Math.random() * 1000 - 500;
            star.position.y = Math.random() * 1000 - 500;
            star.position.z = z;

            star.scale.x = star.scale.y = 2;

            scene.add(star);
            stars.push(star);
        }
    }

    function animateStars() {
        for (let i = 0; i < stars.length; i++) {
            const star = stars[i];
            star.position.z += i / 10;
            if (star.position.z > 1000) star.position.z -= 3000;
        }
    }

    addStars();
}

// Ensure the Three.js scene starts after the video ends
startThreeJS();

// Ripple effect for the cursor
document.addEventListener('mousemove', (e) => {
    const ripple = document.createElement('div');
    ripple.classList.add('ripple');

    // Get the current scrollable section by checking if the cursor's Y position is within the section's Y range
    let activeSection = document.elementFromPoint(e.clientX, e.clientY).closest('.page-section');

    if (activeSection) {
        // Adjust the position to be exactly on or slightly under the cursor
        ripple.style.left = `${e.clientX - activeSection.getBoundingClientRect().left - 10}px`; // Adjust horizontally
        ripple.style.top = `${e.clientY - activeSection.getBoundingClientRect().top - 10}px`;  // Adjust vertically

        activeSection.appendChild(ripple);

        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    }
});
