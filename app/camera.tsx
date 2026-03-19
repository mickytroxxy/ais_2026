import { colors } from "@/constants/colors";
import { getNetworkStatus, uploadFile } from "@/contexts/Api";
import { useAppContext } from "@/contexts/AppContext";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

interface CameraOptions {
  category: string;
  subCategory: string;
}

export default function CameraScreen() {
  const { fontFamilyObj, appState, accountInfo, showToast } = useAppContext();
  const params = useLocalSearchParams<{
    options?: string;
    counter?: string;
    comment?: string;
    isGroupChat?: string;
  }>();
  const router = useRouter();

  // Parse options from params (passed as JSON string from gallery)
  const parsedOptions = params.options
    ? JSON.parse(params.options)
    : { category: "SECURITY PHOTOS", subCategory: "" };
  const options: CameraOptions = {
    category: parsedOptions.category || "SECURITY PHOTOS",
    subCategory: parsedOptions.subCategory || "",
  };
  const comment = params.comment || "";
  const isGroupChat = params.isGroupChat === "true";

  const {
    carObj,
    bookingsArray,
    lastIndex,
    changeLastIndex,
    setImageUrl,
    precostingData,
    lastIndexOfLine,
    changeLastIndexOfLine,
    sendSms,
  } = appState || {};
  const userId = accountInfo?.user || "";

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [photoCounter, setPhotoCounter] = useState(
    parseInt(params.counter || "0", 10),
  );
  const cameraRef = useRef<any>(null);

  if (!permission) {
    return (
      <View style={styles.information}>
        <ActivityIndicator size="large" color={colors.grey} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.information}>
        <Text style={{ textAlign: "center", marginBottom: 20 }}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={styles.permissionBtn}
        >
          <Text style={styles.permissionText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    setFlashEnabled((current) => !current);
  };

  const photoRetrieved = (photo: string) => {
    const namePrefix =
      options.category === "SECURITY PHOTOS"
        ? bookingsArray?.[lastIndex || 0]
        : options.subCategory;
    uploadFile?.(
      photo,
      options.category,
      carObj?.Key_Ref || "",
      namePrefix || "",
      (status, filePath) => {
        if (status === 200) {
          if (
            options.category === "SECURITY PHOTOS" ||
            options.category === "LINE MANAGER PHOTOS"
          ) {
            if (options.category === "SECURITY PHOTOS") {
              savePhoto(bookingsArray?.[lastIndex || 0] || "", filePath);
            } else {
              savePhoto(precostingData?.[lastIndexOfLine || 0] || "", filePath);
            }
          } else {
            savePhoto(options.subCategory, filePath);
          }
        } else {
          setIsUploading(false);
          showToast?.("Could not upload photo!");
        }
      },
    );
  };

  const savePhoto = (phototype: string, filePath: string) => {
    // For group chat, always set the imageUrl and return to chat
    if (isGroupChat) {
      setIsUploading(false);
      setImageUrl?.(filePath);
      console.log(
        "[CAMERA] Photo ready for group chat, returning to chat with URL:",
        filePath,
      );
      showToast?.("Photo ready for chat!");
      setTimeout(() => router.back(), 500);
      return;
    }

    if (options.category === "QUALITY CONTROL") {
      setIsUploading(false);
      setImageUrl?.(filePath);
      showToast?.("File uploaded successfully!");
      setTimeout(() => router.back(), 500);
    } else {
      getNetworkStatus?.((socket: any) => {
        if (options.category === "SECURITY PHOTOS") {
          socket.emit(
            "saveBookingPhoto",
            carObj?.Key_Ref,
            phototype,
            filePath,
            userId,
            (result: boolean) => {
              setIsUploading(false);
              if (result) {
                showToast?.("File uploaded successfully!");
                if (bookingsArray?.[lastIndex || 0] !== "Keys") {
                  changeLastIndex?.(lastIndex || 0);
                } else {
                  router.replace("/security");
                  if (carObj?.Cell_number && carObj.Cell_number !== "") {
                    sendSms?.(
                      carObj.Cell_number,
                      `Hi ${carObj.Fisrt_Name}, we just finished booking your vehicle, please download "AIS SNAPSHOT" app to check them out`,
                    );
                  }
                }
              }
            },
          );
        } else {
          const photoComment =
            options.category === "LINE MANAGER PHOTOS"
              ? precostingData?.[lastIndexOfLine || 0]
              : comment;
          socket.emit(
            "saveOtherPhoto",
            carObj?.Key_Ref,
            phototype,
            filePath,
            options.category,
            photoComment,
            userId,
            true,
            (result: boolean) => {
              setIsUploading(false);
              setPhotoCounter((prev) => prev + 1);
              if (result) {
                showToast?.(`${phototype} has been uploaded!`);
                if (options.category === "LINE MANAGER PHOTOS") {
                  changeLastIndexOfLine?.(lastIndexOfLine || 0);
                }
              }
            },
          );
        }
      });
    }
  };
  // useEffect(() => {
  //   console.log(options);
  // }, []);
  const takePicture = async () => {
    let canContinue = true;
    if (options.category === "WORK IN PROGRESS" && photoCounter > 3) {
      canContinue = false;
    }

    if (cameraRef.current && canContinue) {
      setIsUploading(true);
      try {
        const result = await cameraRef.current.takePictureAsync();
        if (options.category !== "SCAN") {
          const manipulated = await ImageManipulator.manipulateAsync(
            result.uri,
            [{ resize: { width: width * 2, height: height * 2 } }],
            { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG },
          );
          if (
            options.category === "STOCK IMAGE" ||
            options.category === "PAINT IMAGE"
          ) {
            setIsUploading(false);
            setImageUrl?.(manipulated.uri);
            setTimeout(() => router.back(), 500);
          } else {
            photoRetrieved(manipulated.uri);
          }
        } else {
          const cropped = await ImageManipulator.manipulateAsync(
            result.uri,
            [{ crop: { originX: 500, originY: 500, width, height } }],
            { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG },
          );
          setIsUploading(false);
          showToast?.("Document uploaded");
        }
      } catch (error) {
        setIsUploading(false);
        showToast?.("Error taking picture");
      }
    } else if (!canContinue) {
      showToast?.("You have taken enough photos for today!");
      sendSms?.(
        carObj?.Cell_number,
        `Hi ${carObj?.Fisrt_Name}, your vehicle is at ${options.subCategory}, please download "AIS SNAPSHOT" app to check it out`,
      );
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]) {
      setIsUploading(true);
      photoRetrieved(result.assets[0].uri);
    }
  };

  const currentPhotoLabel = () => {
    if (options.category === "SECURITY PHOTOS") {
      return bookingsArray?.[lastIndex || 0]?.toUpperCase() || "";
    } else if (options.category === "LINE MANAGER PHOTOS") {
      return precostingData?.[lastIndexOfLine || 0]?.toUpperCase() || "";
    }
    return options.subCategory?.toUpperCase() || "";
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        flash={flashEnabled ? "on" : "off"}
        ref={cameraRef}
      >
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons
              name="highlight-off"
              size={36}
              color={colors.white}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFlash}>
            <MaterialIcons
              name={flashEnabled ? "flash-off" : "flash-on"}
              size={36}
              color={colors.white}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.labelContainer}>
          {options.category !== "SCAN" && (
            <View style={styles.labelBox}>
              <Text
                style={[
                  styles.labelText,
                  { fontFamily: fontFamilyObj?.fontBold },
                ]}
              >
                {options.category}
              </Text>
            </View>
          )}
          {options.category !== options.subCategory && (
            <View style={[styles.labelBox, { marginTop: 10 }]}>
              <Text
                style={[
                  styles.subLabelText,
                  { fontFamily: fontFamilyObj?.fontBold },
                ]}
              >
                SNAP {currentPhotoLabel()}
              </Text>
            </View>
          )}
        </View>

        {options.category === "SCAN" && (
          <View style={styles.scanOverlay}>
            <View style={styles.scanBox} />
          </View>
        )}

        <View style={styles.bottomRow}>
          <TouchableOpacity onPress={pickImage} style={styles.actionBtn}>
            <FontAwesome name="image" size={36} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.actionBtn}>
            {!isUploading ? (
              <TouchableOpacity onPress={takePicture}>
                <MaterialIcons
                  name="radio-button-checked"
                  size={100}
                  color={colors.white}
                />
              </TouchableOpacity>
            ) : (
              <ActivityIndicator size="large" color={colors.white} />
            )}
          </View>
          <TouchableOpacity
            onPress={toggleCameraFacing}
            style={styles.actionBtn}
          >
            <MaterialIcons
              name="switch-camera"
              size={40}
              color={colors.white}
            />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  information: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    marginTop: 30,
  },
  labelContainer: {
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    marginTop: 10,
  },
  labelBox: {
    backgroundColor: colors.greyLighter,
    padding: 7,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  labelText: {
    fontSize: 18,
  },
  subLabelText: {
    fontSize: 14,
  },
  scanOverlay: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  scanBox: {
    height: height / 2.8,
    width: width / 2,
    borderWidth: 2,
    borderColor: colors.white,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    flex: 1,
    paddingBottom: 30,
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  permissionBtn: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
  },
  permissionText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});
