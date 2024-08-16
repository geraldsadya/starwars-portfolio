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
// New canvas interaction for cursor effect
const canvas = document.getElementById('interactive-cursor');
const ctx = canvas.getContext('2d');
let mouseMoved = false;

const pointer = { x: .5 * window.innerWidth, y: .5 * window.innerHeight };
const params = {
    pointsNumber: 40,
    widthFactor: .3,
    mouseThreshold: .6,
    spring: .4,
    friction: .5
};

const trail = new Array(params.pointsNumber).fill().map(() => ({ x: pointer.x, y: pointer.y, dx: 0, dy: 0 }));

function updateMousePosition(eX, eY) {
    pointer.x = eX;
    pointer.y = eY;
}

function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function update(t) {
    if (!mouseMoved) {
        pointer.x = (.5 + .3 * Math.cos(.002 * t) * (Math.sin(.005 * t))) * window.innerWidth;
        pointer.y = (.5 + .2 * (Math.cos(.005 * t)) + .1 * Math.cos(.01 * t)) * window.innerHeight;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    trail.forEach((p, pIdx) => {
        const prev = pIdx === 0 ? pointer : trail[pIdx - 1];
        const spring = pIdx === 0 ? .4 * params.spring : params.spring;
        p.dx += (prev.x - p.x) * spring;
        p.dy += (prev.y - p.y) * spring;
        p.dx *= params.friction;
        p.dy *= params.friction;
        p.x += p.dx;
        p.y += p.dy;
    });

    ctx.strokeStyle = '#c7e9fd'; // Change the color here to blue
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(trail[0].x, trail[0].y);

    for (let i = 1; i < trail.length - 1; i++) {
        const xc = .5 * (trail[i].x + trail[i + 1].x);
        const yc = .5 * (trail[i].y + trail[i + 1].y);
        ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
        ctx.lineWidth = params.widthFactor * (params.pointsNumber - i);
        ctx.stroke();
    }
    ctx.lineTo(trail[trail.length - 1].x, trail[trail.length - 1].y);
    ctx.stroke();
    window.requestAnimationFrame(update);
}

window.addEventListener("resize", setupCanvas);
window.addEventListener("mousemove", e => {
    mouseMoved = true;
    updateMousePosition(e.pageX, e.pageY);
});
window.addEventListener("touchmove", e => {
    mouseMoved = true;
    updateMousePosition(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
});

setupCanvas();
update(0);



document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('#slider-nav .nav-link');
    function setActiveLink() {
        let foundActive = false;
        navLinks.forEach(link => {
            let section = document.querySelector(link.hash);
            if (window.scrollY >= section.offsetTop && window.scrollY < section.offsetTop + section.offsetHeight) {
                link.classList.add('active');
                foundActive = true;
            } else {
                link.classList.remove('active');
            }
        });
        // Set first link as active if none are active (e.g., top of the page)
        if (!foundActive) navLinks[0].classList.add('active');
    }

    // Initial check to set active link on load
    setActiveLink();

    // Set active link on scroll
    window.addEventListener('scroll', setActiveLink);

    // Smooth scroll on click
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetSection = document.querySelector(this.getAttribute('href'));
            targetSection.scrollIntoView({ behavior: 'smooth' });
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
  const textBlocks = document.querySelectorAll('.page-section h3, .page-section h1');
  const heroSection = document.querySelector('#hero');
  
  // Set indexes for letters within each block
  textBlocks.forEach(block => {
      const letters = block.querySelectorAll('.letter');
      letters.forEach((letter, index) => {
          letter.style.setProperty('--index', index);
      });
  });

  // Function to trigger the slide-up animation
  function slideUp() {
      textBlocks.forEach(block => {
          const letters = block.querySelectorAll('.letter');
          letters.forEach((letter) => {
              letter.style.animation = 'slideIn 0.7s forwards';
              letter.style.animationDelay = `calc(0.05s * var(--index))`;
          });
      });
  }

  // Function to trigger the slide-down animation
  function slideDown() {
      textBlocks.forEach(block => {
          const letters = block.querySelectorAll('.letter');
          letters.forEach((letter) => {
              letter.style.animation = 'slideOut 0.7s forwards';
              letter.style.animationDelay = `calc(0.05s * var(--index))`;
          });
      });
  }

  // Intersection Observer to detect when the hero section is in view
  const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              slideUp();
          } else {
              slideDown();
          }
      });
  }, { threshold: 0.5 }); // Trigger when 50% of the hero section is in view

  observer.observe(heroSection);
});

document.addEventListener('DOMContentLoaded', () => {
  const statContents = document.querySelectorAll('.stat-content');
  let currentStatIndex = 0;

  function showNextStat() {
      // Hide the current stat
      if (statContents[currentStatIndex]) {
          statContents[currentStatIndex].classList.remove('active');
      }

      // Move to the next stat
      currentStatIndex = (currentStatIndex + 1) % statContents.length;

      // Show the new stat
      statContents[currentStatIndex].classList.add('active');

      // Schedule the next animation
      setTimeout(showNextStat, 5000); // Change stat every 5 seconds
  }

  // Initial setup: show the first stat
  statContents[currentStatIndex].classList.add('active');

  // Start the animation cycle
  setTimeout(showNextStat, 5000);
});
