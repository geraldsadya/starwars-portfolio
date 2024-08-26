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
const heroMusic = document.getElementById('hero-music');
const audioControl = document.getElementById('audio-control');
const heroSection = document.getElementById('hero');
const awakeningText = document.querySelector('.main-text.top-text');

let isMuted = false;

function toggleAudio() {
    if (isMuted) {
      heroMusic.play();
      audioControl.classList.remove('muted');
    } else {
      heroMusic.pause();
      audioControl.classList.add('muted');
    }
    isMuted = !isMuted;
  }
  
  audioControl.addEventListener('click', toggleAudio);
  
  // Initially hide the audio control
  audioControl.style.display = 'none';
  awakeningText.style.opacity = '0';


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
    hideHeroText();
    hideAudioControl();

    // Delay the start of animations slightly to ensure smooth rendering
    setTimeout(() => {
        startPulsatingAnimation();
    }, 100);

    // Ensure the START button appears after the pulse effect ends
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        beginContainer.style.display = 'flex';
        applyEffect(); // Apply the effect immediately when the button appears
        setInterval(applyEffect, 5000); // Repeat the effect every 5 seconds
        startRippleAnimation();
    }, 6900); // Show the START button after the pulse effect ends
});

function startRippleAnimation() {
    mouseMoved = false;
    setupCanvas();
    update(0);
}


// Hide the page sections initially
pageSections.forEach(section => {
    section.style.display = 'none';
});


beginButton.addEventListener('click', () => {
    console.log('START button clicked');
    beginContainer.style.display = 'none';
    document.querySelector('.video-container').style.display = 'block';
    video.play();
    audio.play().catch(error => {
        console.log('Audio play was prevented:', error);
    });

    // Show audio control when video starts
    audioControl.style.display = 'block';
    audioControl.style.opacity = '1';
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
// Function to handle the transition after the video ends
function handleTransition() {
    console.log('Transitioning now...');

    // Immediately show black overlay with noise filter
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'black';
    overlay.style.opacity = '1';
    overlay.style.zIndex = '9998'; // Below the noise filter
    document.body.appendChild(overlay);

    // Fade out audio
    fadeOutAudio(audio, 1000);

    // Hide video container
    document.querySelector('.video-container').style.display = 'none';

    // Prepare the new content behind the overlay
    setTimeout(() => {
        document.body.style.overflow = 'auto';

        // Show the audio control
        audioControl.style.display = 'block';
        audioControl.style.opacity = '0';

        // Prepare page sections
        pageSections.forEach(section => {
            section.style.display = 'block';
            section.style.opacity = '0';
        });

        // Prepare post-video elements
        document.querySelectorAll('.post-video-element').forEach(element => {
            element.style.display = 'block';
            element.style.opacity = '0';
        });

        // Defer the Three.js scene initialization
        setTimeout(() => {
            startThreeJS();
        }, 500); // Delay the start of Three.js initialization by 500ms

        // Start playing hero music
        heroMusic.play().catch(error => {
            console.log('Hero music play was prevented:', error);
        });

        // Fade out the overlay and fade in the content
        setTimeout(() => {
            overlay.style.transition = 'opacity 2.5s ease';  // Slightly longer fade-out duration
            overlay.style.opacity = '0';

            audioControl.style.transition = 'opacity 2.5s ease';
            audioControl.style.opacity = '1';

            pageSections.forEach(section => {
                section.style.transition = 'opacity 2.5s ease';
                section.style.opacity = '1';
            });

            document.querySelectorAll('.post-video-element').forEach(element => {
                element.style.transition = 'opacity 2.5s ease';
                element.style.opacity = '1';
            });

            // Show hero text
            document.querySelectorAll('.hero-text').forEach(element => {
                element.style.transition = 'opacity 2.5s ease, visibility 2.5s ease';
                element.style.opacity = '1';
                element.style.visibility = 'visible';
            });

            // Remove the overlay after it fades out
            setTimeout(() => {
                overlay.remove();
            }, 2500); // Match the fade-out duration
        }, 500); // Short delay to ensure everything is ready
    }, 100); // Short delay to ensure overlay is visible
}

// Event listener for when the video ends
video.addEventListener('ended', handleTransition);

function hideHeroText() {
    document.querySelectorAll('.hero-text').forEach(element => {
        element.style.opacity = '0';
        element.style.visibility = 'hidden';
    });
}

function hideAudioControl() {
    const audioControl = document.getElementById('audio-control');
    audioControl.style.display = 'none';
    audioControl.style.opacity = '0';
}

// Function to start the Three.js scene
let threeJSInitialized = false;
function startThreeJS() {
    if (threeJSInitialized) return;
    threeJSInitialized = true;
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
  pointer.y = eY + window.scrollY; // Add scroll offset
}

function setupCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", setupCanvas);

function update(t) {
    if (!mouseMoved) {
        pointer.x = (.5 + .3 * Math.cos(.002 * t) * (Math.sin(.005 * t))) * window.innerWidth;
        pointer.y = (.5 + .2 * (Math.cos(.005 * t)) + .1 * Math.cos(.01 * t)) * window.innerHeight + window.scrollY;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    
    // Translate the canvas context to account for scrolling
    ctx.translate(0, -window.scrollY);

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

    ctx.strokeStyle = '#c7e9fd';
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

    ctx.restore();
    window.requestAnimationFrame(update);
}

window.addEventListener("resize", setupCanvas);

window.addEventListener("mousemove", e => {
  mouseMoved = true;
  updateMousePosition(e.clientX, e.clientY);
});

window.addEventListener("touchmove", e => {
  mouseMoved = true;
  updateMousePosition(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
});

//setupCanvas();
//update(0);



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


// Skip button functionality
const skipButton = document.getElementById('skip-button');

skipButton.addEventListener('click', () => {
    console.log('Skip button clicked');
    video.pause();
    handleTransition();
  });


function animatePlanetarySystem() {
  const orbits = document.querySelectorAll('.proxz-nav__orbit');
  orbits.forEach((orbit, index) => {
      const satellite = orbit.querySelector('.proxz-nav__satellite');
      const label = orbit.querySelector('.proxz-nav__label');
      
      // Set different animation durations for each orbit
      const duration = 38 - (index * 2); // 38s, 36s, 34s, ...
      
      satellite.style.animationDuration = `${duration}s`;
      label.style.animationDuration = `${duration}s`;
      
      // Set different colors for each orbit
      const hue = 150 + (index * 30); // Different hue for each orbit
      const color = `hsl(${hue}, 100%, 70%)`;
      
      satellite.style.setProperty('--orbit-color', color);
      label.style.color = color;
      
      // Leave the project description as it is in the HTML
  });
}

// Call this function after the DOM is loaded
document.addEventListener('DOMContentLoaded', animatePlanetarySystem);


//about animation
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              if (entry.target.classList.contains('slide-up-text')) {
                  entry.target.classList.add('visible');
              } else if (entry.target.classList.contains('text-container')) {
                  highlightText(entry.target.querySelector('.highlight-text'));
              }
          } else {
              if (entry.target.classList.contains('slide-up-text')) {
                  entry.target.classList.remove('visible');
              } else if (entry.target.classList.contains('text-container')) {
                  unhighlightText(entry.target.querySelector('.highlight-text'));
              }
          }
      });
  }, { threshold: 0.1 });

  document.querySelectorAll('.slide-up-text, .text-container').forEach(element => {
      observer.observe(element);
  });

  function highlightText(paragraph) {
    if (!paragraph) return;
    const words = paragraph.textContent.split(' ');
    paragraph.innerHTML = words.map(word => `<span>${word} </span>`).join('');
    const spans = paragraph.querySelectorAll('span');
    const totalWords = spans.length;
    spans.forEach((span, i) => {
        const delay = (i / totalWords) * 1500; // Adjust total animation time here (1500ms = 1.5s)
        setTimeout(() => {
            span.style.color = 'white';
        }, delay);
    });
}

  function unhighlightText(paragraph) {
      if (!paragraph) return;
      paragraph.innerHTML = paragraph.textContent;
      paragraph.style.color = 'rgba(255, 255, 255, 0.2)';
  }
});


