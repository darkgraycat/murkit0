import { Engine, TimeoutEngine, WindowRafEngine } from "./engine";
import { Bitmap, BitmapPallete } from "./bitmap";

import { EntityManager } from "./ecs/simple.ecs";
import * as components from "./components";
import { Systems } from "./systems";
import { World } from "./world";
import { Stage } from "./stage";

import stageConfigs from "./data/runner_stages";

import { fileHelpers } from "./utils";

import assetsPlayer from "../assets/player.png";
import assetsHouses from "../assets/backgrounds_houses.png";
import assetsBackgrounds from "../assets/backgrounds.png";

export type GameConfig = {
  width: number;
  height: number;
  actions: Set<string>;
  screen: HTMLCanvasElement;
  overlay: HTMLDivElement;
  fps: number;
};

export default async (config: GameConfig) => {
  const { width, height, actions, screen, fps } = config;

  // --------------------------------------------------------------------------
  const screenCtx = screen.getContext("2d", {
    alpha: false,
    colorSpace: 'srgb',
    willReadFrequently: true,
  }) as CanvasRenderingContext2D;
  screenCtx.mozImageSmoothingEnabled = false;
  screenCtx.webkitImageSmoothingEnabled = false;
  screenCtx.msImageSmoothingEnabled = false;
  screenCtx.imageSmoothingEnabled = false;
  // const screenCtx = screen.getContext("2d") as CanvasRenderingContext2D;
  const screenImageData = screenCtx.getImageData(0, 0, width, height) as ImageData;
  const viewport = Bitmap.from(screenImageData.data.buffer, width, height);

  // --------------------------------------------------------------------------
  const [tilesPlayer, tilesHouses, tilesBg] = await fileHelpers.loadImagesAsTileableBitmaps(
    [assetsPlayer, 16, 16, 4, 1],
    [assetsHouses, 48, 32, 5, 1],
    [assetsBackgrounds, 32, 32, 6, 1],
  );
  const spritesPlayer = tilesPlayer.split().concat(tilesPlayer.flipV().split());
  const spritesHouses = [
    tilesHouses.reorder([1,0, 2,2, 0,1], 2, 3),
    tilesHouses.reorder([2,2, 1,1, 1,1], 2, 3),
    tilesHouses.reorder([3,4, 3,1, 2,2], 2, 3),
    tilesHouses.reorder([2,2,2,2, 0,0,0,0], 4, 2),
    tilesHouses.reorder([1,2,3,1, 0,2,2,0], 4, 2),
    tilesHouses.reorder([3,4,1,4, 1,3,2,4], 4, 2),
    tilesHouses.reorder([1,1, 1,1], 2, 2),
    tilesHouses.reorder([3,2, 1,1], 2, 2),
    tilesHouses.reorder([1,2,2,1, 1,2,2,1, 0,2,2,0], 4, 3),
    tilesHouses.reorder([2,0,1,4, 2,0,1,1, 0,0,0,0], 4, 3),
    tilesHouses.reorder([1,1, 1,1, 2,2, 3,3], 2, 4),
    tilesHouses.reorder([2,4,3,1,2, 2,1,3,0,2, 0,0,3,0,0], 5, 3),
    tilesHouses.reorder([0], 1, 1),
  ]
  const colors = [0xff101010, 0xff303030, 0];
  const palletesHouses = spritesHouses.map(sprite => new BitmapPallete(sprite));
  palletesHouses.forEach(p => p.colors = colors); // TODO: remove

  // --------------------------------------------------------------------------
  const world = new World({
      width,
      height,
      gravity: 0.5,
      friction: 0.75,
      skyColor: 0xffa09080,
  });
  let currentStage: Stage;
  const stages = stageConfigs.map(config => new Stage(
    world,
    config,
    tilesBg,
    tilesHouses,
  ));

  // TODO: check what should be removed
  // TODO: make 0 - entry, 3 - morning, 4 - ending
  stages.forEach((stage, i) => i > 0 && stages[i - 1].setNext(stage));
  stages.forEach((stage, i) => stage.onfinish((curr, next) => {
    currentStage = next;
    console.debug(`Switching ${i}`);
  }));
  currentStage = stages[0];
  stages[stages.length - 1].onfinish(() => {
    window.alert("Дякую за увагу! Будьте щасливі!");
    engine.stop();
    // console.log("You win!");
  });

  // --------------------------------------------------------------------------
  const eManager = new EntityManager(components);
  const eSystems = Systems(world, viewport);
  const ePlayer = eManager.add({
    cPosition: { x: 32, y: 64 },
    cVelocity: { vx: 0, vy: 0 },
    cShape: { w: 10, h: 14 },
    cPlayer: { air: true, speed: 0.8, power: 6 },
    cInputRunner: { actions, jumping: false, acceleration: 0 },
    cSprite: { spriteIdx: 0, sprites: spritesPlayer, offsetX: -3, offsetY: -2 },
    cAnimation: { animations: [ [0, 0, 3, 3], [1, 2, 3, 0], [1, 1, 2, 2] ], current: 0, length: 4, time: 0, coef: 0.4 },
  });
  const createBuilding = (spriteIdx: number, col: number, row: number) => eManager.add({
    cPosition: { x: col * 16, y: row * 20, },
    cSprite: { spriteIdx, sprites: spritesHouses },
    cShape: { w: spritesHouses[spriteIdx].width, h: spritesHouses[spriteIdx].height },
  });
  const eBuildings = [
    // createBuilding(11, 0, 6),
    createBuilding(0,  0,  5),
    createBuilding(6,  8, 6),
    createBuilding(1,  16, 5),
    createBuilding(2,  24, 6),
    createBuilding(1,  32, 6),
    createBuilding(0,  40, 7),
    createBuilding(7,  48, 5),
    // createBuilding(3,  24, 6),
  ];

  // --------------------------------------------------------------------------
  const collideBounds = eSystems.sCollideBounds.setup([ePlayer]);
  const collideShapes = eSystems.sCollideShapes.setup([ePlayer], eBuildings);
  const platforms = eSystems.sBuildingsRunner.setup(eBuildings);
  const move = eSystems.sMovement.setup([ePlayer]);
  const draw = eSystems.sDrawing.setup([ePlayer, ...eBuildings]);
  const control = eSystems.sControllerRunner.setup([ePlayer]);
  const animate = eSystems.sAnimation.setup([ePlayer]);

  // TODO - remove, handle somewhere
  const { x, y } = components.cPosition.storage;

  // --------------------------------------------------------------------------
  const render = (dt: number, time: number) => {
    currentStage.renderBg(dt, viewport);
    animate(dt);
    draw(dt);
    screenCtx.putImageData(screenImageData, 0, 0);
  };
  const update = (dt: number, time: number) => {
    currentStage.update(dt);
    // if (y[ePlayer] > 200) { // reset player
    //   x[ePlayer] = 32;
    //   y[ePlayer] = 64;
    // }
    platforms(dt),
    move(dt);
    collideBounds(dt);
    collideShapes(dt);
    control(dt);
  };
  // --------------------------------------------------------------------------
  // const engine = new Engine(fps, update, render, 60 / 1000);
  // const engine = new TimeoutEngine(fps, update, render, 60 / 1000);
  const engine = new WindowRafEngine(fps, update, render, 60 / 1000);

  return { engine }
}
