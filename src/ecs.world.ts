export class World {
  readonly width: number;
  readonly height: number;
  public gravity: number;
  public friction: number;
  public skyColor: number;
  private currentLevel: string;
  private levelList: Map<string, Level>;

  constructor({ width, height, gravity, friction, skyColor }) {
    this.width = width;
    this.height = height;
    this.gravity = gravity;
    this.friction = friction;
    this.skyColor = skyColor;

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
  sprite: string,
  spriteIdx: number,
  type: LevelCellType,
} 

export type LevelConfig = {
  map: number[][];
  mapping: { [key: string]: Object };
};

export class Level {
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

  private fillterMap(type: LevelCellType): boolean[][] {
    // TODO: use this to generate collisions
    return [[false]];
  }

  private refreshCollistions(): void {
    const tst = Array(this.height).fill(Array(this.width).fill(false));
    const { collisions, map, mapping } = this;
    let length = this.width * this.height;
    while(length--) {
      const col = (length % this.width);
      const row = (length / this.width | 0);
      const cell = map[row][col];
      // const { type } = mapping.get(cell);
      console.log(cell, cell & LevelCellType.Block);
      tst[row][col] = cell;
    }
    console.log("TST", tst)
  }
}
