import { colors } from "@/constants/colors";
import {
  createData,
  getNotificationTokens,
  getOtherPhotos,
  sendPushNotification,
} from "@/contexts/Api";
import { useAppContext } from "@/contexts/AppContext";
import {
  Feather,
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ClientScreen() {
  const {
    fontFamilyObj,
    appState,
    showToast,
    setModalState,
    getLocation,
    setConfirmDialog,
  } = useAppContext();
  const router = useRouter();
  const params = useLocalSearchParams<{ isVehicleOut?: string }>();
  const isVehicleOut = params.isVehicleOut === "true";

  const {
    carObj: tempCarObj,
    bookingsArray,
    lastIndex,
    nativeLink,
    precostingData,
  } = appState || {};
  const [currentState, setCurrentState] = useState("REQUEST FOR TOWING");

  // Build carObj based on whether vehicle is out
  const carObj = isVehicleOut
    ? {
        Key_Ref: tempCarObj?.regNumber,
        fname: tempCarObj?.driverName,
        regNumber: tempCarObj?.regNumber,
        makeModel: tempCarObj?.makeModel,
        phoneNumber: tempCarObj?.driverPhone,
      }
    : {
        Key_Ref: tempCarObj?.Key_Ref,
        fname: tempCarObj?.Fisrt_Name,
        regNumber: tempCarObj?.Reg_No,
        makeModel: tempCarObj?.Make,
        phoneNumber: tempCarObj?.Cell_number,
      };

  const btns = [
    "Booking Photos",
    "W.I.P Photos",
    "Accident Photos",
    "Additional Photos",
    "Final Stage",
    "Quality Photos",
  ];

  const onBtnPressed = (category: string) => {
    let options: any = {};

    // replicate logic from main.tsx BodySection
    if (category === "Booking Photos") {
      options = {
        category: category.toUpperCase(),
        subCategory: bookingsArray?.[lastIndex] || "",
      };
    } else if (category === "W.I.P Photos") {
      setModalState?.({
        isVisible: true,
        attr: { headerText: "TAP TO SELECT STAGE", onModalClose },
      });
      return;
    } else if (category === "Security Checklist") {
      router.push("/security");
      return;
    } else if (category === "Document Scan") {
      router.push({
        pathname: "/document",
        params: { activeKeyRef: carObj.Key_Ref },
      });
      return;
    } else if (category === "ASK AI") {
      router.push("/chat");
      return;
    } else if (category === "AIS UPDATE") {
      router.push("/group-chat");
      return;
    } else if (category === "Insurance Details") {
      router.push("/insurance-details");
      return;
    } else {
      // map the usual photo categories to backend values
      switch (category) {
        case "Accident Photos":
          options = { category: "ACCIDENT", subCategory: "ACCIDENT" };
          break;
        case "Additional Photos":
          options = { category: "ADDITIONAL", subCategory: "ADDITIONAL" };
          break;
        case "Drivers Photos":
          options = { category: "DRIVERS", subCategory: "DRIVERS" };
          break;
        case "Parcel Photos":
          options = { category: "PARCEL", subCategory: "PARCEL" };
          break;
        case "Marketers Photos":
          options = { category: "MARKETERS", subCategory: "MARKETERS" };
          break;
        case "Clearance Photos":
          options = { category: "CLEARANCE", subCategory: "CLEARANCE" };
          break;
        case "Line M Photos":
          options = {
            category: "LINE MANAGER PHOTOS",
            subCategory: precostingData?.[0] || "",
          };
          break;
        default:
          options = {
            category: category.toUpperCase(),
            subCategory: category.toUpperCase(),
          };
      }
    }

    showCurrentGallery(options);
  };

  const showCurrentGallery = (options: {
    category: string;
    subCategory: string;
  }) => {
    router.push({
      pathname: "/gallery",
      params: { options: JSON.stringify(options), from: "CLIENT" },
    });
  };

  const onModalClose = (response: any) => {
    if (response?.action === "wip") {
      showCurrentGallery({
        category: "WORK IN PROGRESS",
        subCategory: response.value,
      });
    }
  };

  useEffect(() => {
    if (carObj.Key_Ref) {
      getOtherPhotos?.("WORK IN PROGRESS", carObj.Key_Ref, (result: any[]) => {
        if (result && result.length > 0) {
          setCurrentState(result[result.length - 1].stage);
        }
      });
    }
  }, [carObj.Key_Ref]);

  const handleTowingRequest = () => {
    setConfirmDialog?.({
      isVisible: true,
      text: "You are about to send a towing request, Press Request now button to proceed",
      okayBtn: "REQUEST NOW",
      cancelBtn: "Cancel",
      response: (res: boolean) => {
        if (res) {
          getLocation?.((location: any) => {
            const docId = Math.floor(
              Math.random() * 899999 + 100000,
            ).toString();
            createData?.("towingRequests", docId, {
              ...carObj,
              location,
              date: Date.now(),
              docId,
            });
            getNotificationTokens?.((results: any[]) => {
              if (results && results.length > 0) {
                results.forEach((item) => {
                  sendPushNotification?.(
                    item.token,
                    "NEW TOWING REQUEST",
                    carObj.fname +
                      " is requesting for a towing service. Please open your app for more",
                    {},
                  );
                });
                showToast?.(
                  "Thanks for your request, we will call you to arrange your towing!",
                );
              }
            });
          });
        }
      },
    });
  };

  const renderBtnIcon = (btn: string) => {
    const iconColor = colors.white;
    const iconSize = 72;
    switch (btn) {
      case "Booking Photos":
        return <FontAwesome name="ticket" color={iconColor} size={iconSize} />;
      case "W.I.P Photos":
        return (
          <MaterialIcons name="trending-up" color={iconColor} size={iconSize} />
        );
      case "Accident Photos":
        return (
          <FontAwesome5 name="car-crash" color={iconColor} size={iconSize} />
        );
      case "Additional Photos":
        return (
          <MaterialIcons name="add-a-photo" color={iconColor} size={iconSize} />
        );
      case "Final Stage":
        return (
          <MaterialIcons
            name="check-circle"
            color={iconColor}
            size={iconSize}
          />
        );
      case "Quality Photos":
        return (
          <MaterialIcons name="add-a-photo" color={iconColor} size={iconSize} />
        );
      default:
        return (
          <FontAwesome name="check-circle" color={iconColor} size={iconSize} />
        );
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          colors.white,
          colors.white,
          colors.white,
          colors.white,
          colors.white,
          colors.primary,
        ]}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView}>
          <LinearGradient
            colors={colors.loginGradient as any}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={styles.statusCard}
          >
            <View style={styles.statusBox}>
              <Text
                style={[
                  styles.statusTitle,
                  { fontFamily: fontFamilyObj?.fontBold },
                ]}
              >
                CURRENT STATUS
              </Text>
            </View>
            {currentState === "REQUEST FOR TOWING" || isVehicleOut ? (
              <TouchableOpacity
                onPress={handleTowingRequest}
                style={styles.statusButton}
              >
                <Text
                  style={[
                    styles.statusText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  {currentState}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.statusButton}>
                <Text
                  style={[
                    styles.statusText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  {currentState}
                </Text>
              </View>
            )}
          </LinearGradient>

          <View style={styles.contactRow}>
            <TouchableOpacity
              onPress={() =>
                nativeLink?.("call", { phoneNumber: "010 591 7550" })
              }
              style={styles.contactBtn}
            >
              <Feather size={48} name="phone" color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                !isVehicleOut &&
                router.push({
                  pathname: "/group-chat",
                  params: {
                    keyRef: carObj.Key_Ref,
                    senderId: carObj.Key_Ref,
                    senderName: carObj.fname,
                    from: "CLIENT",
                  },
                })
              }
              style={styles.contactBtn}
            >
              <Ionicons
                size={48}
                name="chatbubble-ellipses-outline"
                color={colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                nativeLink?.("email", {
                  email: "info@motoraccidentgroup.co.za",
                })
              }
              style={styles.contactBtn}
            >
              <Ionicons
                size={48}
                name="mail-open-outline"
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonsGrid}>
            {btns.map((btn, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => onBtnPressed(btn)}
                style={styles.actionBtn}
              >
                {renderBtnIcon(btn)}
                <Text
                  style={[
                    styles.actionBtnText,
                    { fontFamily: fontFamilyObj?.fontLight },
                  ]}
                >
                  {btn}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    marginTop: 5,
    borderRadius: 10,
  },
  gradient: { flex: 1, paddingTop: 10, borderRadius: 10 },
  scrollView: { padding: 10 },
  statusCard: {
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  statusBox: {
    borderTopLeftRadius: 50,
    borderBottomRightRadius: 50,
    backgroundColor: colors.white,
    height: 50,
    width: "90%",
    alignContent: "center",
    justifyContent: "center",
  },
  statusTitle: { textAlign: "center", color: colors.primary },
  statusButton: {
    marginTop: 15,
    borderRadius: 20,
    borderColor: "#eff",
    borderWidth: 1,
    padding: 10,
  },
  statusText: { textAlign: "center", color: colors.white, fontSize: 20 },
  contactRow: {
    backgroundColor: colors.greyLighter,
    flexDirection: "row",
    marginTop: 15,
    padding: 10,
    borderRadius: 10,
    flex: 1,
    alignContent: "center",
    alignItems: "center",
    justifyContent: "space-between",
  },
  contactBtn: {
    backgroundColor: colors.white,
    width: "30%",
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    padding: 5,
  },
  buttonsGrid: {
    flexDirection: "row",
    alignContent: "center",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginTop: 15,
  },
  actionBtn: {
    backgroundColor: colors.primary,
    width: "48%",
    borderRadius: 10,
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    minHeight: 120,
    marginTop: 10,
  },
  actionBtnText: { color: colors.white, textAlign: "center" },
});
