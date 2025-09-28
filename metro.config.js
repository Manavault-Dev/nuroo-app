const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Optimize bundle size
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Enable tree shaking for better bundle optimization
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Optimize asset handling
config.resolver.assetExts
  .push
  // Add any additional asset extensions if needed
  ();

// Exclude unused icon fonts from bundle
config.resolver.blockList = [
  /node_modules\/@expo\/vector-icons\/build\/vendor\/react-native-vector-icons\/Fonts\/(?!Ionicons).*\.ttf$/,
];

module.exports = config;
