exports.wrap = (handler) =>
  (async ([, , ...args]) => handler(...args))(process.argv)
    .then(console.log)
    .catch(console.error)
    .finally(process.exit);
