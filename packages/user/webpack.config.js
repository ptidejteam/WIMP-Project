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
  target: "node",
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: [
    nodeExternals({
      allowlist: [], // allowlist any modules you need to include in the bundle
      additionalModuleDirs: [], // additional directories for module resolution if needed
      // Exclude specific optional dependencies to avoid warnings
      modulesFromFile: true, // Use dependencies in package.json if necessary
    }),
    // Add exclusions directly here
    {
      kerberos: "commonjs kerberos",
      snappy: "commonjs snappy",
      "mongodb-client-encryption": "commonjs mongodb-client-encryption",
      "aws-crt": "commonjs aws-crt",
      "zstd":"commonjs zstd"
    },
  ],

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
