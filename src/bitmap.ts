export class Bitmap {
  readonly width: number;
  readonly height: number;
  protected data: Uint32Array;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = new Uint32Array(width * height);
  }

  static from(buffer: ArrayBuffer, width: number, height: number): Bitmap {
    const bitmap = new Bitmap(width, height);
    bitmap.data = new Uint32Array(buffer);
    return bitmap;
  }

  draw(bitmap: Bitmap, x: number, y: number): this {
    const { data: dest, width, height } = this;
    const { data: src, width: offset } = bitmap;
    let i = src.length;
    // for each pixel from source bitmap
    while (i--) {
      const px = x + (i % offset);
      const py = y + (i / offset | 0);
      if (
        px < 0 || px >= width ||
        py < 0 || py >= height ||
        src[i] == 0 // skip transparent
      ) continue;
      // put in calculated position in current bitmap
      dest[px + py * width] = src[i];
    }
    return this
  }

  copy(x: number, y: number, width: number, height: number): Bitmap {
    const bitmap = new Bitmap(width, height);
    const { data: src, width: sw, height: sh } = this;
    const { data: dest } = bitmap;
    let i = dest.length;
    // for each pixel in new bitmap
    while (i--) {
      const px = x + (i % width);
      const py = y + (i / width | 0);
      if (
        px < 0 || px >= sw ||
        py < 0 || py >= sh
      ) continue;
      // put pixel from current bitmap
      dest[i] = src[px + py * sw];
    }
    return bitmap
  }

  clone(): Bitmap {
    const bitmap = new Bitmap(this.width, this.height);
    const { data: dest } = bitmap;
    const { data: src } = this;
    let i = dest.length;
    while (i--) dest[i] = src[i];
    return bitmap;
  }

  fill(color: number): this {
    this.data.fill(color);
    return this;
  }

  remap(mapping: Map<number, number>): this {
    const { data } = this;
    let i = data.length;
    while (i--) {
      const prev = data[i];
      if (!mapping.has(prev)) continue
      data[i] = mapping.get(prev)
    }
    return this;
  }

  flipV(): this {
    const { data, width } = this;
    let i = data.length;
    // for each pixel in current bitmap
    while (i--) {
      const px = width - (i % width) - 1;
      if (px >=  width / 2) continue // skip iterating right half
      const py = i / width | 0;
      const pi = px + py * width;
      // swap pixel horizontaly
      const temp = data[i];
      data[i] = data[pi];
      data[pi] = temp;
    }
    return this;
  }

  flipH(): this {
    const { data, width, height } = this;
    let i = data.length / 2; // skip iterating bottom half
    // for each pixel in the half of current bitmap
    while (i--) {
      const px = i % width;
      const py = height - (i / width | 0) - 1;
      const pi = px + py * width;
      // swap pixel verticaly
      const temp = data[i];
      data[i] = data[pi];
      data[pi] = temp;
    }
    return this;
  }
}

export class TileableBitmap extends Bitmap {
  readonly tileWidth: number;
  readonly tileHeight: number;
  readonly cols: number;
  readonly rows: number;

  constructor(tileWidth:number, tileHeight:number, cols:number, rows: number) {
    super(tileWidth * cols, tileHeight * rows);
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.cols = cols;
    this.rows = rows;
  }

  static from(
    buffer: ArrayBuffer,
    tileWidth: number,
    tileHeight: number,
    cols: number = 1,
    rows: number = 1,
  ): TileableBitmap {
    const tbitmap = new TileableBitmap(tileWidth, tileHeight, cols, rows);
    tbitmap.data = new Uint32Array(buffer);
    return tbitmap;
  }

  splitToBitmaps(): Bitmap[] {
    const bitmaps = [];
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const x = col * this.tileWidth;
        const y = row * this.tileHeight;
        bitmaps.push(this.copy(x, y, this.tileWidth, this.tileWidth));
      }
    }
    return bitmaps;
  }
}
