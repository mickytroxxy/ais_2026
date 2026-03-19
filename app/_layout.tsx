import ConfirmDialog from "@/components/ConfirmDialog";
import ModalController from "@/components/ModalController";
import { colors } from "@/constants/colors";
import { AppProvider, useAppContext } from "@/contexts/AppContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useOTA } from "@/hooks/useOTA";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "react-native-reanimated";

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const {
    confirmDialog,
    setConfirmDialog,
    modalState,
    setModalState,
    fontFamilyObj,
  } = useAppContext();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.header },
          headerShadowVisible: false,
          headerTintColor: colors.white,
          headerTitleStyle: {
            fontSize: 14,
            fontFamily: fontFamilyObj?.fontBold,
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="keyref" options={{ title: "" }} />
        <Stack.Screen name="main" options={{ title: "DASHBOARD" }} />
        <Stack.Screen name="client" options={{ title: "CLIENT DASHBOARD" }} />
        <Stack.Screen name="gallery" options={{ title: "PHOTO GALLERY" }} />
        <Stack.Screen name="camera" options={{ headerShown: false }} />
        <Stack.Screen name="barcode" options={{ headerShown: false }} />
        <Stack.Screen
          name="security"
          options={{ title: "SECURITY CHECKLIST" }}
        />
        <Stack.Screen name="chat" options={{ title: "ASK AI" }} />
        <Stack.Screen name="group-chat" options={{ title: "AIS UPDATE" }} />
        <Stack.Screen name="chatlist" options={{ title: "CHAT LIST" }} />
        <Stack.Screen name="comments" options={{ title: "COMMENTS" }} />
        <Stack.Screen name="company" options={{ title: "COMPANY PROFILE" }} />
        <Stack.Screen name="document" options={{ title: "DOCUMENT SCANNER" }} />
        <Stack.Screen name="pdf-viewer" options={{ title: "PDF VIEWER" }} />
        <Stack.Screen name="progress" options={{ title: "PROGRESS" }} />
        <Stack.Screen name="quality" options={{ title: "QUALITY CONTROL" }} />
        <Stack.Screen name="towing" options={{ title: "TOWING REQUESTS" }} />
        <Stack.Screen name="additem" options={{ title: "NEW CLIENT" }} />
        <Stack.Screen name="addpaint" options={{ title: "NEW PAINT" }} />
        <Stack.Screen name="addstock" options={{ title: "NEW STOCK" }} />
        <Stack.Screen
          name="insurance-details"
          options={{ title: "INSURANCE DETAILS" }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
      <ConfirmDialog
        modalState={confirmDialog}
        setConfirmDialog={setConfirmDialog}
      />
      <ModalController modalState={modalState} setModalState={setModalState} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const {} = useOTA();
  return (
    <AppProvider>
      <KeyboardProvider>
        <RootLayoutNav />
      </KeyboardProvider>
    </AppProvider>
  );
}
