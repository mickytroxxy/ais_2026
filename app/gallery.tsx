import SimpleImageGrid from "@/components/SimpleImageGrid";
import { colors } from "@/constants/colors";
import { getBookingPhotos, getOtherPhotos } from "@/contexts/Api";
import { useAppContext } from "@/contexts/AppContext";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import moment from "moment";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Interface for photo metadata
export interface PhotoWithMetadata {
  url: string;
  fallbackUrl?: string;
  date?: string;
  time?: string;
  picture_comment?: string;
  user?: string;
  picture_name?: string;
  stage?: string;
}

let photoExistObj: any[] = [];

export default function GalleryScreen() {
  const params = useLocalSearchParams();
  const { fontFamilyObj, appState, showToast, setModalState } = useAppContext();
  const { carObj } = appState;
  const router = useRouter();
  const [photos, setPhotos] = useState<PhotoWithMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Parse options from params
  const options = params.options ? JSON.parse(params.options as string) : {};
  const from = params.from || "STAFF";
  const isStaff = from === "STAFF";

  // Reload photos every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, [carObj?.Key_Ref, options.category]),
  );

  const loadPhotos = () => {
    const baseImg = "http://154.117.189.170:8080";
    const fallbackBaseImg = "http://154.117.189.170:3000/files";

    if (!carObj?.Key_Ref) {
      setPhotos([]);
      setIsLoading(false);
      return;
    }

    if (
      options.category === "SECURITY PHOTOS" ||
      options.category === "BOOKING PHOTOS"
    ) {
      getBookingPhotos(carObj.Key_Ref, (result: any[], uri: string) => {
        photoExistObj = result || [];

        if (!result || result.length === 0) {
          setPhotos([]);
          setIsLoading(false);
          return;
        }
        console.log("[Gallery] Processing photos with:", result?.[0]);
        const processedPhotos: PhotoWithMetadata[] = result.map((item: any) => {
          const primaryUrl = `${baseImg}/mag_qoutation/mag_snapshot/security_images/${carObj.Key_Ref}/${item.url}`;
          const fallbackUrl = `${fallbackBaseImg}/mag_qoutation/mag_snapshot/security_images/${carObj.Key_Ref}/${item.url}`;
          return {
            url: primaryUrl,
            fallbackUrl,
            date: item.date,
            time: item.time,
            user: item.user || item.uploaded_by || item.staff_name,
            picture_name: item.url,
            picture_comment: item.picture_comment,
            stage: item.stage,
          };
        });

        setPhotos(processedPhotos);
        setIsLoading(false);
      });
    } else {
      getOtherPhotos(
        options.category,
        carObj.Key_Ref,
        (result: any[], uri: string) => {
          console.log("[Gallery] Processing photos with:", result?.[0]);
          photoExistObj = result || [];

          if (!result || result.length === 0) {
            setPhotos([]);
            setIsLoading(false);
            return;
          }

          const processedPhotos: PhotoWithMetadata[] = result.map(
            (item: any) => {
              const primaryUrl = `${baseImg}/mag_qoutation/photos/${carObj.Key_Ref}/${item.picture_name}`;
              const fallbackUrl = `${fallbackBaseImg}/mag_qoutation/photos/${carObj.Key_Ref}/${item.picture_name}`;
              return {
                url: primaryUrl,
                fallbackUrl,
                date: item.date,
                user: item.user || item.uploaded_by || item.staff_name,
                picture_name: item.picture_name,
                picture_comment: item.picture_comment,
                stage: item.stage,
                time: item.time,
              };
            },
          );

          setPhotos(processedPhotos);
          setIsLoading(false);
        },
      );
    }
  };

  const goToCamera = () => {
    if (options.category === "WORK IN PROGRESS") {
      // setModalState({
      //   isVisible: true,
      //   attr: { headerText: "ADD NOTES", onModalClose },
      // });
      console.log(
        `Vehicle ${carObj?.Reg_No} is on stage: ${options.subCategory}`,
      );
      visitCamera(
        `Vehicle ${carObj?.Reg_No} is on stage: ${options.subCategory}`,
      );
    } else {
      visitCamera("");
    }
  };

  const visitCamera = (comment: string) => {
    checkIfPhotoExist(
      options.category,
      options.subCategory,
      (counter: number | string) => {
        if (counter !== "canNot") {
          router.push({
            pathname: "/camera",
            params: {
              options: JSON.stringify(options),
              counter: counter.toString(),
              comment,
            },
          });
        } else {
          showToast("More than enough photos were taken today!");
        }
      },
    );
  };

  const onModalClose = (response: any) => {
    if (response) {
      visitCamera(response.value);
    }
  };

  const checkIfPhotoExist = (
    category: string,
    stage: string,
    cb: (counter: number | string) => void,
  ) => {
    let wipCounter: number | string = 0;
    const nowDate = moment(new Date(Date.now())).format("YYYY-MM-DD");
    let counter = photoExistObj.length;

    if (photoExistObj.length > 0) {
      if (category === "SECURITY PHOTOS" || category === "BOOKING PHOTOS") {
        photoExistObj.map((item, i) => {
          const date = item.date;
          const photo_type = item.photo_type;
          if (date === nowDate && photo_type === "Keys") {
            wipCounter = "canNot";
          }
          counter--;
          if (counter === 0) {
            cb(wipCounter);
          }
        });
      } else if (category === "WORK IN PROGRESS") {
        photoExistObj.map((item, i) => {
          const date = item.date;
          const photo_type = item.stage;
          if (date === nowDate && photo_type === stage) {
            wipCounter = typeof wipCounter === "number" ? wipCounter + 1 : 1;
          }
          counter--;
          if (counter === 0) {
            if (typeof wipCounter === "number" && wipCounter > 3) {
              cb("canNot");
            } else {
              cb(wipCounter);
            }
          }
        });
      } else {
        cb(wipCounter);
      }
    } else {
      cb(wipCounter);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.white, colors.white]}
        style={styles.content}
      >
        <ScrollView style={styles.scrollView}>
          {isStaff && (
            <TouchableOpacity onPress={goToCamera} style={styles.addButton}>
              <Text
                style={[
                  styles.addButtonText,
                  { fontFamily: fontFamilyObj?.fontBold },
                ]}
              >
                + {options.subCategory}
              </Text>
            </TouchableOpacity>
          )}
          <View style={styles.gridContainer}>
            {isLoading ? (
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={{ marginTop: 50 }}
              />
            ) : photos.length > 0 ? (
              <SimpleImageGrid data={photos} category={options.category} />
            ) : (
              <View style={{ alignItems: "center", marginTop: 50 }}>
                <Text
                  style={[
                    styles.noPhotosText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  No photos available
                </Text>
                <FontAwesome name="photo" size={120} color={colors.border} />
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 15,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.greyLight,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "900" as const,
  },
  content: {
    flex: 1,
    paddingTop: 10,
    borderRadius: 10,
  },
  scrollView: {
    padding: 10,
  },
  addButton: {
    borderWidth: 1,
    alignContent: "center" as const,
    alignItems: "center" as const,
    borderRadius: 10,
    padding: 10,
    borderColor: colors.primary,
  },
  addButtonText: {
    color: colors.primary,
  },
  gridContainer: {
    marginTop: 30,
  },
  noPhotosText: {
    textAlign: "center" as const,
    marginTop: 50,
    fontSize: 16,
    color: colors.grey,
  },
};
