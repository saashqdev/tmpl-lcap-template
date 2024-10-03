const fs = require('fs-extra');
const path = require('path');
const argv = require("minimist")(process.argv.slice(2));

const version = argv.version || require("../package.json").version;

// Check if the version is valid
const versionReg = /[0-9]+\.[0-9]+\.[0-9]+/
if (!versionReg.test(version)) {
  throw new Error('version does not conform to standard format');
}

// Modify package.json in the root directory
const rootPkgPath = path.join(__dirname, "../package.json");
const rootPkg = require(rootPkgPath);
rootPkg.version = version;
fs.writeJSONSync(rootPkgPath, rootPkg, {
  spaces: 2,
  EOL: "\r\n",
});

// Traverse the first-level directories under packages
const packagesDir = path.join(__dirname, '../packages');
const packages = fs.readdirSync(packagesDir);
packages.forEach((package) => {
  if (fs.statSync(path.join(packagesDir, package)).isDirectory()) {
    const pkgPath = path.resolve(packagesDir, package, "package.json");
    if (fs.existsSync(pkgPath)) {
      const pkg = require(pkgPath);
      pkg.version = version;
      fs.writeJSONSync(pkgPath, pkg, {
        spaces: 2,
        EOL: "\r\n",
      });
    }
  }
});