//card on work page
document.addEventListener('DOMContentLoaded', () => {
    const projectCard = document.querySelector('.project-card');
    const orbits = document.querySelectorAll('.proxz-nav__orbit');
  
    function updateProjectCard(orbit) {
      const projectName = orbit.querySelector('.proxz-nav__label').textContent;
      const projectDescription = orbit.querySelector('.proxz-nav__description').textContent;
      
      projectCard.innerHTML = `
        <h2>${projectName}</h2>
        <p>${projectDescription}</p>
      `;
  
      // Add animation class
      projectCard.classList.remove('card-update');
      void projectCard.offsetWidth; // Trigger reflow
      projectCard.classList.add('card-update');
    }
  
    function handleOrbitInteraction(orbit, event) {
      // Remove 'selected' class from all orbits
      orbits.forEach(o => o.classList.remove('selected'));
      
      // Add 'selected' class to clicked orbit
      orbit.classList.add('selected');
      
      // Update the project card
      updateProjectCard(orbit);
  
      // Prevent default behavior and stop propagation
      event.preventDefault();
      event.stopPropagation();
    }
  
    orbits.forEach(orbit => {
      // Use the entire orbit as the clickable area
      orbit.addEventListener('click', (e) => handleOrbitInteraction(orbit, e));
      
      // Optional: Handle hover state
      orbit.addEventListener('mouseenter', () => {
        if (!orbit.classList.contains('selected')) {
          orbits.forEach(o => o.classList.remove('selected'));
        }
      });
    });
  });

//contact

document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('.input-group input, .input-group textarea');
    const sendButton = document.getElementById('sendMessage');

    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            const leftLine = input.closest('.input-group').querySelector('.input-line.left');
            const rightLine = input.closest('.input-group').querySelector('.input-line.right');
            leftLine.style.backgroundColor = '#6ef9d8';
            rightLine.style.backgroundColor = '#6ef9d8';
        });

        input.addEventListener('blur', () => {
            if (!input.value) {
                const leftLine = input.closest('.input-group').querySelector('.input-line.left');
                const rightLine = input.closest('.input-group').querySelector('.input-line.right');
                leftLine.style.backgroundColor = '#444';
                rightLine.style.backgroundColor = '#444';
            }
        });
    });

    sendButton.addEventListener('click', (e) => {
        e.preventDefault();
        const fullName = document.getElementById('fullName');
        const email = document.getElementById('email');
        const message = document.getElementById('message');

        if (fullName.value && email.value && message.value && isValidEmail(email.value)) {
            showMessage('Message sent successfully!', 'success');
        } else {
            showMessage('Please fill all fields correctly.', 'error');
        }
    });

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showMessage(message, type) {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.style.position = 'fixed';
        messageElement.style.top = '20px';
        messageElement.style.left = '50%';
        messageElement.style.transform = 'translateX(-50%)';
        messageElement.style.padding = '10px 20px';
        messageElement.style.borderRadius = '5px';
        messageElement.style.color = '#fff';
        messageElement.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
        messageElement.style.zIndex = '1000';

        document.body.appendChild(messageElement);

        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }
});
