const path = require("path");
module.exports = (_, options) => {
  console.log(options)
  return {
    entry: path.resolve(__dirname, "src/index.ts"),
    resolve: { extensions: [".ts", ".js", ".json"] },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: "ts-loader",
          exclude: [/node_modules/, /old_files/, /devtools/],
        },
      ],
    },
    output: {
      filename: "main.js",
      path: path.resolve(__dirname, "dist"),
    },
    devtool: "source-map",
  };
};
