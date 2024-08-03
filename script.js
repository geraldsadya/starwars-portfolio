// Your existing code for handling the start button, video, and audio
const beginButton = document.querySelector('.begin-button');
const beginContainer = document.querySelector('.begin-container');
const video = document.getElementById('intro-video');
const audio = document.getElementById('bg-music');
const loadingScreen = document.getElementById('loading-screen');

window.addEventListener('load', function() {
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        beginContainer.style.display = 'flex';
    }, 7000); // Show the START button after the pulse effect ends
});

beginButton.addEventListener('click', () => {
    beginContainer.style.display = 'none';
    document.querySelector('.video-container').style.display = 'block';
    video.play();
    audio.play().catch(error => {
        console.log('Audio play was prevented:', error);
    });
});

// Function to fade out audio
function fadeOutAudio(audio, duration) {
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
        }
    }, 50);
}

// Function to handle the transition after the video ends
function handleTransition() {
    console.log('Video ended, transitioning now...'); // This should appear in the console when the video ends

    fadeOutAudio(audio, 2000); // Fade out audio over 2 seconds

    // Fade out video
    video.style.transition = 'opacity 2s ease';
    video.style.opacity = 0;

    setTimeout(() => {
        document.querySelector('.video-container').style.display = 'none'; // Hide the video container
        document.body.style.background = 'black'; // Set background to black
        startThreeJS(); // Start the 3.js scene
    }, 2000); // Wait for the fade-out to complete before transitioning
}

// Event listener for when the video ends
video.addEventListener('ended', handleTransition);

// Function to start the Three.js scene
function startThreeJS() {
    // Step 1: Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Step 2: Create two spheres (3D balls)
    const geometry = new THREE.SphereGeometry(1, 32, 32); // Radius, width segments, height segments
    const material1 = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
    const material2 = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Blue color

    const sphere1 = new THREE.Mesh(geometry, material1);
    const sphere2 = new THREE.Mesh(geometry, material2);

    // Position the spheres
    sphere1.position.x = -1.5;
    sphere2.position.x = 1.5;

    // Add spheres to the scene
    scene.add(sphere1);
    scene.add(sphere2);

    // Step 3: Position the camera
    camera.position.z = 5;

    // Step 4: Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Rotate the spheres for some animation
        sphere1.rotation.y += 0.01;
        sphere2.rotation.y += 0.01;

        renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });
}
