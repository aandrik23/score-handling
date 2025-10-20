export function loadGameOver(onEndCallback) {
    const gameContainer = document.getElementById('game');
    const rect = gameContainer.getBoundingClientRect();

    const video = document.createElement('video');
    video.src = './video/GameOver.mp4';
    video.width = rect.width;
    video.height = rect.height;
    video.controls = false;
    video.autoplay = true;
    video.muted = true; // helps autoplay
    video.style.position = 'absolute';
    video.style.top = `${rect.top}px`;
    video.style.left = `${rect.left}px`;
    video.style.zIndex = 1000; // make sure it’s on top
    video.style.objectFit = 'cover'; // cover the entire game area

    document.body.appendChild(video);

    // When video finishes
    video.addEventListener('ended', () => {
        video.remove();
        if (typeof onEndCallback === 'function') {
            onEndCallback(); // Show scoreboard after video ends
        }
    });
}

export function loadYouWin(onEndCallback) {
    const gameContainer = document.getElementById('game');
    const rect = gameContainer.getBoundingClientRect();

    const video = document.createElement('video');
    video.src = './video/BIM.mp4';
    video.width = rect.width;
    video.height = rect.height;
    video.controls = false;
    video.autoplay = true;
    video.muted = true;
    video.style.position = 'absolute';
    video.style.top = `${rect.top}px`;
    video.style.left = `${rect.left}px`;
    video.style.zIndex = 1000;
    video.style.objectFit = 'cover';

    document.body.appendChild(video);

    video.addEventListener('ended', () => {
        video.remove();
        if (typeof onEndCallback === 'function') {
            onEndCallback();
        }
    });
}