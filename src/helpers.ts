/* helpers to make code in main smaller */
import { EntityManager } from "./ecs/simple.ecs";
import { Bitmap, TileableBitmap } from "./bitmap";
import { Adapter } from "./adapter";

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

export const detectCollision = () => { };
