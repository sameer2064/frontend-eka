// ========== GAME STATE ==========
const gameState = {
  score: 0,
  speed: 0,
  maxSpeed: 10,
  acceleration: 0.05,
  deceleration: 0.1,
  carX: 400,
  coins: [],
  effects: [], // Separate array for visual effects
  gameStarted: false,
  loading: true,
  lastCoinTime: 0,
  coinInterval: 1000
};

// ========== PIXI SETUP ==========
const app = new PIXI.Application({
  view: document.getElementById("gameCanvas"),
  width: 800,
  height: 600,
  backgroundColor: 0x111111,
  antialias: true
});

// ========== GAME ELEMENTS ==========
const road = new PIXI.Graphics();
app.stage.addChild(road);

// Road markings
const roadMarkings = [];
for (let i = 0; i < 20; i++) {
  const marking = new PIXI.Graphics();
  marking.beginFill(0xFFFFFF, 0.8);
  marking.drawRect(-3, -15, 6, 30);
  marking.endFill();
  marking.x = 400;
  marking.y = i * 30 - 30;
  app.stage.addChild(marking);
  roadMarkings.push(marking);
}

// Car
const car = new PIXI.Graphics();
// [Previous car drawing code...]
car.x = gameState.carX;
car.y = 500;
app.stage.addChild(car);

// ========== FIXED COIN SYSTEM ==========
function createCoin() {
  const now = Date.now();
  if (now - gameState.lastCoinTime < gameState.coinInterval) return;
  
  gameState.lastCoinTime = now;
  
  const coin = new PIXI.Graphics();
  coin.beginFill(0xFFD700);
  coin.drawCircle(0, 0, 10);
  coin.endFill();
  coin.beginFill(0xFFFF00);
  coin.drawCircle(0, 0, 7);
  coin.endFill();
  
  coin.x = Math.random() * 400 + 200;
  coin.y = -50;
  app.stage.addChild(coin);
  gameState.coins.push({
    sprite: coin,
    collected: false
  });
}

// ========== FIXED COLLISION SYSTEM ==========
function checkCollisions() {
  const carBounds = car.getBounds();
  
  for (let i = gameState.coins.length - 1; i >= 0; i--) {
    const coin = gameState.coins[i];
    if (coin.collected) continue;
    
    const coinBounds = coin.sprite.getBounds();
    
    if (carBounds.x + carBounds.width > coinBounds.x &&
        carBounds.x < coinBounds.x + coinBounds.width &&
        carBounds.y + carBounds.height > coinBounds.y &&
        carBounds.y < coinBounds.y + coinBounds.height) {
      
      // Mark as collected
      coin.collected = true;
      
      // Increase score
      gameState.score += 1;
      document.getElementById('scoreDisplay').textContent = `Score: ${gameState.score}`;
      
      // Create collection effect
      const effect = new PIXI.Graphics();
      effect.beginFill(0xFFFF00, 0.7);
      effect.drawCircle(coin.sprite.x, coin.sprite.y, 15);
      effect.endFill();
      app.stage.addChild(effect);
      gameState.effects.push({
        sprite: effect,
        alpha: 1
      });
      
      // Remove coin sprite
      app.stage.removeChild(coin.sprite);
      gameState.coins.splice(i, 1);
    }
  }
}

// ========== FIXED EFFECTS SYSTEM ==========
function updateEffects() {
  for (let i = gameState.effects.length - 1; i >= 0; i--) {
    const effect = gameState.effects[i];
    effect.alpha -= 0.02;
    effect.sprite.alpha = effect.alpha;
    
    if (effect.alpha <= 0) {
      app.stage.removeChild(effect.sprite);
      gameState.effects.splice(i, 1);
    }
  }
}

// ========== FIXED GAME LOOP ==========
function gameLoop(delta) {
  if (!gameState.gameStarted) return;
  
  // Update road markings
  roadMarkings.forEach(marking => {
    marking.y += gameState.speed;
    if (marking.y > 600) marking.y = -30;
  });
  
  // Create new coins
  createCoin();
  
  // Move existing coins
  gameState.coins.forEach(coin => {
    if (!coin.collected) {
      coin.sprite.y += gameState.speed;
    }
  });
  
  // Check collisions
  checkCollisions();
  
  // Update effects
  updateEffects();
  
  // Draw road
  road.clear();
  road.beginFill(0x333333);
  road.moveTo(150, 0);
  road.lineTo(650, 0);
  road.lineTo(700, 600);
  road.lineTo(100, 600);
  road.closePath();
  road.endFill();
}

// ========== CONTROL FUNCTIONS ==========
function moveLeft() {
  gameState.carX = Math.max(250, gameState.carX - 10);
  car.x = gameState.carX;
}

function moveRight() {
  gameState.carX = Math.min(550, gameState.carX + 10);
  car.x = gameState.carX;
}

function accelerate() {
  gameState.speed = Math.min(gameState.maxSpeed, gameState.speed + gameState.acceleration);
}

function brake() {
  gameState.speed = Math.max(0, gameState.speed - gameState.deceleration);
}

// ========== INITIALIZE GAME ==========
function initGame() {
  // Start game loop
  app.ticker.add(gameLoop);
  
  // Set up controls
  document.getElementById('leftBtn').addEventListener('mousedown', moveLeft);
  document.getElementById('rightBtn').addEventListener('mousedown', moveRight);
  document.getElementById('acceleratorBtn').addEventListener('mousedown', accelerate);
  document.getElementById('brakeBtn').addEventListener('mousedown', brake);
  
  // Hide loading screen
  setTimeout(() => {
    document.getElementById('loadingScreen').style.display = 'none';
    gameState.gameStarted = true;
  }, 2000);
}

// Start the game
initGame();
