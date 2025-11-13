/**
 * @format
 */

// 👇 add this at the very top
import 'react-native-get-random-values';

import { AppRegistry, NativeModules } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Safely disable DevSettings in Release builds
if (!__DEV__) {
  if (NativeModules.DevSettings) {
    NativeModules.DevSettings.enableRemoteDebugging = undefined;
    NativeModules.DevSettings.setIsDebuggingRemotely = undefined;
  }
}

AppRegistry.registerComponent(appName, () => App);
