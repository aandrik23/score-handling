import { score } from './gameState.js';

export function endGame(won) {
  
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
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 3000;
  `;
  // Create modal content
  const modal = document.createElement('div');
  modal.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 10px;
    text-align: center;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  `;
  const title = document.createElement('h2');
  title.textContent = won ? 'Congratulations! You Won!' : 'Game Over';
  title.style.color = won ? '#4CAF50' : '#f44336';
  title.style.marginBottom = '20px';
  const scoreInfo = document.createElement('p');
  scoreInfo.innerHTML = `
    <strong>Final Score:</strong> ${finalScore}<br>
    <strong>Time:</strong> ${timeString}
  `;
  scoreInfo.style.marginBottom = '20px';
  scoreInfo.style.fontSize = '18px';
  const nameLabel = document.createElement('label');
  nameLabel.textContent = 'Enter your name for the scoreboard:';
  nameLabel.style.display = 'block';
  nameLabel.style.marginBottom = '10px';
  nameLabel.style.fontSize = '16px';
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'Your name';
  nameInput.maxLength = 20;
  nameInput.style.cssText = `
    width: 100%;
    padding: 10px;
    border: 2px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
    margin-bottom: 20px;
    box-sizing: border-box;
  `;
  const submitButton = document.createElement('button');
  submitButton.textContent = 'Submit Score';
  submitButton.style.cssText = `
    background: #4CAF50;
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    margin-right: 10px;
  `;
  const skipButton = document.createElement('button');
  skipButton.textContent = 'Skip';
  skipButton.style.cssText = `
    background: #757575;
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
  `;
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
async function showScoreboard(submissionResult, overlay) {
  try {
    // Remove the name input form
    overlay.innerHTML = '';
    // Create scoreboard content
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 10px;
      text-align: center;
      max-width: 700px;
      width: 95%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    const title = document.createElement('h2');
    title.textContent = 'Scoreboard';
    title.style.color = '#4CAF50';
    title.style.marginBottom = '20px';
    modal.appendChild(title);
    // Show submission message if available
    if (submissionResult && submissionResult.message) {
      const message = document.createElement('p');
      message.textContent = submissionResult.message;
      message.style.cssText = `
        background: #e8f5e8;
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 20px;
        font-weight: bold;
        color: #2e7d32;
      `;
      modal.appendChild(message);
    }
    // Fetch latest scores
    const response = await fetch('/api/scores');
    const data = await response.json();
    if (data.scores && data.scores.length > 0) {
      // Create table
      const table = document.createElement('table');
      table.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      `;
      // Table header
      const header = document.createElement('thead');
      header.innerHTML = `
        <tr style="background: #f5f5f5;">
          <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Rank</th>
          <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Name</th>
          <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">Score</th>
          <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Time</th>
        </tr>
      `;
      table.appendChild(header);
      // Table body
      const tbody = document.createElement('tbody');
      data.scores.forEach(score => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td style="padding: 10px; border: 1px solid #ddd;">${getRankSuffix(score.rank)}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${score.name}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${score.score}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${score.time}</td>
        `;
        tbody.appendChild(row);
      });
      table.appendChild(tbody);
      modal.appendChild(table);
      
    } else {
      const noScores = document.createElement('p');
      noScores.textContent = 'No scores yet. Be the first to play!';
      noScores.style.marginBottom = '20px';
      modal.appendChild(noScores);
    }
    // Buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '20px';
    const playAgainButton = document.createElement('button');
    playAgainButton.textContent = 'Play Again';
    playAgainButton.style.cssText = `
      background: #4CAF50;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      cursor: pointer;
      margin-right: 10px;
    `;
    playAgainButton.addEventListener('click', () => {
      // Remove the overlay first
      overlay.remove();
      // Reload the page to restart the game completely
      window.location.reload();
    });
    buttonContainer.appendChild(playAgainButton);
    modal.appendChild(buttonContainer);
    overlay.appendChild(modal);
  } catch (error) {
    console.error('Error loading scoreboard:', error);
    overlay.innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 10px; text-align: center;">
        <h2>Error Loading Scoreboard</h2>
        <p>Unable to load scores at this time.</p>
        <button onclick="window.location.reload()" style="background: #4CAF50; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer;">Play Again</button>
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