/* Bitmap */
export class Bitmap {
  readonly width: number;
  readonly height: number;
  protected data: Uint32Array;

  /** Create new Bitmap with empty pixels
  * @param width new Bitmap width
  * @param height new Bitmap height */
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = new Uint32Array(width * height);
  }

  /** Create Bitmap from buffer
  * @param buffer buffer with color values
  * @param width new Bitmap width
  * @param height new Bitmap height
  * @returns new Bitmap */
  public static from(buffer: ArrayBuffer, width: number, height: number): Bitmap {
    const bitmap = new Bitmap(width, height);
    bitmap.data = new Uint32Array(buffer);
    return bitmap;
  }

  /** Get pixels array
  * @returns Uint32Array which represents pixels */
  public get pixels(): Uint32Array {
    return this.data;
  }

  /** Draw Bitmap on self
  * @param bitmap source Bitmap to draw
  * @param x destination offset x
  * @param y destination offset y
  * @returns self */
  public draw(bitmap: Bitmap, x: number, y: number): this {
    const { data: dest, width: dw, height: dh } = this;
    const { data: src,  width: sw } = bitmap;
    let i = src.length;
    while (i--) {
      if (src[i] === 0) continue;
      const px = x + (i % sw);
      const py = y + (i / sw | 0);
      if (px < 0 || px >= dw || py < 0 || py >= dh) continue;
      dest[px + py * dw] = src[i];
    }
    return this;
  }

  /** Copy to Bitmap area of self
  * @param bitmap destination Bitmap
  * @param x destination offset x
  * @param y destination offset y
  * @param sx source offset x
  * @param sy source offset y
  * @param width area width to copy
  * @param height area height to copy
  * @returns self */
  public copy(bitmap: Bitmap, x: number, y: number, sx: number, sy: number, width: number, height: number): this {
    const { data: dest, width: dw, height: dh } = bitmap;
    const { data: src,  width: sw } = this;
    let i = width * height;
    while (i--) {
      const j = (sx + i % width) + (sy + (i / width | 0)) * sw;
      if (src[j] == 0) continue;
      const px = x + (i % width);
      const py = y + (i / width | 0);
      if (px < 0 || px >= dw || py < 0 || py >= dh) continue;
      dest[px + py * dw] = src[j];
    }
    return this;
  }

  /** Extract pixels to new Bitmap
  * @param x source offset x
  * @param y source offset y
  * @param width new Bitmap width
  * @param height new Bitam height
  * @returns new Bitmap */
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

  /** Clone self to new Bitmap
  * @returns new Bitmap */
  public clone(): Bitmap {
    const bitmap = new Bitmap(this.width, this.height);
    const { data: dest } = bitmap;
    const { data: src } = this;
    let i = dest.length;
    while (i--) dest[i] = src[i];
    return bitmap;
  }

  /** Fill self with color
  * @param color color to fill
  * @returns self */
  public fill(color: number): this {
    this.data.fill(color);
    return this;
  }

  /** Vertical flip
  * @returns self */
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
  * @returns self */
  public flipH(): this {
    const { data, width, height } = this;
    let i = data.length / 2;
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

/* TileableBitmap */
export class TileableBitmap extends Bitmap {
  readonly twidth: number;
  readonly theight: number;
  readonly cols: number;
  readonly rows: number;

  /** Create new TileableBitmap with empty pixels
  * @param twidth width of the tile
  * @param theight height of the tile
  * @param cols total number of tiles in horizontal
  * @param rows total number of tiles in vertical */
  constructor(twidth: number, theight: number, cols: number, rows: number) {
    super(twidth * cols, theight * rows);
    this.twidth = twidth;
    this.theight = theight;
    this.cols = cols;
    this.rows = rows;
  }

  /** Create TileableBitmap from buffer
  * @param buffer buffer with color values
  * @param twidth width of the tile
  * @param theight height of the tile
  * @param cols total number of tiles in horizontal
  * @param rows total number of tiles in vertical
  * @returns new TileableBitmap */
  public static from(buffer: ArrayBuffer, twidth: number, theight: number, cols: number = 1, rows: number = 1): TileableBitmap {
    const tbitmap = new TileableBitmap(twidth, theight, cols, rows);
    tbitmap.data = new Uint32Array(buffer);
    return tbitmap;
  }

  /** Extract tile to new Bitmap
  * @param col tile location by x
  * @param row tile location by y
  * @returns new Bitmap */
  public extractTile(col: number, row: number): Bitmap {
    return this.extract(
      col * this.twidth,
      row * this.theight,
      this.twidth,
      this.theight,
    );
  }

  /** Copy to Bitmap one tile of self
  * @param bitmap destination Bitmap
  * @param x destination offset x
  * @param y destination offset y
  * @param col tile location by x
  * @param row tile location by y
  * @returns self */
  public copyTile(bitmap: Bitmap, x: number, y: number, col: number, row: number): this {
    return this.copy(
      bitmap, x, y,
      col * this.twidth,
      row * this.theight,
      this.twidth,
      this.theight,
    );
  }

  /** Split TileableBitmap to array of Bitmaps
  * @returns array of Bitmaps */
  public split(): Bitmap[] {
    const bitmaps = [];
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const x = col * this.twidth;
        const y = row * this.theight;
        bitmaps.push(this.extract(x, y, this.twidth, this.twidth));
      }
    }
    return bitmaps;
  }

  /** Create new TileableBitmap by reordering tiles of self
  * @param order indexes of source tiles by col * row
  * @param cols total number of tiles in horizontal
  * @param rows total number of tiles in vertical
  * @returns new TileableBitmap */
  public reorder(order: number[], cols: number, rows: number): TileableBitmap {
    const { twidth, theight, cols: scols } = this;
    const tbitmap = new TileableBitmap(twidth, theight, cols, rows);
    let i = cols * rows;
    while(i--) {
      const j = order[i];
      const [dc, dr] = [i % cols, i / cols | 0];
      const [sc, sr] = [j % scols, j / scols | 0];
      this.copyTile(tbitmap, dc * twidth, dr * theight, sc, sr);
    }
    return tbitmap;
  }
}

/* BitmapPallete */
export class BitmapPallete {
  private palleteData: Uint32Array;
  readonly palleteMap: Uint8Array;
  readonly bitmap: Bitmap;

  /** Create new BitmapPallete attached to Bitmap
  * @param bitmap source Bitmap */
  constructor(bitmap: Bitmap) {
    this.bitmap = bitmap;
    const pixels = bitmap.pixels;
    const map = [] as number[];
    const colors = [] as number[];
    let i = pixels.length;
    while (i--) {
      const pixel = pixels[i];
      const idx = colors.indexOf(pixel);
      if (idx < 0) {
        map[i] = colors.length;
        colors.push(pixel);
      } else map[i] = idx;
    }
    this.palleteMap = new Uint8Array(map);
    this.palleteData = new Uint32Array(colors);
  }

  /** Get pallete as array of numbers
  * @returns colors */
  public get pallete(): number[] {
    return Array.from(this.palleteData);
  }

  /** Set new pallete and apply on source Bitmap
  * @param pallete new pallete to apply */
  public set pallete(pallete: number[]) {
    this.palleteData.set(pallete);
    this.remap();
  }

  /** Apply pallete on source Bitmap */
  protected remap(): void {
    const { 
      bitmap: { pixels },
      palleteData,
      palleteMap,
    } = this;
    let i = pixels.length;
    while (i--) pixels[i] = palleteData[palleteMap[i]];
  }
}
