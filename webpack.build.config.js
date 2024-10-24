const path = require("path");

module.exports = {
  entry: "./dist1/scripts/main.js",
  mode: "production",
  output: {
    filename: "bundle.min.js",
    path: path.resolve(__dirname, "dist2"),
  },
};
