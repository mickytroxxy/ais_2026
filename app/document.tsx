import { colors } from "@/constants/colors";
import { getNetworkStatus, uploadDocument } from "@/contexts/Api";
import { useAppContext } from "@/contexts/AppContext";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DocumentScanner from "react-native-document-scanner-plugin";
const BASE_URL = "http://154.117.189.170:8080/ais/public/docs/uploaded/";
// Document type definition (from server)
interface Document {
  id: number;
  Description: string;
  Key_Ref: string;
  audit_file_status: number;
  date: string;
  date_modified: string | null;
  pre_cost_status: number;
  time: string;
  url: string;
  user: string;
}

export default function DocumentScreen() {
  const { fontFamilyObj, showToast, appState } = useAppContext();
  const params = useLocalSearchParams();
  const router = useRouter();
  const activeKeyRef = params.activeKeyRef as string;

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNoDocuments, setShowNoDocuments] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load existing documents on mount
  useEffect(() => {
    fetchDocuments();

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set timeout to show "no documents found" after 10 seconds
    // This will show regardless of loading state after 10 seconds
    timeoutRef.current = setTimeout(() => {
      if (documents.length === 0) {
        setLoading(false);
        setShowNoDocuments(true);
      }
    }, 10000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [activeKeyRef]);

  const normalizeDocUrl = (rawUrl: string) => {
    if (!rawUrl) return "";
    let normalized = rawUrl.replace(/\\/g, "/");
    normalized = normalized.replace(/^\.\./, "");
    normalized = normalized.replace(/^\//, "");
    normalized = normalized.replace(/\/\//g, "/");
    normalized = normalized.replace(/\/\//g, "/");
    normalized = normalized.replace(/\/\//g, "/");
    normalized = normalized.replace(/\/\//g, "/");
    normalized = normalized.replace(/\/\//g, "/");
    // remove repeated slashes
    normalized = normalized.replace(/\/\/+/, "/");
    if (normalized.startsWith("ais/public/docs")) {
      normalized = "/" + normalized;
    }
    return normalized;
  };

  const fetchDocuments = () => {
    setLoading(true);
    setShowNoDocuments(false);
    getNetworkStatus((socket, url) => {
      if (!socket) {
        setLoading(false);
        setShowNoDocuments(true);
        return;
      }
      socket.emit("getDocuments", activeKeyRef, (response: any[]) => {
        const normalized = (response || []).map((doc: any) => ({
          id: Number(doc.id) || Date.now(),
          Description: doc.Description || doc.description || "Document",
          Key_Ref: doc.Key_Ref || activeKeyRef,
          audit_file_status: doc.audit_file_status ?? 0,
          date: doc.date || new Date().toISOString().split("T")[0],
          date_modified: doc.date_modified ?? null,
          pre_cost_status: doc.pre_cost_status ?? 0,
          time: doc.time || new Date().toTimeString().slice(0, 5),
          url: normalizeDocUrl(doc.url || doc.URL || ""),
          user: doc.user || "Unknown",
        }));
        setDocuments(normalized);
        console.log("Fetched documents:", normalized);
        setLoading(false);
        if (normalized.length === 0) {
          setShowNoDocuments(true);
        }
      });
    });
  };

  const scanDocument = async () => {
    setShowBottomSheet(false);

    try {
      // Check and request camera permission
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "AIS needs access to your camera to scan documents.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            "Permission Denied",
            "Camera permission is required to scan documents.",
          );
          return;
        }
      }

      // Start the document scanner
      const { scannedImages } = await DocumentScanner.scanDocument();

      // Get back an array with scanned image file paths
      if (scannedImages && scannedImages.length > 0) {
        const scannedUri = scannedImages[0];
        setScannedImage(scannedUri);

        const newDoc = {
          Description: `Scanned Document ${new Date().toISOString().slice(0, 10)}`,
          uri: scannedUri,
          type: "image",
        };

        // Save to server
        saveDocument(newDoc);
      }
    } catch (error: any) {
      console.error("Document scanner error:", error);
      showToast("Error scanning document");
    }
  };

  const pickDocument = async () => {
    setShowBottomSheet(false);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const isPDF = asset.mimeType === "application/pdf";

        const newDoc = {
          Description:
            asset.name || `Document_${new Date().toISOString().slice(0, 10)}`,
          uri: asset.uri,
          type: isPDF ? "pdf" : "image",
        };

        // Save to server
        saveDocument(newDoc);
      }
    } catch (error: any) {
      console.error("Document picker error:", error);
      showToast("Error picking document");
    }
  };

  const saveDocument = (doc: any) => {
    setLoading(true);

    uploadDocument(
      doc.uri,
      activeKeyRef,
      doc.Description || doc.name || "Document",
      doc.type === "image" ? "image" : "pdf",
      (status, filePath) => {
        if (!filePath) {
          showToast("Error saving document");
          setLoading(false);
          return;
        }
        const parts = filePath?.split("/");
        const docUrl = parts[parts.length - 1];
        getNetworkStatus((socket, url) => {
          socket.emit(
            "updateClientDoc",
            docUrl,
            activeKeyRef,
            (success: boolean) => {
              if (success) {
                const updatedDoc: Document = {
                  id: Date.now(),
                  Description: doc.Description || doc.name || "Document",
                  Key_Ref: activeKeyRef,
                  audit_file_status: 0,
                  date: new Date().toISOString().split("T")[0],
                  date_modified: null,
                  pre_cost_status: 0,
                  time: new Date().toTimeString().slice(0, 5),
                  url: docUrl,
                  user: "You",
                };
                setDocuments((prev) => [updatedDoc, ...prev]);
                showToast("Document saved successfully!");
                setScannedImage(null);
              } else {
                showToast("Error saving document");
              }
              setLoading(false);
            },
          );
        });
      },
    );
  };

  const handleViewDocument = (doc: Document) => {
    let docUrl = doc.url || "";
    if (doc?.url?.includes("/")) {
      const parts = doc.url.split("/");
      docUrl = parts[parts.length - 1];
    }
    const uri = BASE_URL + doc.Key_Ref + "/" + docUrl;
    console.log("Viewing document:", doc);
    router.push({
      pathname: "/pdf-viewer",
      params: { uri, title: doc.Description || "Document" },
    });
  };

  const handleDeleteDocument = (docId: string) => {
    Alert.alert(
      "Delete Document",
      "Are you sure you want to delete this document?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            getNetworkStatus((socket, url) => {
              if (!socket) return;
              socket.emit(
                "deleteDocument",
                activeKeyRef,
                docId,
                (success: boolean) => {
                  if (success) {
                    const parsedTypeId = Number(docId);
                    setDocuments((prev) =>
                      prev.filter((d) => d.id !== parsedTypeId),
                    );
                    showToast("Document deleted");
                  }
                },
              );
            });
          },
        },
      ],
    );
  };

  const renderDocumentItem = ({ item }: { item: Document }) => {
    const isPdf = item.url?.toLowerCase().endsWith(".pdf");
    const displayDate = item.date
      ? new Date(item.date).toLocaleDateString()
      : "Unknown date";
    return (
      <TouchableOpacity
        style={styles.documentItem}
        onPress={() => handleViewDocument(item)}
        onLongPress={() => handleDeleteDocument(item.id.toString())}
      >
        <View style={styles.documentIcon}>
          {isPdf ? (
            <FontAwesome name="file-pdf-o" size={32} color={colors.aiText} />
          ) : (
            <Image source={{ uri: item.url }} style={styles.thumbnail} />
          )}
        </View>
        <View style={styles.documentInfo}>
          <Text
            style={[
              styles.documentName,
              { fontFamily: fontFamilyObj?.fontBold },
            ]}
          >
            {item.Description || "Document"}
          </Text>
          <Text
            style={[
              styles.documentDate,
              { fontFamily: fontFamilyObj?.fontLight },
            ]}
          >
            {displayDate} {item.time || ""}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={colors.grey} />
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={[
              styles.loadingText,
              { fontFamily: fontFamilyObj?.fontLight },
            ]}
          >
            Loading documents...
          </Text>
        </View>
      );
    }

    if (showNoDocuments) {
      return (
        <View style={styles.noDocumentsContainer}>
          <MaterialIcons name="folder-open" size={100} color={colors.border} />
          <Text
            style={[
              styles.noDocumentsText,
              { fontFamily: fontFamilyObj?.fontBold },
            ]}
          >
            No Documents Found
          </Text>
          <Text
            style={[
              styles.noDocumentsSubtext,
              { fontFamily: fontFamilyObj?.fontLight },
            ]}
          >
            Tap the + button to scan or add documents
          </Text>
        </View>
      );
    }

    return null;
  };

  // Bottom Sheet Modal Component
  const BottomSheetModal = () => (
    <Modal
      visible={showBottomSheet}
      transparent
      animationType="slide"
      onRequestClose={() => setShowBottomSheet(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowBottomSheet(false)}
      >
        <View style={styles.bottomSheet}>
          <View style={styles.bottomSheetHandle} />

          <Text
            style={[
              styles.bottomSheetTitle,
              { fontFamily: fontFamilyObj?.fontBold },
            ]}
          >
            Add Document
          </Text>

          <TouchableOpacity
            style={styles.bottomSheetOption}
            onPress={() => scanDocument()}
          >
            <View
              style={[
                styles.bottomSheetIcon,
                { backgroundColor: colors.primary },
              ]}
            >
              <MaterialIcons
                name="document-scanner"
                size={28}
                color={colors.white}
              />
            </View>
            <View style={styles.bottomSheetOptionText}>
              <Text
                style={[
                  styles.bottomSheetOptionTitle,
                  { fontFamily: fontFamilyObj?.fontBold },
                ]}
              >
                Scan Document
              </Text>
              <Text
                style={[
                  styles.bottomSheetOptionSubtitle,
                  { fontFamily: fontFamilyObj?.fontLight },
                ]}
              >
                Use camera to scan (converts to PDF)
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomSheetOption}
            onPress={() => pickDocument()}
          >
            <View
              style={[
                styles.bottomSheetIcon,
                { backgroundColor: colors.aiText },
              ]}
            >
              <MaterialIcons
                name="picture-as-pdf"
                size={28}
                color={colors.white}
              />
            </View>
            <View style={styles.bottomSheetOptionText}>
              <Text
                style={[
                  styles.bottomSheetOptionTitle,
                  { fontFamily: fontFamilyObj?.fontBold },
                ]}
              >
                Pick PDF File
              </Text>
              <Text
                style={[
                  styles.bottomSheetOptionSubtitle,
                  { fontFamily: fontFamilyObj?.fontLight },
                ]}
              >
                Select PDF from files
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomSheetCancelButton}
            onPress={() => setShowBottomSheet(false)}
          >
            <Text
              style={[
                styles.bottomSheetCancelText,
                { fontFamily: fontFamilyObj?.fontBold },
              ]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: "Documents",
          headerRight: () => (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowBottomSheet(true)}
            >
              <MaterialIcons name="add" size={24} color={colors.white} />
            </TouchableOpacity>
          ),
        }}
      />
      <FlatList
        data={documents}
        renderItem={renderDocumentItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={
          documents.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={renderEmptyList}
        // refreshing={loading}
        // onRefresh={fetchDocuments}
      />

      {/* Bottom Sheet Modal */}
      <BottomSheetModal />
    </View>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  headerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGreyBorder,
  },
  headerTitle: {
    fontSize: 20,
    color: colors.primary,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  documentIcon: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.greyLighter,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  documentName: {
    fontSize: 16,
    color: colors.darkText,
  },
  documentDate: {
    fontSize: 12,
    color: colors.grey,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: colors.grey,
  },
  noDocumentsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  noDocumentsText: {
    fontSize: 20,
    color: colors.grey,
    marginBottom: 8,
  },
  noDocumentsSubtext: {
    fontSize: 14,
    color: colors.grey,
    textAlign: "center",
  },
  // Bottom Sheet Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 20,
    color: colors.primary,
    textAlign: "center",
    marginBottom: 24,
  },
  bottomSheetOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.lighterBackground,
    borderRadius: 12,
    marginBottom: 12,
  },
  bottomSheetIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomSheetOptionText: {
    marginLeft: 16,
    flex: 1,
  },
  bottomSheetOptionTitle: {
    fontSize: 16,
    color: colors.darkText,
  },
  bottomSheetOptionSubtitle: {
    fontSize: 12,
    color: colors.grey,
    marginTop: 2,
  },
  bottomSheetCancelButton: {
    marginTop: 16,
    padding: 16,
    alignItems: "center",
  },
  bottomSheetCancelText: {
    fontSize: 16,
    color: colors.grey,
  },
});
