import * as Updates from "expo-updates";
import { useEffect } from "react";

export const useOTA = () => {
  useEffect(() => {
    // Updates.checkForUpdateAsync is not supported in development builds.
    // Avoid calling it in dev / Expo Go to prevent rejected promises.
    if (__DEV__) {
      return;
    }

    async function fetchUpdate() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (error) {
        // Swallow unsupported / network errors so they don't crash the app.
        console.log("OTA update check failed:", error);
      }
    }

    fetchUpdate();
  }, []);

  return {};
};
