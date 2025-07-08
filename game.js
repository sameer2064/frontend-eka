// Game Configuration
const config = {
  width: 800,
  height: 600,
  backgroundColor: 0x1a1a1a,
  carSpeed: 5,
  obstacleSpeed: 7,
  nitroBoost: 2,
  nitroDuration: 1000,
  nitroCooldown: 3000,
  nitroConsumptionRate: 0.5,
  nitroRegenRate: 0.2,
  scoreMultiplier: 0.1,
  maxObstacles: 5,
  minObstacleInterval: 1000,
  maxObstacleInterval: 2000
};

// Game State
let gameState = {
  score: 0,
  speed: 0,
  nitro: 100,
  isNitroActive: false,
  gameStarted: false,
  gameOver: false,
  lastObstacleTime: 0,
  obstacles: [],
  roadLines: [],
  lastRoadLineTime: 0,
  roadMarkings: []
};

// Initialize PIXI Application
const app = new PIXI.Application({
  view: document.getElementById("gameCanvas"),
  width: config.width,
  height: config.height,
  backgroundColor: config.backgroundColor,
  antialias: true
});

// Load Game Assets
const assets = {
  car: "https://cdn.pixabay.com/photo/2012/04/25/00/19/race-car-41071_1280.png",
  obstacle1: "https://cdn.pixabay.com/photo/2013/07/12/18/57/car-154479_1280.png",
  obstacle2: "https://cdn.pixabay.com/photo/2012/04/25/00/19/truck-41070_1280.png",
  road: "https://cdn.pixabay.com/photo/2017/08/31/05/36/background-2699932_1280.jpg",
  nitroSound: "https://assets.codepen.io/21542/nitro-sound.mp3",
  crashSound: "https://assets.codepen.io/21542/crash-sound.mp3",
  engineSound: "https://assets.codepen.io/21542/engine-sound.mp3"
};

// Game Sounds
const sounds = {
  nitro: new Howl({ src: [assets.nitroSound], volume: 0.5 }),
  crash: new Howl({ src: [assets.crashSound], volume: 0.7 }),
  engine: new Howl({ 
    src: [assets.engineSound], 
    volume: 0.3,
    loop: true 
  })
};

// Game Elements
let car;
let background;
let nitroParticles = [];
let smokeParticles = [];

// Load assets and initialize game
PIXI.Assets.load([
  assets.car,
  assets.obstacle1,
  assets.obstacle2,
  assets.road
]).then(setupGame);

function setupGame([carTexture, obstacle1Texture, obstacle2Texture, roadTexture]) {
  // Create background
  background = new PIXI.TilingSprite(
    roadTexture,
    config.width,
    config.height
  );
  app.stage.addChild(background);
  
  // Create car
  car = new PIXI.Sprite(carTexture);
  car.anchor.set(0.5);
  car.width = 80;
  car.height = 100;
  car.x = config.width / 2;
  car.y = config.height - 100;
  app.stage.addChild(car);
  
  // Create road markings
  createInitialRoadMarkings();
  
  // Setup event listeners
  setupEventListeners();
  
  // Start game loop
  app.ticker.add(gameLoop);
  
  // Show start modal
  document.getElementById('startModal').style.display = 'block';
  document.getElementById('startGame').addEventListener('click', startGame);
  
  // Play engine sound
  sounds.engine.play();
}

