const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Watch the shared package for changes
config.watchFolders = [
  path.resolve(__dirname, "../../packages/shared"),
];

// Support package.json "exports" field
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
