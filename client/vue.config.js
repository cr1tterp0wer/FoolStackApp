/* eslint-disable */
// Vue.config.js
const HardSourceWebpackPlugin = require("hard-source-webpack-plugin");
const path = require("path");
/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
module.exports = {
  lintOnSave: false,
  configureWebpack: {
    plugins: [
      new HardSourceWebpackPlugin({
        cacheDirectory: "node_modules/.cache/hard-source/[confighash]",
        configHash(webpackConfig) {
          return require("node-object-hash")({ sort: false }).hash(webpackConfig);
        },
        environmentHash: {
          root: process.cwd(),
          directories: [],
          files: ["package-lock.json", "yarn.lock"],
        },
        info: {
          mode: "none",
          level: "debug",
        },
        cachePrune: {
          maxAge: 2 * 24 * 60 * 60 * 1000,
          sizeThreshold: 50 * 1024 * 1024,
        },
      }),

      new HardSourceWebpackPlugin.ExcludeModulePlugin([
        {
          test: /mini-css-extract-plugin[\\/]dist[\\/]loader/,
        },
        {
          test: /my-loader/,
          include: path.join(__dirname, "vendor"),
        },
      ]),
    ],
  },
};
