import AisInput from "@/components/forms/AisInput";
import SelectInput from "@/components/forms/Select";
import { colors } from "@/constants/colors";
import { getNetworkStatus } from "@/contexts/Api";
import { useAppContext } from "@/contexts/AppContext";
import { useRoleStore } from "@/stores/roleStore";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddItemScreen() {
  const { fontFamilyObj, showToast, appState, setConfirmDialog } =
    useAppContext();
  const { searchResults, setSearchResults, setCarObj } = appState || {};
  const params = useLocalSearchParams();
  const router = useRouter();
  const from = (params.from as string) || "STAFF";
  const { selectedRole } = useRoleStore();
  const isSecurity = selectedRole === "security";

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    cellNo: "",
    regNo: "",
    make: "",
    branch: "HOME",
    vinNo: "",
    engineNo: "",
    KM: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((v) => ({ ...v, [field]: value }));
  };

  const [hasProcessedScan, setHasProcessedScan] = useState(false);
  const paramsRef = useRef({
    regNo: "",
    make: "",
    vinNo: "",
    engineNo: "",
    KM: "",
  });

  // Handle incoming params from barcode scan or keyref search
  useEffect(() => {
    const newRegNo = params.regNo as string;
    const newMake = params.make as string;
    const newVinNo = params.vinNo as string;
    const newEngineNo = params.engineNo as string;
    const newKM = params.KM as string;

    // Only update if params have actually changed
    if (newRegNo && newRegNo !== paramsRef.current.regNo) {
      paramsRef.current.regNo = newRegNo;
      setFormData((prev) => ({
        ...prev,
        regNo: newRegNo,
      }));
    }
    if (newMake && newMake !== paramsRef.current.make) {
      paramsRef.current.make = newMake;
      setFormData((prev) => ({
        ...prev,
        make: newMake,
      }));
    }
    if (newVinNo && newVinNo !== paramsRef.current.vinNo) {
      paramsRef.current.vinNo = newVinNo;
      setFormData((prev) => ({
        ...prev,
        vinNo: newVinNo,
      }));
    }
    if (newEngineNo && newEngineNo !== paramsRef.current.engineNo) {
      paramsRef.current.engineNo = newEngineNo;
      setFormData((prev) => ({
        ...prev,
        engineNo: newEngineNo,
      }));
    }
    if (newKM && newKM !== paramsRef.current.KM) {
      paramsRef.current.KM = newKM;
      setFormData((prev) => ({
        ...prev,
        KM: newKM,
      }));
    }
  }, [params.regNo, params.make, params.vinNo, params.engineNo, params.KM]);

  const validateFormData = () => {
    // For security role, only require regNo and make
    if (isSecurity) {
      if (formData.regNo.length > 4 && formData.make !== "") {
        setConfirmDialog({
          isVisible: true,
          text: `Press the confirm button to add the specified vehicle to the security list`,
          okayBtn: "PROCEED",
          cancelBtn: "Cancel",
          response: (res: boolean) => {
            if (res) {
              setIsLoading(true);
              getNetworkStatus((socket) => {
                socket.emit(
                  "saveClient",
                  formData.fname || "Security",
                  formData.lname || "User",
                  formData.cellNo || "0000000000",
                  formData.regNo || "",
                  formData.make || "",
                  formData.branch || "",
                  formData.vinNo || "",
                  formData.engineNo || "",
                  formData.KM || "",
                  (result: boolean | string) => {
                    setIsLoading(false);
                    if (result && typeof result === "string") {
                      // Success - result is the Key_Ref
                      showToast("Client has been successfully added");

                      if (isSecurity && setCarObj) {
                        // Set the car object for the newly created client
                        setCarObj({
                          Key_Ref: result,
                          Reg_No: formData.regNo,
                          Make: formData.make,
                        });

                        // Navigate directly to security photos gallery
                        router.replace({
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
                        router.back();
                      }
                    } else {
                      showToast(
                        `Could not save ${formData.regNo}, Please try again later!`,
                      );
                    }
                  },
                );
              });
            }
          },
        });
      } else {
        showToast("Error, Please fill in registration and make fields!");
      }
      return;
    }

    // Normal validation for other roles
    if (
      formData.fname.length > 2 &&
      formData.lname.length > 2 &&
      formData.cellNo.length > 9 &&
      formData.regNo.length > 4 &&
      formData.make !== ""
    ) {
      setConfirmDialog({
        isVisible: true,
        text: `Press the confirm button to add the specified user to our clients list`,
        okayBtn: "PROCEED",
        cancelBtn: "Cancel",
        response: (res: boolean) => {
          if (res) {
            setIsLoading(true);
            getNetworkStatus((socket) => {
              socket.emit(
                "saveClient",
                formData.fname,
                formData.lname,
                formData.cellNo,
                formData.regNo,
                formData.make,
                formData.branch,
                formData.vinNo,
                formData.engineNo,
                formData.KM,
                (result: boolean) => {
                  if (result !== false) {
                    showToast("New client has been added successfully!");
                    setIsLoading(false);
                    router.back();
                  } else {
                    showToast(
                      `Could not save ${formData.fname}, Please try again later!`,
                    );
                    setIsLoading(false);
                  }
                },
              );
            });
          }
        },
      });
    } else {
      showToast("Error, You must carefully fill in all fields!");
    }
  };

  // Handle search results from barcode scan - with flag to prevent infinite loop
  useEffect(() => {
    if (searchResults && !hasProcessedScan) {
      setHasProcessedScan(true);
      setFormData((prev) => ({
        ...prev,
        regNo: searchResults.regNo || prev.regNo || "",
        make:
          searchResults.description || searchResults.make || prev.make || "",
        engineNo: searchResults.engineNo || prev.engineNo || "",
        vinNo: searchResults.vinNo || prev.vinNo || "",
        KM: searchResults.KM || prev.KM || "",
      }));
      if (setSearchResults) {
        setSearchResults(null);
      }
    }
  }, [searchResults, hasProcessedScan]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.white, colors.white]}
        style={styles.gradient}
      >
        <ScrollView style={{ padding: 10 }}>
          <View style={{ marginTop: 50, padding: 10 }}>
            <TouchableOpacity
              style={{ flexDirection: "row" }}
              onPress={() => router.push("/barcode")}
            >
              <Text
                style={{ fontFamily: fontFamilyObj?.fontBold, marginTop: 12 }}
              >
                SCAN LICENCE DISK
              </Text>
              <Ionicons name="scan" size={48} color={colors.header} />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.formInner}>
              {!isSecurity && (
                <>
                  <AisInput
                    attr={{
                      field: "fname",
                      icon: {
                        name: "user",
                        type: "Feather",
                        min: 5,
                        color: colors.header,
                      },
                      keyboardType: null,
                      placeholder: "First Name",
                      color: colors.accent,
                      handleChange,
                    }}
                  />
                  <AisInput
                    attr={{
                      field: "lname",
                      icon: {
                        name: "users",
                        type: "Feather",
                        min: 5,
                        color: colors.header,
                      },
                      keyboardType: null,
                      placeholder: "Last Name",
                      color: colors.accent,
                      handleChange,
                    }}
                  />
                  <AisInput
                    attr={{
                      field: "cellNo",
                      icon: {
                        name: "phone",
                        type: "FontAwesome",
                        min: 5,
                        color: colors.header,
                      },
                      keyboardType: "phone-pad",
                      placeholder: "Cell Number",
                      color: colors.accent,
                      handleChange,
                    }}
                  />
                </>
              )}
              <AisInput
                attr={{
                  field: "regNo",
                  icon: {
                    name: "list",
                    type: "FontAwesome",
                    min: 5,
                    color: colors.header,
                  },
                  keyboardType: null,
                  placeholder: "Vehicle Registration Number",
                  color: colors.accent,
                  handleChange,
                }}
              />
              <AisInput
                attr={{
                  field: "make",
                  icon: {
                    name: "truck",
                    type: "Feather",
                    min: 5,
                    color: colors.header,
                  },
                  keyboardType: null,
                  placeholder: "Vehicle Make/Model",
                  color: colors.accent,
                  handleChange,
                }}
              />
              {!isSecurity && (
                <>
                  <AisInput
                    attr={{
                      field: "vinNo",
                      icon: {
                        name: "barcode",
                        type: "FontAwesome",
                        min: 5,
                        color: colors.header,
                      },
                      keyboardType: null,
                      placeholder: "VIN Number",
                      color: colors.accent,
                      handleChange,
                    }}
                  />
                  <AisInput
                    attr={{
                      field: "engineNo",
                      icon: {
                        name: "cog",
                        type: "FontAwesome",
                        min: 5,
                        color: colors.header,
                      },
                      keyboardType: "numeric",
                      placeholder: "Engine Number",
                      color: colors.accent,
                      handleChange,
                    }}
                  />
                  <AisInput
                    attr={{
                      field: "km",
                      icon: {
                        name: "dashboard",
                        type: "FontAwesome",
                        min: 1,
                        color: colors.header,
                      },
                      keyboardType: "numeric",
                      placeholder: "Odometer Reading (KM)",
                      color: colors.accent,
                      handleChange,
                    }}
                  />
                  {from === "STAFF" && (
                    <View style={{ marginTop: 10 }}>
                      <SelectInput
                        attr={{
                          field: "branch",
                          list: [
                            { label: "SELECT BRANCH", value: "SELECT BRANCH" },
                            { label: "MAG SELBY", value: "MAG SELBY" },
                            {
                              label: "MAG LONGMEADOW",
                              value: "MAG LONGMEADOW",
                            },
                            {
                              label: "MAG THE GLEN CUSTOMS",
                              value: "MAG THE GLEN CUSTOMS",
                            },
                            {
                              label: "MAG THE GLEN EASTCLIFF",
                              value: "MAG THE GLEN EASTCLIFF",
                            },
                          ],
                          handleChange: (_field: string, val: string) =>
                            handleChange("branch", val),
                          padding: 10,
                        }}
                      />
                    </View>
                  )}
                </>
              )}
            </View>
          </View>

          <View style={styles.buttonContainer}>
            {!isLoading ? (
              <TouchableOpacity
                onPress={validateFormData}
                style={styles.buttonContainer}
              >
                <FontAwesome size={120} color="green" name="check-circle" />
              </TouchableOpacity>
            ) : (
              <ActivityIndicator size="large" color={colors.grey} />
            )}
          </View>

          {from !== "STAFF" && (
            <TouchableOpacity
              style={{ marginTop: 15 }}
              onPress={() =>
                router.push({
                  pathname: "/register" as any,
                  params: { from: "CLIENT" },
                })
              }
            >
              <Text
                style={{
                  fontFamily: fontFamilyObj?.fontBold,
                  textAlign: "center",
                  color: colors.grey,
                }}
              >
                Cooperate Account? Register Here
              </Text>
            </TouchableOpacity>
          )}
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
    elevation: 5,
  },
  gradient: {
    flex: 1,
    paddingTop: 10,
    borderRadius: 10,
  },
  formContainer: {
    margin: 5,
    backgroundColor: colors.lightBackground,
    padding: 5,
    borderRadius: 10,
  },
  formInner: {
    padding: 5,
    backgroundColor: colors.white,
    borderRadius: 10,
  },
  buttonContainer: {
    marginTop: 30,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
});
