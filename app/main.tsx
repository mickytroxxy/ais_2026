import ParallaxScrollView from "@/components/parallax-scroll-view";
import { colors } from "@/constants/colors";
import { getNetworkStatus } from "@/contexts/Api";
import { useAppContext } from "@/contexts/AppContext";
import { useRoleStore } from "@/stores/roleStore";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Animatable from "react-native-animatable";

// Define action categories with their buttons and icons
const actionCategories: {
  [key: string]: { title: string; buttons: string[]; icon: string };
} = {
  security: {
    title: "Security",
    icon: "security",
    buttons: ["Security Photos", "Security Checklist", "AIS UPDATE"],
  },
  estimators: {
    title: "Estimators",
    icon: "calculate",
    buttons: [
      "W.I.P Photos",
      "Add Notes",
      "Accident Photos",
      "Additional Photos",
      "ASK AI",
      "AIS UPDATE",
      "Documents",
    ],
  },
  marketers: {
    title: "Marketers",
    icon: "campaign",
    buttons: [
      "Marketers Photos",
      "Accident Photos",
      "New Client",
      "Notes",
      "Insurance Details",
      "ASK AI",
      "AIS UPDATE",
      "Documents",
    ],
  },
  customerCare: {
    title: "Customer Care",
    icon: "support-agent",
    buttons: [
      "Notes",
      "Quality Photos",
      "Driver License Photo",
      //"Clearance Photos",
      "Documents",
      "Send SMS",
      "ASK AI",
      "AIS UPDATE",
    ],
  },
  lineManagers: {
    title: "Line Managers",
    icon: "supervisor-account",
    buttons: [
      //"Drivers Photos",
      "Quality Control",
      "Quality Photos",
      "Line M Photos",
      "Car Rental",
      "W.I.P Photos",
      "Additional Photos",
      "Documents",
      "ASK AI",
      "AIS UPDATE",
    ],
  },
};

// Render category icon based on category key
const renderCategoryIcon = (
  categoryKey: string,
  size: number = 28,
  color: string = colors.primary,
) => {
  const iconName = actionCategories[categoryKey]?.icon || "category";
  return <MaterialIcons name={iconName as any} size={size} color={color} />;
};

export default function Main() {
  const { height } = Dimensions.get("screen");
  const params = useLocalSearchParams();
  const { selectedRole: storedRole } = useRoleStore();
  const paramRole = params.role as string;
  const initialRole = paramRole || storedRole || "security";
  const PARALLAX_HEIGHT = parseInt(
    (0.475 * parseFloat(height.toString())).toFixed(0),
  );
  const [selectedCategory] = useState(initialRole);

  return (
    <View style={styles.container}>
      <ParallaxScrollView
        headerImage={<HeaderSection selectedCategory={selectedCategory} />}
        headerBackgroundColor={{
          dark: colors.primary,
          light: colors.headerLight,
        }}
        headerHeight={PARALLAX_HEIGHT}
      >
        <BodySection selectedCategory={selectedCategory} />
      </ParallaxScrollView>
    </View>
  );
}

