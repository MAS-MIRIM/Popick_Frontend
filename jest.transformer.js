const babelJest = require('babel-jest');

module.exports = babelJest.createTransformer({
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'babel-plugin-styled-components',
      {
        ssr: false,
        displayName: false,
      },
    ],
  ],
});
