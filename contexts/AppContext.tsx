import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";

// ensure notifications behave consistently across the app (banner, sound, badge)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
// @ts-ignore - ngeohash doesn't have TypeScript definitions
import { colors } from "@/constants/colors";
import {
  DEVICE_TOKENS_COLLECTION,
  FIREBASE_CONFIG,
} from "@/contexts/FirebaseConfig";
import { getApps, initializeApp } from "firebase/app";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import geohash from "ngeohash";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Alert, Linking, Platform, ToastAndroid } from "react-native";

interface AppContextType {
  fontFamilyObj: { fontLight: string; fontBold: string } | null;
  accountInfo: any;
  setAccountInfo: (info: any) => void;
  modalState: any;
  setModalState: (state: any) => void;
  confirmDialog: any;
  setConfirmDialog: (dialog: any) => void;
  appState: any;
  showToast: (message: string) => void;
  getLocation: (cb: (location: any) => void) => void;
  /** Expo push token for this device, may be null until granted */
  pushToken: string | null;
  /** Ensure the current device is registered for pushes; returns token or null */
  registerForPushNotifications: () => Promise<string | null>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [fontFamilyObj, setFontFamilyObj] = useState<{
    fontLight: string;
    fontBold: string;
  } | null>(null);
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [modalState, setModalState] = useState({
    isVisible: false,
    attr: { headerText: "HEADER TEXT" },
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isVisible: false,
    text: "Would you like to come today for a fist?",
    okayBtn: "VERIFY",
    cancelBtn: "CANCEL",
    isSuccess: false,
  });
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [directories, setDirectories] = useState<any>(null);
  const [activeProfile, setActiveProfile] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [carObj, setCarObj] = useState<any>(null);
  const [carObject, setCarObject] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<any>(null);
  const [pushToken, setPushToken] = useState<string | null>(null);

  // helper that requests permissions and obtains a token
  const registerForPushNotifications = useCallback(async (): Promise<
    string | null
  > => {
    try {
      const { status: existing } = await Notifications.getPermissionsAsync();
      let finalStatus = existing;
      if (existing !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") return null;

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("ais-update", {
          name: "AIS Update",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: colors.primary,
          sound: "default",
        });
      }

      // For native builds (dev builds), we need to prioritize Expo Push Tokens
      // because the current notification backend uses Expo's push service.
      // The Expo Push Token can work with native builds when properly configured.
      // Device tokens (APNs/FCM) require different backend handling.
      let pushTokenData: string | null = null;

      if (Platform.OS !== "web") {
        try {
          // First try to get Expo Push Token - this works with Expo's push service
          // which can forward to APNs (iOS) and FCM (Android) when credentials are configured
          const expoTokenData = await Notifications.getExpoPushTokenAsync();
          pushTokenData = expoTokenData.data;
          console.log(
            "[AppProvider] registered Expo push token",
            pushTokenData,
          );
        } catch (expoTokenError) {
          // Fall back to device token if Expo token fails
          console.log(
            "[AppProvider] Expo push token not available, trying device token",
            expoTokenError,
          );
          try {
            const deviceToken = await Notifications.getDevicePushTokenAsync();
            pushTokenData = deviceToken.data;
            console.log(
              "[AppProvider] registered device push token",
              pushTokenData,
            );
          } catch (deviceTokenError) {
            console.log(
              "[AppProvider] All push token methods failed",
              deviceTokenError,
            );
          }
        }
      } else {
        // Web fallback
        const tokenData = await Notifications.getExpoPushTokenAsync();
        pushTokenData = tokenData.data;
      }

      setPushToken(pushTokenData);

      // Store push token in Firestore for push notifications
      if (pushTokenData) {
        try {
          const firebaseApp =
            getApps().length === 0
              ? initializeApp(FIREBASE_CONFIG)
              : getApps()[0];
          const db = getFirestore(firebaseApp);

          // Use the token itself as the document ID for easy lookup
          const tokenDocRef = doc(db, DEVICE_TOKENS_COLLECTION, pushTokenData);
          await setDoc(
            tokenDocRef,
            {
              token: pushTokenData,
              platform: Platform.OS,
              createdAt: new Date(),
              updatedAt: new Date(),
              // You can add more fields like user ID, device info, etc.
            },
            { merge: true },
          );
          console.log("[AppProvider] Push token stored in Firestore");
        } catch (firestoreError) {
          console.log(
            "[AppProvider] Error storing token in Firestore:",
            firestoreError,
          );
        }
      }

      return pushTokenData;
    } catch (err) {
      console.log("[AppProvider] push registration failed", err);
      return null;
    }
  }, []);

