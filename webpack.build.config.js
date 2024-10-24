const path = require("path");

module.exports = {
  entry: "./dist1/scripts/main.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist2"),
  },
};
