const path = require("path");

module.exports = {
  entry: "./dist1/scripts/main.js",
  mode: "development",
  optimization: {
    minimize: false,
  },
  output: {
    filename: "bundle.min.js",
    path: path.resolve(__dirname, "dist2"),
  },
};
