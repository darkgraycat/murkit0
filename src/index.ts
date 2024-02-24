import { init } from "./main";

export const debug: any = {};

window.addEventListener("load", () => {
  const debugEl = document.getElementById("debug") as HTMLDivElement;
  debug.set = (...msg: string[]) => (debugEl.innerHTML = msg.join(", "));
  debug.add = (...msg: string[]) =>
    (debugEl.innerHTML += "<br>" + msg.join(", "));

  const keys: Set<string> = new Set();
  window.addEventListener("keydown", ({ code }) => keys.add(code));
  window.addEventListener("keyup", ({ code }) => keys.delete(code));

  const width = 320;
  const height = 160;

  console.log(document);
  const screen = document.getElementById("screen") as HTMLCanvasElement;

  screen.width = width;
  screen.height = height;

  init({
    screen,
    width,
    height,
    keys,
    fps: 1000 / 60,
  });
});
