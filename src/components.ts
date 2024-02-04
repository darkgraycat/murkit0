import { Bitmap } from "./bitmap";
import { Component } from "./ecs/simple.ecs";

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
  flipped: boolean;
}>({
  spriteIdx: 0,
  sprites: [],
  flipped: false,
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

// TODO: investigate possibility of using world as a component
export const cWorld = new Component<{
  width: number,
  height: number,
  gravity: number,
  friction: number,
  viewport: Bitmap,
}>({
  width: 0,
  height: 0,
  gravity: 0,
  friction: 0,
  viewport: new Bitmap(0, 0),
});
