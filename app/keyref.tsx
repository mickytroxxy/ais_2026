import AisInput from "@/components/forms/AisInput";
import { colors } from "@/constants/colors";
import { getKeyRef, getNetworkStatus, getPrecostingData } from "@/contexts/Api";
import { useAppContext } from "@/contexts/AppContext";
import { useRoleStore } from "@/stores/roleStore";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Animatable from "react-native-animatable";

export default function KeyRefScreen() {
  const { height } = Dimensions.get("screen");
  const router = useRouter();
  const params = useLocalSearchParams();
  const { selectedRole: storedRole } = useRoleStore();
  const selectedRole = storedRole || (params.role as string) || "security";
  const { setConfirmDialog, accountInfo, fontFamilyObj, appState } =
    useAppContext();
  const { logout } = appState;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const PARALLAX_HEIGHT = parseInt(
    (0.475 * parseFloat(height.toString())).toFixed(0),
  );

  const handleLogout = () => {
    setConfirmDialog({
      isVisible: true,
      text: `Would you like to logout? Your phone number and password may be required the next time you sign in.`,
      okayBtn: "NOT NOW",
      cancelBtn: "LOGOUT",
      response: async (res: boolean) => {
        if (!res) {
          const loggedOut = await logout();
          console.log("Logout result:", loggedOut);
          if (loggedOut) {
            router.replace("/");
          }
        }
      },
    });
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout}>
              <Feather name="lock" size={36} color="tomato" />
            </TouchableOpacity>
          ),
          title: `${accountInfo?.fname}`,
          headerTitleStyle: { fontFamily: fontFamilyObj?.fontBold || "bold" },
          headerLeft: () => null,
        }}
      />
      <Foreground selectedRole={selectedRole} />

      {/* Floating Action Button and Select Role */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.selectRoleButton}
          onPress={() => router.push("/role-selector")}
        >
          <Text
            style={[
              styles.selectRoleText,
              { fontFamily: fontFamilyObj?.fontBold },
            ]}
          >
            Select Role
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.fab} onPress={toggleModal}>
          <MaterialIcons name="menu-book" color={colors.white} size={32} />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={toggleModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={toggleModal}
        >
          <View
            style={styles.bottomSheet}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.bottomSheetHandle} />
            <Text
              style={[
                styles.bottomSheetTitle,
                { fontFamily: fontFamilyObj?.fontBold || "bold" },
              ]}
            >
              WHAT WOULD YOU LIKE TO DO?
            </Text>
            <View style={styles.bottomSheetGrid}>
              <ActionButtons toggleModal={toggleModal} />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const Foreground = ({ selectedRole }: { selectedRole?: string }) => {
  const router = useRouter();
  const { selectedRole: storedRole } = useRoleStore();
  const role = selectedRole || storedRole || "security";
  const {
    fontFamilyObj,
    appState,
    showToast,
    setModalState,
    setConfirmDialog,
  } = useAppContext();
  const { setCarObj, setSearchResults, setPrecostingData, searchResults } =
    appState;
  const [formData, setFormData] = useState({ keyRef: "" });
  const [isLoading, setIsLoading] = useState(false);
  let isNowLoading = false;

  // Handle scan results from barcode scanner
  useEffect(() => {
    if (searchResults && (searchResults.regNo || searchResults.rawData)) {
      // Clear searchResults first to prevent re-processing
      const scanData = searchResults;
      setSearchResults(null);

      // Use the reg number from scan (or rawData as fallback)
      const regNumberToSearch = scanData.regNo || scanData.rawData;

      if (regNumberToSearch) {
        console.log("Searching for scanned reg number:", regNumberToSearch);

        // First, search if this reg number exists in our database
        getKeyRef(regNumberToSearch, (result: any[]) => {
          if (result && result.length > 0) {
            // Found in database - load the car actions screen
            console.log("Reg number found in database:", result);
            loadCarActionsScreen(result[0]);
          } else {
            // Not found in database - show confirmation dialog to add
            console.log("Reg number not found in database");
            setConfirmDialog({
              isVisible: true,
              text: `Registration number "${regNumberToSearch}" is not found in our database. Would you like to add it as a new client?`,
              okayBtn: "YES, ADD NEW",
              cancelBtn: "NO, CANCEL",
              response: (res: boolean) => {
                if (res) {
                  // Add as new client
                  if (scanData.regNo) {
                    // It's an AIS scan - use saveClient
                    setIsLoading(true);
                    getNetworkStatus((socket) => {
                      socket.emit(
                        "saveClient",
                        "",
                        "",
                        "",
                        scanData.regNo,
                        `${scanData?.make} ${scanData?.description}`,
                        "",
                        scanData?.vinNo,
                        scanData?.engineNo,
                        "",
                        (result: boolean) => {
                          if (result !== false) {
                            showToast(
                              "New client has been added successfully!",
                            );

                            // Set the carObj with the new client data so gallery can access it
                            const newCarObj = {
                              Key_Ref: scanData.regNo,
                              regNumber: scanData.regNo,
                              make: scanData?.make || "",
                              description: scanData?.description || "",
                              vinNo: scanData?.vinNo || "",
                              engineNo: scanData?.engineNo || "",
                            };
                            setCarObj(newCarObj);
                            setPrecostingData(["NO PRECOSTING"]);

                            // Navigate to gallery with security photos
                            router.push({
                              pathname: "/gallery",
                              params: {
                                options: JSON.stringify({
                                  category: "SECURITY PHOTOS",
                                  subCategory: "Security",
                                }),
                                from: "STAFF",
                              },
                            });
                          } else {
                            showToast(
                              `Could not save ${scanData?.regNo}, Please try again later!`,
                            );
                          }
                          setIsLoading(false);
                        },
                      );
                    });
                  } else {
                    // Generic barcode - navigate to additem
                    router.push({
                      pathname: "/additem",
                      params: {
                        regNo: scanData.rawData || "",
                        from: "STAFF",
                      },
                    });
                  }
                }
              },
            });
          }
        });
      }
    }
  }, [searchResults]);

  const handleChange = (field: string, value: string) =>
    setFormData((v) => ({ ...v, [field]: value }));

  const searchKeyRef = (Key_Ref: string) => {
    if (Key_Ref !== "") {
      setIsLoading(true);
      isNowLoading = true;

      // Timeout for poor network
      setTimeout(() => {
        if (isNowLoading) {
          isNowLoading = false;
          showToast("You have poor network connection!");
          setIsLoading(false);
        }
      }, 10000);
      getKeyRef(Key_Ref, (result: any[]) => {
        setIsLoading(false);
        isNowLoading = false;

        if (result.length === 1) {
          loadCarActionsScreen(result[0]);
        } else if (result.length > 1) {
          setModalState({
            isVisible: true,
            attr: { headerText: "PICK A KEY", onModalClose, result },
          });
        } else {
          // No result found - show confirmation dialog before navigating to additem
          setConfirmDialog({
            isVisible: true,
            text: `No result found for "${Key_Ref}". Would you like to add a new client?`,
            okayBtn: "YES, ADD NEW",
            cancelBtn: "NO, CANCEL",
            response: (res: boolean) => {
              if (res) {
                router.push({
                  pathname: "/additem",
                  params: {
                    regNo: Key_Ref,
                    from: "STAFF",
                  },
                });
              }
            },
          });
        }
        setSearchResults(null);
      });
    } else {
      showToast("Please enter key ref to proceed!");
    }
  };

  const onModalClose = (response: any) => {
    if (response) {
      if (response.action === "key") {
        loadCarActionsScreen(response.value);
      }
    }
  };

  const loadCarActionsScreen = (result: any) => {
    setCarObj(result);
    getPrecostingData(result, (response: any[]) => {
      if (response.length > 0) {
        setPrecostingData(response.map((a: any) => a.Description));
      } else {
        setPrecostingData(["NO PRECOSTING"]);
      }
    });

    // If role is security, go straight to gallery with security photos
    if (role === "security") {
      router.push({
        pathname: "/gallery",
        params: {
          options: JSON.stringify({
            category: "SECURITY PHOTOS",
            subCategory: "Security",
          }),
          from: "STAFF",
        },
      });
      //router.push({ pathname: "/main", params: { result, role } });
    } else {
      router.push({ pathname: "/main", params: { result, role } });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={colors.loginGradient as any}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1 }}
      />
      <View style={styles.searchContainer}>
        <Animatable.View
          animation="bounceIn"
          duration={1500}
          useNativeDriver={true}
          style={styles.searchBox}
        >
          <AisInput
            attr={{
              field: "keyRef",
              icon: {
                name: "search",
                type: "Ionicons",
                min: 5,
                color: colors.header,
              },
              keyboardType: null,
              placeholder:
                role === "security"
                  ? "Enter registration number"
                  : "Search key ref or reg number",
              color: colors.accent,
              handleChange,
            }}
          />
        </Animatable.View>

        {isLoading ? (
          <ActivityIndicator
            color={colors.white}
            size={48}
            style={{ marginTop: 15 }}
          />
        ) : (
          <View>
            {formData.keyRef.length > 2 ? (
              <TouchableOpacity
                style={{ marginTop: 15, alignSelf: "center" }}
                onPress={() => searchKeyRef(formData.keyRef)}
              >
                <MaterialIcons name="search" color={colors.white} size={72} />
              </TouchableOpacity>
            ) : (
              <View style={{ marginTop: 15, alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: fontFamilyObj?.fontBold,
                    color: colors.white,
                  }}
                >
                  OR SCAN LICENSE DISK
                </Text>
                <TouchableOpacity
                  style={{ marginTop: 15, alignSelf: "center" }}
                  onPress={() => router.push("/barcode")}
                >
                  <MaterialIcons
                    name="qr-code-scanner"
                    color={colors.white}
                    size={120}
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 15,
                alignSelf: "center",
                backgroundColor: "rgba(255,255,255,0.3)",
                padding: 10,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: "#fff",
              }}
              onPress={() => router.push("/additem")}
            >
              <Feather name="plus-circle" color="#fff" size={48} />
              <Text
                style={{
                  color: "#fff",
                  fontSize: 14,
                  fontFamily: fontFamilyObj?.fontBold || "bold",
                  marginLeft: 5,
                }}
              >
                ADD NEW CLIENT
              </Text>
            </TouchableOpacity> */}
          </View>
        )}
      </View>
    </View>
  );
};

