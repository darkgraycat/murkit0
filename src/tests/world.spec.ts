import { Level, LevelConfig } from "../world"

describe("World", () => {
  describe("Level", () => {
    const levelConfig: LevelConfig = {
      map: [
        [3, 0, 2, 3],
        [0, 1, 0, 0],
        [1, 2, 2, 1],
      ],
      mapping: {
        1: { sprite: "block", spriteIdx: 0, type: 0b0001 },
        2: { sprite: "block", spriteIdx: 1, type: 0b0011 },
        3: { sprite: "decor", spriteIdx: 4, type: 0b0110 },
      }
    };

    // it("should build new level", () => {
    //   const { map, mapping } = levelConfig;
    //   const level = new Level("testLevel", map, mapping);
    // })
    it("should parse new level and setup collision map", () => {
      const level = Level.from("testLevel", levelConfig);
      expect(level.name).toBe("testLevel");
      expect(level.width).toBe(4);
      expect(level.height).toBe(3);
      console.log(level.collisions);
      expect(level.collisions).toEqual([
        [false, false, true, false],
        [false, true, false, false],
        [true, true, true, true],
      ])
    })
  })
})
