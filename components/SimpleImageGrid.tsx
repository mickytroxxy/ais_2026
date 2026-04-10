import { PhotoWithMetadata } from "@/app/gallery";
import { colors } from "@/constants/colors";
import { useAppContext } from "@/contexts/AppContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, Modal, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";

// Interface for photo metadata

interface SimpleImageGridProps {
  data: PhotoWithMetadata[];
  category?: string;
}

function GridImage({
  item,
  imageSize,
  onPress,
}: {
  item: PhotoWithMetadata;
  imageSize: number;
  onPress: () => void;
}) {
  const [uri, setUri] = React.useState(item.url);

  React.useEffect(() => {
    setUri(item.url);
  }, [item.url]);

  return (
    <TouchableOpacity
      style={[
        styles.imageWrapper,
        { width: imageSize, height: imageSize + 50 },
      ]}
      onPress={() => {
        onPress();
        console.log("Image pressed:", item.url);
      }}
    >
      <Image
        source={{ uri }}
        style={[styles.image, { width: imageSize - 4, height: imageSize - 4 }]}
        contentFit="cover"
        onError={() => {
          if (item.fallbackUrl && uri !== item.fallbackUrl) {
            setUri(item.fallbackUrl);
          }
        }}
      />
      <View style={styles.metadataContainer}>
        {item.date && (
          <Text style={styles.metadataText} numberOfLines={1}>
            {item.date} {item?.time ? `- ${item?.time}` : "NO TIME"}
          </Text>
        )}
        {item.user && (
          <Text style={styles.metadataUserText} numberOfLines={1}>
            {item.user}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function SimpleImageGrid({
  data,
  category,
}: SimpleImageGridProps) {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const { fontFamilyObj } = useAppContext();

  // Find the selected photo item from the data array
  const selectedPhoto = data.find((item) => item.url === selectedImage);
  const numColumns = 3;
  const screenWidth = Dimensions.get("window").width;
  const imageSize = (screenWidth - 40) / numColumns;

  const handleShare = async () => {
    if (!selectedImage) return;

    // Validate that the URL is a valid URI before sharing
    const trimmedUrl = selectedImage.trim();
    if (
      !trimmedUrl ||
      (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://"))
    ) {
      console.error(
        "Invalid image URL: URL is empty or not a valid HTTP URI:",
        selectedImage,
      );
      return;
    }

    try {
      const result = await Share.share({
        url: selectedImage,
        message: "Check out this image",
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type
          console.log("Shared with activity type:", result.activityType);
        } else {
          // Shared successfully
          console.log("Image shared successfully");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dismissed");
      }
    } catch (error: any) {
      console.error("Share error:", error);
    }
  };

  return (
    <>
      <View style={styles.gridContainer}>
        {data.map((item, index) => (
          <GridImage
            key={`${item.url}-${index}`}
            item={item}
            imageSize={imageSize}
            onPress={() => {
              setSelectedImage(item.url);
              console.log("Selected image URL:", item);
            }}
          />
        ))}
      </View>

      <Modal
        visible={!!selectedImage}
        transparent={true}
        onRequestClose={() => setSelectedImage(null)}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => setSelectedImage(null)}
        >
          {selectedImage && (
            <>
              <Image
                source={{ uri: selectedImage }}
                style={styles.fullImage}
                contentFit="contain"
              />
              {(selectedPhoto?.picture_comment || selectedPhoto?.stage) && (
                <View style={styles.metadataModalContainer}>
                  {selectedPhoto?.picture_comment && (
                    <Text
                      style={[
                        {
                          fontFamily: fontFamilyObj?.fontLight,
                          color: colors.white,
                        },
                        { textAlign: "center", marginTop: 10 },
                      ]}
                    >
                      {selectedPhoto.picture_comment}
                    </Text>
                  )}
                  {selectedPhoto?.stage && (
                    <Text
                      style={[
                        {
                          color: colors.white,
                          fontFamily: fontFamilyObj?.fontBold,
                        },
                        { textAlign: "center", marginTop: 5 },
                      ]}
                    >
                      Stage: {selectedPhoto.stage}
                    </Text>
                  )}
                </View>
              )}
              {category === "ADDITIONAL" && (
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={handleShare}
                >
                  <Ionicons
                    name="share-social"
                    size={28}
                    color={colors.white}
                  />
                  <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 2,
  },
  imageWrapper: {
    margin: 2,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: colors.greyLighter,
  },
  image: {
    borderRadius: 4,
  },
  metadataContainer: {
    padding: 4,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 4,
    marginTop: 2,
  },
  metadataText: {
    color: colors.white,
    fontSize: 10,
  },
  metadataUserText: {
    color: colors.border,
    fontSize: 9,
  },
  metadataModalContainer: {
    position: "absolute",
    left: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 8,
    marginHorizontal: "5%",
    bottom: 100,
  },
  stageText: {
    color: colors.primary,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: Dimensions.get("window").width - 20,
    height: Dimensions.get("window").height - 100,
  },
  shareButton: {
    position: "absolute",
    bottom: 50,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 8,
  },
  shareButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
