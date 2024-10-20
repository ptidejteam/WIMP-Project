const path = require("path");
const nodeExternals = require("webpack-node-externals");
const TerserPlugin = require("terser-webpack-plugin");
const WebpackBar = require("webpackbar");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  mode: 'production',
  entry: {
    server: "./lib/index.js",
  },
  output: {
    path: path.join(__dirname, "dist"),
    publicPath: "/",
    filename: "[name].js",
  },
  target: "node", // Use a string instead of an array
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: [nodeExternals()], // Needed to avoid errors when working with Express

  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
      }),
    ],
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      { test: /\.node$/, use: "node-loader" },
    ],
  },

  plugins: [
    new NodePolyfillPlugin(),
    new WebpackBar(),
  ],
};
