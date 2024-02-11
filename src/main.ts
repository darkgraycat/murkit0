import { Adapter } from "./adapter";
import { Engine } from "./engine";
import { Bitmap, BitmapPallete } from "./bitmap";

import { EntityManager } from "./ecs/simple.ecs";
import { World } from "./world";
import { Systems } from "./systems";
import * as components from "./components";

import { bulkTileableBitmapLoad, createStaticDrawableEntity } from "./helpers";

import { benchmark } from "./utils";

export type MainConfig = {
  width: number;
  height: number;
  keys: Set<string>;
  screen: HTMLCanvasElement;
  fps: number;
};

export const init = async (config: MainConfig): Promise<void> => {
  console.debug("MAIN: init");
  const { width, height, keys, screen, fps } = config;
  const screenCtx = screen.getContext("2d");
  const screenImageData = screenCtx.getImageData(0, 0, width, height);

  const screenBitmap = Bitmap.from(screenImageData.data.buffer, width, height);
  const adapter = new Adapter();

  console.debug("MAIN: load assets");
  const [playerTiles, boxTiles, bgTiles, bgHouseTiles] =
    await bulkTileableBitmapLoad(
      adapter,
      ["./assets/player.png", 16, 16, 4, 1],
      ["./assets/platforms.png", 16, 16, 4, 1],
      ["./assets/backgrounds.png", 32, 32, 6, 1],
      ["./assets/backgrounds_houses.png", 48, 32, 5, 1],
    );


  const playerSprites = playerTiles.split().concat(playerTiles.flipV().split());
  const bgSprites = bgTiles.split();
  const bgHouseSprites = bgHouseTiles.split();
  const boxSprites = boxTiles.split();

  const animatedBgSprites = [
    bgTiles.extractTile(0, 0),         // 0 sky 1
    bgTiles.extractTile(0, 0).flipV(), // 1 sky 2
    bgTiles.extractTile(2, 0),         // 2 pines
    bgTiles.extractTile(1, 0),         // 3 hills
    bgTiles.extractTile(3, 0),         // 4 elec
    bgTiles.extractTile(4, 0),         // 5 factory
    bgTiles.extractTile(5, 0),         // 6 city 1
    bgTiles.extractTile(5, 0).flipV(), // 7 city 2
  ];
  const animatedBgPalletes = animatedBgSprites.map((bitmap) => new BitmapPallete(bitmap));
  console.log(animatedBgSprites.length)
  
  console.debug("MAIN: init world");
  const world = new World({
    width,
    height,
    gravity: 0.9,
    friction: 0.8,
    skyColor: 0xffa09080,
  });

  console.debug("MAIN: init systems");
  const {
    sMovement,
    sAnimation,
    sCollideBounds,
    sDrawing,
    sController,
    sDrawAnimatedBg,
  } = Systems(world, screenBitmap);

  console.debug("MAIN: init entities");
  const em = new EntityManager(components);
  const player = em.add({
    cPosition: { x: 32, y: 128 },
    cVelocity: { vx: 0, vy: 0 },
    cShape: { w: 10, h: 14 },
    cMeta: { air: true, speed: 1 },
    cInput: { keys },
    cSprite: { spriteIdx: 0, sprites: playerSprites, offsetX: -3, offsetY: -2 },
    cAnimation: {
      animations: [ [0, 0, 3, 3], [1, 2, 3, 0] ],
      current: 0,
      length: 4,
      time: 0,
      coef: 0.4,
    },
  });

  const createAnimatedBgEntity = (spriteIdx: number, x: number, y: number, speed: number) => em.add({
    cAnimation: { animations: [[0]], current: 0, length: 0, time: 0, coef: speed },
    cSprite:   { sprites: animatedBgSprites, spriteIdx, offsetX: x, offsetY: y },
  });

  const animatedBgWidth = bgSprites[0].width;
  const animatedBgCols = width / animatedBgWidth | 0;
  const animatedBgEntities = [
    ...Array.from({ length: animatedBgCols + 1 }).map((_, i) => createAnimatedBgEntity(2, i * animatedBgWidth, 5 * 16, -1 )),
    ...Array.from({ length: animatedBgCols + 1 }).map((_, i) => createAnimatedBgEntity(3, i * animatedBgWidth, 6 * 16, -1.5 )),
    ...Array.from({ length: animatedBgCols + 1 }).map((_, i) => createAnimatedBgEntity(4, i * animatedBgWidth, 7 * 16, -2 )),
    ...Array.from({ length: animatedBgCols + 1 }).map((_, i) => createAnimatedBgEntity(5, i * animatedBgWidth, 8 * 16, -2.5 )),
    ...Array.from({ length: animatedBgCols + 1 }).map((_, i) => createAnimatedBgEntity(6, i * animatedBgWidth, 9.5 * 16, -3 )),
    ...Array.from({ length: animatedBgCols + 1 }).map((_, i) => createAnimatedBgEntity(7, i * animatedBgWidth, 10.9 * 16, -3.5 )),
    ...Array.from({ length: animatedBgCols + 1 }).map((_, i) => createAnimatedBgEntity(1, i * animatedBgWidth, 1 * 16, -2 )),
    ...Array.from({ length: animatedBgCols + 1 }).map((_, i) => createAnimatedBgEntity(0, i * animatedBgWidth, 0 * 16, -1 )),
  ];

  console.debug("MAIN: attach entities with systems");
  const collideBounds = sCollideBounds.setup([player]);
  const move = sMovement.setup([player]);
  const draw = sDrawing.setup([player]);
  const control = sController.setup([player]);
  const animate = sAnimation.setup([player]);
  const animateBg = sDrawAnimatedBg.setup(animatedBgEntities);

  animatedBgPalletes[0].pallete = [0, 0xff807060, 0xff605040];
  animatedBgPalletes[1].pallete = [0, 0xff908070, 0xff706050];
  animatedBgPalletes[2].pallete = [0xff304030, 0];
  animatedBgPalletes[3].pallete = [0xff293929, 0];
  animatedBgPalletes[4].pallete = [0xff484848, 0];
  animatedBgPalletes[5].pallete = [0xff404040, 0xff206090];
  animatedBgPalletes[6].pallete = [0xff303030, 0xff909090];
  animatedBgPalletes[7].pallete = [0xff202020, 0xff909090];
  console.log(animatedBgPalletes.map(d => d.pallete))

  const renderBench = benchmark("render bench", 2);
  const updateBench = benchmark("update bench", 2);

  const factoryAndCity = bgTiles.reorder([4, 4, 4, 4, 5, 5, 5, 5], 4, 2);
  console.log(bgTiles.width);
  console.log(bgTiles.height);
  console.log(factoryAndCity.width);
  console.log(factoryAndCity.height);

  // animated bg
  const render = (dt: number) => {
    renderBench.A();
    screenBitmap.fill(world.skyColor);

    // animateBg(dt);
    screenBitmap.draw(factoryAndCity, 100, 100);
    animate(dt);
    draw(dt);

    screenCtx.putImageData(screenImageData, 0, 0);
    renderBench.B();
  };

  const update = (dt: number) => {
    updateBench.A();
    move(dt);
    collideBounds(dt);
    control(dt);
    updateBench.B();
  };

  console.debug("MAIN: run engine");
  const engine = new Engine(adapter, fps, update, render, 0.03);
  engine.start();
  // TODO: live limited time. for dev only
  setTimeout(() => {
    engine.stop();
    console.debug("MAIN: engine stopped");
    console.log(renderBench.resultsFps());
    console.log(updateBench.resultsFps());
  }, 1000 * 5); // for development only, to stop after 30 sec
};
