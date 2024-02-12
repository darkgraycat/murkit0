import { Adapter } from "./adapter";
import { Engine } from "./engine";
import { Bitmap, BitmapPallete, TileableBitmap } from "./bitmap";

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

  // TODO: make dedicated EM and components and systems for decorations
  const animatedBgLayers = [
    // bgTiles.reorder([0,0,0,0,0,0,0,0,0,0,0], 11, 1),          // 0 sky
    // bgTiles.reorder([0,0,0,0,0,0,0,0,0,0,0], 11, 1).flipV(),  // 1 sky
    // bgTiles.reorder([2,2,2,2,2,2,2,2,2,2,2], 11, 1),          // 2 pines
    // bgTiles.reorder([1,1,1,1,1,1,1,1,1,1,1], 11, 1),          // 3 hills
    // bgTiles.reorder([3,3,3,3,3,3,3,3,3,3,3], 11, 1),          // 4 elechils
    // bgTiles.reorder([4,4,4,4,4,4,4,4,4,4,4], 11, 1),          // 5 factory
    // bgTiles.reorder([5,5,5,5,5,5,5,5,5,5,5], 11, 1),          // 6 city
    // bgTiles.reorder([5,5,5,5,5,5,5,5,5,5,5], 11, 1).flipV(),  // 7 city

    bgTiles.reorder([0,0,0,0,0,0,0,0,0,0,0], 11, 1),          // 0 sky
    bgTiles.reorder([0,0,0,0,0,0,0,0,0,0,0], 11, 1).flipV(),  // 1 sky
    bgTiles.reorder([2,2,2,2,2,2,2,2,2,2,2], 11, 1),          // 2 pines
    bgTiles.reorder([1,1,1,1,1,1,1,1,1,1,1], 11, 1),          // 3 hills
    bgTiles.reorder([5,5,5,5,5,5,5,5,5,5,5], 11, 1),          // 4 elechils
    bgTiles.reorder([5,5,5,5,5,5,5,5,5,5,5], 11, 1),          // 5 factory
    bgTiles.reorder([5,5,5,5,5,5,5,5,5,5,5], 11, 1),          // 6 city
    bgTiles.reorder([5,5,5,5,5,5,5,5,5,5,5], 11, 1).flipV(),  // 7 city
  ]
  const animatedBgPalletes = animatedBgLayers.map((bitmap) => new BitmapPallete(bitmap));

  const animatedFgOrder =  [9, 9, 2, 9, 9, 3, 9, 9];
  const animatedFgOrder2 = [9, 9, 0, 9, 9, 0, 9, 9];
  const animatedFgLayers = [
    bgHouseTiles.reorder([
      ...animatedFgOrder,
      ...animatedFgOrder,
      ...animatedFgOrder2,
      ...animatedFgOrder2,
      ...animatedFgOrder,
      ...animatedFgOrder,
      ...animatedFgOrder2,
      ...animatedFgOrder2,
    ], 16, 4),
  ];
  const animatedFgPalletes = animatedFgLayers.map((bitmap) => new BitmapPallete(bitmap));
  
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
    sDrawAnimatedFg,
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
      animations: [ [0, 0, 3, 3], [1, 2, 3, 0], [1, 1, 2, 2] ],
      current: 0,
      length: 4,
      time: 0,
      coef: 0.4,
    },
  });

  // TODO: #newECS: how we can make dynamic component arguments using TS types, to achive this API:
  // const entity = em.create(x, y, w, h) // where x & y and w & h is separate components
  const createAnimatedBgEntity = (spriteIdx: number, alt: number, speed: number) => em.add({
    cAnimation: { animations: [[0]], current: 0, length: 0, time: 0, coef: speed },
    cSprite:   { sprites: animatedBgLayers, spriteIdx, offsetX: 0, offsetY: alt * 16 },
  });

  const animatedBgLayersEntities = [
    createAnimatedBgEntity(2, 4, -1.0),
    createAnimatedBgEntity(3, 5, -1.5),
    createAnimatedBgEntity(4, 6, -2.0),
    createAnimatedBgEntity(5, 7, -2.5),
    createAnimatedBgEntity(6, 8, -3.0),
    createAnimatedBgEntity(7, 9, -3.5),
    createAnimatedBgEntity(0, 2, -1.0),
    createAnimatedBgEntity(1, 1, -1.5),
    createAnimatedBgEntity(0, 0, -2.0),
  ]
  const createAnimatedFgEntity = (spriteIdx: number, alt: number, speed: number) => em.add({
    cAnimation: { animations: [[0]], current: 0, length: 0, time: 0, coef: speed },
    cSprite:   { sprites: animatedFgLayers, spriteIdx, offsetX: 0, offsetY: alt * 16 },
  });
  const animatedFgLayersEntities = [
    createAnimatedFgEntity(0, 5, -3)
  ]

  console.debug("MAIN: attach entities with systems");
  const collideBounds = sCollideBounds.setup([player]);
  const move = sMovement.setup([player]);
  const draw = sDrawing.setup([player]);
  const control = sController.setup([player]);
  const animate = sAnimation.setup([player]);
  const animateBg = sDrawAnimatedBg.setup(animatedBgLayersEntities);
  const animateFg = sDrawAnimatedFg.setup(animatedFgLayersEntities);

  console.log("FGpals", animatedBgPalletes.map(d => d.pallete))
  // animatedBgPalletes[0].pallete = [0, 0xff807060, 0xff605040];
  // animatedBgPalletes[1].pallete = [0, 0xff908070, 0xff706050];
  // animatedBgPalletes[2].pallete = [0xff304030, 0];
  // animatedBgPalletes[3].pallete = [0xff293929, 0];
  // animatedBgPalletes[4].pallete = [0xff484848, 0];
  // animatedBgPalletes[5].pallete = [0xff404040, 0xff206090];
  // animatedBgPalletes[6].pallete = [0xff303030, 0xff909090];
  // animatedBgPalletes[7].pallete = [0xff202020, 0xff909090];

  world.skyColor = 0xff4499ff;
  animatedBgPalletes[0].pallete = [0, 0xff3366ee, 0xff2244aa];
  animatedBgPalletes[1].pallete = [0, 0xff113388, 0xff2255bb];
  animatedBgPalletes[2].pallete = [0xff303030, 0];
  animatedBgPalletes[3].pallete = [0xff292929, 0];
  animatedBgPalletes[4].pallete = [0xff333333, 0xff206090];
  animatedBgPalletes[5].pallete = [0xff303030, 0xff206090];
  animatedBgPalletes[6].pallete = [0xff252525, 0xff206090];
  animatedBgPalletes[7].pallete = [0xff202020, 0xff206090];

  console.log("BGpals", animatedFgPalletes.map(d => d.pallete))
  // animatedFgPalletes[0].pallete = [0, 0xff202020, 0xff505050];
  animatedFgPalletes[0].pallete = [0, 0xff101010, 0xff303030];

  const renderBench = benchmark("render bench", 2);
  const updateBench = benchmark("update bench", 2);

  // animated bg
  const render = (dt: number) => {
    renderBench.A();
    screenBitmap.fill(world.skyColor);

    animateBg(dt);
    animate(dt);
    draw(dt);
    animateFg(dt);

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
  }, 1000 * 30); // for development only, to stop after 30 sec
};
