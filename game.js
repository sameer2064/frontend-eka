// ========== GAME STATE ==========
const gameState = {
  score: 0,
  speed: 0,
  carX: 400,
  coins: [],
  effects: [],
  gameActive: true,
  lastCoinTime: 0,
  coinInterval: 1000
};

// ========== PIXI SETUP ==========
const app = new PIXI.Application({
  view: document.getElementById("gameCanvas"),
  width: 800,
  height: 600,
  backgroundColor: 0x111111
});

// ========== SIMPLIFIED CAR ==========
const car = new PIXI.Graphics();
car.beginFill(0xFF0000);
car.drawRect(-20, -30, 40, 60);
car.endFill();
car.x = gameState.carX;
car.y = 500;
app.stage.addChild(car);

// ========== BULLETPROOF COIN SYSTEM ==========
function createCoin() {
  const now = Date.now();
  if (now - gameState.lastCoinTime < gameState.coinInterval) return;
  
  gameState.lastCoinTime = now;
  
  const coin = new PIXI.Graphics();
  coin.beginFill(0xFFFF00);
  coin.drawCircle(0, 0, 10);
  coin.endFill();
  
  coin.x = Math.random() * 400 + 200;
  coin.y = -30;
  app.stage.addChild(coin);
  
  // Store with unique ID
  gameState.coins.push({
    id: Date.now() + Math.random(),
    sprite: coin
  });
}

// ========== ROCK-SOLID COLLISION ==========
function checkCollisions() {
  const carBounds = car.getBounds();
  
  // Create temp array of coins to process
  const coinsToCheck = [...gameState.coins];
  
  coinsToCheck.forEach(coin => {
    const coinBounds = coin.sprite.getBounds();
    
    if (carBounds.x + carBounds.width > coinBounds.x &&
        carBounds.x < coinBounds.x + coinBounds.width &&
        carBounds.y + carBounds.height > coinBounds.y &&
        carBounds.y < coinBounds.y + coinBounds.height) {
      
      // Remove from main array
      gameState.coins = gameState.coins.filter(c => c.id !== coin.id);
      
      // Remove from stage
      app.stage.removeChild(coin.sprite);
      
      // Update score
      gameState.score++;
      document.getElementById('scoreDisplay').textContent = `Score: ${gameState.score}`;
      
      // Create effect (won't interfere with coins)
      const effect = new PIXI.Graphics();
      effect.beginFill(0xFFA500, 0.7);
      effect.drawCircle(coin.sprite.x, coin.sprite.y, 15);
      effect.endFill();
      app.stage.addChild(effect);
      
     function fadeEffectFn() {
  effect.alpha -= 0.05;
  if (effect.alpha <= 0) {
    app.stage.removeChild(effect);
    app.ticker.remove(fadeEffectFn);
  }
}
app.ticker.add(fadeEffectFn);

        }
      };
      app.ticker.add(fadeEffect);
    }
  });
}

// ========== FAILSAFE GAME LOOP ==========
function gameLoop() {
  if (!gameState.gameActive) return;
  
  // Create coins
  createCoin();
  
  // Move coins
  gameState.coins.forEach(coin => {
    coin.sprite.y += 5 + gameState.speed;
    if (coin.sprite.y > 630) {
      app.stage.removeChild(coin.sprite);
      gameState.coins = gameState.coins.filter(c => c.id !== coin.id);
    }
  });
  
  // Check collisions
  checkCollisions();
}

// ========== CONTROLS (ALWAYS WORKING) ==========
function moveLeft() {
  if (!gameState.gameActive) return;
  gameState.carX = Math.max(200, gameState.carX - 10);
  car.x = gameState.carX;
}

function moveRight() {
  if (!gameState.gameActive) return;
  gameState.carX = Math.min(600, gameState.carX + 10);
  car.x = gameState.carX;
}

function accelerate() {
  if (!gameState.gameActive) return;
  gameState.speed = Math.min(10, gameState.speed + 0.1);
}

function brake() {
  if (!gameState.gameActive) return;
  gameState.speed = Math.max(0, gameState.speed - 0.2);
}

// ========== INITIALIZE ==========
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
  }, 1000);
}

// Start the game
initGame();
