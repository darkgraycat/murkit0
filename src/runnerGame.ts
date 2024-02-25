import { Adapter } from "./adapter";
import { Engine } from "./engine";
import { Bitmap, TileableBitmap } from "./bitmap";

import { EntityManager } from "./ecs/simple.ecs";
import { World } from "./world";
import { Systems } from "./systems";
import * as components from "./components";

import playerAsset from "../assets/player.png";
import bgAsset from "../assets/backgrounds.png";
import houseAsset from "../assets/backgrounds_houses.png";
import stageConfigs, { StageConfig, BgRow } from "./data/runner_stages";

export type GameConfig = {
  width: number;
  height: number;
  keys: Set<string>;
  screen: HTMLCanvasElement;
  fps: number;
};

// why do I need this?
export type GameState = {
  speed: number;
  distance: number;
  current: number;
  engine?: Engine;
  world?: World;
}

export type GameStateSwitcher = [

]

export default async (config: GameConfig): Promise<GameState> => {
  const { width, height, keys, screen, fps } = config;
  const gs: GameState = { speed: 0.6, distance: 6000, current: 1 };
  // --------------------------------------------------------------------------
  const adapter = new Adapter();
  const screenCtx = screen.getContext("2d") as CanvasRenderingContext2D;
  const screenImageData = screenCtx.getImageData(0, 0, width, height) as ImageData;
  const viewport = Bitmap.from(screenImageData.data.buffer, width, height);
  // --------------------------------------------------------------------------
  const { playerSprites, bgTiles, houseTiles } = await assets(adapter);


  // --------------------------------------------------------------------------
  const world = new World({ width, height, gravity: 0.9, friction: 0.95, skyColor: 0xffa09080 });
  const {
    sMovement, sAnimation, sCollideBounds,
    sDrawing, sControllerRunner,
  } = Systems(world, viewport);

  const eManager = new EntityManager(components);
  const ePlayer = eManager.add({
    cPosition: { x: 32, y: 128 },
    cVelocity: { vx: 0, vy: 0 },
    cShape: { w: 10, h: 14 },
    cMeta: { air: true, speed: 0.4 },
    cInput: { keys },
    cSprite: { spriteIdx: 0, sprites: playerSprites, offsetX: -3, offsetY: -2 },
    cAnimation: { animations: [ [0, 0, 3, 3], [1, 2, 3, 0], [1, 1, 2, 2] ], current: 0, length: 4, time: 0, coef: 0.4 },
  });

  // --------------------------------------------------------------------------
  const collideBounds = sCollideBounds.setup([ePlayer]);
  const move = sMovement.setup([ePlayer]);
  const draw = sDrawing.setup([ePlayer]);
  const control = sControllerRunner.setup([ePlayer]);
  const animate = sAnimation.setup([ePlayer]);

  // --------------------------------------------------------------------------
  const render = (dt: number, time: number) => {
    animate(dt);
    draw(dt);
    screenCtx.putImageData(screenImageData, 0, 0);
  };
  const update = (dt: number, time: number) => {
    gs.world.time = time;
    gs.distance -= gs.speed;
    move(dt);
    collideBounds(dt);
    control(dt);
  };
  // --------------------------------------------------------------------------
  const engine = new Engine(adapter, fps, update, render, 0.03);
  gs.world = world;
  gs.engine = engine;
  return gs;
}

async function assets(adapter: Adapter) {
  const playerTiles = await adapter.loadImage(playerAsset).then(img => TileableBitmap.from(img.data, 16, 16, 4, 1));
  const bgTiles = await adapter.loadImage(bgAsset).then(img => TileableBitmap.from(img.data, 32, 32, 6, 1));
  const houseTiles = await adapter.loadImage(houseAsset).then(img => TileableBitmap.from(img.data, 48, 32, 5, 1));
  // TODO: add collectables
  const playerSprites = playerTiles.split().concat(playerTiles.flipV().split());

  return { playerSprites, bgTiles, houseTiles };
}

/*
QUICK NOTE:
to make switch - create a timer which will wake up every 2 seconds and check distance
*/
