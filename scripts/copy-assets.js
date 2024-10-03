const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const cwd = process.cwd();
const version = argv.version || require('../package.json').version;

// Create a temporary directory
const tempDir = path.resolve(cwd, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
} else {
    execSync(`rm -rf ${tempDir}`);
    fs.mkdirSync(tempDir);
}

// Copy the contents of h5 public to mobile-template@version in the temporary directory
const mobileTargetDir = path.resolve(tempDir, `mobile-template@${version}`);
fs.mkdirSync(mobileTargetDir);
const h5Root = path.resolve(__dirname, "../packages/h5");
require(`${h5Root}/scripts/copy-assets.js`)({
    target: mobileTargetDir,
});

// Copy the contents of pc's public to pc-template@version in the temporary directory
const pcTargetDir = path.resolve(tempDir, `pc-template@${version}`);
fs.mkdirSync(pcTargetDir);
const pcRoot = path.resolve(__dirname, "../packages/pc");
require(`${pcRoot}/scripts/copy-assets.js`)({
    target: pcTargetDir,
});

// Copy core's zip.tgz file to core-template@version in the temporary directory
const coreTargetDir = path.resolve(tempDir, `core-template@${version}`);
fs.mkdirSync(coreTargetDir);
const coreRoot = path.resolve(__dirname, "../packages/core");
require(`${coreRoot}/scripts/copy-assets.js`)({
    target: coreTargetDir,
});

// Assign the basic zip.tgz file to basic-template@version in the temporary directory
const basicTargetDir = path.resolve(tempDir, `basic-template@${version}`);
fs.mkdirSync(basicTargetDir);
const basicRoot = path.resolve(__dirname, "../packages/basic");
require(`${basicRoot}/scripts/copy-assets.js`)({
    target: basicTargetDir,
});
