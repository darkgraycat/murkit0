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
export const collision = {
  sphere(
    x0: number, y0: number, d0: number,
    x1: number, y1: number, d1: number,
  ): boolean {
    const dist = Math.sqrt(
      (x1 - x0) ** 2 + 
      (y1 - y0) ** 2
    );
    return dist < (d0 + d1) / 2;
  },
  rectangle(
    x0: number, y0: number,
    r0: number, b0: number,
    x1: number, y1: number,
    r1: number, b1: number,
  ): CollisionSide {
    // if (x0 >= r1 || x1 >= r0 || y0 >= b1 || y1 >= b0) return CollisionSide.None;
    // below is very dirty hack:
    if (x0 >= r1 -1 || x1 >= r0 -1 || y0 >= b1 || y1 >= b0) return CollisionSide.None;
    const dx = Math.min(r0 - x1, r1 - x0);
    const dy = Math.min(b0 - y1, b1 - y0);
    return dx < dy
      ? x0 > x1 ? CollisionSide.Left : CollisionSide.Right
      : y0 > y1 ? CollisionSide.Top : CollisionSide.Bottom;
  },
  bounds(
    x0: number, y0: number,
    r0: number, b0: number,
    bl: number, bt: number,
    br: number, bb: number,
  ): CollisionSide {
    if (y0 < bt) return CollisionSide.Top;
    if (b0 > bb) return CollisionSide.Bottom;
    if (x0 < bl) return CollisionSide.Left;
    if (r0 > br) return CollisionSide.Right;
    return CollisionSide.None;
  }
};
