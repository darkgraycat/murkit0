import { Adapter } from "./adapter";
import { Engine } from "./engine";
import { Bitmap, BitmapPallete, TileableBitmap } from "./bitmap";

import { EntityManager } from "./ecs/simple.ecs";
import { World } from "./world";
import { Systems } from "./systems";
import * as components from "./components";

import playerAsset from "../assets/player.png";
import bgAsset from "../assets/backgrounds.png";
import houseAsset from "../assets/backgrounds_houses.png";
import stageConfigs from "./data/runner_stages";

export type GameConfig = {
  width: number;
  height: number;
  keys: Set<string>;
  screen: HTMLCanvasElement;
  fps: number;
};

export default async (config: GameConfig) => {
  const { width, height, keys, screen, fps } = config;
  // --------------------------------------------------------------------------
  const adapter = new Adapter();
  const screenCtx = screen.getContext("2d") as CanvasRenderingContext2D;
  const screenImageData = screenCtx.getImageData(0, 0, width, height) as ImageData;
  const viewport = Bitmap.from(screenImageData.data.buffer, width, height);
  // --------------------------------------------------------------------------
  // TODO: add collectables
  const playerTiles = await adapter.loadImage(playerAsset).then(img => TileableBitmap.from(img.data, 16, 16, 4, 1));
  const playerSprites = playerTiles.split().concat(playerTiles.flipV().split());
  const bgTiles = await adapter.loadImage(bgAsset).then(img => TileableBitmap.from(img.data, 32, 32, 6, 1));
  const houseTiles = await adapter.loadImage(houseAsset).then(img => TileableBitmap.from(img.data, 48, 32, 5, 1));

  const stageBgSprites = [] as TileableBitmap[][];
  const stageBgPalletes = [] as BitmapPallete[][];
  // const stageBgSpritesTurn = [] as TileableBitmap[][];
  // const stageBgPalletesTurn = [] as BitmapPallete[][];
  for (let i = 1; i <= stageConfigs.length; i++) {
    const { bgRows: curr, bgWidth: currlength } = stageConfigs[i - 1];
    const { bgRows: next, bgWidth: nextlength } = stageConfigs[i % stageConfigs.length];
    let rowIdx = curr.length;
    const currRows = Array.from<TileableBitmap>({ length: rowIdx });
    const turnRows = Array.from<TileableBitmap>({ length: rowIdx });
    const currColors = Array.from<BitmapPallete>({ length: rowIdx });
    const turnColors = Array.from<BitmapPallete>({ length: rowIdx });
    while(rowIdx--) {
      const { layout: currlayout, colors: currcolors } = curr[rowIdx];
      const { layout: nextlayout, colors: nextcolors } = next[rowIdx];
      currRows[rowIdx] = bgTiles.reorder(currlayout.concat(currlayout), currlength * 2, 1);
      turnRows[rowIdx] = bgTiles.reorder(currlayout.concat(nextlayout), currlength + nextlength, 1);
      currColors[rowIdx] = new BitmapPallete(currRows[rowIdx]);
      turnColors[rowIdx] = new BitmapPallete(turnRows[rowIdx]);
      currColors[rowIdx].pallete = currcolors;
      turnColors[rowIdx].pallete = nextcolors;
    }
    stageBgSprites.push(currRows, turnRows);
    stageBgPalletes.push(currColors, turnColors);
    //stageBgSpritesTurn.push(turnRows);
    //stageBgPalletesTurn.push(turnColors);
  }

  console.log(stageBgSprites);

  // HERE COMES COMPLETE MESS!
  // just to make all quick as I can
  // everything will be rewrited from scratch
  const totalRows = 6;
  const offset = [0.5, 0.0, 2.5, 3.0, 3.5, 4.0];
  const speed = [1.0, 2.0, 2.0, 3.0, 3.5, 4.0]
  const shifts = [0, 0, 0, 0, 0, 0]; // x offset for each row
  const sprites = [0, 0, 0, 0, 0, 0]; // rows can be from different levels
  const fill = 0; // bg fill from stage 0
  let transition = 0; // transition step
  let transition_target = 0; // transition target

  const colorsTransition = (rowIdx: number) => {
    if (transition <= 0) return;
    const curr = stageBgPalletes[sprites[rowIdx]][rowIdx];
    const prevPal = curr.pallete;
    const nextPal = stageBgPalletes[sprites[rowIdx]+1][rowIdx].pallete;
    const newPal = prevPal.map((p, i) => linear(p, nextPal[i], transition / 12));
    curr.pallete = newPal; 
    console.log("c transition", transition, rowIdx);
  };
  const layoutTransition = (rowIdx: number) => {
    if (transition <= 0) return;
    if (sprites[rowIdx] === transition_target) return;
    sprites[rowIdx]++;
    transition--;
    if (transition <= totalRows) transition_target++;
    console.log("l transition", transition, rowIdx);
  }

  const nextStage = () => {
    transition_target++;
    transition = totalRows * 2 - 1;
  }

  const linear = (lo: number, hi: number, step: number): number => lo + (hi - lo) * step;

  const renderStageBg = (dt: number) => {
    const bgfill = stageConfigs[fill].bgFill;
    viewport.fill(bgfill);
    for (let i = 0; i < totalRows; i++) {
      const sprite = stageBgSprites[sprites[i]][i];
      const distance = speed[i] * dt;
      shifts[i] -= distance;
      const outOfBounds = -320 > shifts[i];
      if (transition) colorsTransition(i);
      if (transition && outOfBounds) layoutTransition(i);
      if (outOfBounds) shifts[i] = 0;
      viewport.draw(sprite, Math.round(shifts[i]), offset[i] * 32);
    }
  };


  // --------------------------------------------------------------------------
  // 0 1 2 3 4
  // 0   1   2
  // 1 and 3 - transitions

  // @ts-ignore
  window.transition = () => {
    nextStage();
  };

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
    renderStageBg(dt);
    animate(dt);
    draw(dt);
    screenCtx.putImageData(screenImageData, 0, 0);
  };
  const update = (dt: number, time: number) => {
    move(dt);
    collideBounds(dt);
    control(dt);
  };
  // --------------------------------------------------------------------------
  const engine = new Engine(adapter, fps, update, render, 0.03);

  return { engine }
}

/*
QUICK NOTE:
to make switch - create a timer which will wake up every 2 seconds and check distance
*/