function setupEventListeners() {
  // Keyboard controls
  window.addEventListener("keydown", (e) => {
    if (!gameState.gameStarted || gameState.gameOver) return;
    
    if (e.key === "ArrowLeft") {
      car.x = Math.max(car.width / 2, car.x - 15);
    }
    if (e.key === "ArrowRight") {
      car.x = Math.min(config.width - car.width / 2, car.x + 15);
    }
    if (e.key === " " && gameState.nitro > 0 && !gameState.isNitroActive) {
      activateNitro();
    }
  });
  
  // Touch controls for mobile
  let touchStartX = 0;
  document.getElementById('gameCanvas').addEventListener('touchstart', (e) => {
    if (!gameState.gameStarted || gameState.gameOver) return;
    touchStartX = e.touches[0].clientX;
  });
  
  document.getElementById('gameCanvas').addEventListener('touchmove', (e) => {
    if (!gameState.gameStarted || gameState.gameOver) return;
    e.preventDefault();
    const touchX = e.touches[0].clientX;
    const diff = touchX - touchStartX;
    
    if (Math.abs(diff) > 10) {
      car.x = Math.max(car.width / 2, 
        Math.min(config.width - car.width / 2, car.x + diff * 0.5));
      touchStartX = touchX;
    }
  });
  
  // Nitro button for mobile
  document.getElementById('gameCanvas').addEventListener('touchend', (e) => {
    if (!gameState.gameStarted || gameState.gameOver) return;
    if (gameState.nitro > 0 && !gameState.isNitroActive) {
      activateNitro();
    }
  });
  
  // Game over buttons
  document.getElementById('restartGame').addEventListener('click', restartGame);
  document.getElementById('submitScore').addEventListener('click', submitScore);
}

function createInitialRoadMarkings() {
  // Create initial road lines
  for (let i = 0; i < 5; i++) {
    const line = new PIXI.Graphics();
    line.beginFill(0xFFFFFF, 0.8);
    line.drawRect(0, 0, 10, 50);
    line.endFill();
    line.x = config.width / 2 - 5;
    line.y = i * 150;
    app.stage.addChild(line);
    gameState.roadMarkings.push(line);
  }
}

function activateNitro() {
  gameState.isNitroActive = true;
  sounds.nitro.play();
  car.tint = 0x00FFFF;
  
  // Create nitro particles
  for (let i = 0; i < 20; i++) {
    createNitroParticle();
  }
  
  setTimeout(() => {
    gameState.isNitroActive = false;
    car.tint = 0xFFFFFF;
  }, config.nitroDuration);
}

function createNitroParticle() {
  const particle = new PIXI.Graphics();
  particle.beginFill(0x00FFFF, 0.7);
  particle.drawCircle(0, 0, Math.random() * 5 + 2);
  particle.endFill();
  particle.x = car.x + (Math.random() * 40 - 20);
  particle.y = car.y + car.height / 2 + 10;
  particle.speed = Math.random() * 3 + 2;
  particle.life = 30;
  app.stage.addChild(particle);
  nitroParticles.push(particle);
}

function createSmokeParticle(x, y) {
  const particle = new PIXI.Graphics();
  particle.beginFill(0x888888, 0.6);
  particle.drawCircle(0, 0, Math.random() * 10 + 5);
  particle.endFill();
  particle.x = x;
  particle.y = y;
  particle.speedX = Math.random() * 2 - 1;
  particle.speedY = Math.random() * -1 - 1;
  particle.life = 50;
  app.stage.addChild(particle);
  smokeParticles.push(particle);
}

function createObstacle() {
  const textures = [PIXI.Texture.from(assets.obstacle1), PIXI.Texture.from(assets.obstacle2)];
  const obstacle = new PIXI.Sprite(textures[Math.floor(Math.random() * textures.length)]);
  obstacle.anchor.set(0.5);
  obstacle.width = 70 + Math.random() * 30;
  obstacle.height = 100 + Math.random() * 40;
  obstacle.x = Math.random() * (config.width - 100) + 50;
  obstacle.y = -obstacle.height;
  obstacle.speed = config.obstacleSpeed + Math.random() * 2;
  app.stage.addChild(obstacle);
  gameState.obstacles.push(obstacle);
}

function gameLoop(delta) {
  if (!gameState.gameStarted || gameState.gameOver) return;
  
  // Update game state
  updateGameState(delta);
  
  // Update background and road markings
  updateBackground();
  
  // Update obstacles
  updateObstacles();
  
  // Update particles
  updateParticles();
  
  // Check for collisions
  checkCollisions();
  
  // Spawn new obstacles
  spawnObstacles();
  
  // Update UI
  updateUI();
}

