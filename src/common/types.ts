export type Imutable<T> = { +readonly [K in keyof T]: T[K] };
export type Mutable<T> = { -readonly [K in keyof T]: T[K] };
export type Dictionary = { [key: string]: any }

export interface IImage {
  width: number;
  height: number;
  data: ArrayBuffer;
}

export interface IAdapter {
  loadImage(src: string): Promise<IImage>;
  sleep(ms: number): Promise<void>;
  now(): number;
}

