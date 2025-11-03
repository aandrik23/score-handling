import { buildMap } from "./bomber.js";
import { gameLoop, resetTimer, resetGame as resetGameState } from "./gameloop.js";
import { setPausedAt, addPausedDuration, resetFrameTimers } from "./gameloop.js";
import { resetGame } from "./bomber.js";
import { startMusic, stopMusic } from "./audio.js";
import { inputDisabled } from "./main.js";
import { showScoreboard } from "./score.js";


let gamePaused = true;
let gameRunning = false;
export const animationState = { id: null };

const menu = document.getElementById("menu");
const mainMenu = document.getElementById("mainMenu");
const pauseMenu = document.getElementById("pauseMenu");


//MAIN MENU
const startBtn = document.getElementById("startBtn");
const infoBtn = document.getElementById("infoBtn");
const settingsBtn = document.getElementById("settingsBtn");
const highScoreBtn = document.getElementById("highScoreBtn");
const quitBtn = document.getElementById("quitBtn");

// Debug: Check if highScoreBtn exists
console.log("highScoreBtn element:", highScoreBtn);

//PAUSE MENU
const continueBtn = document.getElementById("continueBtn");
const restartBtn = document.getElementById("restartBtn");
const mainMenuBtn = document.getElementById("mainMenuBtn")
const settingsPauseBtn = document.getElementById("settingsPauseBtn");;
const infoPauseBtn = document.getElementById("infoPauseBtn");

//SETTINGS  
export const settingsMenu = document.getElementById("settingsMenu");
const backBtn = document.getElementById("backBtn");

//INFO
const infoMenu = document.getElementById("infoMenu");
const backInfoBtn = document.getElementById("backInfoBtn");

export function showMainMenu() {
    menu.style.display = "flex";
    mainMenu.style.display = "flex";
    pauseMenu.style.display = "none";
    gamePaused = true;
}

function showPauseMenu() {
    menu.style.display = "flex";
    mainMenu.style.display = "none";
    pauseMenu.style.display = "flex";
    gamePaused = true;
}
export function hideMenu() {
    menu.style.display = "none";
    gamePaused = false;
    if (!gameRunning) {
        gameRunning = true;
        resetTimer();
        buildMap();
        animationState.id = requestAnimationFrame(gameLoop);
    } else {
        animationState.id = requestAnimationFrame(gameLoop);
    }
}

// Main menu buttons
startBtn.onclick = () => {
    Restart();
};


infoBtn.onclick = () => {
    infoMenu.style.display = "flex";
    backInfoBtn.focus();
};

infoPauseBtn.onclick = () => {
    infoMenu.style.display = "flex";
    backInfoBtn.focus();  // focus back button for accessibility.   ***
};

backInfoBtn.onclick = () => {
    infoMenu.style.display = "none";   // hide info menu    // show main menu again
};


settingsBtn.onclick = () => {
    settingsMenu.style.display = "flex";
    backBtn.focus();  // focus back button for accessibility.   ***
};
settingsPauseBtn.onclick = () => {
    settingsMenu.style.display = "flex";
    backBtn.focus();  // focus back button for accessibility.   ***
};

backBtn.onclick = () => {
    settingsMenu.style.display = "none";   // hide settings menu    // show main menu again
};

if (highScoreBtn) {
    highScoreBtn.onclick = async () => {
        console.log('High Score button clicked!');
        
        // Create overlay for scoreboard
        const overlay = document.createElement('div');
        overlay.id = 'gameEndOverlay';
        document.body.appendChild(overlay);
        
        console.log('Overlay created and added to DOM:', overlay);
        
        try {
            // Show scoreboard
            console.log('Calling showScoreboard...');
            await showScoreboard(null, overlay, true); // Pass true to indicate it's from menu
            console.log('Scoreboard displayed successfully');
        } catch (error) {
            console.error('Error opening scoreboard:', error);
            overlay.remove();
            alert('Failed to load high scores. Please try again.');
        }
    };
    console.log('High Score button onclick handler registered');
} else {
    console.error('High Score button not found!');
}

quitBtn.onclick = () => {
    window.close();
};

// Pause menu buttons
continueBtn.onclick = () => {
    startMusic();
    resetFrameTimers();
    hideMenu();
};
restartBtn.onclick = () => {
    Restart();
};
mainMenuBtn.onclick = () => {
    showMainMenu();
    gameRunning = false;
};


// pause logic:
window.addEventListener("keydown", (e) => {
    // Don't handle pause keys if input is disabled (e.g., leaderboard showing)
    if (inputDisabled) {
        return;
    }

    if (e.code === "Space") e.preventDefault();

    if (e.repeat) return; // ignore if key is held down.   ***
    if (settingsMenu.style.display === "flex") {
        settingsMenu.style.display = "none";
        return;
    }


    if (e.code === "Space" && gameRunning) {
        if (gamePaused) {
            startMusic();
            // Unpausing
            addPausedDuration();
            hideMenu();
        } else {
            stopMusic();
            // Pausing
            setPausedAt();
            showPauseMenu();
            cancelAnimationFrame(animationState.id);
        }
    }
});


// block dafault click on focused space button.   ***
window.addEventListener("keyup", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
    }
});




export { gamePaused, gameRunning };


export function Restart() {
    startMusic();
    cancelAnimationFrame(animationState.id);

    resetGame();
    resetGameState(); // Reset the gameEnded flag
    buildMap();

    hideMenu();
}