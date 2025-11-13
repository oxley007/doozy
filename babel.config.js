module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'nativewind/babel',
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',       // or 'placesapi.env' if you named it that
        safe: false,        // set to true if you want to ensure all vars are defined
        allowUndefined: true,
      },
    ],
  ],
};
