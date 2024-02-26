// import { init } from "./main";
import runnerGame from "./runnerGame";

export const debug: any = {};

window.addEventListener("load", async () => {
  const debugEl = document.getElementById("debug") as HTMLDivElement;
  debug.set = (...msg: string[]) => (debugEl.innerHTML = msg.join(", "));
  debug.add = (...msg: string[]) =>
    (debugEl.innerHTML += "<br>" + msg.join(", "));

  const width = 320;
  const height = 160;

  console.log(document);
  const screen = document.getElementById("screen") as HTMLCanvasElement;
  const overlay = document.getElementById("overlay") as HTMLDivElement;

  screen.width = width;
  screen.height = height;

  const keys: Set<string> = new Set();
  window.addEventListener("keydown", ({ code }) => keys.add(code));
  window.addEventListener("keyup", ({ code }) => keys.delete(code));

  // init({
  //   screen,
  //   width,
  //   height,
  //   keys,
  //   fps: 1000 / 60,
  // });

  const game = await runnerGame({ screen, overlay, width, height, keys, fps: 1000/60 });
  game.engine.start();
  console.log("INITIALIZED");
});
