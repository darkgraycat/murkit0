import { IImage } from "./common/types";
import { Adapter } from "./adapter";
import { Bitmap, TileableBitmap } from "./bitmap";
import { Engine } from "./engine";
import { EntityManager, Component, System } from "./ecs/simple.ecs";

export type CoreConfig = {
  width: number;
  height: number;
  keys: Set<string>;
  screen: HTMLCanvasElement;
  gui: HTMLDivElement;
};
// TODO: think bout separating init from run
// and this is a nice place to store entities/state btw
export const init = async (config: CoreConfig): Promise<void> => {
  const { width, height, keys, gui, screen } = config;
  const screenCtx = screen.getContext("2d");
  const screenImageData = screenCtx.getImageData(0, 0, width, height);

  const guiWrite = (msg: string) => (gui.innerHTML += `${msg}<br>`);
  const guiClear = () => (gui.innerHTML = "");
  const guiSet = (msg: string) => (gui.innerHTML = msg);

  const screenBitmap = Bitmap.from(screenImageData.data.buffer, width, height);
  const adapter = new Adapter();

  // load images to tilesets
  type TilesheetTuple = [string, number, number, number, number];
  const [playerTiles, blocksTiles, bgTiles, bgHouseTiles] = await Promise.all(
    [
      ["./assets/player.png", 16, 16, 4, 1],
      ["./assets/platforms.png", 16, 16, 4, 1],
      ["./assets/backgrounds.png", 32, 32, 6, 1],
      ["./assets/backgrounds_houses.png", 48, 32, 5, 1],
    ].map(([file, w, h, cols, rows]: TilesheetTuple) =>
      adapter
        .loadImage(file)
        .then((img: IImage) => TileableBitmap.from(img.data, w, h, cols, rows)),
    ),
  );
  const playerSprites = playerTiles.splitToBitmaps();
  playerSprites.push(...playerTiles.flipV().splitToBitmaps());

  const World = {
    gravity: 0.9,
    friction: 0.9,
  };

  /* Components */
  const cPosition = new Component({ x: 0, y: 0 });
  const cVelocity = new Component({ vx: 0, vy: 0 });
  const cShape = new Component({ w: 0, h: 0 });
  const cSprite = new Component({
    // TODO: use separate component for animations
    spriteIdx: 0,
    sprites: [],
    flipped: false,
  });
  const cAnimation = new Component({
    animations: [[]],
    current: 0,
    length: 0,
    time: 0,
    coef: 0,
  });
  const cControls = new Component({ keys: new Set() });
  const cStats = new Component({ air: false, speed: 0 });

  const em = new EntityManager({
    cPosition,
    cVelocity,
    cShape,
    cSprite,
    cControls,
    cStats,
    cAnimation,
  });

  /* Systems */
  const sCollideBounds = new System(
    { cPosition, cVelocity, cShape, cStats },
    (_, comp, entities) => {
      const { x, y } = comp.cPosition.storage;
      const { vx, vy } = comp.cVelocity.storage;
      const { w, h } = comp.cShape.storage;
      const { air } = comp.cStats.storage;
      for (const e of entities) {
        x[e] < 0
          ? ((x[e] = 0), (vx[e] = 0))
          : x[e] + w[e] > width && ((x[e] = width - w[e]), (vx[e] = 0));
        y[e] < 0
          ? ((y[e] = 0), (vy[e] = 0))
          : y[e] + h[e] > height &&
          ((y[e] = height - h[e]), ((vy[e] = 0), (air[e] = false)));
      }
    },
  );
  const sMovement = new System(
    { cPosition, cVelocity },
    (dt, comp, entities) => {
      const { x, y } = comp.cPosition.storage;
      const { vx, vy } = comp.cVelocity.storage;
      const { gravity, friction } = World;
      for (const e of entities) {
        x[e] += vx[e] * dt;
        y[e] += vy[e] * dt;
        vx[e] *= friction;
        vy[e] += gravity;
      }
    },
  );
  const sDrawing = new System({ cSprite, cPosition }, (_, comp, entities) => {
    const { sprites, spriteIdx, flipped } = comp.cSprite.storage;
    const { x, y } = comp.cPosition.storage;
    screenBitmap.fill(0xffff8822);
    for (const e of entities) {
      const half = sprites[e].length / 2;
      const idx = flipped[e] ? spriteIdx[e] + half : spriteIdx[e];
      screenBitmap.draw(sprites[e][idx], x[e] | 0, y[e] | 0);
    }
  });
  const sAnimation = new System(
    { cAnimation, cSprite },
    (dt, comp, entities) => {
      const { animations, current, length, time, coef } =
        comp.cAnimation.storage;
      const { spriteIdx } = comp.cSprite.storage;
      for (const e of entities) {
        const frameTime = (time[e] + dt * coef[e]) % length[e];
        spriteIdx[e] = animations[e][current[e]][frameTime | 0];
        time[e] = frameTime;
      }
    },
  );
  const sController = new System(
    { cVelocity, cControls, cSprite, cStats, cAnimation },
    (_, comp, entities) => {
      const { flipped } = comp.cSprite.storage;
      const { current } = comp.cAnimation.storage;
      const { keys } = comp.cControls.storage;
      const { vx, vy } = comp.cVelocity.storage;
      const { air, speed } = comp.cStats.storage;
      for (const e of entities) {
        if (!keys[e].size) {
          current[e] = 0;
          continue;
        }
        current[e] = 1;
        if (keys[e].has("KeyQ")) (vx[e] -= speed[e]), (flipped[e] = true);
        if (keys[e].has("KeyW")) (vx[e] += speed[e]), (flipped[e] = false);
        if (keys[e].has("KeyP")) !air[e] && ((air[e] = true), (vy[e] = -12));
      }
    },
  );

  /* Entities */
  const player = em.add({
    cPosition: { x: 32, y: 32 },
    cVelocity: { vx: 0, vy: 0 },
    cShape: { w: 16, h: 16 },
    cStats: { air: false, speed: 0.6 },
    cControls: { keys },
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

  /* Run */
  const collideBounds = sCollideBounds.setup([player]);
  const move = sMovement.setup([player]);
  const draw = sDrawing.setup([player]);
  const control = sController.setup([player]);
  const animate = sAnimation.setup([player]);

  const { x, y } = cPosition.storage;
  const { vx, vy } = cVelocity.storage;

  const render = (dt: number) => {
    guiSet(
      `POS ${x[player].toFixed(2)}:${y[player].toFixed(2)} | VEL ${vx[player].toFixed(2)}:${vy[player].toFixed(2)}`,
    );
    // guiWrite("Render dt " + dt);
    // guiWrite("Player " + JSON.stringify(playerEnt));
    // TODO: logic to render
    animate(dt);
    draw(dt);
    screenCtx.putImageData(screenImageData, 0, 0);
  };

  const update = (dt: number) => {
    move(dt);
    collideBounds(dt);
    control(dt);
    // TODO: logic to update
  };

  const engine = new Engine(adapter, 1000 / 60, update, render, 0.03);

  engine.start();
  setTimeout(() => engine.stop(), 1000 * 30); // for development only, to stop after 30 sec
};
