import { Adapter } from "./adapter";
import { Engine } from "./engine";
import { Bitmap } from "./bitmap";

import { EntityManager } from "./ecs/simple.ecs";
import { World, Stage } from "./world";
import { Systems } from "./systems";
import { Entities } from "./entities";
import * as components from "./components";

import { benchmark } from "./utils";

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
  } = Systems(world, screenBitmap);

  console.debug("MAIN: init entities");
  const em = new EntityManager(components);
  const {
    playerEntity,
    // TODO: NOTE! HERE LEVEL
    animatedBgLayersEntities,
    // animatedFgLayersEntities,
    fgBgLayers: {
      animatedBgPalletes,
      // animatedFgPalletes,
    }
  } = await Entities(em, world, adapter, keys);

  console.debug("MAIN: init stages");
  //const stages = Object.fromEntries(runnerLevels.map(level => [level.name, Stage.from(level)]));

  console.debug("MAIN: attach entities with systems");
  const collideBounds = sCollideBounds.setup([playerEntity]);
  const move = sMovement.setup([playerEntity]);
  const draw = sDrawing.setup([playerEntity]);
  const control = sControllerRunner.setup([playerEntity]);
  const animate = sAnimation.setup([playerEntity]);
  // TODO: NOTE! HERE LEVEL
  const animateBg = sDrawAnimatedBg.setup(animatedBgLayersEntities);
  // const animateFg = sDrawAnimatedFg.setup(animatedFgLayersEntities);

  // colors
  world.skyColor = 0xff4499ff;

  // TODO: NOTE! HERE LEVEL
  animatedBgPalletes[0].pallete = [0, 0xff3366ee, 0xff2244aa];
  animatedBgPalletes[1].pallete = [0, 0xff113388, 0xff2255bb];
  animatedBgPalletes[2].pallete = [0xff303030, 0];
  animatedBgPalletes[3].pallete = [0xff292929, 0];
  animatedBgPalletes[4].pallete = [0xff333333, 0xff206090];
  animatedBgPalletes[5].pallete = [0xff303030, 0xff206090];
  animatedBgPalletes[6].pallete = [0xff252525, 0xff206090];
  animatedBgPalletes[7].pallete = [0xff202020, 0xff206090];

  // animatedFgPalletes[0].pallete = [0, 0xff101010, 0xff303030];

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
    // animateFg(dt);

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
