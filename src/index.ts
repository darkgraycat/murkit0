// import { init } from "./main";
import runnerGame from "./runnerGame";

export const debug: any = {};

window.addEventListener("load", async () => {
  const debugEl = document.getElementById("debug") as HTMLDivElement;
  debug.set = (...msg: string[]) => (debugEl.innerHTML = msg.join(", "));
  debug.add = (...msg: string[]) => (debugEl.innerHTML += "<br>" + msg.join(", "));

  const width = 320;
  const height = 160;

  console.log(document);
  const screen = document.getElementById("screen") as HTMLCanvasElement;
  const overlay = document.getElementById("overlay") as any;
  overlay.set = (...msg: string[]) => (debugEl.innerHTML = msg.join("<br>"));
  overlay.add = (...msg: string[]) => (debugEl.innerHTML += msg.join("<br>"));

  screen.width = width;
  screen.height = height;

  const actions: Set<string> = new Set();
  const kbMapping = {
    KeyQ: "Left", KeyW: "Right", KeyP: "Jump",
    KeyA: "Left", KeyD: "Right", Space: "Jump",
    ArrowLeft: "Left", ArrowRight: "Right", ArrowUp: "Jump",
  };
  const mouseFields = {

  }
  window.addEventListener("keydown", ({ code }) => actions.add(kbMapping[code] || code));
  window.addEventListener("keyup", ({ code }) => actions.delete(kbMapping[code] || code));
  window.addEventListener("mousedown", () => {

  })

  setInterval(() => {
    if (actions.size) console.log(actions);
  }, 100);

  // init({
  //   screen,
  //   width,
  //   height,
  //   keys,
  //   fps: 1000 / 60,
  // });

  const game = await runnerGame({ screen, overlay, width, height, actions, fps: 1000/60 });
  game.engine.start();
  console.log("INITIALIZED");
});
