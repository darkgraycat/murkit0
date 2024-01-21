import { Adapter } from "./adapter";
import { Engine } from "./engine";
import { Bitmap } from "./bitmap";

import { EntityManager } from "./ecs/simple.ecs";
import { World } from "./ecs.world";
import { Systems } from "./ecs.systems";
import * as components from "./ecs.components";

import { bulkTileableBitmapLoad } from "./helpers";

export type CoreConfig = {
  width: number;
  height: number;
  keys: Set<string>;
  screen: HTMLCanvasElement;
  gui: HTMLDivElement;
  fps: number;
};

export const init = async (config: CoreConfig): Promise<void> => {
  console.debug("MAIN: init");
  const { width, height, keys, gui, screen, fps } = config;
  const screenCtx = screen.getContext("2d");
  const screenImageData = screenCtx.getImageData(0, 0, width, height);

  const guiSet = (msg: string) => (gui.innerHTML = msg);

  const screenBitmap = Bitmap.from(screenImageData.data.buffer, width, height);
  const adapter = new Adapter();

  console.debug("MAIN: load assets");
  const [playerTiles, blocksTiles, bgTiles, bgHouseTiles] =
    await bulkTileableBitmapLoad(
      adapter,
      ["./assets/player.png", 16, 16, 4, 1],
      ["./assets/platforms1.png", 16, 16, 4, 1],
      ["./assets/backgrounds.png", 32, 32, 6, 1],
      ["./assets/backgrounds_houses.png", 48, 32, 5, 1],
    );

  const playerSprites = playerTiles.splitToBitmaps();
  playerSprites.push(...playerTiles.flipV().splitToBitmaps());
  const bgHouseSprites = bgHouseTiles.splitToBitmaps();

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
    cPosition: { x: 32, y: 32 },
    cVelocity: { vx: 0, vy: 0 },
    cShape: { w: 16, h: 16 },
    cMeta: { air: false, speed: 0.6 },
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

  const createHouseBlockEntity = (spriteIdx: number, x: number, y: number) =>
    em.add({
      cPosition: { x, y },
      cShape: { w: 48, h: 32 },
      cSprite: { sprites: bgHouseSprites, spriteIdx, flipped: false },
    });

  const houseBlocks = [
    createHouseBlockEntity(0, 48 * 4, 208),
    createHouseBlockEntity(1, 48 * 5, 208),
  ];

  console.debug("MAIN: attach entities with systems");
  const collideBounds = sCollideBounds.setup([player]);
  const collideBlocks = sCollideShapes.setup([player], houseBlocks);
  const move = sMovement.setup([player]);
  const draw = sDrawing.setup([player, ...houseBlocks]);
  const control = sController.setup([player]);
  const animate = sAnimation.setup([player]);

  // TODO: for debug only
  const { x, y } = components.cPosition.storage;
  const { vx, vy } = components.cVelocity.storage;

  const render = (dt: number) => {
    guiSet(
      `POS ${x[player].toFixed(2)}:${y[player].toFixed(2)} | VEL ${vx[player].toFixed(2)}:${vy[player].toFixed(2)}`,
    );
    animate(dt);
    draw(dt);
    screenCtx.putImageData(screenImageData, 0, 0);
  };

  const update = (dt: number) => {
    move(dt);
    collideBounds(dt);
    collideBlocks(dt);
    control(dt);
  };

  console.debug("MAIN: run engine");
  const engine = new Engine(adapter, fps, update, render, 0.03);
  engine.start();
  // TODO: live limited time. for dev only
  setTimeout(() => engine.stop(), 1000 * 30); // for development only, to stop after 30 sec
};
