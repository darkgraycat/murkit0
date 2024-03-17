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
  const actionsMapping = {
    KeyQ: "Left", KeyW: "Right", KeyP: "Jump",
    KeyA: "Left", KeyD: "Right", Space: "Jump",
    ArrowLeft: "Left", ArrowRight: "Right", ArrowUp: "Jump",
    "btn-left": "Left", "btn-right": "Right", "btn-jump": "Jump",
  };
  window.addEventListener("keydown", ({ code }) => actionsMapping[code] && actions.add(actionsMapping[code]));
  window.addEventListener("keyup", ({ code }) => actionsMapping[code] && actions.delete(actionsMapping[code]));
  for (const btn of buttons) {
    btn.addEventListener("touchstart", ({ target: { id } }: any) => actionsMapping[id] && actions.add(actionsMapping[id]))
    btn.addEventListener("touchend", ({ target: { id } }: any) => actionsMapping[id] && actions.delete(actionsMapping[id]))
    btn.addEventListener("mousedown", ({ target: { id } }: any) => actionsMapping[id] && actions.add(actionsMapping[id]))
    btn.addEventListener("mouseup", ({ target: { id } }: any) => actionsMapping[id] && actions.delete(actionsMapping[id]))
  };

  const game = await runnerGame({ screen, overlay, width, height, actions, fps: 1000/60 });
  game.engine.start();
  console.log("INITIALIZED");
});
