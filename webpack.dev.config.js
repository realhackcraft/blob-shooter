const path = require("path");

module.exports = {
  entry: "./dist1/scripts/main.js",
  optimization: {
    minimize: false,
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist2"),
  },
};
