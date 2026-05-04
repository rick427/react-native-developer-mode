#import "DeveloperMode.h"
#import <React/RCTLog.h>

#if __has_include(<DeviceCheck/DeviceCheck.h>)
  #import <DeviceCheck/DeviceCheck.h>
#endif

@implementation DeveloperMode

RCT_EXPORT_MODULE()

/**
 * Checks whether Developer Mode is enabled on the device.
 *
 * iOS 16+: Uses DCDevice.currentDevice.developerModeEnabled (requires DeviceCheck.framework).
 * iOS < 16: Developer Mode does not exist as a formal concept; always returns false.
 *
 * Note: `isAdbEnabled` is always false on iOS (USB debugging is Android-only).
 */
RCT_EXPORT_METHOD(isDeveloperModeEnabled:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    BOOL devModeEnabled = NO;

#if __has_include(<DeviceCheck/DeviceCheck.h>)
    if (@available(iOS 16.0, *)) {
        devModeEnabled = DCDevice.currentDevice.developerModeEnabled;
    }
#endif

    resolve(@{
        @"isDeveloperModeEnabled": @(devModeEnabled),
        @"isAdbEnabled": @(NO)
    });
}

// Ensure the module runs on the main queue is NOT required here
// since we only read a synchronous property.
+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

@end