  // register once on mount
  React.useEffect(() => {
    registerForPushNotifications();
  }, [registerForPushNotifications]);
  const [precostingData, setPrecostingData] = useState<any>(null);
  const [bookingsArray, setBookingsArray] = useState<any[]>([
    "Licence Disk",
    "Front Bumper",
    "Bonnet",
    "Right Front Fender",
    "Right Front Door Mirror",
    "Right Front Door",
    "Right Rear Door",
    "Right Rear Fender",
    "Boot",
    "Right Rear Tyre",
    "Left Rear Tyre",
    "Left Rear Fender",
    "Left Rear Door",
    "Left Front Door",
    "Left Front Door Mirror",
    "Left Front Fender",
    "Left Front Headlamp",
    "Right Front Headlamp",
    "Front WindScreen",
    "Roof",
    "Engine",
    "Left Front Tyre",
    "Right Front Tyre",
    "Spare wheel",
    "Inside Boot",
    "Left Front Door Inner Panel",
    "Right Front Door Inner Panel",
    "Left Rear Door Inner Panel",
    "Right Rear Door Inner Panel",
    "Right Front Carpet",
    "Left Front Carpet",
    "Right Rear Carpet",
    "Left Rear Carpet",
    "Left Front Seat",
    "Right Front Seat",
    "Rear Seats",
    "Instrument Cover",
    "Instrument Cluster",
    "Console",
    "Headlining",
    "Radio",
    "Towing Invoice",
    "Parcel 1",
    "Parcel 2",
    "Parcel 3",
    "Keys",
  ]);
  const [lastIndex, setLastIndex] = useState(0);
  const [lastIndexOfLine, setLastIndexOfLine] = useState(0);

  const customFonts = {
    fontLight: require("../assets/fonts/MontserratAlternates-Light.otf"),
    fontBold: require("../assets/fonts/MontserratAlternates-Bold.otf"),
  };

  React.useEffect(() => {
    loadFontsAsync();
  }, []);

  const loadFontsAsync = async () => {
    await Font.loadAsync(customFonts);
    setFontFamilyObj({ fontLight: "fontLight", fontBold: "fontBold" });
  };

  const getLocation = (cb: (location: any) => void) => {
    if (currentLocation) {
      cb(currentLocation);
    } else {
      getCurrentLocation((latitude, longitude, heading, hash) => {
        setCurrentLocation({ latitude, longitude, heading, hash });
        cb({ latitude, longitude, heading, hash });
      });
    }
    getCurrentLocation((latitude, longitude, heading, hash) =>
      setCurrentLocation({ latitude, longitude, heading, hash }),
    );
  };

  const setActiveAccount = (id: string) =>
    setActiveProfile(directories.filter((item: any) => item.docId === id)[0]);

  const saveUser = async (user: any) => {
    try {
      console.log("saveUser called with:", user);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      setAccountInfo(user);
      return true;
    } catch (e) {
      showToast(String(e));
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      setAccountInfo(null);
      return true;
    } catch (e) {
      showToast(String(e));
      return false;
    }
  };

  const getUser = async (cb: (result: boolean) => void) => {
    try {
      const user = await AsyncStorage.getItem("user");
      if (user) {
        setAccountInfo(JSON.parse(user));
        cb(true);
      } else {
        cb(false);
      }
    } catch (e) {
      showToast(String(e));
      cb(false);
    }
  };

  const getLastIndex = async () => {
    try {
      const savedIndex = await AsyncStorage.getItem("lastIndex");
      const Key_Ref = await AsyncStorage.getItem("Key_Ref");
      if (Key_Ref == carObj?.Key_Ref) {
        if (savedIndex) {
          setLastIndex(parseInt(savedIndex));
        }
      } else {
        setLastIndex(0);
      }
    } catch (e) {
      showToast(String(e));
    }
  };

  const changeLastIndex = async (currentIndex: number) => {
    const newIndex = currentIndex + 1;
    setLastIndex(newIndex);
    await AsyncStorage.setItem("lastIndex", newIndex.toString());
    await AsyncStorage.setItem("Key_Ref", carObj.Key_Ref.toString());
  };

  const changeLastIndexOfLine = (currentIndex: number) => {
    const newIndex = currentIndex + 1;
    if (newIndex + 1 <= precostingData?.length) {
      setLastIndexOfLine(newIndex);
    }
  };

