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
  detectCollision,
  detectCollisionBounds,
} from "./helpers";

import { debug } from ".";

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
          const collisionSide = detectCollisionBounds(
            x[e],
            y[e],
            eRight,
            eBottom,
            0,
            0,
            width,
            height,
          );
          if (collisionSide == CollisionSide.None) continue;
          switch (collisionSide) {
            case CollisionSide.Left:
              vx[e] = 0;
              x[e] = 0;
              break;
            case CollisionSide.Right:
              vx[e] = 0;
              x[e] = width - w[e];
              break;
            case CollisionSide.Top:
              vy[e] = 1;
              y[e] = 0;
              break;
            case CollisionSide.Bottom:
              vy[e] = 0;
              y[e] = height - h[e];
              air[e] = false;
              break;
          }
        }
      },
    ),

    /* Collide entities from groupA with entities from groupB */
    sCollideShapes: new System(
      { cPosition, cVelocity, cShape },
      (_, comp, units, blocks) => {
        const { x, y } = comp.cPosition.storage;
        const { vx, vy } = comp.cVelocity.storage;
        const { w, h } = comp.cShape.storage;
        for (const u of units) {
          const uRight = x[u] + w[u];
          const uBottom = y[u] + h[u];
          let totalCollisions = 0;
          for (const b of blocks) {
            if (totalCollisions > 3) break;
            const bRight = x[b] + w[b];
            const bBottom = y[b] + h[b];
            const collisionSide = detectCollision(
              x[u],
              y[u],
              uRight,
              uBottom,
              x[b],
              y[b],
              bRight,
              bBottom,
            );
            if (collisionSide == CollisionSide.None) continue;
            totalCollisions++;
            switch (collisionSide) {
              case CollisionSide.Left:
                vx[u] = 0;
                x[u] = bRight;
                break;
              case CollisionSide.Right:
                vx[u] = 0;
                x[u] = x[b] - w[u];
                break;
              case CollisionSide.Top:
                vy[u] = 1;
                y[u] = bBottom;
                break;
              case CollisionSide.Bottom:
                vy[u] = 0;
                y[u] = y[b] - h[u];
                break;
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
          // TODO: think to move it separately, to avoid dependency with cMeta.air
          vx[e] *= friction;
          if (air[e]) vy[e] += gravity;
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
        viewport.draw(sprites[e][idx], x[e] | 0, y[e] | 0);
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
          debug.set(air, vx[e].toFixed(), vy[e].toFixed());
          if ((air[e] == true, vy[e] == 0)) air[e] = false;
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
