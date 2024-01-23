import { Adapter } from "./adapter";
import { Engine } from "./engine";
import { Bitmap } from "./bitmap";

import { EntityManager } from "./ecs/simple.ecs";
import { World, Level } from "./world";
import { Systems } from "./systems";
import * as components from "./components";

import { bulkTileableBitmapLoad, createStaticDrawableEntity } from "./helpers";

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

  const playerSprites = playerTiles.splitToBitmaps();
  playerSprites.push(...playerTiles.flipV().splitToBitmaps());
  const bgHouseSprites = bgHouseTiles.splitToBitmaps();
  const boxSprites = boxTiles.splitToBitmaps();

  console.debug("MAIN: init world");
  const world = new World({
    width,
    height,
    gravity: 0.9,
    friction: 0.9,
    skyColor: 0xffff8822,
  });

  console.debug("MAIN: init systems");
  const {
    sMovement,
    sAnimation,
    sCollideBounds,
    sCollideShapes,
    sDrawing,
    sController,
  } = Systems(world, screenBitmap);

  console.debug("MAIN: init entities");
  const em = new EntityManager(components);
  const player = em.add({
    cPosition: { x: 32, y: 128 },
    cVelocity: { vx: 0, vy: 0 },
    cShape: { w: 16, h: 16 },
    cMeta: { air: true, speed: 0.6 },
    cInput: { keys },
    cSprite: {
      spriteIdx: 0,
      sprites: playerSprites,
      flipped: false,
    },
    cAnimation: {
      animations: [
        [0, 0, 3, 3],
        [1, 2, 1, 0],
      ],
      current: 0,
      length: 4,
      time: 0,
      coef: 0.3,
    },
  });

  const createHouseBlock = (idx: number, x: number, y: number) =>
    createStaticDrawableEntity(em, bgHouseSprites, idx, x, y, 48, 32);
  const createBoxBlock = (idx: number, x: number, y: number) =>
    createStaticDrawableEntity(em, boxSprites, idx, x, y, 16, 16);

  const houseBlocks = [
    createHouseBlock(1, 48 * 2, 13 * 16),
    createHouseBlock(2, 48 * 2, 11 * 16),

    createHouseBlock(0, 48 * 3, 13 * 16),
    createHouseBlock(2, 48 * 3, 11 * 16),

    createHouseBlock(3, 48 * 4, 13 * 16),
    createHouseBlock(2, 48 * 4, 11 * 16),

    createHouseBlock(0, 48 * 5, 13 * 16),
    createHouseBlock(1, 48 * 5, 11 * 16),

    createHouseBlock(1, 48 * 6, 13 * 16),
    createHouseBlock(2, 48 * 6, 11 * 16),

    createHouseBlock(4, 48 * 4.5, 9 * 16),

    createBoxBlock(1, 4 * 16, 224),
    createBoxBlock(1, 3 * 16, 224),
    createBoxBlock(0, 3.5 * 16, 224 - 16),

  ];

  console.debug("MAIN: attach entities with systems");
  const collideBounds = sCollideBounds.setup([player]);
  const collideBlocks = sCollideShapes.setup([player], houseBlocks);
  const move = sMovement.setup([player]);
  // const draw = sDrawing.setup([player, ...houseBlocks]);
  const draw = sDrawing.setup([player]);
  const drawBg = sDrawing.setup(houseBlocks);
  const control = sController.setup([player]);
  const animate = sAnimation.setup([player]);

  // TODO: for debug only
  const { x, y } = components.cPosition.storage;
  const { vx, vy } = components.cVelocity.storage;

  const render = (dt: number) => {
    // console.time("render")
    screenBitmap.fill(world.skyColor);
    animate(dt);
    drawBg(dt);
    draw(dt);
    screenCtx.putImageData(screenImageData, 0, 0);
    // console.timeEnd("render")
  };

  const update = (dt: number) => {
    // console.time("update")
    move(dt);
    control(dt);
    collideBounds(dt);
    collideBlocks(dt);
    // console.timeEnd("update")
  };

  console.debug("MAIN: run engine");
  const engine = new Engine(adapter, fps, update, render, 0.03);
  engine.start();
  // TODO: live limited time. for dev only
  setTimeout(() => engine.stop(), 1000 * 120); // for development only, to stop after 30 sec
};
