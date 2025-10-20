import { PlayerHitSound, PlayLevelFailedSound, stopMusic } from './audio.js';
import { player } from './bomber.js';
import { showMainMenu } from './menu.js';
import { loadGameOver } from './videos.js';
import { endGame } from './score.js';



export let score = 0;
export let lives = 3

export function addScore(points) {
    score += points;
}

export function resetStats() {
    score = 0;
    lives = 3;
}

export function playerHit() {

    PlayerHitSound();
    if (!player.invulnerable) {
        lives--;
        if (lives <= 0) {
            stopMusic();
            PlayLevelFailedSound();
            loadGameOver(() => endGame(false));
            // Show scoreboard even when losing
            // // we should fix this to show a proper game over screen
            // alert("Game Over!");
            // window.location.reload();
            // return;
        }

        // Reset player position
        player.resetPosition();

        // Activate temporary invulnerability
        player.activateInvulnerability();
    }
}
