document.getElementById('mute-toggle').addEventListener('click', function() {
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic.paused) {
        bgMusic.play();
        this.textContent = '🔊';
    } else {
        bgMusic.pause();
        this.textContent = '🔇';
    }
});

// Start the background music on load
window.addEventListener('load', function() {
    document.getElementById('bg-music').play();
});
