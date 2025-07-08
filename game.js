// ========== GAME STATE ==========
const gameState = {
  score: 0,
  speed: 0,
  maxSpeed: 10,
  acceleration: 0.05,
  deceleration: 0.1,
  carX: 400,
  coins: [],
  gameStarted: false,
  loading: true,
  lastCoinTime: 0,
  coinInterval: 1000 // Time between coins in ms
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
car.beginFill(0xFF3333);
car.drawRoundedRect(-25, -40, 50, 80, 10);
car.endFill();
car.beginFill(0x66CCFF, 0.5);
car.drawRoundedRect(-20, -30, 40, 30, 5);
car.endFill();
car.beginFill(0xFFFF00);
car.drawRect(-25, -40, 10, 5);
car.drawRect(15, -40, 10, 5);
car.endFill();
car.beginFill(0xFF0000);
car.drawRect(-25, 40, 10, 5);
car.drawRect(15, 40, 10, 5);
car.endFill();
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
  gameState.coins.push(coin);
}

function updateCoins(delta) {
  // Move coins
  for (let i = gameState.coins.length - 1; i >= 0; i--) {
    const coin = gameState.coins[i];
    coin.y += gameState.speed * delta;
    
    // Remove coins that are off screen
    if (coin.y > 650) {
      app.stage.removeChild(coin);
      gameState.coins.splice(i, 1);
    }
  }
  
  // Create new coins
  createCoin();
}

// ========== FIXED COLLISION DETECTION ==========
function checkCollisions() {
  for (let i = gameState.coins.length - 1; i >= 0; i--) {
    const coin = gameState.coins[i];
    const distance = Math.sqrt(
      Math.pow(car.x - coin.x, 2) + 
      Math.pow(car.y - coin.y, 2)
    );
    
    if (distance < 30) { // Collision detected
      // Remove coin
      app.stage.removeChild(coin);
      gameState.coins.splice(i, 1);
      
      // Increase score
      gameState.score += 1;
      document.getElementById('scoreDisplay').textContent = `Score: ${gameState.score}`;
      
      // Create collection effect
      const effect = new PIXI.Graphics();
      effect.beginFill(0xFFFF00, 0.7);
      effect.drawCircle(coin.x, coin.y, 15);
      effect.endFill();
      app.stage.addChild(effect);
      
      // Animate and remove effect
      let alpha = 1;
      const fadeOut = () => {
        alpha -= 0.05;
        effect.alpha = alpha;
        if (alpha <= 0) {
          app.stage.removeChild(effect);
          app.ticker.remove(fadeOut);
        }
      };
      app.ticker.add(fadeOut);
    }
  }
}

// ========== GAME LOOP ==========
function gameLoop(delta) {
  if (!gameState.gameStarted) return;
  
  // Update road markings
  roadMarkings.forEach(marking => {
    marking.y += gameState.speed;
    if (marking.y > 600) marking.y = -30;
  });
  
  // Update coins
  updateCoins(delta);
  
  // Check collisions
  checkCollisions();
  
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

// ========== INITIALIZE GAME ==========
function initGame() {
  // Start game loop
  app.ticker.add(gameLoop);
  
  // Hide loading screen after 2 seconds
  setTimeout(() => {
    document.getElementById('loadingScreen').style.display = 'none';
    gameState.gameStarted = true;
  }, 2000);
}

// Start the game
initGame();
