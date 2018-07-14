const withTypescript = require("@zeit/next-typescript");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = withTypescript({
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    config.node = {
      fs: "empty"
    };

    if (isServer) config.plugins.push(new ForkTsCheckerWebpackPlugin());

    return config;
  }
});
