// Initialize PixiJS application
const app = new PIXI.Application({
  width: 800,
  height: 600,
  backgroundColor: 0x222222,  // dark grey background
  antialias: true,
  resolution: window.devicePixelRatio || 1
});
document.body.appendChild(app.view);

// Load images (road and car) using Pixi's loader
PIXI.Loader.shared
  .add('road', 'road.png')
  .add('car', 'car.png')
  .load((loader, resources) => {
    // Add the road background sprite
    const bg = new PIXI.Sprite(resources.road.texture);
    bg.width = app.screen.width;
    bg.height = app.screen.height;
    app.stage.addChild(bg);

    // Add the car sprite and center it
    const car = new PIXI.Sprite(resources.car.texture);
    car.anchor.set(0.5);
    car.x = app.screen.width / 2;
    car.y = app.screen.height / 2;
    app.stage.addChild(car);
});
