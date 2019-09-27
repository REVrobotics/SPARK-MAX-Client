const path = require("path");
const findRoot = require("find-root");
const webpack = require("webpack");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const projectDir = findRoot();

const toProjectPath = (relative) => path.join(projectDir, relative);

module.exports = {
  context: projectDir,
  entry: "./public/electron.ts",
  target: "electron-main",
  output: {
    path: toProjectPath("build"),
    filename: "electron.js",
  },
  // do not include node_modules packages into build
  externals: [nodeExternals()],
  resolve: {
    extensions: [".js", ".ts"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: toProjectPath("public"),
        loader: "ts-loader",
        options: {
          configFile: "tsconfig.electron.json",
        },
      },
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: "development",
    }),
    // Remove this code as soon as ZeroMQ support will be terminated
    new CopyWebpackPlugin([{
      context: toProjectPath("public/protobuf"),
      from: "**/*.proto",
      to: "protobuf",
    }]),
    new TsconfigPathsPlugin({configFile: toProjectPath("tsconfig.electron.json")}),
  ],
  node: {
    __dirname: false,
    __filename: false
  },
  stats: "errors-only",
};
