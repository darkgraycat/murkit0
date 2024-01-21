/* helpers to make code in main smaller */
import { EntityManager } from "./ecs/simple.ecs";
import { Bitmap, TileableBitmap } from "./bitmap";
import { Adapter } from "./adapter";

import { debug } from ".";

export type BulkTileableBitmapLoadingConfig = [
  path: string,
  w: number,
  h: number,
  cols: number,
  rows: number,
];
export const bulkTileableBitmapLoad = (
  adapter: Adapter,
  ...configs: BulkTileableBitmapLoadingConfig[]
): Promise<TileableBitmap[]> =>
  Promise.all(
    configs.map(([path, w, h, cols, rows]) =>
      adapter
        .loadImage(path)
        .then((img) => TileableBitmap.from(img.data, w, h, cols, rows))
        .catch((error) => {
          console.error("HELPERS: bulkTileableBitmapLoad", path, error);
          return TileableBitmap.from(new ArrayBuffer(w * h), w, h, cols, rows);
        }),
    ),
  );

export const createStaticDrawableEntity = (
  em: EntityManager<any>,
  sprites: Bitmap[],
  spriteIdx: number,
  x: number,
  y: number,
  w: number,
  h: number,
) =>
  em.add({
    cPosition: { x, y },
    cShape: { w, h },
    cSprite: { sprites, spriteIdx, flipped: false },
  });

export enum CollisionSide {
  None = "none",
  Left = "left",
  Right = "right",
  Top = "top",
  Bottom = "bottom",
}
export const detectCollision = (
  x0: number, y0: number,
  r0: number, b0: number,
  x1: number, y1: number,
  r1: number, b1: number,
): CollisionSide => {
  if (x0 >= r1 || x1 >= r0 || y0 >= b1 || y1 >= b0) return CollisionSide.None;
  const overlapX = Math.min(r0 - x1, r1 - x0);
  const overlapY = Math.min(b0 - y1, b1 - y0);

  if (overlapX > 0 && overlapX < overlapY) {
    return x0 > x1
      ? CollisionSide.Left
      : CollisionSide.Right;
  } else if (overlapY > 0) {
    return y0 > y1
      ? CollisionSide.Top
      : CollisionSide.Bottom;
  }

  return CollisionSide.None;
};

export const detectCollisionBounds = (
  x0: number, y0: number,
  r0: number, b0: number,
  x1: number, y1: number,
  r1: number, b1: number,
): CollisionSide => {
  if (x0 < x1) {
    return CollisionSide.Left;
  } else if (r0 > r1) {
    return CollisionSide.Right;
  }
  if (y0 < y1) {
    return CollisionSide.Top;
  } else if (b0 > b1) {
    return CollisionSide.Bottom;
  }
  return CollisionSide.None;
}

















