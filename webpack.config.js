const path = require("path");
// const HtmlWebpackPlugin = require('html-webpack-plugin');
//

module.exports = (env) => {
  console.log(env);
  return {
    mode: "development",
    entry: { index: "./src/index.ts" },
    resolve: { extensions: [".ts", ".js", ".json"] },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: "ts-loader",
          exclude: [ /node_modules/, /old_files/, /devtools/, /\.(?:test|spec)\.ts$/ ],
        },
        {
          test: [/\.html$/, /\.png$/],
          loaders: [
            'file-loader?hash=sha512&digest=hex&name=img/[hash].[ext]',
            'image-webpack-loader?bypassOnDebug&optipng.optimizationLevel=7&gifsicle.interlaced=false'
          ] 
        }
      ],
    },
    devtool: "inline-source-map",
    devServer: { 
      static: "./dist",
      historyApiFallback: true
    },
    // plugins: [ new HtmlWebpackPlugin({ title: "Development", template: "./index.html" }) ],
    output: {
      filename: "[name].main.js",
      path: path.resolve(__dirname, "dist"),
      clean: true,
      publicPath: "/",
    },
    optimization: {
      runtimeChunk: "single"
    }
  };
};
