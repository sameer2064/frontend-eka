const app = new PIXI.Application({
  view: document.getElementById("gameCanvas"),
  width: 800,
  height: 600,
  backgroundColor: 0x1e1e1e
});

PIXI.Assets.load([
  "https://cdn.pixabay.com/photo/2012/04/25/00/19/race-car-41071_1280.png"
]).then(([carTexture]) => {
  const car = new PIXI.Sprite(carTexture);
  car.anchor.set(0.5);
  car.width = 80;
  car.height = 100;
  car.x = app.screen.width / 2;
  car.y = app.screen.height - 100;

  app.stage.addChild(car);

  // Car movement
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") car.x -= 10;
    if (e.key === "ArrowRight") car.x += 10;
    if (e.key === " ") {
      car.tint = 0xff0000;
      setTimeout(() => car.tint = 0xffffff, 300);
    }
  });

  // Animate road (simple scrolling background idea)
  app.ticker.add(() => {
    car.y = app.screen.height - 100; // Fix car position for now
  });
});