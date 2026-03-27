import { useEffect } from "react";
import { Alert, Platform, Text, View } from "react-native";

import * as ExpoInAppUpdates from "expo-in-app-updates";

const useInAppUpdates = () => {
    useEffect(() => {
        if (false || Platform.OS === "web") return;

        const checkForUpdates = async () => {
            try {
                if (Platform.OS === "android") {
                    await ExpoInAppUpdates.checkAndStartUpdate(false);
                } else {
                    const result = await ExpoInAppUpdates.checkForUpdate();
                    if (!result.updateAvailable) return;
                    // alert do iOS...
                }
            } catch (err) {
                // ignora silenciosamente em dev
                if (__DEV__) return;
                console.error("Update check failed:", err);
            }
        };

        checkForUpdates();
    }, []);
};

export default function InAppUpdates() {
    // Use this hook in your root app or root layout component
    useInAppUpdates();

   return null;
}