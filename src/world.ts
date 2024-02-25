import { Bitmap, BitmapPallete, TileableBitmap } from "./bitmap";

export class World {
  readonly width: number;
  readonly height: number;
  public gravity: number;
  public friction: number;
  public skyColor: number;
  public time: number;
  private currentLevel: string;
  private levelList: Map<string, Level>;

  constructor({ width, height, gravity, friction, skyColor }) {
    this.width = width;
    this.height = height;
    this.gravity = gravity;
    this.friction = friction;
    this.skyColor = skyColor;
    this.time = 0;
    this.currentLevel = "start";
    this.levelList = new Map();
  }

  addLevel(level: Level): void {
    this.levelList.set(level.name, level);
  }

  getCurrentLevel(): Level {
    return this.levelList.get(this.currentLevel);
  }
}

/*
IDEA: to define cell type I can use bits.
for example first bit is block/notblock
*/
export enum LevelCellType {
  Block = 0b0001,
}

export type LevelCell = {
  sprite: string;
  spriteIdx: number;
  type: number;
};

export type LevelConfig = {
  map: number[][];
  mapping: { [key: number]: LevelCell };
};

// TODO: rewrite implementation and data structure
export class Level {
  // TODO: use LevelCell type for map property
  public collisions: boolean[][];
  readonly width: number;
  readonly height: number;
  constructor(
    readonly name: string,
    private map: number[][],
    private mapping: Map<number, LevelCell>,
  ) {
    this.width = map[0].length;
    this.height = map.length;
    this.collisions = Array(this.height).fill(Array(this.width).fill(false));
    this.refreshCollistions();
  }

  static from(name: string, config: LevelConfig): Level {
    // TODO: make normal level parser
    const { map, mapping } = config;
    const parsedMapping = new Map<number, LevelCell>();
    Object.entries(mapping).forEach(([key, value]) =>
      parsedMapping.set(+key, value as LevelCell),
    );
    Object.entries(mapping).forEach(([key, value]) => {
      // const cell: LevelCell = {}
    });
    return new Level(name, map, parsedMapping);
  }

  private filterMap(type: LevelCellType): boolean[][] {
    const filtered = this.map.map((row) => row.map((col) => !!(col & type)));
    return filtered;
  }

  private refreshCollistions(): void {
    this.collisions = this.filterMap(LevelCellType.Block);
  }
}

// TODO: I should treat World,Stage,Level as a part of ECS
// because I need to init Stage entities and etc. Lot of dependencies
// I will think about it later, during refactor
// Maybe it makes sense to refactor ECS to support archetypes
export type StageConfig = {
  name: string,
  bgLayout: number[][],
  bgColors: number[][],
  bgOffset: number[],
  bgSpeed: number[],
  bgFill: number,
  fgFill: number,
};
// export class Stage {
//   constructor(
//     readonly name: string,
//     public bgLayout: TileableBitmap[],
//     public bgColors: BitmapPallete[],
//     public bgOffset: number[],
//     public bgSpeed: number[],
//     public bgFill: number,
//     public fgFill: number,
//   ) {}
// 
//   static from(config: StageConfig, tiles: TileableBitmap): Stage {
//     const { name, bgOffset, bgSpeed, bgLayout, bgColors, bgFill, fgFill } = config;
//     const lengths = [bgOffset.length, bgSpeed.length, bgLayout.length, bgColors.length];
//     if (lengths.some(l => l !== lengths[0])) throw new Error(`Error during Stage parsing: ${lengths}`);
// 
//     const parsedBgLayout = bgLayout.map(row => tiles.reorder(row.concat(row), row.length * 2, 1));
//     const parsedBgColors = parsedBgLayout.map((tbitmap) => new BitmapPallete(tbitmap));
//     bgColors.forEach((color, i) => parsedBgColors[i].pallete = color);
// 
//     return new Stage(name, parsedBgLayout, parsedBgColors, bgOffset, bgSpeed, bgFill, fgFill);
//   }
// }
// export class Stage {
//   public progress = 0.0;
//   private next: Stage;
//   constructor(
//     readonly name: string,
//     readonly bg: StageBg,
//   ) {}
//   static from(config: StageConfig, tiles: TileableBitmap): Stage {
//     const { name, bgLayout, bgOffset, bgColors, bgSpeed, bgFill } = config;
//     const rows = [];
//     for (let r = 0; r < bgLayout.length; r++) {
//       new StageBgRow()
//     }
//   }
// }
// 
// export class StageBg {
//   public colors: TileableBitmap[];
//   constructor(
//     public fill: number,
//     public rows: StageBgRow[],
//   ) {}
//   update(dt: number) {
//     for (const row of this.rows) row.update(dt);
//   }
//   transition(step: number) {
// 
//   }
// }
// 
// export class StageBgRow {
//   private shift: number;
//   private width: number;
//   constructor (
//     public layout: TileableBitmap,
//     public colors: number[],
//     private offset: number,
//     private speed: number,
//   ) { this.shift = 0; this.width = layout.width / 2 }
// 
//   update(dt: number) {
//     this.shift = Math.round(this.shift - this.speed * dt) % this.width;
//   }
//   append(row: StageBgRow) {
//     row.shift = this.shift + this.layout.width;
//   }
//   render(viewport: Bitmap) {
//     viewport.draw(this.layout, this.shift, this.offset);
//   }
// }