  const takePicture = async (type: string, cb: (uri: string) => void) => {
    const permissionRes = await ImagePicker.requestCameraPermissionsAsync();
    const mediaPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaPermission.granted || permissionRes.granted) {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: type == "avatar" ? [1, 1] : undefined,
        quality: 0.5,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        cb(result.assets[0].uri);
      }
    }
  };

  const pickImage = async (type: string, cb: (uri: string) => void) => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted) {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: type == "avatar" ? [1, 1] : undefined,
        quality: 0.5,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        cb(result.assets[0].uri);
      }
    }
  };

  const sendSms = (phoneNo: string, msg: string) => {
    var request = new XMLHttpRequest();
    request.open("POST", "https://rest.clicksend.com/v3/sms/send");
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader(
      "Authorization",
      "Basic aW5mb0BlbXBpcmVkaWdpdGFscy5jb206ZW1waXJlRGlnaXRhbHMxIUA=",
    );
    request.onreadystatechange = function () {
      showToast("message sent to " + phoneNo);
    };
    var body = {
      messages: [
        {
          source: "javascript",
          from: "uberFlirt",
          body: msg,
          to: phoneNo,
          schedule: "",
          custom_string: "",
        },
      ],
    };
    request.send(JSON.stringify(body));
  };

  const phoneNoValidation = (phone: string) => {
    let phoneNumber = phone.replace(/ /g, "");
    if (phoneNumber.length < 16 && phoneNumber.length > 7) {
      if (
        phoneNumber[0] === "0" &&
        phoneNumber[1] !== "0" &&
        phoneNumber.length === 10
      ) {
        phoneNumber = "27" + phoneNumber.slice(1, phoneNumber.length);
      } else if (phoneNumber[0] !== "0") {
        phoneNumber = phoneNumber;
      }
      return phoneNumber;
    } else {
      return "Incorrect phone number";
    }
  };

  const nativeLink = (type: string, obj: any) => {
    if (type === "map") {
      const scheme = Platform.select({
        ios: "maps:0,0?q=",
        android: "geo:0,0?q=",
      });
      const latLng = `${obj.lat},${obj.lng}`;
      const label = obj.label;
      const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`,
      });
      Linking.openURL(url!);
    } else if (type === "call") {
      let phoneNumber = obj.phoneNumber;
      if (Platform.OS !== "android") {
        phoneNumber = `telprompt:${obj.phoneNumber}`;
      } else {
        phoneNumber = `tel:${obj.phoneNumber}`;
      }
      Linking.canOpenURL(phoneNumber)
        .then((supported) => {
          if (!supported) {
            Alert.alert("Phone number is not available");
          } else {
            return Linking.openURL(phoneNumber);
          }
        })
        .catch((err) => console.log(err));
    } else if (type === "email") {
      Linking.openURL(`mailto:${obj.email}`);
    }
  };

  // Memoize appState to prevent recreating on every render
  const appState = useMemo(
    () => ({
      directories,
      carObject,
      bookingsArray,
      getLastIndex,
      changeLastIndex,
      changeLastIndexOfLine,
      setBookingsArray,
      lastIndex,
      setLastIndex,
      lastIndexOfLine,
      setLastIndexOfLine,
      setCarObject,
      nativeLink,
      logout,
      getUser,
      saveUser,
      setDirectories,
      activeProfile,
      setActiveAccount,
      takePicture,
      pickImage,
      sendSms,
      phoneNoValidation,
      searchResults,
      setSearchResults,
      imageUrl,
      setImageUrl,
      carObj,
      setCarObj,
      precostingData,
      setPrecostingData,
    }),
    [
      directories,
      carObject,
      bookingsArray,
      lastIndex,
      lastIndexOfLine,
      activeProfile,
      searchResults,
      imageUrl,
      carObj,
      precostingData,
    ],
  );

  // DIAGNOSTIC: Log when fontFamilyObj changes
  React.useEffect(() => {
    console.log(
      "[AppProvider] fontFamilyObj changed, children will render:",
      fontFamilyObj !== null,
    );
  }, [fontFamilyObj]);

  // Memoize context value to prevent infinite re-renders
  const contextValue = useMemo(
    () => ({
      appState,
      showToast,
      getLocation,
      setAccountInfo,
      accountInfo,
      fontFamilyObj,
      setModalState,
      confirmDialog,
      setConfirmDialog,
      modalState,
      pushToken,
      registerForPushNotifications,
    }),
    [
      appState,
      accountInfo,
      fontFamilyObj,
      confirmDialog,
      modalState,
      pushToken,
      registerForPushNotifications,
    ],
  );

  return (
    <AppContext.Provider value={contextValue}>
      {fontFamilyObj && children}
    </AppContext.Provider>
  );
};

const getCurrentLocation = (
  cb: (
    latitude: number,
    longitude: number,
    heading: number,
    hash: string,
  ) => void,
) => {
  const latitude = -26.2163;
  const longitude = 28.0369;

  (async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      const hash = geohash.encode(latitude, longitude);
      cb(latitude, longitude, 0, hash);
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude: lat, longitude: lng } = location.coords;
      const heading = location.coords.heading || 0;
      const hash = geohash.encode(lat, lng);
      cb(lat, lng, heading, hash);
    } catch (error) {
      const hash = geohash.encode(latitude, longitude);
      cb(latitude, longitude, 0, hash);
    }
  })();
};

const showToast = (message: string) => {
  if (Platform.OS == "android") {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else {
    alert(message);
  }
};
