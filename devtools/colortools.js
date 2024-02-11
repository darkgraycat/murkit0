const { wrap } = require("./helpers");

const tools = {
  hex2rgb: (color) => color.match(/.{1,2}/g).map(c => parseInt(c, 16)),
  
  rgb2hex: (r, g, b) => (r << 16 | g << 8 | b).toString(16),
  
  tint: (color, mod = 1, reverse = false) => {
    const [r, g, b] = tools.hex2rgb(color);
  
    const rg_d = Math.abs(r - g);
    const gb_d = Math.abs(g - b);
    const br_d = Math.abs(b - r);
  
    const R = r + (reverse ? rg_d : br_d) * mod;
    const G = g + (reverse ? gb_d : rg_d) * mod;
    const B = b + (reverse ? br_d : gb_d) * mod;
  
    const result = tools.rgb2hex(R, G, B);
  
    return result;
  },
}

wrap((method = "", ...args) => {
  if (!tools[method]) return `Allowed commands: ${Object.keys(tools)}`;
  return tools[method](...args);
});

module.exports = { ...tools };
