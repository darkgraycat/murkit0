import { init } from './core';

window.addEventListener('load', () => {
  const keys: Set<string> = new Set();
  window.addEventListener('keydown', ({ code }) => keys.add(code));
  window.addEventListener('keyup', ({ code }) => keys.delete(code));

  const width = 320;
  const height = 240;

  const screen = document.getElementById('screen') as HTMLCanvasElement;
  const gui = document.getElementById('gui') as HTMLDivElement;

  screen.width = width;
  screen.height = height;

  init({
    screen,
    gui,
    width,
    height,
    keys,
  })
});
