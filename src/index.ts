import {
  NativeModules,
  NativeEventEmitter,
  Platform,
  EmitterSubscription,
} from 'react-native';

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

const emitter = new NativeEventEmitter(DeveloperModeNative);

const CHANGE_EVENT = 'developerModeChanged';

// ── Types ──────────────────────────────────────────────────────────────────

export interface DeveloperModeResult {
  /** Whether developer mode / developer options is active. */
  isDeveloperModeEnabled: boolean;
  /**
   * Android only: whether USB debugging (ADB) is enabled.
   * Always `false` on iOS.
   */
  isAdbEnabled: boolean;
}

// ── One-shot read ──────────────────────────────────────────────────────────

/**
 * Reads the current developer-mode state once.
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
 * Convenience helper that resolves to `true` when developer mode is active.
 */
export async function checkDeveloperMode(): Promise<boolean> {
  const result = await isDeveloperModeEnabled();
  return result.isDeveloperModeEnabled;
}

// ── Real-time listener ─────────────────────────────────────────────────────

/**
 * Subscribes to developer-mode state changes.
 *
 * **Android** — the callback fires immediately whenever the user toggles
 * Developer Options or USB debugging in the Settings app, even while your
 * app is running in the background. Powered by a `ContentObserver` on the
 * system settings URI.
 *
 * **iOS** — Apple provides no system-level callback for this setting, so the
 * callback fires when the app returns to the foreground *and* the value has
 * changed since the listener was last active.
 *
 * @example
 * ```ts
 * const subscription = addDeveloperModeListener((result) => {
 *   if (result.isDeveloperModeEnabled) {
 *     // warn the user or take protective action
 *   }
 * });
 *
 * // Clean up when done (e.g. in useEffect return)
 * return () => subscription.remove();
 * ```
 *
 * @param callback Invoked with the latest {@link DeveloperModeResult} on change.
 * @returns An {@link EmitterSubscription} — call `.remove()` to unsubscribe.
 */
export function addDeveloperModeListener(
  callback: (result: DeveloperModeResult) => void
): EmitterSubscription {
  return emitter.addListener(CHANGE_EVENT, callback);
}
