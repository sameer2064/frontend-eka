// DEBUGGING
const debug = document.getElementById('debug');
function log(message) {
  debug.textContent = message;
  console.log(message);
}

// GAME INIT
log("Initializing game...");

try {
  // 1. Create renderer
  const app = new PIXI.Application({
    view: document.getElementById("gameCanvas"),
    width: 800,
    height: 600,
    backgroundColor: 0x111111,
    antialias: true
  });
  log("Renderer created");

  // 2. Create road (using graphics)
  const road = new PIXI.Graphics();
  road.beginFill(0x333333);
  road.drawRect(200, 0, 400, 600);
  road.endFill();
  app.stage.addChild(road);
  log("Road created");

  // 3. Create car (using graphics - no image needed)
  const car = new PIXI.Graphics();
  car.beginFill(0xFF0000); // Red car
  car.drawRect(-25, -50, 50, 100); // Centered
  car.endFill();
  
  // Add headlights
  car.beginFill(0xFFFF00);
  car.drawRect(-20, -45, 15, 10);
  car.drawRect(5, -45, 15, 10);
  car.endFill();
  
  car.x = 400;
  car.y = 500;
  app.stage.addChild(car);
  log("Car created");

  // 4. Road markings
  const markings = [];
  for (let i = 0; i < 10; i++) {
    const line = new PIXI.Graphics();
    line.beginFill(0xFFFFFF);
    line.drawRect(-5, 0, 10, 30);
    line.endFill();
    line.x = 400;
    line.y = i * 60;
    app.stage.addChild(line);
    markings.push(line);
  }
  log("Road markings created");

  // 5. Simple movement
  let carSpeed = 0;
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") car.x -= 10;
    if (e.key === "ArrowRight") car.x += 10;
    if (e.key === "ArrowUp") carSpeed = 5;
    if (e.key === "ArrowDown") carSpeed = 0;
  });

  // 6. Game loop
  app.ticker.add(() => {
    // Move road markings
    markings.forEach(line => {
      line.y += carSpeed;
      if (line.y > 600) line.y = -30;
    });

    // Add some simple obstacles
    if (Math.random() < 0.01) {
      const obstacle = new PIXI.Graphics();
      obstacle.beginFill(0x00FF00);
      obstacle.drawRect(-20, -20, 40, 40);
      obstacle.endFill();
      obstacle.x = Math.random() * 400 + 200;
      obstacle.y = -50;
      app.stage.addChild(obstacle);
      
      // Simple obstacle movement
      app.ticker.add(() => {
        obstacle.y += carSpeed + 3;
        if (obstacle.y > 650) app.stage.removeChild(obstacle);
      });
    }
  });

  log("Game started! Use arrow keys to move");
} catch (e) {
  log(`ERROR: ${e.message}`);
  console.error(e);
}
