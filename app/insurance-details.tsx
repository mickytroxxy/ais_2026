import AisInput from "@/components/forms/AisInput";
import { colors } from "@/constants/colors";
import { updateInsuranceDetails } from "@/contexts/Api";
import { useAppContext } from "@/contexts/AppContext";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function InsuranceDetailsScreen() {
  const { fontFamilyObj, showToast, appState, setConfirmDialog } =
    useAppContext();
  const { carObj } = appState || {};
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    insuranceType: "",
    insuranceKey: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((v) => ({ ...v, [field]: value }));
  };
  useEffect(() => {
    console.log(carObj?.insurace_type, carObj?.insuranceKey);
    if (carObj?.insurace_type) {
      setFormData((v) => ({ ...v, insuranceType: carObj.insurace_type }));
    }
    if (carObj?.insuranceKey) {
      setFormData((v) => ({ ...v, insuranceKey: carObj.insuranceKey }));
    }
  }, [carObj]);
  const validateFormData = () => {
    if (formData.insuranceType.length > 0 && formData.insuranceKey.length > 0) {
      setConfirmDialog({
        isVisible: true,
        text: `Press the confirm button to save insurance details for ${carObj?.Reg_No || "this vehicle"}`,
        okayBtn: "PROCEED",
        cancelBtn: "Cancel",
        response: (res: boolean) => {
          if (res) {
            setIsLoading(true);
            updateInsuranceDetails(
              carObj?.Key_Ref,
              formData.insuranceType,
              formData.insuranceKey,
              (result: boolean) => {
                if (result) {
                  showToast("Insurance details saved successfully!");
                  setIsLoading(false);
                  router.back();
                } else {
                  showToast(
                    "Could not save insurance details, Please try again later!",
                  );
                  setIsLoading(false);
                }
              },
            );
          }
        },
      });
    } else {
      showToast("Error, Please fill in insurance type and insurance key!");
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#fff", "#f0f0f0"]} style={styles.gradient}>
        <ScrollView style={{ padding: 10 }}>
          <View style={{ marginTop: 50, padding: 10 }}>
            <Text
              style={{
                fontFamily: fontFamilyObj?.fontBold,
                fontSize: 20,
                color: colors.primary,
                textAlign: "center",
              }}
            >
              INSURANCE DETAILS
            </Text>
            <Text
              style={{
                fontFamily: fontFamilyObj?.fontLight,
                fontSize: 14,
                color: colors.grey,
                textAlign: "center",
                marginTop: 5,
              }}
            >
              Vehicle: {carObj?.Reg_No || "N/A"}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.formInner}>
              <Text
                style={{
                  fontFamily: fontFamilyObj?.fontLight,
                  fontSize: 16,
                  color: colors.primary,
                }}
              >
                Insurance Type
              </Text>
              <AisInput
                attr={{
                  field: "insuranceType",
                  icon: {
                    name: "business",
                    type: "Ionicons",
                    min: 3,
                    color: colors.header,
                  },
                  keyboardType: null,
                  placeholder: "Insurance Type",
                  value: formData.insuranceType || "",
                  color: colors.accent,
                  handleChange,
                }}
              />
              <Text
                style={{
                  fontFamily: fontFamilyObj?.fontLight,
                  fontSize: 16,
                  color: colors.primary,
                  marginTop: 15,
                }}
              >
                Insurance Key
              </Text>
              <AisInput
                attr={{
                  field: "insuranceKey",
                  icon: {
                    name: "key",
                    type: "Ionicons",
                    min: 3,
                    color: colors.header,
                  },
                  keyboardType: null,
                  placeholder: "Insurance Key",
                  color: colors.accent,
                  value: formData.insuranceKey || "",
                  handleChange,
                }}
              />
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

          <TouchableOpacity
            style={{ marginTop: 15 }}
            onPress={() => router.back()}
          >
            <Text
              style={{
                fontFamily: fontFamilyObj?.fontBold,
                textAlign: "center",
                color: colors.grey,
              }}
            >
              Cancel and Go Back
            </Text>
          </TouchableOpacity>
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
