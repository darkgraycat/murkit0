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
import stageConfigs, { StageConfig } from "./data/runner_stages";

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

  const stages = stageConfigs.map(config => new Stage(config, bgTiles, houseTiles));
  let stageIndex = 1;
  let currentStage = stages[stageIndex];

  // @ts-ignore
  window.applyPal = (r: number, b: number, g: number) => {
    currentStage.adjustPallete(r, b, g);
  }
  // TODO: make 0 - entry, 3 - morning, 4 - ending

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
    currentStage.renderBg(dt, viewport);
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

type StageBgRow = {
  sprite: Bitmap,
  pallete: BitmapPallete,
  shift: number,
  offset: number,
  speed: number,
}
class Stage {
  config: StageConfig;
  bgRows: StageBgRow[];
  bgFill: number;
  fgFill: number;
  width: number;
  constructor(config: StageConfig, bgTiles: TileableBitmap, fgTiles: TileableBitmap) {
    const { bgfill, fgfill, bgwidth, bgrows } = config;
    this.config = config;
    this.bgFill = bgfill;
    this.fgFill = fgfill;
    this.width = bgwidth * bgTiles.twidth;
    this.bgRows = [] as StageBgRow[];
    for (let i = 0; i < bgrows.length; i++) {
      const { layout, colors, offset, speed } = bgrows[i];
      const sprite = bgTiles.reorder(layout.concat(layout), bgwidth * 2, 1);
      const pallete = new BitmapPallete(sprite);
      pallete.pallete = colors; 
      this.bgRows[i] = { sprite, pallete, speed, shift: 0, offset: offset * sprite.theight };
    }
  }
  renderBg(dt: number, viewport: Bitmap) {
    const { width, bgRows, bgFill } = this;
    viewport.fill(bgFill);
    for (const row of bgRows) {
      row.shift -= row.speed * dt;
      if (-width >= row.shift) row.shift = 0;
      viewport.draw(row.sprite, Math.round(row.shift), row.offset);
    }
  }
  adjustPallete(redCoef: number, greenCoef: number, blueCoef: number) {
    this.bgFill = helpers.hexadjust(this.bgFill, 1, blueCoef, greenCoef, redCoef);
    for (const row of this.bgRows) {
      row.pallete.pallete = row.pallete.pallete.map(color => helpers.hexadjust(color, 1, blueCoef, greenCoef, redCoef));
    }
  }

}

const helpers = {
  hex2abgr: (hex: number) => ([hex >>> 24 & 0xff, hex >>> 16 & 0xff, hex >>> 8 & 0xff, hex & 0xff]),
  abgr2hex: (a: number, b: number, g: number, r: number) => ((a << 24) | (b << 16) | (g << 8) | r) >>> 0,
  hexadjust: (hex: number, A: number, B: number, G: number, R: number) => {
    const [a, b, g, r] = helpers.hex2abgr(hex);
    return helpers.abgr2hex(Math.min(a * A, 0xff), Math.min(b * B, 0xff), Math.min(g * G, 0xff), Math.min(r * R, 0xff));
  }
};

// @ts-ignore
window.h = helpers;

/*
QUICK NOTE:
to make switch - create a timer which will wake up every 2 seconds and check distance
*/
