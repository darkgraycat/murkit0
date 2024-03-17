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
  cInputRunner,
  cPlayer,
} from "./components";
import { collisionHelpers, CollisionSide } from "./utils";

import { debug } from ".";

const { rectangle, bounds } = collisionHelpers;

export function Systems(world: World, viewport: Bitmap) {
  console.debug("SYSYEMS: initialization");

  const { width, height } = world;
  return {
    /* Collide entities with world bounds */
    sCollideBounds: new System(
      { cPosition, cVelocity, cShape, cPlayer },
      (_, comp, entities) => {
        const { x, y } = comp.cPosition.storage;
        const { vx, vy } = comp.cVelocity.storage;
        const { w, h } = comp.cShape.storage;
        const { air } = comp.cPlayer.storage;
        for (const e of entities) {
          const eRight = x[e] + w[e];
          const eBottom = y[e] + h[e];
          const collisionSide = bounds(
            x[e], y[e], eRight, eBottom,
            0, 0, width, height,
          );
          if (collisionSide == CollisionSide.None) continue;
          switch (collisionSide) {
            case CollisionSide.Bottom: x[e] = 32; y[e] = 32; air[e] = true; break;
            case CollisionSide.Left: vx[e] = 0; x[e] = 0; break;
            case CollisionSide.Right: vx[e] = 0; x[e] = width - w[e]; break;
            case CollisionSide.Top: vy[e] = 1; y[e] = 0; break;
          }
        }
      },
    ),

    /* Collide entities from groupA with entities from groupB */
    sCollideShapes: new System(
      { cPosition, cVelocity, cShape, cPlayer },
      (_, comp, entities, blocks) => {
        const { x, y } = comp.cPosition.storage;
        const { vx, vy } = comp.cVelocity.storage;
        const { w, h } = comp.cShape.storage;
        const { air } = comp.cPlayer.storage;
        for (const e of entities) {
          const eRight = x[e] + w[e];
          const eBottom = y[e] + h[e];
          let totalCollisions = 0;
          for (const b of blocks) {
            if (totalCollisions > 2) break;
            const bRight = x[b] + w[b];
            const bBottom = y[b] + h[b];
            const collisionSide = rectangle(
              x[e], y[e], eRight, eBottom,
              x[b], y[b], bRight, bBottom,
            );
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
      { cPosition, cVelocity, cPlayer },
      (dt, comp, entities) => {
        const { x, y } = comp.cPosition.storage;
        const { vx, vy } = comp.cVelocity.storage;
        const { air } = comp.cPlayer.storage;
        const { friction, gravity } = world;
        for (const e of entities) {
          x[e] += vx[e] * dt;
          y[e] += vy[e] * dt;
          // TODO: think to move it separately, to avoid dependency with cPlayer.air
          vx[e] *= friction;
          vy[e] += gravity;
        }
      },
    ),

    /* Render frame of spritesheet by index */
    sDrawing: new System({ cSprite, cPosition }, (_, comp, entities) => {
      const { sprites, spriteIdx, flipped, offsetX, offsetY } = comp.cSprite.storage;
      const { x, y } = comp.cPosition.storage;
      for (const e of entities) {
        const half = sprites[e].length / 2;
        const idx = flipped[e] ? spriteIdx[e] + half : spriteIdx[e];
        viewport.draw(
          sprites[e][idx],
          Math.round(offsetX[e] + x[e]),
          Math.round(offsetY[e] + y[e]),
        );
      }
    }),

    /* Calculate next frame needed to draw */
    sAnimation: new System({ cAnimation, cSprite }, (dt, comp, entities) => {
      const { animations, current, length, time, coef } = comp.cAnimation.storage;
      const { spriteIdx } = comp.cSprite.storage;
      for (const e of entities) {
        const frameTime = (time[e] + dt * coef[e]) % length[e];
        spriteIdx[e] = animations[e][current[e]][frameTime | 0];
        time[e] = frameTime;
      }
    }),

    /* Listen for user input */
    sController: new System(
      { cVelocity, cInput, cSprite, cPlayer, cAnimation },
      (_, comp, entities) => {
        const { flipped } = comp.cSprite.storage;
        const { current } = comp.cAnimation.storage;
        const { keys } = comp.cInput.storage;
        const { vx, vy } = comp.cVelocity.storage;
        const { air, speed } = comp.cPlayer.storage;
        for (const e of entities) {
          if (!keys[e].size) {
            current[e] = air[e] ? 2 : 0;
            continue;
          }
          if (keys[e].has("KeyQ"))      vx[e] -= speed[e], current[e] = 1, flipped[e] = true;
          else if (keys[e].has("KeyW")) vx[e] += speed[e], current[e] = 1, flipped[e] = false;
          if (keys[e].has("KeyP"))      !air[e] && (air[e] = true, vy[e] = -10);
        }
      },
    ),

    /* Listen for user input for runner mode */
    sControllerRunner: new System(
      { cVelocity, cInputRunner, cPlayer, cAnimation },
      (_, comp, entities) => {
        const { current, coef } = comp.cAnimation.storage;
        const { actions, jumping } = comp.cInputRunner.storage;
        const { vx, vy } = comp.cVelocity.storage;
        const { air, speed, power } = comp.cPlayer.storage;
        for (const e of entities) {
          if (!actions[e].size) {
            current[e] = air[e] ? 2 : 1;
            coef[e] = 0.24
            if (air[e] == false) jumping[e] = false;
            continue;
          }
          if (actions[e].has("Jump")) {
            if (!jumping[e] && !air[e]) {
              jumping[e] = true;
              air[e] = true;
              vy[e] = -power[e];
            }
          } else if (air[e] == false) jumping[e] = false;

          if (actions[e].has("Left"))      vx[e] -= speed[e], coef[e] = 0.12, current[e] = 1;
          else if (actions[e].has("Right")) vx[e] += speed[e], coef[e] = 0.48, current[e] = 1;
        }
      },
    ),

    /* Generate platforms */
    sBuildingsRunner: new System(
      { cPosition, cShape },
      (dt, comp, entities) => {
        const speed = 1.5;
        const { x, y } = comp.cPosition.storage;
        const { w, h } = comp.cShape.storage;
        for (const e of entities) {
          x[e] -= speed * dt;
          // no replace if still visible
          if (x[e] >= -w[e]) continue;
          x[e] += width + w[e];
          //const [dx, dy] = platformPlacer(x[e], y[e], w[e], h[e], e);
          // x[e] += width + w[e] + dx;
          // y[e] += dy;
        }
      }
    ),
  };
}
