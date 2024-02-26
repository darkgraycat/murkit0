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
  const buttons = [
    document.getElementById("btn-left"),
    document.getElementById("btn-right"),
    document.getElementById("btn-jump"),
  ];

  screen.width = width;
  screen.height = height;

  const actions: Set<string> = new Set();
  const kbMapping = {
    KeyQ: "Left", KeyW: "Right", KeyP: "Jump",
    KeyA: "Left", KeyD: "Right", Space: "Jump",
    ArrowLeft: "Left", ArrowRight: "Right", ArrowUp: "Jump",
  };
  window.addEventListener("keydown", ({ code }) => actions.add(kbMapping[code] || code));
  window.addEventListener("keyup", ({ code }) => actions.delete(kbMapping[code] || code));
  for (const btn of buttons) {
    btn.addEventListener("mousedown", (e) => {
      // @ts-ignore
      const id = e.target.id;
      if (id === "btn-left") actions.add("Left");
      if (id === "btn-jump") actions.add("Jump");
      if (id === "btn-right") actions.add("Right");
    });
    btn.addEventListener("mouseup", (e) => {
      // @ts-ignore
      const id = e.target.id;
      if (id === "btn-left") actions.delete("Left");
      if (id === "btn-jump") actions.delete("Jump");
      if (id === "btn-right") actions.delete("Right");
    });
  }

  const game = await runnerGame({ screen, overlay, width, height, actions, fps: 1000/60 });
  game.engine.start();
  console.log("INITIALIZED");
});
