import { System } from "./ecs/simple.ecs";
import { World } from "./world";
import { Bitmap } from "./bitmap";
import {
  cPosition,
  cVelocity,
  cShape,
  cSprite,
  cAnimation,
  cInput,
  cMeta,
} from "./components";
import {
  CollisionSide,
  collision,
} from "./helpers";

import { debug } from ".";

const { rectangle, bounds } = collision;

let [lastx, lasty] = [0, 0];

export function Systems(world: World, viewport: Bitmap) {
  const { width, height } = world;
  return {
    /* Collide entities with world bounds */
    sCollideBounds: new System(
      { cPosition, cVelocity, cShape, cMeta },
      (_, comp, entities) => {
        const { x, y } = comp.cPosition.storage;
        const { vx, vy } = comp.cVelocity.storage;
        const { w, h } = comp.cShape.storage;
        const { air } = comp.cMeta.storage;
        for (const e of entities) {
          const eRight = x[e] + w[e];
          const eBottom = y[e] + h[e];
          const collisionSide = bounds(
            x[e], y[e], eRight, eBottom,
            0, 0, width, height,
          );
          if (collisionSide == CollisionSide.None) continue;
          switch (collisionSide) {
            case CollisionSide.Left: vx[e] = 0; x[e] = 0; break;
            case CollisionSide.Right: vx[e] = 0; x[e] = width - w[e]; break;
            case CollisionSide.Top: vy[e] = 1; y[e] = 0; break;
            case CollisionSide.Bottom: vy[e] = 0; y[e] = height - h[e]; air[e] = false; break;
          }
        }
      },
    ),

    /* Collide entities with a world tiles */
    sCollideLevel: new System(
      { cPosition, cVelocity, cShape, cMeta },
      (_, comp, entities) => {
        throw new Error("Not implemented yet");
        // get entity cell cx, cy - current row and column
        // get index world.level.collisions[top * columns + left]
        // and collide with top, left, bottom, right
        // input: same as collide shapes + level collision map
        // algo:
        // for all entities:
        //  get top, left, right, bottom cells (ghost, no actualy an object)
        //  check if collide for each side
      }
    ),

    /* Collide entities from groupA with entities from groupB */
    sCollideShapes: new System(
      { cPosition, cVelocity, cShape, cMeta },
      (_, comp, entities, blocks) => {
        const { x, y } = comp.cPosition.storage;
        const { vx, vy } = comp.cVelocity.storage;
        const { w, h } = comp.cShape.storage;
        const { air } = comp.cMeta.storage;
        for (const e of entities) {
          const eRight = x[e] + w[e];
          const eBottom = y[e] + h[e];
          let totalCollisions = 0;
          for (const b of blocks) {
            if (totalCollisions > 1) break;
            const bRight = x[b] + w[b];
            const bBottom = y[b] + h[b];
            const collisionSide = rectangle(
              x[e], y[e], eRight, eBottom,
              x[b], y[b], bRight, bBottom,
            );
            // TODO: remove debug
            debug.set(collisionSide.toUpperCase(), air[e] ? "^" : "_", `${x[e].toFixed(2)}:${y[e].toFixed(2)}`, vy[e].toFixed(2));
            if (collisionSide === CollisionSide.None) continue;
            totalCollisions++;
            switch (collisionSide) {
              case CollisionSide.Bottom: vy[e] = 0; y[e] = y[b] - h[e]; air[e] = false; break;
              case CollisionSide.Right: vx[e] = 0; x[e] = x[b] - w[e] - 0.01; break;
              case CollisionSide.Left: vx[e] = 0; x[e] = bRight + 0.01; break;
              case CollisionSide.Top: vy[e] = 1; y[e] = bBottom; break;
            }
          }
        }
      },
    ),

    /* Move entity using velocity values */
    sMovement: new System(
      { cPosition, cVelocity, cMeta },
      (dt, comp, entities) => {
        const { x, y } = comp.cPosition.storage;
        const { vx, vy } = comp.cVelocity.storage;
        const { air } = comp.cMeta.storage;
        const { friction, gravity } = world;
        for (const e of entities) {
          x[e] += vx[e] * dt;
          y[e] += vy[e] * dt;
          lastx = x[e];
          lasty = y[e];
          // TODO: think to move it separately, to avoid dependency with cMeta.air
          vx[e] *= friction;
          vy[e] += gravity;
        }
      },
    ),

    /* Render frame of spritesheet by index */
    sDrawing: new System({ cSprite, cPosition }, (_, comp, entities) => {
      const { sprites, spriteIdx, flipped } = comp.cSprite.storage;
      const { x, y } = comp.cPosition.storage;
      for (const e of entities) {
        const half = sprites[e].length / 2;
        const idx = flipped[e] ? spriteIdx[e] + half : spriteIdx[e];
        // viewport.draw(sprites[e][idx], x[e] | 0, y[e] | 0);
        viewport.draw(sprites[e][idx], Math.round(x[e]), Math.round(y[e]));
      }
    }),

    /* Calculate next frame needed to draw */
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

    /* Listen for user input */
    sController: new System(
      { cVelocity, cInput, cSprite, cMeta, cAnimation },
      (_, comp, entities) => {
        const { flipped } = comp.cSprite.storage;
        const { current } = comp.cAnimation.storage;
        const { keys } = comp.cInput.storage;
        const { vx, vy } = comp.cVelocity.storage;
        const { air, speed } = comp.cMeta.storage;
        for (const e of entities) {
          // debug.set(air, vx[e].toFixed(), vy[e].toFixed());
          // if ((air[e] == true, vy[e] == 0)) air[e] = false;
          if (!keys[e].size) {
            current[e] = 0;
            continue;
          }
          current[e] = 1; // TODO: fix false firing on any key
          if (keys[e].has("KeyQ")) (vx[e] -= speed[e]), (flipped[e] = true);
          if (keys[e].has("KeyW")) (vx[e] += speed[e]), (flipped[e] = false);
          if (keys[e].has("KeyP")) !air[e] && ((air[e] = true), (vy[e] = -10));
        }
      },
    ),
  };
}
