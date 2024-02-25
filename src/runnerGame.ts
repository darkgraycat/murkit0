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
  const stageBgSpritesTurn = [] as TileableBitmap[][];
  const stageBgPalletesTurn = [] as BitmapPallete[][];
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
    stageBgSprites.push(currRows);
    stageBgPalletes.push(currColors);
    stageBgSpritesTurn.push(turnRows);
    stageBgPalletesTurn.push(currColors);
  }

  const stage = {
    currentIdx: 0,
    spritesIdx: 0,
    progress: 0,
    current: stageConfigs[0],
    sprites: stageBgSprites[0],
    shifts: [0, 0, 0, 0, 0, 0],
  }

  console.log(stage.current.name)

  const renderStageBg = (dt: number) => {
    const { bgRows, bgFill } = stage.current;
    viewport.fill(bgFill);
    for (let i = 0; i < stage.sprites.length; i++) {
      const rowSprite = stage.sprites[i];
      const { shifts } = stage;
      const { offset, speed } = bgRows[i];
      const distance = speed * dt;
      shifts[i] -= distance;
      if (-320 > shifts[i]) {
        shifts[i] = 0;
      }
      viewport.draw(rowSprite, Math.round(shifts[i]), offset * 32);
    }
  }

  // --------------------------------------------------------------------------
  // 0 1 2 3 4
  // 0   1   2
  // 1 and 3 - transitions

  // @ts-ignore
  window.transition = (n: number, mod = false) => {
    stage.currentIdx = n;
    stage.spritesIdx = n;
    stage.current = stageConfigs[n];
    if (mod) stage.sprites = stageBgSpritesTurn[n]
    else stage.sprites = stageBgSprites[n];
    console.log(stage.sprites);
  };

  // gameStage.bgRows[1].sprite = bgTiles.reorder([0,0,0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1,1,1], 20, 1);

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
