const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// Get the default config
const config = getDefaultConfig(__dirname);

// Add support for SVG files
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

// Update the resolver to handle SVG files
config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...config.resolver.sourceExts, "svg"],
  unstable_enablePackageExports: false,
};

// Apply NativeWind transformer
module.exports = withNativeWind(config, { input: "./global.css" });
