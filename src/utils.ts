import { Bitmap, TileableBitmap } from "./bitmap";

// file loading helpers
export interface Image {
  width: number;
  height: number;
  data: ArrayBuffer;
}
export const fileHelpers = {
  loadImage(src: string): Promise<Image> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d") as CanvasRenderingContext2D;
        const { width, height } = image;
        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0);
        const imageData = context.getImageData(0, 0, width, height);
        return resolve({ width, height, data: imageData.data.buffer });
      };
      image.onerror = (err) => {
        console.error("Error loading image:", err);
        reject(err);
      };
      image.src = src;
    });
  },
  loadImageAsBitmap(src: string): Promise<Bitmap> {
    return fileHelpers
      .loadImage(src)
      .then(img => Bitmap.from(img.data, img.width, img.height))
      .catch(err => {
        console.error("Error loading bitmap:", src);
        throw err;
      });
  },
  loadImagesAsTileableBitmaps(...configs: Array<[
    src: string,
    width: number,
    height: number,
    cols: number,
    rows: number,
  ]>): Promise<TileableBitmap[]> {
    return Promise.all(configs.map(([src, w, h, c, r]) => fileHelpers
      .loadImage(src)
      .then(img => TileableBitmap.from(img.data, w, h, c, r))
      .catch(err => {
        console.error("Error loading tileable bitmap:", src, err);
        return TileableBitmap.from(new ArrayBuffer(w * h), w, h, c, r);
      }),
    ));
  },
  bitmapToJSON(bitmap: Bitmap): string {
    return JSON.stringify({
      width: bitmap.width,
      height: bitmap.height,
      cols: 1,
      rows: 1,
      pixels: bitmap.pixels.toString(),
    });
  },
  jsonToBitmap(json: string): Bitmap {
    const { width, height, pixels } = JSON.parse(json);
    return Bitmap.from(
      pixels.split(",").map(Number),
      width,
      height,
    );
  },
  tileableBitmapToJSON(tbitmap: TileableBitmap): string {
    return JSON.stringify({
      width: tbitmap.twidth,
      height: tbitmap.theight,
      cols: tbitmap.cols,
      rows: tbitmap.rows,
      pixels: tbitmap.pixels.toString(),
    });
  },
  jsonToTileableBitmap(json: string): TileableBitmap {
    const { width, height, cols, rows, pixels } = JSON.parse(json);
    return TileableBitmap.from(
      pixels.split(",").map(Number),
      width,
      height,
      cols,
      rows,
    );
  }
};

// color helpers
export type hex = number;
export type abgr = [number, number, number, number];
export const colorHelpers = {
  hex2abgr: (hex: hex): abgr => ([hex >>> 24 & 0xff, hex >>> 16 & 0xff, hex >>> 8 & 0xff, hex & 0xff]),
  abgr2hex: ([a, b, g, r]: abgr) => ((a << 24) | (b << 16) | (g << 8) | r) >>> 0,
  hexadjust: (hex: hex, [A, B, G, R]: abgr) => {
    const [a, b, g, r] = colorHelpers.hex2abgr(hex);
    return colorHelpers.abgr2hex([Math.min(a * A, 255), Math.min(b * B, 255), Math.min(g * G, 255), Math.min(r * R, 255)]);
  },
  calccoefs: (colora: abgr, colorb: abgr, K = 1) => {
    const A = colora[0] == 0 ? 255 : colorb[0] / colora[0] * K;
    const B = colora[1] == 0 ? 255 : colorb[1] / colora[1] * K;
    const G = colora[2] == 0 ? 255 : colorb[2] / colora[2] * K;
    const R = colora[3] == 0 ? 255 : colorb[3] / colora[3] * K;
    return [A, B, G, R];
  },
  interpolate: (hexa: hex, hexb: hex, step: number) => {
    const colora = colorHelpers.hex2abgr(hexa);
    const colorb = colorHelpers.hex2abgr(hexb);
    const a = colora[0] + (colorb[0] - colora[0]) * step | 0;
    const b = colora[1] + (colorb[1] - colora[1]) * step | 0;
    const g = colora[2] + (colorb[2] - colora[2]) * step | 0;
    const r = colora[3] + (colorb[3] - colora[3]) * step | 0;
    return colorHelpers.abgr2hex([a, b, g, r]);
  }
};

// timeHelpers
export const timeHelpers = {
  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
  now(): number {
    return performance.now();
  }
};

// colision helpers
export enum CollisionSide {
  None = "none",
  Left = "left",
  Right = "right",
  Top = "top",
  Bottom = "bottom",
}
export const collisionHelpers = {
  circle(
    x0: number, y0: number, d0: number,
    x1: number, y1: number, d1: number,
  ): boolean {
    const dist = Math.sqrt(
      (x1 - x0) ** 2 + 
      (y1 - y0) ** 2
    );
    return dist <= (d0 + d1);
  },
  rectangle(
    x0: number, y0: number,
    r0: number, b0: number,
    x1: number, y1: number,
    r1: number, b1: number,
  ): CollisionSide {
    if (x0 > r1 || x1 > r0 || y0 > b1 || y1 > b0) return CollisionSide.None;
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
  },
};

// benchmark tools
export const benchmark = (name = "default", calcMiddleRate = 10, fixedDigit = 4) => {
  let minimumtime = Infinity;
  let maximumtime = 0;
  let lasttime = 0;
  let calcMiddleIter = calcMiddleRate;

  const history = [];
  const middles = [];

  const A = () => lasttime = performance.now();

  const B = () => {
    const dt = performance.now() - lasttime;
    if (dt <= 0 && dt >= Infinity) {
      console.log("lol", dt);
      return;
    }
    calcMiddleIter--;
    history.push(dt);
    if (minimumtime > dt) minimumtime = dt;
    if (maximumtime < dt) maximumtime = dt;
    if (calcMiddleIter > 0) return;
    calcMiddleIter = calcMiddleRate;
    middles.push(middle(history));
    clear();
  }
  const fps = (time: number) => 1 / (time * 0.001);
  const clear = () => history.length = 0;
  const middle = (arr: number[]) => arr.reduce((acc, v) => acc += v, 0) / arr.length;
  const fixed = (num: number) => +num.toFixed(fixedDigit);
  const filter = (num: number) => num > 0 && num < Infinity;

  const resultsTime = () => ({
    name,
    min: fixed(minimumtime),
    max: fixed(maximumtime),
    middles: middles.filter(filter).map(fixed),
  });

  const resultsFps = () => ({
    name,
    maxFps: fixed(fps(minimumtime)),
    minFps: fixed(fps(maximumtime)),
    fps: fixed(fps(middle(middles))),
    middlesFps: middles.filter(filter).map(fps).map(fixed),
  })

  return { A, B, resultsTime, resultsFps };
};

