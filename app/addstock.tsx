import AisInput from "@/components/forms/AisInput";
import SelectInput from "@/components/forms/Select";
import { colors } from "@/constants/colors";
import { getNetworkStatus } from "@/contexts/Api";
import { useAppContext } from "@/contexts/AppContext";
import { Feather, FontAwesome } from "@expo/vector-icons";
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
import { Col, Grid } from "react-native-easy-grid";

export default function AddStockScreen() {
  const { fontFamilyObj, showToast, appState } = useAppContext();
  const { imageUrl, setImageUrl } = appState || {};
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    na: "",
    supplier: "",
    category: "SELECT CATEGORY",
    branch: "SELECT BRANCH",
    url: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((v) => ({ ...v, [field]: value }));
  };

  const validateFormData = () => {
    if (
      formData.branch !== "SELECT BRANCH" &&
      formData.category !== "SELECT CATEGORY" &&
      formData.amount !== "" &&
      formData.supplier.length > 2
    ) {
      setIsLoading(true);
      if (formData.url) {
        uploadStockFile(formData.url, (response: number, filePath: string) => {
          response === 200
            ? saveStockData(filePath)
            : showToast("Could not upload photo");
        });
      } else {
        saveStockData("");
      }
    } else {
      showToast("Error, You must carefully fill in all fields!");
    }
  };

  const saveStockData = (filePath: string) => {
    getNetworkStatus((socket) => {
      socket.emit(
        "saveStock",
        formData.description,
        formData.amount,
        formData.na,
        formData.supplier,
        formData.category,
        formData.branch,
        filePath,
        (cb: boolean) => {
          setIsLoading(false);
          if (cb) {
            showToast("You have successfully added new stock");
            router.back();
          } else {
            showToast("There was an error while trying to add new stock!");
          }
        },
      );
    });
  };

  const uploadStockFile = async (
    uri: string,
    cb: (status: number, filePath: string) => void,
  ) => {
    const apiUrl = "http://154.117.189.170:3000/upload";
    const name = uri.substring(uri.lastIndexOf("/") + 1);
    const filePath =
      "../Ordering_system/stock_icon/stock" +
      Math.floor(Math.random() * 899999 + 100000) +
      ".jpg";

    const formDataUpload = new FormData();
    formDataUpload.append("fileUrl", { uri, name, type: `image/jpg` } as any);
    formDataUpload.append("filePath", filePath);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formDataUpload,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });
      cb(response.status, filePath);
    } catch (error) {
      console.log(error);
      cb(500, "");
    }
  };

  useEffect(() => {
    if (imageUrl) {
      setFormData((prev) => ({ ...prev, url: imageUrl }));
      if (setImageUrl) setImageUrl(null);
    }
  }, [imageUrl]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.securityGradient as any}
        style={styles.gradient}
      >
        <ScrollView style={{ padding: 10 }}>
          <View style={styles.formContainer}>
            <View style={styles.formInner}>
              <AisInput
                attr={{
                  field: "description",
                  icon: {
                    name: "list",
                    type: "Feather",
                    min: 5,
                    color: colors.header,
                  },
                  keyboardType: null,
                  placeholder: "Stock Description",
                  color: colors.accent,
                  handleChange,
                }}
              />
              <AisInput
                attr={{
                  field: "amount",
                  icon: {
                    name: "plus-circle",
                    type: "Feather",
                    min: 5,
                    color: colors.header,
                  },
                  keyboardType: "numeric",
                  placeholder: "Enter Stock Amount",
                  color: colors.accent,
                  handleChange,
                }}
              />
              <AisInput
                attr={{
                  field: "na",
                  icon: {
                    name: "trello",
                    type: "Feather",
                    min: 5,
                    color: colors.header,
                  },
                  keyboardType: "numeric",
                  placeholder: "N/A",
                  color: colors.accent,
                  handleChange,
                }}
              />
              <AisInput
                attr={{
                  field: "supplier",
                  icon: {
                    name: "user",
                    type: "Feather",
                    min: 5,
                    color: colors.header,
                  },
                  keyboardType: null,
                  placeholder: "Enter Supplier name",
                  color: colors.accent,
                  handleChange,
                }}
              />
              <View style={{ marginTop: 10 }}>
                <SelectInput
                  attr={{
                    field: "category",
                    list: [
                      { label: "SELECT CATEGORY", value: "SELECT CATEGORY" },
                      { label: "SUNDRIES", value: "SUNDRIES" },
                      { label: "PAINT SUPPLIES", value: "PAINT SUPPLIES" },
                      { label: "WASTE DISPOSAL", value: "WASTE DISPOSAL" },
                      { label: "TOOLS", value: "TOOLS" },
                      { label: "EQUIPMENT", value: "EQUIPMENT" },
                      { label: "DEAD STOCK", value: "DEAD STOCK" },
                    ],
                    handleChange: (_field: string, val: string) =>
                      handleChange("category", val),
                    padding: 10,
                  }}
                />
              </View>
              <View style={{ marginTop: 10 }}>
                <SelectInput
                  attr={{
                    field: "branch",
                    list: [
                      { label: "SELECT BRANCH", value: "SELECT BRANCH" },
                      { label: "MAG SELBY", value: "MAG SELBY" },
                      { label: "MAG LONGMEADOW", value: "MAG LONGMEADOW" },
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
              <View style={{ marginTop: 10 }}>
                <Grid style={[styles.searchInputHolder, { marginTop: 5 }]}>
                  <Col size={0.15} style={styles.iconCol}>
                    <Feather
                      name="upload-cloud"
                      color={colors.header}
                      size={20}
                      style={{ alignSelf: "center" }}
                    />
                  </Col>
                  <Col style={styles.labelCol}>
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/camera",
                          params: {
                            category: "STOCK IMAGE",
                            subCategory: "STOCK IMAGE",
                          },
                        })
                      }
                    >
                      <Text style={{ fontFamily: fontFamilyObj?.fontLight }}>
                        SELECT IMAGE
                      </Text>
                    </TouchableOpacity>
                  </Col>
                </Grid>
              </View>
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
  searchInputHolder: {
    height: 40,
    borderRadius: 10,
    flexDirection: "row",
    borderWidth: 0.5,
    borderColor: colors.grey,
  },
  iconCol: {
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  labelCol: {
    justifyContent: "center",
  },
  buttonContainer: {
    marginTop: 30,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
});
