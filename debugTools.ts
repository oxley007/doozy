// debugTools.ts
import { Platform, NativeModules } from "react-native";

// Use DevSettings from NativeModules if available
const NativeDevSettings = NativeModules.DevSettings || NativeModules.NativeDevSettings;

export function enableRemoteDebugging() {
  if (__DEV__ && NativeDevSettings) {
    // Only call if the module actually exists
    NativeDevSettings.setIsDebuggingRemotely?.(true);
  }
}
