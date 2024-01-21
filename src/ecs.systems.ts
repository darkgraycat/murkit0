import { System } from "./ecs/simple.ecs";
import { World } from "./ecs.world";
import { Bitmap } from "./bitmap";
import {
  cPosition,
  cVelocity,
  cShape,
  cSprite,
  cAnimation,
  cInput,
  cMeta,
} from "./ecs.components";

export function Systems(world: World, viewport: Bitmap) {
  const { width, height } = world;
  return {
    sCollideBounds: new System(
      { cPosition, cVelocity, cShape, cMeta },
      (_, comp, entities) => {
        const { x, y } = comp.cPosition.storage;
        const { vx, vy } = comp.cVelocity.storage;
        const { w, h } = comp.cShape.storage;
        const { air } = comp.cMeta.storage;
        for (const e of entities) {
          x[e] < 0
            ? ((x[e] = 0), (vx[e] = 0))
            : x[e] + w[e] > width && ((x[e] = width - w[e]), (vx[e] = 0));
          y[e] < 0
            ? ((y[e] = 0), (vy[e] = 0))
            : y[e] + h[e] > height &&
            ((y[e] = height - h[e]), ((vy[e] = 0), (air[e] = false)));
        }
      },
    ),

    sMovement: new System({ cPosition, cVelocity }, (dt, comp, entities) => {
      const { x, y } = comp.cPosition.storage;
      const { vx, vy } = comp.cVelocity.storage;
      const { friction, gravity } = world;
      for (const e of entities) {
        x[e] += vx[e] * dt;
        y[e] += vy[e] * dt;
        vx[e] *= friction;
        vy[e] += gravity;
      }
    }),

    sDrawing: new System({ cSprite, cPosition }, (_, comp, entities) => {
      const { sprites, spriteIdx, flipped } = comp.cSprite.storage;
      const { x, y } = comp.cPosition.storage;
      viewport.fill(world.skyColor);
      for (const e of entities) {
        const half = sprites[e].length / 2;
        const idx = flipped[e] ? spriteIdx[e] + half : spriteIdx[e];
        viewport.draw(sprites[e][idx], x[e] | 0, y[e] | 0);
      }
    }),

    sAnimation: new System({ cAnimation, cSprite }, (dt, comp, entities) => {
      const { animations, current, length, time, coef } =
        comp.cAnimation.storage;
      const { spriteIdx } = comp.cSprite.storage;
      for (const e of entities) {
        const frameTime = (time[e] + dt * coef[e]) % length[e];
        spriteIdx[e] = animations[e][current[e]][frameTime | 0];
        time[e] = frameTime;
      }
    }),

    sController: new System(
      { cVelocity, cInput, cSprite, cMeta, cAnimation },
      (_, comp, entities) => {
        const { flipped } = comp.cSprite.storage;
        const { current } = comp.cAnimation.storage;
        const { keys } = comp.cInput.storage;
        const { vx, vy } = comp.cVelocity.storage;
        const { air, speed } = comp.cMeta.storage;
        for (const e of entities) {
          if (!keys[e].size) {
            current[e] = 0;
            continue;
          }
          current[e] = 1;
          if (keys[e].has("KeyQ")) (vx[e] -= speed[e]), (flipped[e] = true);
          if (keys[e].has("KeyW")) (vx[e] += speed[e]), (flipped[e] = false);
          if (keys[e].has("KeyP")) !air[e] && ((air[e] = true), (vy[e] = -12));
        }
      },
    ),
  };
}
