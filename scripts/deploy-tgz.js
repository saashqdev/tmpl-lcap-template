const upload = require('lcap/lib/upload');
const fs = require('fs');
const path = require('path');
const getDeployConfig = require('./getDeployConfig');

/**
 * 
 * @param {*} options
 * @param {string} options.target
 * @param {string} options.root
 * @param {string} options.name
 * @param {string} options.version
 * @param {string} options.platform
 * @returns {Promise<void>}
 * http://minio-api.kubevue-dev.kubeworkz.io/lowcode-static/packages/@lcap/template-core@3.5.0/zip.tgz
 */
function deployTgz(options = {}) {
  const { root, name, version, platform, username, password } = options;
  const defaultConfig = getDeployConfig(options);

  const target = name.replace("@", "").replace("/", "-") + "-" + version + ".tgz";
  const targetPath = path.resolve(root, target);
  // Does tgz exist?
  if (!fs.existsSync(targetPath)) {
    console.error(`${targetPath} not found`);
    process.exit(1);
  }

  const source = "zip.tgz";
  const sourcePath = path.resolve(root, source);

  // Does zip.tgz exist?
  if (fs.existsSync(sourcePath)) {
    fs.unlinkSync(sourcePath);
  }

  // Copy tgz to zip.tgz
  fs.copyFileSync(targetPath, sourcePath);

  if (!fs.existsSync(sourcePath)) {
    console.error(`Cannot find source: ${sourcePath}`);
    process.exit(1);
  }

  // Start the upload process
  const prefix = `packages/${name}@${version}`;
  let formFiles = [{
    name: path.posix.join(prefix, source),
    path: sourcePath,
  }];

  return upload(formFiles, {
    platform: platform || defaultConfig.platform,
    username: username || defaultConfig.username,
    password: password || defaultConfig.password,
  })
    .then(() => {
      console.log(`Upload successful`);
    })
    .catch(() => {
      throw new Error("Upload failed");
    })
    .finally(() => {
      fs.unlinkSync(sourcePath);
      fs.unlinkSync(targetPath);
    });
}

module.exports = deployTgz;