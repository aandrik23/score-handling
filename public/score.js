import { score } from './gamestate.js';
import { disableGameInput } from './main.js';

export function endGame(won) {
  // Disable game input so player can type in the leaderboard
  disableGameInput();
  
  // Calculate final time from the timer display
  const timerText = document.getElementById('timer').textContent;
  const timeString = timerText.replace('Time: ', '');
  
  // Show player name input and scoreboard
  showPlayerNameInput(won, score, timeString);
}
function showPlayerNameInput(won, finalScore, timeString) {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.id = 'gameEndOverlay';

  // Create modal content
  const modal = document.createElement('div');
  modal.className = 'score-modal';

  const title = document.createElement('h2');
  title.className = `score-title ${won ? 'win' : 'lose'}`;
  title.textContent = won ? 'Congratulations! You Won!' : 'Game Over!';
  
  const scoreInfo = document.createElement('p');
  scoreInfo.className = 'score-info';
  scoreInfo.innerHTML = `
    <strong>Final Score:</strong> ${finalScore}<br>
    <strong>Time:</strong> ${timeString}
  `;

  const nameLabel = document.createElement('label');
  nameLabel.className = 'score-input-label';
  nameLabel.textContent = 'Enter your name for the scoreboard:';

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'Your name';
  nameInput.maxLength = 20;
  nameInput.className = 'score-input';

  const submitButton = document.createElement('button');
  submitButton.className = 'score-btn submit';
  submitButton.textContent = 'Submit Score';

  const skipButton = document.createElement('button');
  skipButton.className = 'score-btn skip';
  skipButton.textContent = 'Skip';

  // Event handlers
  submitButton.addEventListener('click', () => {
    const playerName = nameInput.value.trim();
    if (playerName) {
      submitScore(playerName, finalScore, timeString, overlay);
    } else {
      alert('Please enter your name!');
    }
  });

  nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      submitButton.click();
    }
  });

  skipButton.addEventListener('click', () => {
    showScoreboard(null, overlay);
  });

  // Assemble modal
  modal.appendChild(title);
  modal.appendChild(scoreInfo);
  modal.appendChild(nameLabel);
  modal.appendChild(nameInput);
  modal.appendChild(submitButton);
  modal.appendChild(skipButton);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Focus on input
  nameInput.focus();
}

async function submitScore(name, score, time, overlay) {
  try {
    const response = await fetch('/api/scores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        score: score,
        time: time
      })
    });

    if (response.ok) {
      const result = await response.json();
      showScoreboard(result, overlay);
    } else {
      throw new Error('Failed to submit score');
    }
  } catch (error) {
    console.error('Error submitting score:', error);
    alert('Failed to submit score. Showing scoreboard anyway.');
    showScoreboard(null, overlay);
  }
}

export async function showScoreboard(submissionResult, overlay, fromMenu = false) {
  try {
    overlay.innerHTML = '';

    const modal = document.createElement('div');
    modal.className = 'scoreboard-modal';

    const title = document.createElement('h2');
    title.textContent = 'High Scores';
    modal.appendChild(title);

    // Show submission message if available
    if (submissionResult && submissionResult.message) {
      const message = document.createElement('p');
      message.className = 'score-message';
      message.textContent = submissionResult.message;
      modal.appendChild(message);
    }

    const response = await fetch('/api/scores');
    const data = await response.json();

    if (data.scores && data.scores.length > 0) {
      const table = document.createElement('table');
      table.className = 'scoreboard-table';

      const header = document.createElement('thead');
      header.innerHTML = `
        <tr>
          <th>Rank</th>
          <th>Name</th>
          <th>Score</th>
          <th>Time</th>
        </tr>
      `;
      table.appendChild(header);

      const tbody = document.createElement('tbody');
      data.scores.forEach(score => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${getRankSuffix(score.rank)}</td>
          <td>${score.name}</td>
          <td>${score.score}</td>
          <td>${score.time}</td>
        `;
        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      modal.appendChild(table);
    } else {
      const noScores = document.createElement('p');
      noScores.textContent = 'No scores yet. Be the first to play!';
      modal.appendChild(noScores);
    }

    const buttonContainer = document.createElement('div');
    const closeButton = document.createElement('button');
    closeButton.className = 'play-again-btn';
    closeButton.textContent = fromMenu ? 'Close' : 'Play Again';
    closeButton.addEventListener('click', () => {
      overlay.remove();
      if (!fromMenu) {
        window.location.reload();
      }
    });

    buttonContainer.appendChild(closeButton);
    modal.appendChild(buttonContainer);
    overlay.appendChild(modal);
  } catch (error) {
    console.error('Error loading scoreboard:', error);
    overlay.innerHTML = `
      <div class="scoreboard-modal">
        <h2>Error Loading Scoreboard</h2>
        <p>Unable to load scores at this time.</p>
        <button class="play-again-btn" onclick="this.parentElement.parentElement.remove()">Close</button>
      </div>
    `;
  }
}

function getRankSuffix(rank) {
  switch (rank % 10) {
    case 1:
      if (rank % 100 !== 11) return `${rank}st`;
      break;
    case 2:
      if (rank % 100 !== 12) return `${rank}nd`;
      break;
    case 3:
      if (rank % 100 !== 13) return `${rank}rd`;
      break;
  }
  return `${rank}th`;
}