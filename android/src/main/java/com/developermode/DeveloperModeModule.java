package com.developermode;

import android.content.Context;
import android.os.Build;
import android.provider.Settings;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

public class DeveloperModeModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public DeveloperModeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "DeveloperMode";
    }

    /**
     * Checks whether Developer Options is enabled on the device.
     *
     * On Android 4.1+ (API 16) this is stored in Settings.Global.DEVELOPMENT_SETTINGS_ENABLED.
     * USB debugging (ADB) is tracked separately via Settings.Global.ADB_ENABLED.
     */
    @ReactMethod
    public void isDeveloperModeEnabled(Promise promise) {
        try {
            Context context = reactContext.getApplicationContext();

            boolean devOptions = false;
            boolean adbEnabled = false;

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
                devOptions = Settings.Global.getInt(
                        context.getContentResolver(),
                        Settings.Global.DEVELOPMENT_SETTINGS_ENABLED,
                        0
                ) != 0;

                adbEnabled = Settings.Global.getInt(
                        context.getContentResolver(),
                        Settings.Global.ADB_ENABLED,
                        0
                ) != 0;
            }

            WritableMap result = new WritableNativeMap();
            result.putBoolean("isDeveloperModeEnabled", devOptions);
            result.putBoolean("isAdbEnabled", adbEnabled);

            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("DEVELOPER_MODE_ERROR", e.getMessage(), e);
        }
    }
}
