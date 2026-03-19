import { colors } from "@/constants/colors";
import { useAppContext } from "@/contexts/AppContext";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import LoginScreen from "./login";

export default function Home() {
  const { appState } = useAppContext();
  const { getUser } = appState || {};
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    getUser((res: boolean) => {
      console.log("[Index] Auth check result:", res);
      if (res) {
        // User is logged in - navigate to keyref using replace (no back button)
        router.replace("/keyref");
      } else {
        setIsLoggedIn(false);
      }
    });
  }, []);

  // Show loading while checking auth and redirecting
  if (isLoggedIn === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.lightBackground,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // User is not logged in - show login screen
  return <LoginScreen />;
}
