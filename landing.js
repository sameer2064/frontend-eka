document.addEventListener('DOMContentLoaded', () => {
  // Fetch top scores from backend
  fetch('https://your-render-backend-url.herokuapp.com/leaderboard')
    .then(response => response.json())
    .then(scores => {
      const scoresContainer = document.getElementById('top-scores');
      if (scores.length === 0) {
        scoresContainer.innerHTML = '<p>No scores yet. Be the first!</p>';
        return;
      }
      
      scores.forEach((score, index) => {
        const scoreElement = document.createElement('div');
        scoreElement.className = 'score-entry';
        scoreElement.innerHTML = `
          <span class="rank">${index + 1}.</span>
          <span class="player">${score.player}</span>
          <span class="score">${score.score}</span>
        `;
        scoresContainer.appendChild(scoreElement);
      });
    })
    .catch(error => {
      console.error('Error fetching leaderboard:', error);
      document.getElementById('top-scores').innerHTML = '<p>Leaderboard unavailable</p>';
    });

  // Background music control
  const bgMusic = document.getElementById('bgMusic');
  bgMusic.volume = 0.3;
  
  // Start music on any user interaction
  document.body.addEventListener('click', () => {
    bgMusic.play().catch(e => console.log('Audio play failed:', e));
  }, { once: true });
});
