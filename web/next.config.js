const config = {
  target: process.env.TARGET
};
try {
  const withTypescript = require("@zeit/next-typescript");

  module.exports = withTypescript(config);
} catch (e) {
  module.exports = config;
}
