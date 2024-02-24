import { Bitmap } from "./bitmap";
import { Component } from "./ecs/simple.ecs";

console.debug("COMPONENTS: definitions");

export const cPosition = new Component<{ x: number; y: number }>({
  x: 0,
  y: 0,
});

export const cVelocity = new Component<{ vx: number; vy: number }>({
  vx: 0,
  vy: 0,
});

export const cShape = new Component<{ w: number; h: number }>({
  w: 0,
  h: 0,
});

export const cSprite = new Component<{
  spriteIdx: number;
  sprites: Bitmap[];
  flipped?: boolean;
  offsetX?: number,
  offsetY?: number,
}>({
  spriteIdx: 0,
  sprites: [],
  flipped: false,
  offsetX: 0,
  offsetY: 0
});

export const cAnimation = new Component<{
  animations: number[][];
  current: number;
  length: number;
  time: number;
  coef: number;
}>({
  animations: [[]],
  current: 0,
  length: 0,
  time: 0,
  coef: 0,
});

export const cInput = new Component<{ keys: Set<string> }>({
  keys: new Set(),
});

export const cMeta = new Component<{ air: boolean; speed: number }>({
  air: false,
  speed: 0,
});

// export const cWorld = new Component<{
//   time?: number,
//   width: number,
//   height: number,
//   gravity: number,
//   friction: number,
//   viewport: Bitmap,
// }>({
//   time: 0,
//   width: 0,
//   height: 0,
//   gravity: 0,
//   friction: 0,
//   viewport: new Bitmap(0, 0),
// });