function updateGameState(delta) {
  // Increase score based on speed
  gameState.score += Math.floor(gameState.speed * config.scoreMultiplier);
  
  // Update speed
  const targetSpeed = gameState.isNitroActive ? 
    config.carSpeed * config.nitroBoost : config.carSpeed;
  
  gameState.speed += (targetSpeed - gameState.speed) * 0.05;
  
  // Update nitro
  if (gameState.isNitroActive) {
    gameState.nitro -= config.nitroConsumptionRate * delta;
    if (gameState.nitro <= 0) {
      gameState.nitro = 0;
      gameState.isNitroActive = false;
      car.tint = 0xFFFFFF;
    }
    
    // Create nitro particles occasionally
    if (Math.random() < 0.2) {
      createNitroParticle();
    }
  } else if (gameState.nitro < 100) {
    gameState.nitro += config.nitroRegenRate * delta;
    if (gameState.nitro > 100) gameState.nitro = 100;
  }
}

function updateBackground() {
  // Move background
  background.tilePosition.y += gameState.speed;
  
  // Update road markings
  for (let i = 0; i < gameState.roadMarkings.length; i++) {
    const line = gameState.roadMarkings[i];
    line.y += gameState.speed;
    
    // If line goes off screen, move it to the top
    if (line.y > config.height) {
      line.y = -50;
    }
  }
  
  // Add new road lines occasionally
  if (Date.now() - gameState.lastRoadLineTime > 150) {
    gameState.lastRoadLineTime = Date.now();
    const line = new PIXI.Graphics();
    line.beginFill(0xFFFFFF, 0.8);
    line.drawRect(0, 0, 10, 50);
    line.endFill();
    line.x = config.width / 2 - 5;
    line.y = -50;
    app.stage.addChild(line);
    gameState.roadMarkings.push(line);
  }
}

function updateObstacles() {
  for (let i = gameState.obstacles.length - 1; i >= 0; i--) {
    const obstacle = gameState.obstacles[i];
    obstacle.y += obstacle.speed + gameState.speed * 0.5;
    
    // Remove obstacles that are off screen
    if (obstacle.y > config.height + obstacle.height) {
      app.stage.removeChild(obstacle);
      gameState.obstacles.splice(i, 1);
    }
  }
}

function updateParticles() {
  // Update nitro particles
  for (let i = nitroParticles.length - 1; i >= 0; i--) {
    const particle = nitroParticles[i];
    particle.y += particle.speed;
    particle.life--;
    particle.alpha = particle.life / 30;
    
    if (particle.life <= 0) {
      app.stage.removeChild(particle);
      nitroParticles.splice(i, 1);
    }
  }
  
  // Update smoke particles
  for (let i = smokeParticles.length - 1; i >= 0; i--) {
    const particle = smokeParticles[i];
    particle.x += particle.speedX;
    particle.y += particle.speedY;
    particle.life--;
    particle.alpha = particle.life / 50;
    particle.scale.set(1 + (50 - particle.life) / 50);
    
    if (particle.life <= 0) {
      app.stage.removeChild(particle);
      smokeParticles.splice(i, 1);
    }
  }
}

function checkCollisions() {
  for (const obstacle of gameState.obstacles) {
    if (checkCollision(car, obstacle)) {
      gameOver();
      break;
    }
  }
}

function checkCollision(obj1, obj2) {
  const bounds1 = obj1.getBounds();
  const bounds2 = obj2.getBounds();
  
  return bounds1.x < bounds2.x + bounds2.width &&
         bounds1.x + bounds1.width > bounds2.x &&
         bounds1.y < bounds2.y + bounds2.height &&
         bounds1.y + bounds1.height > bounds2.y;
}

function spawnObstacles() {
  const now = Date.now();
  if (gameState.obstacles.length < config.maxObstacles && 
      now - gameState.lastObstacleTime > getObstacleInterval()) {
    gameState.lastObstacleTime = now;
    createObstacle();
  }
}

