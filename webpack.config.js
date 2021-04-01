// Gatsby doesn't need webpack.config.js
// This is mainly for WebStorm IDE.
module.exports = {
  resolve: {
    alias: {
      "@": require("path").resolve(__dirname, "src"),
      "~": path.resolve(__dirname, "content"),
    },
    modules: [
      path.resolve(__dirname, "src"),
      path.resolve(__dirname, "content"),
      "node_modules"],
  },
}