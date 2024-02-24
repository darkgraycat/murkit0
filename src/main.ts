import { Adapter } from "./adapter";
import { Engine } from "./engine";
import { Bitmap } from "./bitmap";

import { EntityManager } from "./ecs/simple.ecs";
import { World } from "./world";
import { Systems } from "./systems";
import { Entities } from "./entities";
import * as components from "./components";

import { benchmark } from "./utils";
import { IImage } from "./common/types";

const images = {
 player:{"width":64,"height":16,"data":[7,1950960965,132385029,219613455,1221465600,6004,1163424851,1868985463,1634886912,1196180560,1313284214,1701978163,775188869,2766209024,554096,1313294156,1144193024,19072,689897472,288577,1296105472,2978941948,1627717632,418379,1195639039,16711935,2696783763,372,1229209940,2023538006,3238904368,206316678,3805882339,4041529639,3482239496,495029570,2356180056,1323972737,1252439450,1000283451,631542978,1825265506,3556532065,1031146186,358829308,2618770921,1796766045,2524166319,3082962238,435767068,446070091,4230938074,249856233,3107932901,3518491680,2917127915,394769503,3819829927,105320030,1264372807,3330182503,82825647,2394977757,4075755058,3520814998,3850231799,3182729381,2378823714,754028753,863073131,1784436412,2263732511,1066740527,942147287,1210599457,1103236871,3798543755,1092611934,1008124069,1604239068,1121479322,534811798,1047601231,2334343371,2079362193,593544906,607961525,68191027,1290762646,3103791775,133158143,2112418820,3077963890,3764463153,519832829,3976863369,3612241636,2845426851,2250177704,2117435678,4055172238,1291551989,1890860701,1573199629,773040309,1609273108,3467806563,2826449682,415356902,2517457754,465560056,3010875467,3257015899,3065406456,1578877289,96478380,2503953090,578717305,4114060280,2549651717,3906338562,2834214070,2500612727,0,1229278788,2923585666]}
}

export type MainConfig = {
  width: number;
  height: number;
  keys: Set<string>;
  screen: HTMLCanvasElement;
  fps: number;
};

export const init = async (config: MainConfig): Promise<void> => {
  console.debug("MAIN: init");
  const { width, height, keys, screen, fps } = config;
  const screenCtx = screen.getContext("2d") as CanvasRenderingContext2D;
  const screenImageData = screenCtx.getImageData(0, 0, width, height) as ImageData;

  const screenBitmap = Bitmap.from(screenImageData.data.buffer, width, height);
  const adapter = new Adapter();

  const playerImg = images.player as any as IImage;
  const playerBitmap = Bitmap.from(playerImg.data, playerImg.width, playerImg.height);

  const ab = new Uint32Array(16);
  for (let i = 0; i < 16; i++) ab[i] = 0xff00ff00;
  const bb = Bitmap.from(ab.buffer, 4, 4);

  screenBitmap.draw(bb, 16, 16);
  screenBitmap.draw(playerBitmap, 32, 16);

  screenCtx.putImageData(screenImageData, 0, 0);

  return;
  console.debug("MAIN: init world");
  const world = new World({
    width,
    height,
    gravity: 0.9,
    friction: 0.95,
    skyColor: 0xffa09080,
  });

  console.debug("MAIN: init systems");
  const {
    sMovement,
    sAnimation,
    sCollideBounds,
    sDrawing,
    sControllerRunner,
    sDrawAnimatedBg,
    sDrawAnimatedFg,
  } = Systems(world, screenBitmap);

  console.debug("MAIN: init entities");
  const em = new EntityManager(components);
  const {
    playerEntity,
    animatedBgLayersEntities,
    animatedFgLayersEntities,
    fgBgLayers: {
      animatedBgPalletes,
      animatedFgPalletes,
    }
  } = await Entities(em, world, adapter, keys);

  console.debug("MAIN: attach entities with systems");
  const collideBounds = sCollideBounds.setup([playerEntity]);
  const move = sMovement.setup([playerEntity]);
  const draw = sDrawing.setup([playerEntity]);
  const control = sControllerRunner.setup([playerEntity]);
  const animate = sAnimation.setup([playerEntity]);
  const animateBg = sDrawAnimatedBg.setup(animatedBgLayersEntities);
  const animateFg = sDrawAnimatedFg.setup(animatedFgLayersEntities);

  // colors
  world.skyColor = 0xff4499ff;

  animatedBgPalletes[0].pallete = [0, 0xff3366ee, 0xff2244aa];
  animatedBgPalletes[1].pallete = [0, 0xff113388, 0xff2255bb];
  animatedBgPalletes[2].pallete = [0xff303030, 0];
  animatedBgPalletes[3].pallete = [0xff292929, 0];
  animatedBgPalletes[4].pallete = [0xff333333, 0xff206090];
  animatedBgPalletes[5].pallete = [0xff303030, 0xff206090];
  animatedBgPalletes[6].pallete = [0xff252525, 0xff206090];
  animatedBgPalletes[7].pallete = [0xff202020, 0xff206090];

  animatedFgPalletes[0].pallete = [0, 0xff101010, 0xff303030];

  // debug tools
  const renderBench = benchmark("render bench", 2);
  const updateBench = benchmark("update bench", 2);

  // animated bg
  const render = (dt: number) => {
    renderBench.A();
    screenBitmap.fill(world.skyColor);

    animateBg(dt);
    animate(dt);
    draw(dt);
    animateFg(dt);

    screenCtx.putImageData(screenImageData, 0, 0);
    renderBench.B();
  };

  const update = (dt: number) => {
    updateBench.A();
    move(dt);
    collideBounds(dt);
    control(dt);
    updateBench.B();
  };

  console.debug("MAIN: run engine");
  const engine = new Engine(adapter, fps, update, render, 0.03);
  engine.start();
  // TODO: live limited time. for dev only
  setTimeout(() => {
    engine.stop();
    console.debug("MAIN: engine stopped");
    console.log(renderBench.resultsFps());
    console.log(updateBench.resultsFps());
  }, 1000 * 30); // for development only, to stop after 30 sec
};
