const { withAndroidManifest } = require("@expo/config-plugins");

/**
 * Adds the Notifee ForegroundService to AndroidManifest.xml with the
 * foregroundServiceType required by Android 14+ (targetSDK >= 34).
 * Without this declaration the service crashes immediately on launch.
 */
module.exports = function withNotifee(config) {
    return withAndroidManifest(config, (cfg) => {
        const app = cfg.modResults.manifest.application[0];

        if (!app.service) {
            app.service = [];
        }

        const NOTIFEE_SERVICE = "app.notifee.core.ForegroundService";

        // Only add if not already present
        const exists = app.service.some(
            (s) => s.$?.["android:name"] === NOTIFEE_SERVICE,
        );

        if (!exists) {
            app.service.push({
                $: {
                    "android:name": NOTIFEE_SERVICE,
                    "android:exported": "false",
                    "android:stopWithTask": "true",
                    // Required on Android 14+ — use dataSync for a timer/session tracker
                    "android:foregroundServiceType": "dataSync",
                },
            });
        } else {
            // Ensure the attribute is set on an existing entry
            app.service.forEach((s) => {
                if (s.$?.["android:name"] === NOTIFEE_SERVICE) {
                    s.$["android:foregroundServiceType"] = "dataSync";
                }
            });
        }

        return cfg;
    });
};
