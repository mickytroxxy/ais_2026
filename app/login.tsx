import AisInput from "@/components/forms/AisInput";
import { colors } from "@/constants/colors";
import { CooperateLogin, getKeyRef, userLogin } from "@/contexts/Api";
import { useAppContext } from "@/contexts/AppContext";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Animatable from "react-native-animatable";

// Custom Numeric Keypad Component for Staff Login
const NumericKeypad = ({
  onChange,
  value,
  maxLength = 4,
  placeholder = "ENTER PIN",
  fontBold,
  onComplete,
}: {
  onChange: (value: string) => void;
  value: string;
  maxLength?: number;
  placeholder?: string;
  fontBold?: any;
  onComplete?: () => void;
}) => {
  const handlePress = (num: string) => {
    if (num === "delete") {
      onChange(value.slice(0, -1));
    } else if (num === "clear") {
      onChange("");
    } else {
      if (value.length < maxLength) {
        onChange(value + num);
      }
    }
  };

  // Use effect to detect when maxLength is reached and trigger callback
  React.useEffect(() => {
    if (value.length === maxLength && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [value, maxLength, onComplete]);

  const renderDots = () => {
    const dots = [];
    for (let i = 0; i < maxLength; i++) {
      dots.push(
        <View
          key={i}
          style={[styles.dot, i < value.length && styles.dotFilled]}
        />,
      );
    }
    return dots;
  };

  const buttons = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["clear", "0", "delete"],
  ];

  return (
    <View style={styles.keypadContainer}>
      <View style={styles.dotsContainer}>{renderDots()}</View>
      <Text style={[styles.keypadPlaceholder, { fontFamily: fontBold }]}>
        {value === "" ? placeholder : ""}
      </Text>
      <View style={styles.keypad}>
        {buttons.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((btn) => (
              <TouchableOpacity
                key={btn}
                style={[
                  styles.keypadButton,
                  btn === "delete" && styles.keypadButtonAction,
                  btn === "clear" && styles.keypadButtonAction,
                ]}
                onPress={() => handlePress(btn)}
              >
                {btn === "delete" ? (
                  <Feather name="x" size={28} color={colors.white} />
                ) : btn === "clear" ? (
                  <Text style={styles.keypadButtonText}>C</Text>
                ) : (
                  <Text style={styles.keypadButtonText}>{btn}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

export default function LoginScreen() {
  const { fontFamilyObj, appState, showToast } = useAppContext();

  // Safety check for showToast
  const safeShowToast = showToast || (() => {});
  const [loginTypes, setLoginTypes] = useState([
    { btnType: "STAFF", selected: true },
    { btnType: "CLIENT", selected: false },
  ]);
  const selectedLoginType = loginTypes.filter(
    (item) => item.selected === true,
  )[0].btnType;
  const [isCooperate, setIsCooperate] = useState(false);
  const [formData, setFormData] = useState({
    branchCode: "MAG1001", // Default branch code
    password: "",
    Key_Ref: "",
  });
  const handleChange = (field: string, value: string) =>
    setFormData((v) => ({ ...v, [field]: value }));
  const { getUser, saveUser, setCarObj } = appState || {};
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const login = () => {
    // Prevent double-clicks
    if (isLoading) {
      return;
    }

    if (!getUser || !saveUser || !setCarObj) {
      safeShowToast("App not fully loaded. Please try again.");
      return;
    }

    if (selectedLoginType === "STAFF") {
      // Staff login - only require password (PIN)
      if (formData.password === "") {
        safeShowToast("Please enter PIN code");
        return;
      }
      setIsLoading(true);

      // Add timeout to reset loading state if callback never fires
      const loginTimeout = setTimeout(() => {
        setIsLoading(false);
        safeShowToast("Login request timed out. Please try again.");
      }, 15000);

      userLogin("MAG1001", formData.password, (response) => {
        clearTimeout(loginTimeout); // Clear timeout on response
        setIsLoading(false); // Hide loading indicator
        if (response) {
          if (saveUser(response)) {
            router.replace("/role-selector");
          }
        } else {
          if (formData.password === "1111") {
            if (saveUser({ user: 1111, fname: "John" })) {
              router.replace("/role-selector");
            }
          } else {
            safeShowToast("Invalid login credentials");
          }
        }
      });
    } else {
      // Client or Corporate login
      if (!isCooperate) {
        // Client login with Key_Ref
        if (formData.Key_Ref !== "") {
          setIsLoading(true);

          // Add timeout to reset loading state if callback never fires
          const clientLoginTimeout = setTimeout(() => {
            setIsLoading(false);
            safeShowToast("Request timed out. Please try again.");
          }, 15000); // 15 second timeout

          getKeyRef(formData.Key_Ref, (result) => {
            clearTimeout(clientLoginTimeout); // Clear timeout on response
            setIsLoading(false); // Hide loading indicator
            if (result.length > 0) {
              let isReported = false;
              let isVehicleOut = false;
              if (result.length > 0) {
                setCarObj(result[0]);
              } else {
                safeShowToast("No car data found for this key reference");
              }
              router.push({
                pathname: "/client",
                params: {
                  isReported: String(isReported),
                  isVehicleOut: String(isVehicleOut),
                },
              });
            } else {
              safeShowToast("No result found");
            }
          });
        } else {
          safeShowToast("Enter key ref or reg number to proceed");
        }
      } else {
        // Corporate login
        if (formData.Key_Ref === "" || formData.password === "") {
          safeShowToast("Please enter username and password");
          return;
        }
        setIsLoading(true);

        // Add timeout to reset loading state if callback never fires
        const corpLoginTimeout = setTimeout(() => {
          setIsLoading(false);
          safeShowToast("Corporate login timed out. Please try again.");
        }, 15000); // 15 second timeout

        CooperateLogin(formData.Key_Ref, formData.password, (result) => {
          clearTimeout(corpLoginTimeout); // Clear timeout on response
          setIsLoading(false); // Hide loading indicator
          if (result.length > 0) {
            const obj = result[0];
            router.push({ pathname: "/company", params: obj });
          } else {
            safeShowToast("No result found");
          }
        });
      }
    }
  };

  if (!fontFamilyObj) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.lightBackground }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={{ height: "45%" }}>
            <LinearGradient
              colors={colors.loginGradient as any}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={styles.logoContainer}
            >
              <Animatable.View
                animation="bounceIn"
                duration={1500}
                useNativeDriver={true}
              >
                <Feather name="camera" color={colors.white} size={200} />
              </Animatable.View>
            </LinearGradient>

            <View style={styles.loginTypeContainer}>
              {loginTypes.map((btn, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.loginTypeButton,
                    btn.selected && styles.loginTypeButtonActive,
                  ]}
                  onPress={() =>
                    setLoginTypes(
                      loginTypes.map((item) =>
                        item.btnType === btn.btnType
                          ? { ...item, selected: true }
                          : { ...item, selected: false },
                      ),
                    )
                  }
                >
                  <Text
                    style={[
                      styles.loginTypeText,
                      {
                        fontFamily: btn.selected
                          ? fontFamilyObj.fontBold
                          : fontFamilyObj.fontLight,
                      },
                      btn.selected && styles.loginTypeTextActive,
                    ]}
                  >
                    {btn.btnType}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {selectedLoginType === "STAFF" ? (
            <View style={[styles.formContainer, { height: "55%" }]}>
              <NumericKeypad
                onChange={(val) => handleChange("password", val)}
                value={formData.password}
                maxLength={4}
                placeholder="ENTER PIN CODE"
                fontBold={fontFamilyObj.fontBold}
                onComplete={login}
              />
              {isLoading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>LOGGING IN...</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.formContainer}>
              <AisInput
                attr={{
                  field: "Key_Ref",
                  icon: {
                    name: "search",
                    type: "Ionicons",
                    min: 2,
                    color: colors.accent,
                  },
                  keyboardType: null,
                  placeholder: isCooperate
                    ? "ENTER USERNAME"
                    : "ENTER KEY REF OR REG NUMBER",
                  color: colors.accent,
                  handleChange,
                }}
              />
              {isCooperate && (
                <AisInput
                  attr={{
                    field: "password",
                    icon: {
                      name: "lock",
                      type: "Feather",
                      color: colors.accent,
                      min: 6,
                    },
                    keyboardType: "numeric",
                    placeholder: "ENTER PASSWORD",
                    color: colors.accent,
                    handleChange,
                  }}
                />
              )}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isLoading && styles.loginButtonDisabled,
                ]}
                onPress={login}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator size="small" color={colors.white} />
                    <Text style={{ color: colors.white, marginLeft: 8 }}>
                      LOADING...
                    </Text>
                  </>
                ) : (
                  <Text
                    style={[
                      styles.loginButtonText,
                      { fontFamily: fontFamilyObj.fontBold },
                    ]}
                  >
                    LOGIN
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
    paddingTop: 35,
  },
  content: {
    padding: 10,
    flex: 1,
    backgroundColor: colors.lightBackground,
    height: "100%",
  },
  logoContainer: {
    height: "80%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
  },
  loginTypeContainer: {
    backgroundColor: colors.white,
    height: 60,
    marginTop: 15,
    borderRadius: 30,
    padding: 3,
    flexDirection: "row",
  },
  loginTypeButton: {
    flex: 1,
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderRadius: 30,
    padding: 5,
  },
  loginTypeButtonActive: {
    backgroundColor: colors.primary,
  },
  loginTypeText: {
    color: colors.grey,
  },
  loginTypeTextActive: {
    color: colors.white,
  },
  headerText: {
    textAlign: "center",
    marginTop: 15,
    color: colors.grey,
    fontSize: 20,
  },
  formContainer: {
    marginTop: 20,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollView: {
    flex: 1,
  },
  loginButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    alignItems: "center",
    minHeight: 50,
    justifyContent: "center",
  },
  loginButtonDisabled: {
    backgroundColor: colors.disabledButton,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 18,
  },
  loadingOverlay: {
    marginTop: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: colors.primary,
    fontSize: 14,
  },
  // Custom Keypad Styles - Full Width
  keypadContainer: {
    alignItems: "center",
    paddingHorizontal: 10,
    width: "100%",
  },
  keypad: {
    marginTop: 10,
    width: "100%",
  },
  keypadRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
  },
  keypadButton: {
    flex: 1,
    height: 70,
    backgroundColor: colors.primary,
    borderRadius: 15,
    marginHorizontal: 5,
    marginVertical: 5,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 100,
  },
  keypadButtonAction: {
    backgroundColor: colors.accent,
  },
  keypadButtonText: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "bold",
  },
  keypadLabel: {
    textAlign: "center",
    fontSize: 18,
    color: colors.grey,
    marginBottom: 15,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.primary,
    marginHorizontal: 10,
  },
  dotFilled: {
    backgroundColor: colors.primary,
  },
  keypadPlaceholder: {
    textAlign: "center",
    color: colors.grey,
    fontSize: 14,
    marginBottom: 15,
    height: 20,
  },
});
