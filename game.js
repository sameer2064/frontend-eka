const app = new PIXI.Application({
  view: document.getElementById("gameCanvas"),
  width: 800,
  height: 600,
  backgroundColor: 0x1e1e1e
});

// Load assets
PIXI.Assets.load([
  "https://opengameart.org/sites/default/files/car_blue_small_0.png"
]).then(([carTexture]) => {
  const car = new PIXI.Sprite(carTexture);
  car.anchor.set(0.5);
  car.x = app.screen.width / 2;
  car.y = app.screen.height - 100;

  app.stage.addChild(car);

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") car.x -= 10;
    if (e.key === "ArrowRight") car.x += 10;
    if (e.key === " ") {
      car.tint = 0xff0000;
      setTimeout(() => car.tint = 0xffffff, 300);
    }
  });
});