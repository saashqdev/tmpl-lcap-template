const path = require("path");
const fs = require("fs");
const pkg = require("../package.json");

const root = path.resolve(__dirname, "../");

module.exports = function ({ target }) {
  const tgz = `${pkg.name.replace("@", "").replace("/", "-")}-${pkg.version}.tgz`;
  fs.copyFileSync(`${root}/${tgz}`, `${target}/zip.tgz`);
};
