import { Adapter } from "./adapter";
import { Engine, TimeoutEngine } from "./engine";
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
  actions: Set<string>;
  screen: HTMLCanvasElement;
  overlay: HTMLDivElement;
  fps: number;
};

export default async (config: GameConfig) => {
  const { width, height, actions, screen, fps } = config;
  // --------------------------------------------------------------------------
  const adapter = new Adapter();
  const screenCtx = screen.getContext("2d") as CanvasRenderingContext2D;
  const screenImageData = screenCtx.getImageData(0, 0, width, height) as ImageData;
  const viewport = Bitmap.from(screenImageData.data.buffer, width, height);
  // --------------------------------------------------------------------------
  // TODO: add collectables
  const playerTiles = await adapter.loadImage(playerAsset).then(img => TileableBitmap.from(img.data, 16, 16, 4, 1));
  const bgTiles = await adapter.loadImage(bgAsset).then(img => TileableBitmap.from(img.data, 32, 32, 6, 1));
  const houseTiles = await adapter.loadImage(houseAsset).then(img => TileableBitmap.from(img.data, 48, 32, 5, 1));

  const playerSprites = playerTiles.split().concat(playerTiles.flipV().split());
  const houseSprites = [ // TODO: move to data, later ofc
    houseTiles.reorder([1,0, 2,2, 0,1], 2, 3),
    houseTiles.reorder([2,2, 1,1, 1,1], 2, 3),
    houseTiles.reorder([3,4, 3,1, 2,2], 2, 3),
    houseTiles.reorder([2,2,2,2, 0,0,0,0], 4, 2),
    houseTiles.reorder([1,2,3,1, 0,2,2,0], 4, 2),
    houseTiles.reorder([3,4,1,4, 1,3,2,4], 4, 2),
    houseTiles.reorder([1,1, 1,1], 2, 2),
    houseTiles.reorder([3,2, 1,1], 2, 2),
    houseTiles.reorder([1,2,2,1, 1,2,2,1, 0,2,2,0], 4, 3),
    houseTiles.reorder([2,0,1,4, 2,0,1,1, 0,0,0,0], 4, 3),
    houseTiles.reorder([1,1, 1,1, 2,2, 3,3], 2, 4),
    houseTiles.reorder([2,4,3,1,2, 2,1,3,0,2, 0,0,3,0,0], 5, 3),
  ];

  // TODO: the current pallete depends on progress
  // i suggest to have some adjuster (1.2, 0.9. 0.8) for ex and apply it every N
  let currentStage: Stage;
  const stages = stageConfigs.map(config => new Stage(config, bgTiles, houseTiles));

  stages.forEach((stage, i) => i > 0 && stages[i - 1].setNext(stage));
  stages.forEach((stage, i) => stage.onfinish((curr, next) => {
    currentStage = next;
    console.debug(`Switching ${i}`);
  }));
  currentStage = stages[1];
  stages[stages.length - 1].onfinish(() => {
    // window.alert("You win!");
    console.log("You win!");

  });
  // TODO: make 0 - entry, 3 - morning, 4 - ending
  //

  // --------------------------------------------------------------------------
  const world = new World({ width, height, gravity: 0.7, friction: 0.95, skyColor: 0xffa09080 });
  const {
    sMovement, sAnimation, sCollideBounds, sCollideShapes,
    sDrawing, sControllerRunner, sBuildingsRunner,
  } = Systems(world, viewport);

  const eManager = new EntityManager(components);
  const ePlayer = eManager.add({
    cPosition: { x: 32, y: 128 },
    cVelocity: { vx: 0, vy: 0 },
    cShape: { w: 10, h: 14 },
    cMeta: { air: true, speed: 0.4 },
    cInputRunner: { actions, jumping: false, acceleration: 0 },
    cSprite: { spriteIdx: 0, sprites: playerSprites, offsetX: -3, offsetY: -2 },
    cAnimation: { animations: [ [0, 0, 3, 3], [1, 2, 3, 0], [1, 1, 2, 2] ], current: 0, length: 4, time: 0, coef: 0.4 },
  });
  const createBuilding = (spriteIdx: number, col: number, row: number) => eManager.add({
    cPosition: { x: col * 16, y: row * 20, },
    cSprite: { spriteIdx, sprites: houseSprites },
    cShape: { w: houseSprites[spriteIdx].width, h: houseSprites[spriteIdx].height },
  });
  const eBuildings = [
    // createBuilding(11, 0, 4),
    createBuilding(0,  0, 4),
    createBuilding(1,  20, 4),
    // createBuilding(2,  0, 4),
    // createBuilding(3,  0, 4),
  ];



  // --------------------------------------------------------------------------
  const collideBounds = sCollideBounds.setup([ePlayer]);
  const collideShapes = sCollideShapes.setup([ePlayer], eBuildings);
  const platforms = sBuildingsRunner.setup(eBuildings);
  const move = sMovement.setup([ePlayer]);
  const draw = sDrawing.setup([ePlayer, ...eBuildings]);
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
    currentStage.update(dt);
    platforms(dt),
    move(dt);
    collideBounds(dt);
    collideShapes(dt);
    control(dt);
  };
  // --------------------------------------------------------------------------
  // const engine = new Engine(adapter, fps, update, render, 0.03);
  const engine = new TimeoutEngine(adapter, fps, update, render, 0.03);

  return { engine }
}

// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------

type StageBgRow = {
  sprite: Bitmap,
  pallete: BitmapPallete,
  shift: number,
  offset: number,
  speed: number,
}
type StageCallback = (self: Stage, next: Stage) => void;
class Stage {
  private static current: Stage;
  private next: Stage;
  private config: StageConfig;
  private bgRows: StageBgRow[];
  private bgFadeoutCoefs: [number, number, number];
  private bgFadeoutTimer: NodeJS.Timeout;
  private bgFill: number;
  private fgFill: number;
  private width: number;
  private progress: number;
  private handlers: {
    onstart: StageCallback;
    onfinish: StageCallback;
  }
  constructor(config: StageConfig, bgTiles: TileableBitmap, fgTiles: TileableBitmap) {
    const { bgfill, fgfill, bgwidth, bgrows, length } = config;
    this.config = config;
    this.bgFill = bgfill;
    this.fgFill = fgfill;
    this.width = bgwidth * bgTiles.twidth;
    this.progress = length;
    this.handlers = {
      onstart: () => {},
      onfinish: () => {},
    };
    this.bgRows = [] as StageBgRow[];
    for (let i = 0; i < bgrows.length; i++) {
      const { layout, colors, offset, speed } = bgrows[i];
      const sprite = bgTiles.reorder(layout.concat(layout), bgwidth * 2, 1);
      const pallete = new BitmapPallete(sprite);
      pallete.pallete = colors; 
      this.bgRows[i] = { sprite, pallete, speed, shift: 0, offset: offset * sprite.theight };
    }
  }
  update(dt: number) {
    this.progress -= dt; 
    if (this.progress <= 100 && !this.bgFadeoutTimer) {
      this.bgFadeoutTimer = setInterval(() => this.interpolateBgPallete((100 - this.progress) / 100), 100);
    }
    if (this.progress <= 0) {
      this.finish();
      this.next.start();
      return;
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
  renderFg(dt: number, viewport: Bitmap) {

  }
  interpolateBgPallete(step: number) {
    const { bgrows: sbgrows, bgfill: sbgfill } = this.config;
    const { bgrows: dbgrows, bgfill: dbgfill } = this.next.config;
    this.bgFill = helpers.interpolate(sbgfill, dbgfill, step);
    this.bgRows.forEach((row, i) => {
      const spal = sbgrows[i].colors;
      const dpal = dbgrows[i].colors;
      const colors = spal.map((_, j) => helpers.interpolate(spal[j], dpal[j], step));
      row.pallete.pallete = colors;
    });
  }
  setNext(stage: Stage) {
    this.next = stage;
    const [_, B, G, R] = helpers.calccoefs(
      helpers.hex2abgr(this.config.bgfill),
      helpers.hex2abgr(stage.config.bgfill),
    );
    // TODO: no need for now. interpolation is used for all rows
    this.bgFadeoutCoefs = [B, G, R];
  }
  start() {
    this.handlers.onstart(this, this.next);
    clearInterval(this.bgFadeoutTimer);
    console.debug(`Start: ${this.config.name}`)
  }
  finish() {
    this.handlers.onfinish(this, this.next);
    clearInterval(this.bgFadeoutTimer);
    console.debug(`Finish: ${this.config.name}`)
  }
  onstart(cb: StageCallback) { this.handlers.onstart = cb; }
  onfinish(cb: StageCallback) { this.handlers.onfinish = cb; }
}

// --------------------------------------------------------------------------

type hex = number;
type abgr = [number, number, number, number];
const helpers = {
  hex2abgr: (hex: hex): abgr => ([hex >>> 24 & 0xff, hex >>> 16 & 0xff, hex >>> 8 & 0xff, hex & 0xff]),
  abgr2hex: ([a, b, g, r]: abgr) => ((a << 24) | (b << 16) | (g << 8) | r) >>> 0,
  hexadjust: (hex: hex, [A, B, G, R]: abgr) => {
    const [a, b, g, r] = helpers.hex2abgr(hex);
    return helpers.abgr2hex([Math.min(a * A, 255), Math.min(b * B, 255), Math.min(g * G, 255), Math.min(r * R, 255)]);
  },
  calccoefs: (colora: abgr, colorb: abgr, K = 1) => {
    const A = colora[0] == 0 ? 255 : colorb[0] / colora[0] * K;
    const B = colora[1] == 0 ? 255 : colorb[1] / colora[1] * K;
    const G = colora[2] == 0 ? 255 : colorb[2] / colora[2] * K;
    const R = colora[3] == 0 ? 255 : colorb[3] / colora[3] * K;
    return [A, B, G, R];
  },
  interpolate: (hexa: hex, hexb: hex, step: number) => {
    const colora = helpers.hex2abgr(hexa);
    const colorb = helpers.hex2abgr(hexb);
    const a = colora[0] + (colorb[0] - colora[0]) * step | 0;
    const b = colora[1] + (colorb[1] - colora[1]) * step | 0;
    const g = colora[2] + (colorb[2] - colora[2]) * step | 0;
    const r = colora[3] + (colorb[3] - colora[3]) * step | 0;
    // TODO: Point to improve: by avoiding conversion;
    return helpers.abgr2hex([a, b, g, r]);
  }
};