function getObstacleInterval() {
  // Decrease interval as score increases (game gets harder)
  const scoreFactor = Math.min(1, gameState.score / 5000);
  return config.minObstacleInterval + 
    (1 - scoreFactor) * (config.maxObstacleInterval - config.minObstacleInterval);
}

function updateUI() {
  document.getElementById('scoreDisplay').textContent = `SCORE: ${gameState.score}`;
  document.getElementById('nitroDisplay').textContent = `NITRO: ${Math.floor(gameState.nitro)}%`;
  document.getElementById('speedDisplay').textContent = `SPEED: ${Math.floor(gameState.speed * 10)}`;
}

function startGame() {
  document.getElementById('startModal').style.display = 'none';
  gameState.gameStarted = true;
  sounds.engine.fade(0.3, 0.6, 1000);
}

function gameOver() {
  gameState.gameOver = true;
  sounds.engine.stop();
  sounds.crash.play();
  
  // Create explosion effect
  for (let i = 0; i < 30; i++) {
    createSmokeParticle(car.x, car.y);
  }
  
  // Show game over modal
  document.getElementById('finalScore').textContent = `Your score: ${gameState.score}`;
  document.getElementById('gameOverModal').style.display = 'block';
  
  // Fetch leaderboard
  fetchLeaderboard();
}

function restartGame() {
  // Reset game state
  gameState = {
    score: 0,
    speed: 0,
    nitro: 100,
    isNitroActive: false,
    gameStarted: true,
    gameOver: false,
    lastObstacleTime: Date.now(),
    obstacles: [],
    roadLines: [],
    lastRoadLineTime: 0,
    roadMarkings: []
  };
  
  // Clear all obstacles
  for (const obstacle of gameState.obstacles) {
    app.stage.removeChild(obstacle);
  }
  gameState.obstacles = [];
  
  // Clear particles
  for (const particle of nitroParticles) {
    app.stage.removeChild(particle);
  }
  nitroParticles = [];
  
  for (const particle of smokeParticles) {
    app.stage.removeChild(particle);
  }
  smokeParticles = [];
  
  // Clear road markings and recreate
  for (const line of gameState.roadMarkings) {
    app.stage.removeChild(line);
  }
  gameState.roadMarkings = [];
  createInitialRoadMarkings();
  
  // Reset car position
  car.x = config.width / 2;
  car.y = config.height - 100;
  car.tint = 0xFFFFFF;
  
  // Hide game over modal
  document.getElementById('gameOverModal').style.display = 'none';
  
  // Play engine sound
  sounds.engine.play();
}

function submitScore() {
  const playerName = document.getElementById('playerName').value.trim() || 'Anonymous';
  
  fetch('https://your-render-backend-url.herokuapp.com/submit-score', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      player: playerName,
      score: gameState.score
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'success') {
      alert('Score submitted successfully!');
      fetchLeaderboard();
    } else {
      alert('Failed to submit score. Please try again.');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Failed to submit score. Please check your connection.');
  });
}

function fetchLeaderboard() {
  fetch('https://your-render-backend-url.herokuapp.com/leaderboard')
    .then(response => response.json())
    .then(scores => {
      const leaderboard = document.getElementById('leaderboard');
      leaderboard.innerHTML = '<h3>LEADERBOARD</h3>';
      
      if (scores.length === 0) {
        leaderboard.innerHTML += '<p>No scores yet</p>';
        return;
      }
      
      const ol = document.createElement('ol');
      scores.forEach((score, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <span class="rank">${index + 1}.</span>
          <span class="player">${score.player}</span>
          <span class="score">${score.score}</span>
        `;
        ol.appendChild(li);
      });
      leaderboard.appendChild(ol);
    })
    .catch(error => {
      console.error('Error fetching leaderboard:', error);
      document.getElementById('leaderboard').innerHTML = '<p>Leaderboard unavailable</p>';
    });
}
