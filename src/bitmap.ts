export class Bitmap {
  readonly width: number;
  readonly height: number;
  protected data: Uint32Array;

  /** Create Bitmap with empty pixels
  * @param width new Bitmap width
  * @param height new Bitmap height
  * */
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = new Uint32Array(width * height);
  }

  /** Create Bitmap from buffer
  * @param buffer buffer with color values
  * @param width new Bitmap width
  * @param height new Bitmap height
  * @returns new Bitmap
  * */
  public static from(buffer: ArrayBuffer, width: number, height: number): Bitmap {
    const bitmap = new Bitmap(width, height);
    bitmap.data = new Uint32Array(buffer);
    return bitmap;
  }

  /** Draw Bitmap on current one
  * @param bitmap source Bitmap to draw
  * @param x destination offset x
  * @param y destination offset y
  * @returns self
  * */
  public draw(bitmap: Bitmap, x: number, y: number): this {
    const { data: dest, width: dw, height: dh } = this;
    const { data: src,  width: sw } = bitmap;
    let i = src.length;
    while (i--) {
      const px = x + (i % sw);
      const py = y + (i / sw | 0);
      if (px < 0 || px >= dw || py < 0 || py >= dh) continue;
      if (src[i] === 0) continue;
      dest[px + py * dw] = src[i];
    }
    return this;
  }

  /** Copy Bitmap area to current one
  * @param bitmap source Bitmap to draw
  * @param x destination offset x
  * @param y destination offset y
  * @param sx source offset x
  * @param sy source offset y
  * @param width area width of source Bitmap
  * @param height area height of source Bitmap
  * @returns self
  * */
  public copy(bitmap: Bitmap, x: number, y: number, sx: number, sy: number, width: number, height: number): this {
    // TODO: define do we need to sx, sy?
    // as a help pls see old implementation
    const { data: dest, width: dw, height: dh } = this;
    const { data: src,  width: sw } = bitmap;
    let i = width * height;
    while (i--) {
      const px = x + (i % sw);
      const py = y + (i / sw | 0);
      if (px < 0 || px >= dw || py < 0 || py >= dh) continue;
      if (src[i] === 0) continue;
      dest[px + py * dw] = src[i];
    }
    return this;
  }

  /** Extract pixels to new Bitmap
  * @param x source offset x
  * @param y source offset y
  * @param width new Bitmap width
  * @param height new Bitam height
  * @returns new Bitmap
  * */
  public extract(x: number, y: number, width: number, height: number): Bitmap {
    const bitmap = new Bitmap(width, height);
    const { data: src,  width: sw, height: sh } = this;
    const { data: dest, width: dw } = bitmap;
    let i = dest.length;
    while (i--) {
      const px = x + (i % dw);
      const py = y + (i / dw | 0);
      if (px < 0 || px >= sw || py < 0 || py >= sh) continue;
      dest[i] = src[px + py * sw];
    }
    return bitmap;
  }

  /** Clone current Bitmap in new one
  * @returns new Bitmap
  * */
  public clone(): Bitmap {
    const bitmap = new Bitmap(this.width, this.height);
    const { data: dest } = bitmap;
    const { data: src } = this;
    let i = dest.length;
    while (i--) dest[i] = src[i];
    return bitmap;
  }

  /** Fill current Bitmap with color
  * @param color color to fill
  * @returns self
  * */
  public fill(color: number): this {
    this.data.fill(color);
    return this;
  }

  /** Remap Bitmap colors by new palette
  * @param mapping <prevColor, newColor>
  * @returns self
  * */
  public remap(mapping: Map<number, number>): this {
    const { data } = this;
    let i = data.length;
    while (i--) {
      const prev = data[i];
      if (!mapping.has(prev)) continue
      data[i] = mapping.get(prev)
    }
    return this;
  }

  /** Vertical flip
   * @returns self
  * */
  public flipV(): this {
    const { data, width } = this;
    let i = data.length;
    while (i--) {
      const px = width - (i % width) - 1;
      if (px >=  width / 2) continue;
      const py = i / width | 0;
      const pi = px + py * width;
      const temp = data[i];
      data[i] = data[pi];
      data[pi] = temp;
    }
    return this;
  }

  /** Horizontal flip
   * @returns self
  * */
  public flipH(): this {
    const { data, width, height } = this;
    let i = data.length / 2; // skip iterating bottom half
    while (i--) {
      const px = i % width;
      const py = height - (i / width | 0) - 1;
      const pi = px + py * width;
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

  public static from(
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

  public split(): Bitmap[] {
    const bitmaps = [];
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const x = col * this.tileWidth;
        const y = row * this.tileHeight;
        bitmaps.push(this.extract(x, y, this.tileWidth, this.tileWidth));
      }
    }
    return bitmaps;
  }
}
