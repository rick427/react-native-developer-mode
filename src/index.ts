import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `react-native-developer-mode: The native module is not linked. ` +
  `Make sure you have run 'pod install' (iOS) or rebuilt the Android project.`;

const DeveloperModeNative = NativeModules.DeveloperMode
  ? NativeModules.DeveloperMode
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export interface DeveloperModeResult {
  /** Whether developer mode / developer options is active */
  isDeveloperModeEnabled: boolean;
  /**
   * Android only: whether USB debugging (ADB) is enabled.
   * Always false on iOS.
   */
  isAdbEnabled: boolean;
}

/**
 * Checks whether the device has developer mode (Android Developer Options /
 * iOS Developer Mode) enabled.
 *
 * @returns A promise that resolves with {@link DeveloperModeResult}.
 */
export async function isDeveloperModeEnabled(): Promise<DeveloperModeResult> {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    return { isDeveloperModeEnabled: false, isAdbEnabled: false };
  }
  return DeveloperModeNative.isDeveloperModeEnabled();
}

/**
 * Convenience helper that resolves to `true` when developer mode is active
 * on the current platform.
 */
export async function checkDeveloperMode(): Promise<boolean> {
  const result = await isDeveloperModeEnabled();
  return result.isDeveloperModeEnabled;
}