const ActionButtons = ({ toggleModal }: { toggleModal: () => void }) => {
  const router = useRouter();
  const { fontFamilyObj } = useAppContext();
  const btns = [
    "Progress",
    "New Client",
    "New Stock",
    "New Paint",
    "Customer Support",
    "Towing Requests",
  ];

  const on_btn_pressed = (btn: string) => {
    toggleModal();
    switch (btn) {
      case "New Client":
        router.push("/additem");
        break;
      case "New Paint":
        router.push("/addpaint");
        break;
      case "New Stock":
        router.push("/addstock");
        break;
      case "Progress":
        router.push("/progress");
        break;
      case "Customer Support":
        router.push("/chatlist");
        break;
      case "Towing Requests":
        router.push("/towing");
        break;
    }
  };

  return (
    <>
      {btns.map((btn, i) => (
        <TouchableOpacity
          onPress={() => on_btn_pressed(btn)}
          key={i}
          style={styles.actionButton}
        >
          {render_btn_icons(btn)}
          <Text
            style={[
              styles.buttonText,
              { fontFamily: fontFamilyObj?.fontBold || "bold" },
            ]}
          >
            {btn}
          </Text>
        </TouchableOpacity>
      ))}
    </>
  );
};

const render_btn_icons = (btn: string) => {
  switch (btn) {
    case "Progress":
      return (
        <MaterialIcons size={48} name="trending-up" color={colors.white} />
      );
    case "New Client":
      return (
        <MaterialIcons
          name="add-circle-outline"
          color={colors.white}
          size={48}
        />
      );
    case "New Stock":
      return (
        <MaterialIcons
          name="add-circle-outline"
          color={colors.white}
          size={48}
        />
      );
    case "New Paint":
      return <MaterialIcons name="brush" color={colors.white} size={48} />;
    case "Customer Support":
      return (
        <Ionicons
          name="chatbubble-ellipses-outline"
          color={colors.white}
          size={48}
        />
      );
    case "Towing Requests":
      return (
        <MaterialIcons name="local-shipping" color={colors.white} size={48} />
      );
    default:
      return <MaterialIcons name="star" color={colors.white} size={48} />;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  scrollView: {
    flex: 1,
  },
  headerLeftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userNameText: {
    color: colors.primary,
    marginLeft: 10,
    fontSize: 16,
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  foregroundContainer: {
    position: "relative",
  },
  searchContainer: {
    position: "absolute",
    top: 150,
    left: 0,
    right: 0,
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    minWidth: 260,
    backgroundColor: colors.greyLight,
    width: "80%",
    padding: 30,
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabContainer: {
    position: "absolute",
    bottom: 24,
    right: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  selectRoleButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  selectRoleText: {
    color: colors.white,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: colors.white,
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
  bottomSheetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    backgroundColor: colors.primary,
    width: "48%",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    minHeight: 100,
    marginBottom: 10,
  },
  buttonText: {
    color: colors.white,
    textAlign: "center",
    fontSize: 12,
    marginTop: 5,
  },
});
