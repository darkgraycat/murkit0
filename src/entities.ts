import { BitmapPallete } from "./bitmap";
import { IAdapter } from "./common/types";
import { EntityManager } from "./ecs/simple.ecs";
import { bulkTileableBitmapLoad } from "./helpers";
import { MainConfig } from "./main";
import { World } from "./world";

// TODO: investigate how to do it in a proper way
import playerAsset from "../assets/player.png";
import blocksAsset from "../assets/platforms.png";
import bgAsset from "../assets/backgrounds.png";
import houseAsset from "../assets/backgrounds_houses.png";

// TODO: I dont like this function at all, added temporary
export async function Entities(em: EntityManager<any>, world: World, adapter: IAdapter, keys: MainConfig["keys"]) {
  console.debug("ENTITIES: load assets");
  const [playerTiles, blockTiles, bgTiles, houseTiles] = await bulkTileableBitmapLoad(
    adapter,
    // ["./assets/player.png", 16, 16, 4, 1],
    // ["./assets/platforms.png", 16, 16, 4, 1],
    // ["./assets/backgrounds.png", 32, 32, 6, 1],
    // ["./assets/backgrounds_houses.png", 48, 32, 5, 1],
    [playerAsset, 16, 16, 4, 1],
    [blocksAsset, 16, 16, 4, 1],
    [bgAsset, 32, 32, 6, 1],
    [houseAsset, 48, 32, 5, 1],
  );
  console.debug("ENTITIES: build graphics");
  const playerSprites = playerTiles.split().concat(playerTiles.flipV().split());
  const blockSprites = blockTiles.split();
  const bgSprites = bgTiles.split();
  const houseSprites = houseTiles.split();

  // TODO: make dedicated EM and components and systems for decorations
  // TODO: use Level to build level assets
  //           or make Level to use ids of assets
  const animatedBgLength= 20;
  const animatedBgLayers = [
    // LAYOUT
    bgTiles.reorder(Array.from<number>({ length: animatedBgLength }).fill(0),animatedBgLength, 1),
    bgTiles.reorder(Array.from<number>({ length: animatedBgLength }).fill(0),animatedBgLength, 1),

    bgTiles.reorder(Array.from<number>({ length: animatedBgLength }).fill(2),animatedBgLength, 1),
    bgTiles.reorder(Array.from<number>({ length: animatedBgLength }).fill(1),animatedBgLength, 1),
    bgTiles.reorder(Array.from<number>({ length: animatedBgLength }).fill(4),animatedBgLength, 1),
    bgTiles.reorder(Array.from<number>({ length: animatedBgLength }).fill(5),animatedBgLength, 1),
    bgTiles.reorder(Array.from<number>({ length: animatedBgLength }).fill(5),animatedBgLength, 1),
    bgTiles.reorder(Array.from<number>({ length: animatedBgLength }).fill(5),animatedBgLength, 1),
  ];
  const animatedBgPalletes = animatedBgLayers.map((bitmap) => new BitmapPallete(bitmap));

  // TODO: handle FG layers later
  // const animatedFgOrder =  [9, 9, 2, 9, 9, 3, 9, 9];
  // const animatedFgOrder2 = [9, 9, 0, 9, 9, 0, 9, 9];
  // const animatedFgLayers = [
  //   houseTiles.reorder([
  //     ...animatedFgOrder,
  //     ...animatedFgOrder,
  //     ...animatedFgOrder2,
  //     ...animatedFgOrder2,
  //     ...animatedFgOrder,
  //     ...animatedFgOrder,
  //     ...animatedFgOrder2,
  //     ...animatedFgOrder2,
  //   ], 16, 4),
  // ];
  // const animatedFgPalletes = animatedFgLayers.map((bitmap) => new BitmapPallete(bitmap));

  console.debug("ENTITIES: define entities");
  // player
  const playerEntity = em.add({
    cPosition: { x: 32, y: 128 },
    cVelocity: { vx: 0, vy: 0 },
    cShape: { w: 10, h: 14 },
    cMeta: { air: true, speed: 0.4 },
    cInput: { keys },
    cSprite: { spriteIdx: 0, sprites: playerSprites, offsetX: -3, offsetY: -2 },
    cAnimation: {
      animations: [ [0, 0, 3, 3], [1, 2, 3, 0], [1, 1, 2, 2] ],
      current: 0,
      length: 4,
      time: 0,
      coef: 0.4,
    },
  });

  // platforms/blocks
  const createPlatformEntity = (spriteIdx: number, x: number, y: number) => em.add({});

  // bg & fg
  const createAnimatedBgEntity = (spriteIdx: number, alt: number, speed: number) => em.add({
    cAnimation: { animations: [[0]], current: 0, length: 0, time: 0, coef: speed },
    cSprite: { sprites: animatedBgLayers, spriteIdx, offsetX: 0, offsetY: alt * 16 },
  });
  const animatedBgLayersEntities = [
    createAnimatedBgEntity(2, 4, -1.0),
    createAnimatedBgEntity(3, 5, -1.5),
    createAnimatedBgEntity(4, 6, -2.0),
    createAnimatedBgEntity(5, 7, -2.5),
    createAnimatedBgEntity(6, 8, -3.0),
    createAnimatedBgEntity(7, 9, -3.5),
    createAnimatedBgEntity(0, 2, -1.0),
    createAnimatedBgEntity(1, 1, -1.5),
    createAnimatedBgEntity(0, 0, -2.0),
  ]

  // const createAnimatedFgEntity = (spriteIdx: number, alt: number, speed: number) => em.add({
  //   cAnimation: { animations: [[0]], current: 0, length: 0, time: 0, coef: speed },
  //   cSprite: { sprites: animatedFgLayers, spriteIdx, offsetX: 0, offsetY: alt * 16 },
  // });
  // const animatedFgLayersEntities = [createAnimatedFgEntity(0, 5, -3)];

  return {
    // return graphics, just in case
    tiles: { playerTiles, blockTiles, bgTiles, houseTiles },
    sprites: { playerSprites, blockSprites, bgSprites, houseSprites },
    fgBgLayers: {
      // animatedFgLayers,
      // animatedFgPalletes,
      animatedBgLayers,
      animatedBgPalletes,
    },
    // entities
    playerEntity,
    // animatedFgLayersEntities,
    animatedBgLayersEntities,
  };
}
