import { collision, CollisionSide } from "../helpers";

describe("helpers/collision", () => {
  describe("rectangle", () => {
    type Bounds = [ x: number, y: number, w: number, h: number ];
    it.each([
      // [ [20, 20, 10, 10], [30, 20, 20, 20], CollisionSide.None ],
      [ [50, 20, 10, 10], [30, 20, 20, 20], CollisionSide.Left ],
      [ [20, 20, 10, 10], [30, 20, 20, 20], CollisionSide.Right ],
      [ [30, 40, 10, 10], [30, 20, 20, 20], CollisionSide.Top ],
      [ [30, 10, 10, 10], [30, 20, 20, 20], CollisionSide.Bottom ],
    ] as [Bounds, Bounds, CollisionSide][])
    ("test rectangle", ([x, y, w, h], [bx, by, bw, bh], expectation) => expect(collision.rectangle(
      x, y, x + w, y + h,
      bx, by, bx + bw, by + bh,
    )).toBe(expectation))
  });
  describe("sphere", () => {
    type Circle = [ x: number, y: number, d: number ];
    it.each([
      [ [20, 20, 10], [50, 20, 20], true ],
      [ [20, 20, 15], [40, 25, 15], true ],
      [ [20, 20, 10], [50, 22, 20], false ],
      // [ [20, 20, 10], [50, 20, 20], true ],
    ] as [Circle, Circle, boolean][])
    ("test circle", ([x, y, d], [bx, by, bd], expectation) => expect(collision.circle(
      x, y, d,
      bx, by, bd,
    )).toBe(expectation))
  });
});
