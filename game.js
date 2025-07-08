const app = new PIXI.Application({
  view: document.getElementById("gameCanvas"),
  width: 800,
  height: 600,
  backgroundColor: 0x1e1e1e
});

// Create a car sprite with a working image URL
const carTexture = PIXI.Texture.from("https://i.ibb.co/M2gNnyq/car-blue.png");
const car = new PIXI.Sprite(carTexture);

car.anchor.set(0.5);
car.width = 80;
car.height = 100;
car.x = app.screen.width / 2;
car.y = app.screen.height - 100;

app.stage.addChild(car);

// Key controls
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") car.x -= 10;
  if (e.key === "ArrowRight") car.x += 10;
  if (e.key === " ") {
    car.tint = 0x00ffff; // Nitro boost visual
    setTimeout(() => car.tint = 0xffffff, 300);
  }
});

// Animate road (placeholder for infinite scroll)
app.ticker.add(() => {
  car.y = app.screen.height - 100;
});