/*
TODO: cleanup
Fast notes:
layout transition - input 2 layouts and just reorder again

W: 320
WW: 640;
[][]
*/

export class StageBg {
  private fill: number;
  private rows: StageBgRow[];
  constructor(
    tiles: TileableBitmap,
    fill: number,
    layout: number[][],
    colors: number[][],
    offset: number[],
    speed: number[],
  ) {
    this.fill = fill;
    this.rows = [];
    for (let i = 0; i < layout.length; i++) {
      const rowLayout = layout[i];
      const rowSpeed = speed[i];
      const rowOffset = offset[i];
      const rowSprite = tiles.reorder(rowLayout, rowLayout.length, 1);
      const rowColor = new BitmapPallete(rowSprite);
      rowColor.pallete = colors[i];
      this.rows.push(new StageBgRow(rowSprite, rowSpeed, rowOffset));
    }
  }
  static from(config: StageConfig, tiles: TileableBitmap): StageBg {
     const { bgOffset, bgSpeed, bgLayout, bgColors, bgFill } = config;
     const lengths = [bgOffset.length, bgSpeed.length, bgLayout.length, bgColors.length];
     if (lengths.some(l => l !== lengths[0])) throw new Error(`Error during Stage parsing: ${lengths}`);
     return new StageBg(
       tiles,
       bgFill,
       bgLayout,
       bgColors,
       bgOffset,
       bgSpeed,
     );
  }
  render(dt: number, viewport: Bitmap) {
    viewport.fill(this.fill);
    for (const row of this.rows) row.render(dt, viewport);
  }
  transition(layout: number[][], colors: number[][], bgFill: number, fgFill: number, tiles: TileableBitmap) {
    for (let i = 0; i < layout.length; i++) {
      const row = tiles.reorder(layout[i], layout[i].length, 1);
      new BitmapPallete(row).pallete = colors[i];
      this.rows[i].transition(row);
    }
  }
}

export class StageBgRow {
  private spriteA: Bitmap;
  private spriteB: Bitmap;
  private target: Bitmap;
  private shiftA: number;
  private shiftB: number;
  private offset: number;
  private width: number;
  private speed: number;
  constructor(sprite: TileableBitmap, speed: number, offset: number) {
    this.spriteA = sprite;
    this.spriteB = sprite;
    this.target = sprite;
    this.shiftA = 0;
    this.shiftB = sprite.width;
    this.offset = offset * sprite.theight;
    this.width = sprite.width;
    this.speed = speed;
  }
  render(dt: number, viewport: Bitmap) {
    const { width, speed, offset } = this;
    const distance = speed * dt;
    this.shiftA -= distance;
    this.shiftB -= distance;
    if (-width > this.shiftA) {
      this.spriteA = this.target; 
      this.shiftA = this.shiftB + width;
    } else if (-width > this.shiftB) {
      this.spriteB = this.target; 
      this.shiftB = this.shiftA + width;
    }
    viewport.draw(this.spriteA, Math.round(this.shiftA), offset);
    viewport.draw(this.spriteB, Math.round(this.shiftB), offset);
  }
  transition(target: Bitmap) {
    this.target = target;
  }
}
