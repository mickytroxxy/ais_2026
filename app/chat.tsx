import { colors } from "@/constants/colors";
import { getBookingPhotos, getOtherPhotos } from "@/contexts/Api";
import { useAppContext } from "@/contexts/AppContext";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Animatable from "react-native-animatable";
import {
  Bubble,
  GiftedChat,
  IMessage,
  InputToolbar,
  Send,
} from "react-native-gifted-chat";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller"; // added for proper keyboard handling

// OpenAI API
const OPENAI_API_KEY = "";

interface PhotoItem {
  url?: string;
  picture_name?: string;
  photo_type?: string;
  stage?: string;
  date?: string;
  time?: string;
  category?: string;
  fullUrl?: string;
}

// Extended message interface for image messages
interface ImageMessage extends IMessage {
  image?: string;
}

interface PhotoData {
  security: PhotoItem[];
  booking: PhotoItem[];
  wip: PhotoItem[];
  accident: PhotoItem[];
  additional: PhotoItem[];
  drivers: PhotoItem[];
  parcel: PhotoItem[];
  marketers: PhotoItem[];
  clearance: PhotoItem[];
  lineManager: PhotoItem[];
}

export default function ChatScreen() {
  // Use appState to get carObj - EXACTLY like gallery.tsx
  const { appState, fontFamilyObj } = useAppContext();
  const { carObj } = appState; // This has ALL client details!
  const params = useLocalSearchParams<{ from?: string }>();
  const from = params.from || "CLIENT";

  const [messages, setMessages] = useState<IMessage[]>([
    {
      _id: "welcome",
      text: "👋 I can help you with this vehicle. Ask me a question!\n\n⚠️ AI responses are for assistance only. Please verify critical information.",
      createdAt: new Date(),
      user: { _id: "ai", name: "AI Assistant" },
    },
  ]);

  // Report reason options
  const reportReasons = [
    "Inappropriate content",
    "Incorrect information",
    "Offensive language",
    "Spam",
    "Other",
  ];

  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<IMessage | null>(null);

  // Handle report modal
  const showReportModal = (message: IMessage) => {
    setSelectedMessage(message);
    setIsReportModalVisible(true);
  };

  const handleReport = (reason: string) => {
    if (selectedMessage) {
      console.log("[Chat] Reported AI message:", {
        messageId: selectedMessage._id,
        reason: reason,
        messageText: selectedMessage.text,
        carObj: carObj?.Key_Ref,
        timestamp: new Date().toISOString(),
      });

      Alert.alert(
        "Thank you!",
        "This message has been reported. We'll review it to improve our AI.",
      );
    }
    setIsReportModalVisible(false);
    setSelectedMessage(null);
  };

  // Helper to parse photo requests from user text – stable reference keeps callbacks from re‑creating
  const parsePhotoRequest = useCallback(
    (text: string): { category: string; count: number } | null => {
      const lowerText = text.toLowerCase();

      // Define category mappings
      const categoryMap: { [key: string]: string[] } = {
        wip: ["wip", "work in progress", "work progress", "progress"],
        security: ["security", "booking"],
        booking: ["booking"],
        accident: ["accident"],
        additional: ["additional", "extras"],
        drivers: ["driver", "drivers"],
        parcel: ["parcel"],
        marketers: ["marketer", "marketing"],
        clearance: ["clearance"],
        "line manager": ["line manager", "manager"],
      };

      let requestedCategory = "";
      for (const [cat, keywords] of Object.entries(categoryMap)) {
        if (keywords.some((kw) => lowerText.includes(kw))) {
          requestedCategory = cat;
          break;
        }
      }
      if (!requestedCategory) return null;

      const numberMatch = lowerText.match(/(\d+)/);
      const count = numberMatch ? parseInt(numberMatch[1], 10) : 5;
      return { category: requestedCategory, count };
    },
    [],
  );

  const [photoData, setPhotoData] = useState<PhotoData>({
    security: [],
    booking: [],
    wip: [],
    accident: [],
    additional: [],
    drivers: [],
    parcel: [],
    marketers: [],
    clearance: [],
    lineManager: [],
  });
  const [isSending, setIsSending] = useState(false);

  const userId = from === "CLIENT" ? carObj?.Key_Ref : "STAFF";

  const loadPhotos = useCallback(() => {
    const keyRef = carObj?.Key_Ref;
    const baseImg = "http://154.117.189.170:8080";

    if (!keyRef) {
      return;
    }

    // Helper to build photo URLs (same as gallery.tsx)
    const buildPhotoUrls = (photos: any[], category: string): any[] => {
      if (!photos || photos.length === 0) return [];
      return photos.map((item: any) => {
        let url = "";
        if (category === "SECURITY PHOTOS" || category === "BOOKING PHOTOS") {
          url = `${baseImg}/mag_qoutation/mag_snapshot/security_images/${keyRef}/${item.url}`;
        } else {
          url = `${baseImg}/mag_qoutation/photos/${keyRef}/${item.picture_name}`;
        }
        return {
          ...item,
          fullUrl: url,
          category: category,
        };
      });
    };

    getBookingPhotos(keyRef, (photos: any) => {
      const photosWithUrls = buildPhotoUrls(photos, "BOOKING PHOTOS");
      setPhotoData((prev) => ({
        ...prev,
        security: photosWithUrls,
        booking: photosWithUrls,
      }));
    });

    getOtherPhotos("WORK IN PROGRESS", keyRef, (photos: any) => {
      const photosWithUrls = buildPhotoUrls(photos, "WORK IN PROGRESS");
      setPhotoData((prev) => ({ ...prev, wip: photosWithUrls }));
    });

    getOtherPhotos("ACCIDENT", keyRef, (photos: any) => {
      const photosWithUrls = buildPhotoUrls(photos, "ACCIDENT");
      setPhotoData((prev) => ({ ...prev, accident: photosWithUrls }));
    });

    getOtherPhotos("ADDITIONAL", keyRef, (photos: any) => {
      const photosWithUrls = buildPhotoUrls(photos, "ADDITIONAL");
      setPhotoData((prev) => ({ ...prev, additional: photosWithUrls }));
    });

    getOtherPhotos("DRIVERS", keyRef, (photos: any) => {
      const photosWithUrls = buildPhotoUrls(photos, "DRIVERS");
      setPhotoData((prev) => ({ ...prev, drivers: photosWithUrls }));
    });

    getOtherPhotos("PARCEL", keyRef, (photos: any) => {
      const photosWithUrls = buildPhotoUrls(photos, "PARCEL");
      setPhotoData((prev) => ({ ...prev, parcel: photosWithUrls }));
    });

    getOtherPhotos("MARKETERS", keyRef, (photos: any) => {
      const photosWithUrls = buildPhotoUrls(photos, "MARKETERS");
      setPhotoData((prev) => ({ ...prev, marketers: photosWithUrls }));
    });

    getOtherPhotos("CLEARANCE", keyRef, (photos: any) => {
      const photosWithUrls = buildPhotoUrls(photos, "CLEARANCE");
      setPhotoData((prev) => ({ ...prev, clearance: photosWithUrls }));
    });

    getOtherPhotos("LINE MANAGER PHOTOS", keyRef, (photos: any) => {
      const photosWithUrls = buildPhotoUrls(photos, "LINE MANAGER PHOTOS");
      setPhotoData((prev) => ({ ...prev, lineManager: photosWithUrls }));
    });
  }, [carObj?.Key_Ref]);

  // Initial load
  useEffect(() => {
    if (carObj?.Key_Ref) {
      loadPhotos();
    }
  }, [carObj?.Key_Ref, loadPhotos]);

  const handleSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      const userText = newMessages[0].text;

      setMessages((prev: any) => GiftedChat.append(prev, newMessages));
      setIsSending(true);

      // Check if user is requesting photos
      const photoRequest = parsePhotoRequest(userText);

      if (photoRequest) {
        // User wants photos - send image messages
        const categoryKey = photoRequest.category as keyof PhotoData;
        const photos = photoData[categoryKey] || [];
        const requestedCount = Math.min(photoRequest.count, photos.length);

        if (requestedCount > 0) {
          const selectedPhotos = photos.slice(0, requestedCount);
          const imageMessages: IMessage[] = selectedPhotos.map(
            (photo, index) => ({
              _id: `${Date.now()}_${index}`,
              text: `${photoRequest.category.toUpperCase()} - ${photo.date || ""} ${photo.time || ""}`,
              createdAt: new Date(),
              user: { _id: "ai", name: "AI Assistant" },
              image: photo.fullUrl,
            }),
          );

          setMessages((prev: any) => GiftedChat.append(prev, imageMessages));
          setIsSending(false);
          return;
        } else {
          // No photos found for category
          const aiMessage: IMessage = {
            _id: Date.now().toString(),
            text: `I couldn't find any ${photoRequest.category} photos for this vehicle. Available categories: Security (${photoData.security?.length || 0}), WIP (${photoData.wip?.length || 0}), Accident (${photoData.accident?.length || 0}), Additional (${photoData.additional?.length || 0})`,
            createdAt: new Date(),
            user: { _id: "ai", name: "AI Assistant" },
          };
          setMessages((prev: any) => GiftedChat.append(prev, [aiMessage]));
          setIsSending(false);
          return;
        }
      }

      try {
        // Create a concise summary of photo counts only - not the full URLs
        const photoSummary = {
          security: photoData.security?.length || 0,
          booking: photoData.booking?.length || 0,
          wip: photoData.wip?.length || 0,
          accident: photoData.accident?.length || 0,
          additional: photoData.additional?.length || 0,
        };

        const systemPrompt = `You are a helpful AI Vehicle Assistant for MAG accident management. 

Vehicle: ${carObj?.Reg_No || "N/A"} | ${carObj?.Make || ""} ${carObj?.Model || ""} | Status: ${carObj?.status || "Processing"}
Client: ${carObj?.Fisrt_Name || ""} ${carObj?.Last_Name || ""} | ${carObj?.Cell_number || carObj?.selected_cell_no || ""}

Photo counts: ${JSON.stringify(photoSummary)}

IMPORTANT: If user asks for photos (e.g., "show me wip photos"), respond with ONLY this exact phrase: "[SHOW_PHOTOS:CATEGORY:COUNT]" where CATEGORY is the photo type and COUNT is how many they want (default 5). Example: "[SHOW_PHOTOS:wip:5]" 

For all other questions, give helpful responses about the vehicle using the data above. Be brief and friendly.`;

        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: "gpt-3.5-turbo",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userText },
              ],
              max_tokens: 400,
            }),
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          // API failure – nothing to log in production
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        // response data logged when debugging if needed

        const aiText = data.choices?.[0]?.message?.content || "No response";

        // Check if AI wants to show photos
        const photoMatch = aiText.match(/\[SHOW_PHOTOS:(\w+):?(\d+)?\]/i);
        if (photoMatch) {
          const [, category, count] = photoMatch;
          const requestedCount = parseInt(count, 10) || 5;
          const categoryKey = category.toLowerCase() as keyof PhotoData;
          const photos = photoData[categoryKey] || [];
          const actualCount = Math.min(requestedCount, photos.length);

          if (actualCount > 0) {
            const selectedPhotos = photos.slice(0, actualCount);
            const imageMessages: IMessage[] = selectedPhotos.map(
              (photo, index) => ({
                _id: `${Date.now()}_${index}`,
                text: `${category.toUpperCase()} - ${photo.date || ""} ${photo.time || ""}`,
                createdAt: new Date(),
                user: { _id: "ai", name: "AI Assistant" },
                image: photo.fullUrl,
              }),
            );
            setMessages((prev: any) => GiftedChat.append(prev, imageMessages));
            setIsSending(false);
            return;
          }
        }

        const aiMessage: IMessage = {
          _id: Date.now().toString(),
          text: aiText,
          createdAt: new Date(),
          user: { _id: "ai", name: "AI Assistant" },
        };

        setMessages((prev: any) => GiftedChat.append(prev, [aiMessage]));
      } catch (error: any) {
        // Fallback - show vehicle info with photo counts
        const p = photoData;
        const totalPhotos =
          (p.security?.length || 0) +
          (p.booking?.length || 0) +
          (p.wip?.length || 0) +
          (p.accident?.length || 0) +
          (p.additional?.length || 0);
        const fallbackText = `📋 ${carObj?.Reg_No || carObj?.Key_Ref || "N/A"} - ${carObj?.Make || ""} ${carObj?.Model || ""}

👤 ${carObj?.Fisrt_Name || carObj?.Last_Name || "N/A"}
📞 ${carObj?.Cell_number || carObj?.selected_cell_no || "N/A"}

📸 ${totalPhotos} photos total
Security: ${p.security?.length || 0} | WIP: ${p.wip?.length || 0} | Accident: ${p.accident?.length || 0}

💡 Ask me for photos like "show me 5 wip photos"`;

        const aiMessage: IMessage = {
          _id: Date.now().toString(),
          text: fallbackText,
          createdAt: new Date(),
          user: { _id: "ai", name: "AI Assistant" },
        };

        setMessages((prev: any) => GiftedChat.append(prev, [aiMessage]));
      }

      setIsSending(false);
    },
    [carObj, photoData, fontFamilyObj],
  );

  const renderBubble = useCallback(
    (props: any) => {
      const isAI = props.currentMessage?.user?._id === "ai";
      const hasImage = props.currentMessage?.image;

      return (
        <Animatable.View animation="fadeIn" duration={300}>
          {hasImage ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: props.currentMessage.image }}
                style={styles.photoImage}
                resizeMode="cover"
              />
              <Text
                style={[
                  styles.imageCaption,
                  { fontFamily: fontFamilyObj?.fontLight },
                ]}
              >
                {props.currentMessage.text}
              </Text>
            </View>
          ) : (
            <View>
              <Bubble
                {...props}
                wrapperStyle={{
                  right: {
                    backgroundColor: "#7ab6e6",
                    borderRadius: 15,
                    borderBottomLeftRadius: 0,
                  },
                  left: {
                    backgroundColor: isAI ? "#e8f5e9" : "#d7e5e5",
                    borderRadius: 15,
                    borderBottomRightRadius: 0,
                  },
                }}
                textStyle={{
                  right: {
                    color: colors.white,
                    fontSize: 14,
                    fontFamily: fontFamilyObj?.fontLight || undefined,
                  },
                  left: {
                    color: isAI ? colors.aiText : colors.grey,
                    fontSize: 14,
                    fontFamily: fontFamilyObj?.fontLight || undefined,
                  },
                }}
              />
              {/* Report button for AI messages */}
              {isAI && (
                <TouchableOpacity
                  style={styles.reportButton}
                  onPress={() => showReportModal(props.currentMessage)}
                >
                  <MaterialIcons name="flag" size={14} color={colors.grey} />
                  <Text style={styles.reportText}>Report</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Animatable.View>
      );
    },
    [fontFamilyObj],
  );

  const renderSend = useCallback(
    (props: any) => (
      <Send {...props}>
        <View style={{ padding: 8, justifyContent: "center" }}>
          <Feather name="send" color={colors.header} size={24} />
        </View>
      </Send>
    ),
    [],
  );

  const renderInputToolbar = useCallback(
    (props: any) => (
      <InputToolbar
        {...props}
        containerStyle={{
          marginHorizontal: 5,
          marginBottom: 5,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 1,
        }}
        textInputProps={{
          ...props.textInputProps,
          multiline: false,
          returnKeyType: "send",
          style: {
            fontSize: 16,
            minHeight: 40,
            color: colors.black,
          },
        }}
      />
    ),
    [],
  );

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        <LinearGradient
          colors={colors.securityGradient as any}
          style={styles.gradient}
        >
          <KeyboardAwareScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flex: 1 }}
            enabled
          >
            <View style={{ flex: 1 }}>
              <GiftedChat
                messages={messages}
                onSend={handleSend}
                user={{ _id: userId || "user" }}
                renderBubble={renderBubble}
                renderSend={renderSend}
                renderInputToolbar={renderInputToolbar}
                isTyping={isSending}
                // keyboardAvoiding handled by parent
              />
            </View>
          </KeyboardAwareScrollView>
        </LinearGradient>
      </View>

      {/* Report Modal */}
      <Modal
        visible={isReportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsReportModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsReportModalVisible(false)}
        >
          <View style={styles.reportModal}>
            <Text style={styles.reportTitle}>Report AI Message</Text>
            <Text style={styles.reportSubtitle}>
              Why are you reporting this message?
            </Text>
            {reportReasons.map((reason, index) => (
              <TouchableOpacity
                key={index}
                style={styles.reportOption}
                onPress={() => handleReport(reason)}
              >
                <Text style={styles.reportOptionText}>{reason}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsReportModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.lightBackground },
  container: { flex: 1, backgroundColor: colors.primary, borderRadius: 10 },
  gradient: { flex: 1, borderRadius: 10 },
  imageContainer: {
    maxWidth: 250,
    marginBottom: 5,
  },
  photoImage: {
    width: 250,
    height: 180,
    borderRadius: 10,
  },
  imageCaption: {
    fontSize: 12,
    color: colors.darkGrey,
    marginTop: 4,
    textAlign: "center",
  },
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginLeft: 5,
    marginTop: 2,
  },
  reportText: {
    fontSize: 10,
    color: colors.grey,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  reportModal: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 20,
    width: "80%",
    maxWidth: 300,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.black,
    textAlign: "center",
    marginBottom: 5,
  },
  reportSubtitle: {
    fontSize: 14,
    color: colors.grey,
    textAlign: "center",
    marginBottom: 20,
  },
  reportOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reportOptionText: {
    fontSize: 16,
    color: colors.black,
  },
  cancelButton: {
    marginTop: 15,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "bold",
  },
});
