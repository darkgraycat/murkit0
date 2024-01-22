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
  sprite: string;
  spriteIdx: number;
  type: number;
};

export type LevelConfig = {
  map: number[][];
  mapping: { [key: number]: LevelCell };
};

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
