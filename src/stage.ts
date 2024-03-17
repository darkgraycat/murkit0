import { Bitmap, BitmapPallete , TileableBitmap} from "./bitmap";
import stageConfigs from "./data/runner_stages";
import { colorHelpers } from "./utils";
import { World } from "./world";

export type StageConfig = {
  name: string,
  length: number,
  bgrows: BgRow[],
  bgwidth: number,
  bgfill: number,
  fgfill: number,
};
type BgRow = {
  layout: number[],
  colors: number[]
  offset: number,
  speed: number,
};

type StageBgRow = {
  sprite: Bitmap,
  pallete: BitmapPallete,
  shift: number,
  offset: number,
  speed: number,
}
export type StageCallback = (self: Stage, next: Stage) => void;

export class Stage {
  private static current: Stage;
  private world: World;
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
  constructor(world: World, config: StageConfig, bgTiles: TileableBitmap, fgTiles: TileableBitmap) {
    const { bgfill, fgfill, bgwidth, bgrows, length } = config;
    this.world = world;
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
    const speedQuickFix = 0.5; // TODO: remove, handle properly, later ofc
    for (let i = 0; i < bgrows.length; i++) {
      const { layout, colors, offset, speed } = bgrows[i];
      const sprite = bgTiles.reorder(layout.concat(layout), bgwidth * 2, 1);
      const pallete = new BitmapPallete(sprite);
      pallete.colors = colors; 
      this.bgRows[i] = { sprite, pallete, speed: speed * speedQuickFix, shift: 0, offset: offset * sprite.theight };
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
    if (!this.next) return;
    const { bgrows: sbgrows, bgfill: sbgfill } = this.config;
    const { bgrows: dbgrows, bgfill: dbgfill } = this.next.config;
    this.bgFill = colorHelpers.interpolate(sbgfill, dbgfill, step);
    this.bgRows.forEach((row, i) => {
      const spal = sbgrows[i].colors;
      const dpal = dbgrows[i].colors;
      const colors = spal.map((_, j) => colorHelpers.interpolate(spal[j], dpal[j], step));
      row.pallete.colors = colors;
    });
  }
  setNext(stage: Stage) {
    this.next = stage;
    const [_, B, G, R] = colorHelpers.calccoefs(
      colorHelpers.hex2abgr(this.config.bgfill),
      colorHelpers.hex2abgr(stage.config.bgfill),
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