const HeaderSection = ({ selectedCategory }: { selectedCategory: string }) => {
  const { fontFamilyObj, appState } = useAppContext();
  const { carObj } = appState;
  const activeKeyRef = carObj?.Key_Ref || "N/A";

  return (
    <View style={{ position: "relative", flex: 1 }}>
      <LinearGradient
        colors={colors.loginGradient as any}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <Animatable.View
          animation="bounceIn"
          duration={1500}
          useNativeDriver={true}
          style={styles.keyRefBox}
        >
          <View style={{ flexDirection: "row" }}>
            <FontAwesome
              name="key"
              color={colors.white}
              size={30}
              style={{ flex: 1 }}
            />
            <View style={[styles.keyRefBadge, { borderTopLeftRadius: 30 }]}>
              <Text
                style={{
                  color: colors.white,
                  fontFamily: fontFamilyObj?.fontBold,
                }}
              >
                {activeKeyRef}
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              marginTop: 10,
              borderTopWidth: 1,
              borderTopColor: "rgba(255,255,255,0.3)",
              paddingTop: 10,
            }}
          >
            <FontAwesome
              name="drivers-license"
              color={colors.white}
              size={30}
              style={{ flex: 1 }}
            />
            <View style={[styles.keyRefBadge, { borderBottomLeftRadius: 30 }]}>
              <Text
                style={{
                  color: colors.white,
                  fontFamily: fontFamilyObj?.fontBold,
                }}
              >
                {carObj?.Reg_No || "N/A"}
              </Text>
            </View>
          </View>
        </Animatable.View>

        {/* Category Display (no dropdown) */}
        <View style={styles.categoryDisplay}>
          <View style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>
            <Text
              style={[
                styles.categorySelectorText,
                {
                  fontFamily: fontFamilyObj?.fontBold || "bold",
                  marginLeft: 8,
                },
              ]}
            >
              {actionCategories[selectedCategory].title}
            </Text>
          </View>
          <View>
            {renderCategoryIcon(selectedCategory, 24, colors.primary)}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const BodySection = ({ selectedCategory }: { selectedCategory: string }) => {
  const { fontFamilyObj, showToast, appState, accountInfo, setModalState } =
    useAppContext();
  const { carObj, precostingData, lastIndex, bookingsArray } = appState;
  const userId = accountInfo?.user;
  const activeKeyRef = carObj?.Key_Ref;
  const router = useRouter();

  // Get buttons for the selected category
  const btns = actionCategories[selectedCategory]?.buttons || [];

  const on_btn_pressed = (category: string) => {
    let options: any = {};
    if (category == "Booking Photos") {
      options = {
        category: category.toUpperCase(),
        subCategory: bookingsArray[lastIndex],
      };
    } else if (category == "W.I.P Photos") {
      category = "WORK IN PROGRESS";
      setModalState({
        isVisible: true,
        attr: { headerText: "TAP TO SELECT STAGE", onModalClose },
      });
      return;
    } else if (category == "Add Notes") {
      router.push({
        pathname: "/notes",
        params: { activeKeyRef: carObj.Key_Ref },
      });
      return;
    } else if (category == "Notes") {
      router.push({
        pathname: "/notes",
        params: { activeKeyRef: carObj.Key_Ref },
      });
      return;
    } else if (category == "Security Checklist") {
      router.push("/security");
      return;
    } else if (category == "Documents") {
      router.push({
        pathname: "/document",
        params: { activeKeyRef: carObj.Key_Ref },
      });
      return;
    } else if (category == "ASK AI") {
      router.push("/chat");
      return;
    } else if (category == "AIS UPDATE") {
      router.push("/group-chat");
      return;
    } else if (category == "Get Comments") {
      router.push("/comments");
      return;
    } else if (category == "Quality Control") {
      router.push("/quality");
      return;
    } else if (category == "Send SMS") {
      setModalState({
        isVisible: true,
        attr: { headerText: "SEND SMS", onModalClose },
      });
      return;
    } else if (category == "Line M Photos") {
      category = "LINE MANAGER PHOTOS";
      options = { category: category, subCategory: precostingData?.[0] };
    } else if (category == "Accident Photos") {
      category = "ACCIDENT";
      options = { category: category, subCategory: category };
    } else if (category == "Additional Photos") {
      category = "ADDITIONAL";
      options = { category: category, subCategory: category };
    } else if (category == "Drivers Photos") {
      category = "DRIVERS";
      options = { category: category, subCategory: category };
    } else if (category == "Parcel Photos") {
      category = "PARCEL";
      options = { category: category, subCategory: category };
    } else if (category == "Marketers Photos") {
      category = "MARKETERS";
      options = { category: category, subCategory: category };
    } else if (category == "Clearance Photos") {
      category = "CLEARANCE";
      options = { category: category, subCategory: category };
    } else if (category == "Driver License Photo") {
      category = "DRIVER LICENSE";
      options = { category: category, subCategory: category };
    } else if (category == "Insurance Details") {
      router.push("/insurance-details");
      return;
    } else if (category == "New Client") {
      router.push("/additem");
      return;
    } else {
      options = {
        category: category.toUpperCase(),
        subCategory: category.toUpperCase(),
      };
    }
    showCurrentGallery(options);
  };

  const showCurrentGallery = (options: any) => {
    router.push({
      pathname: "/gallery",
      params: { options: JSON.stringify(options), from: "STAFF" },
    });
  };

  const onModalClose = (response: any) => {
    if (response) {
      if (response.action == "wip") {
        showCurrentGallery({
          category: "WORK IN PROGRESS",
          subCategory: response.value,
        });
      } else if (response.action == "comment" || response.action == "sms") {
        console.log("Modal response:", response.sendSms, response.value);

        const notes = response.value;
        if (notes.length > 0) {
          getNetworkStatus((socket, url) => {
            socket.emit(
              !response.sendSms ? "saveChat" : "saveNotes",
              notes,
              activeKeyRef,
              userId,
              (cb: any) => {
                if (cb) {
                  showToast("Notes saved successfully!");
                } else {
                  showToast("There was an error while trying to save notes!");
                }
              },
            );
          });
        } else {
          showToast("Please add something to proceed!");
        }
      } else if (response.action == "sms") {
        const message = response.value;
        if (message.length > 0) {
          // TODO: Implement SMS sending via socket
          getNetworkStatus((socket, url) => {
            socket.emit("sendSMS", message, activeKeyRef, userId, (cb: any) => {
              if (cb) {
                showToast("SMS sent successfully!");
              } else {
                showToast("There was an error while trying to send SMS!");
              }
            });
          });
        } else {
          showToast("Please enter a message to send!");
        }
      }
    }
  };

  return (
    <LinearGradient
      colors={["#BED0D8", colors.primary, colors.white, colors.white]}
      start={{ x: 1, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={styles.footerStyle}
    >
      <View>
        <Text
          style={{
            fontFamily: fontFamilyObj?.fontBold,
            color: colors.grey,
            textAlign: "center",
          }}
        >
          WHAT WOULD YOU LIKE TO DO?
        </Text>
      </View>
      <View style={styles.buttonGrid}>
        {btns.map((btn, i) => (
          <TouchableOpacity
            onPress={() => on_btn_pressed(btn)}
            key={i}
            style={styles.actionButton}
          >
            {render_btn_icons(btn)}
            <Text
              style={{
                fontFamily: fontFamilyObj?.fontBold,
                color: colors.white,
                textAlign: "center",
              }}
            >
              {btn}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );
};

const render_btn_icons = (btn: string) => {
  const iconSize = 48;
  const iconColor = colors.white;

  switch (btn) {
    case "Booking Photos":
      return (
        <MaterialIcons name="photo-library" color={iconColor} size={iconSize} />
      );
    case "Security Photos":
      return (
        <MaterialIcons name="photo-library" color={iconColor} size={iconSize} />
      );
    case "New Client":
      return (
        <MaterialIcons name="add-circle" color={iconColor} size={iconSize} />
      );
    case "W.I.P Photos":
      return (
        <MaterialIcons name="construction" color={iconColor} size={iconSize} />
      );
    case "Accident Photos":
      return (
        <MaterialIcons name="car-crash" color={iconColor} size={iconSize} />
      );
    case "Additional Photos":
      return (
        <MaterialIcons name="add-a-photo" color={iconColor} size={iconSize} />
      );
    case "Security Checklist":
      return (
        <MaterialIcons name="security" color={iconColor} size={iconSize} />
      );
    case "ASK AI":
      return (
        <MaterialIcons name="smart-toy" color={iconColor} size={iconSize} />
      );
    case "AIS UPDATE":
      return <MaterialIcons name="groups" color={iconColor} size={iconSize} />;
    case "Final Stage":
      return (
        <MaterialIcons name="done-all" color={iconColor} size={iconSize} />
      );
    case "Get Comments":
      return <MaterialIcons name="comment" color={iconColor} size={iconSize} />;
    case "Documents":
      return (
        <MaterialIcons
          name="document-scanner"
          color={iconColor}
          size={iconSize}
        />
      );
    case "Add Notes":
      return (
        <MaterialIcons name="note-add" color={iconColor} size={iconSize} />
      );
    case "Notes":
      return (
        <MaterialIcons name="sticky-note-2" color={iconColor} size={iconSize} />
      );
    case "Marketers Photos":
      return (
        <MaterialIcons name="photo-camera" color={iconColor} size={iconSize} />
      );
    case "Clearance Photos":
      return (
        <MaterialIcons name="check-circle" color={iconColor} size={iconSize} />
      );
    case "Driver License Photo":
      return (
        <FontAwesome name="drivers-license" color={iconColor} size={iconSize} />
      );
    case "Send SMS":
      return <MaterialIcons name="sms" color={iconColor} size={iconSize} />;
    case "Drivers Photos":
      return (
        <FontAwesome name="drivers-license" color={iconColor} size={iconSize} />
      );
    case "Quality Control":
      return (
        <MaterialIcons name="high-quality" color={iconColor} size={iconSize} />
      );
    case "Quality Photos":
      return (
        <MaterialIcons name="photo-camera" color={iconColor} size={iconSize} />
      );
    case "Line M Photos":
      return (
        <MaterialIcons name="line-style" color={iconColor} size={iconSize} />
      );
    case "Car Rental":
      return (
        <MaterialIcons name="car-rental" color={iconColor} size={iconSize} />
      );
    case "Insurance Details":
      return (
        <MaterialIcons
          name="health-and-safety"
          color={iconColor}
          size={iconSize}
        />
      );
    default:
      return <MaterialIcons name="apps" color={iconColor} size={iconSize} />;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  headerGradient: {
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  keyRefBox: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    width: "100%",
    padding: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  keyRefBadge: {
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    width: 120,
    alignItems: "flex-end",
    borderRadius: 5,
  },
  categoryDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 15,
    marginTop: 15,
    width: "90%",
  },
  categorySelectorText: {
    color: colors.primary,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  categoryBottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 15,
  },
  bottomSheetTitle: {
    color: colors.grey,
    textAlign: "center",
    marginBottom: 15,
    fontSize: 14,
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGreyBorder,
  },
  categoryOptionSelected: {
    backgroundColor: colors.selectedOptionBg,
  },
  categoryOptionText: {
    color: colors.darkText,
    fontSize: 16,
  },
  categoryOptionTextSelected: {
    color: colors.primary,
  },
  footerStyle: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingBottom: 160,
    marginTop: 0,
  },
  buttonGrid: {
    flexDirection: "row",
    alignContent: "center",
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  actionButton: {
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
});
