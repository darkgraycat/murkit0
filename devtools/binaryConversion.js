const { wrap } = require("./helpers");

wrap((...numbers) => {
  return numbers.reduce((acc, n) => {
    const isBinary = n[1] == "b";
    acc[n] = isBinary ? +n : "0b" + (+n).toString(2);
    return acc;
  }, {});
});
