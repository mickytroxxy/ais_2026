import { colors } from "@/constants/colors";
import { useAppContext } from "@/contexts/AppContext";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import { Stack, useLocalSearchParams } from "expo-router";
import { PDFDocument } from "pdf-lib";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Dimensions,
  Linking,
  Modal,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Pdf from "react-native-pdf";
import RNShare from "react-native-share";
import * as Sharing from "expo-sharing";
import SignatureScreen, {
  SignatureViewRef,
} from "react-native-signature-canvas";
import { WebView } from "react-native-webview";

export default function PdfViewerScreen() {
  const { fontFamilyObj } = useAppContext();
  const params = useLocalSearchParams();
  const uri = (params.uri as string) || "";
  const title = (params.title as string) || "Document";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Signature States
  const [isSigningMode, setIsSigningMode] = useState(false);
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  const [tapCoordinate, setTapCoordinate] = useState<{
    page: number;
    x: number;
    y: number;
  } | null>(null);
  const [isProcessingSignature, setIsProcessingSignature] = useState(false);
  const signatureRef = useRef<SignatureViewRef>(null);

  const pdfUrl = uri.trim();
  const isPdfFile = pdfUrl.toLowerCase().endsWith(".pdf");
  const viewUrl = isPdfFile ? pdfUrl : pdfUrl; // Webview will handle google docs fallback if non-pdf, wait originally it did Google Docs for PDF!

  // The original used docs.google for PDF, but now we use react-native-pdf if it's a PDF.
  const webViewUrl = isPdfFile
    ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`
    : pdfUrl;

  const openInBrowser = async () => {
    try {
      await Linking.openURL(uri);
    } catch (e) {
      console.error("Unable to open URL", e);
    }
  };

  const shareDocument = async () => {
    // Validate URL before sharing
    const trimmedUri = uri.trim();
    if (
      !trimmedUri ||
      (!trimmedUri.startsWith("http://") && !trimmedUri.startsWith("https://"))
    ) {
      console.error("Invalid document URL for sharing:", uri);
      return;
    }

    try {
      await Share.share({
        message: `Check out this document: ${uri}`,
        title: title,
        url: uri,
      });
    } catch (error: any) {
      console.error("Share error:", error);
    }
  };

  const handleClearSignature = () => {
    signatureRef.current?.clearSignature();
  };

  const handleConfirmSignature = () => {
    signatureRef.current?.readSignature();
  };

  const onSignSignature = async (base64Signature: string) => {
    if (!tapCoordinate) return;
    setSignatureModalVisible(false);
    setIsProcessingSignature(true);

    try {
      // 1. Download original PDF
      const localPdfUri = FileSystem.cacheDirectory + "temp_doc.pdf";
      const { uri: downloadedUri } = await FileSystem.downloadAsync(
        pdfUrl,
        localPdfUri,
      );

      // 2. Read PDF into file
      const pdfBytes = await FileSystem.readAsStringAsync(downloadedUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // 3. Process Signature Image
      const signatureImageBytes = base64Signature.replace(
        "data:image/png;base64,",
        "",
      );
      const pngImage = await pdfDoc.embedPng(signatureImageBytes);

      const { width, height } = pngImage.scale(0.25); // Scale down the signature

      // 4. Get the specific page
      const pages = pdfDoc.getPages();
      // react-native-pdf uses 1-based indexing for pages
      const pageIndex = tapCoordinate.page - 1;
      if (pageIndex >= 0 && pageIndex < pages.length) {
        const page = pages[pageIndex];
        const pageHeight = page.getHeight();

        // Convert y coordinate. pdf-lib origin is bottom-left, react-native-pdf is top-left.
        const pdfY = pageHeight - tapCoordinate.y;

        page.drawImage(pngImage, {
          x: tapCoordinate.x - width / 2,
          y: pdfY - height / 2,
          width: width,
          height: height,
        });
      }

      // 5. Save the modified PDF
      const modifiedPdfBase64 = await pdfDoc.saveAsBase64();

      // Ensure documentDirectory exists
      if (!FileSystem.documentDirectory) {
        console.error("documentDirectory is undefined or null");
        alert("Failed to save signed document");
        return;
      }

      const signedPdfUri = FileSystem.documentDirectory + "signed_document.pdf";
      await FileSystem.writeAsStringAsync(signedPdfUri, modifiedPdfBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 6. Share the signed PDF
      try {
        console.log("Sharing signed PDF with URI:", signedPdfUri);

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(signedPdfUri, {
            mimeType: "application/pdf",
            dialogTitle: "Share signed document",
            UTI: "com.adobe.pdf",
          });
        } else {
          // Fallback
          let fileUri = signedPdfUri;
          if (
            fileUri &&
            !fileUri.startsWith("file://") &&
            !fileUri.startsWith("http")
          ) {
            fileUri = "file://" + fileUri;
          }
          await RNShare.open({
            url: fileUri,
            type: "application/pdf",
            title: "Share signed document",
          });
        }
      } catch (error: any) {
        console.log("Share dismissed or error:", error);
      }
    } catch (e: any) {
      console.error("Signature error", e);
      alert("Failed to process signature: " + e.message);
    } finally {
      setIsProcessingSignature(false);
      setTapCoordinate(null);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: title,
          headerRight: () => (
            <View style={{ flexDirection: "row" }}>
              {isPdfFile && (
                <TouchableOpacity
                  onPress={() => setIsSigningMode(!isSigningMode)}
                  style={{
                    padding: 8,
                    backgroundColor: isSigningMode
                      ? colors.white
                      : "transparent",
                    borderRadius: 8,
                    marginRight: 5,
                  }}
                >
                  <MaterialIcons
                    name="draw"
                    size={24}
                    color={isSigningMode ? colors.primary : colors.white}
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={shareDocument} style={{ padding: 8 }}>
                <Ionicons name="share-social" size={24} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity onPress={openInBrowser} style={{ padding: 8 }}>
                <Ionicons name="open-outline" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {isSigningMode && (
        <View style={styles.signingModeBanner}>
          <Text
            style={[
              styles.signingModeText,
              { fontFamily: fontFamilyObj?.fontBold },
            ]}
          >
            Signing Mode Active: Tap anywhere on the document to sign.
          </Text>
        </View>
      )}

      {!uri ? (
        <View style={styles.errorContainer}>
          <Text
            style={[styles.errorText, { fontFamily: fontFamilyObj?.fontBold }]}
          >
            No document URL provided
          </Text>
        </View>
      ) : (
        <View style={styles.pdfContainer}>
          {loading && !isProcessingSignature && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text
                style={[
                  styles.loadingText,
                  { fontFamily: fontFamilyObj?.fontLight },
                ]}
              >
                Loading document...
              </Text>
            </View>
          )}
          {isProcessingSignature && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text
                style={[
                  styles.loadingText,
                  { fontFamily: fontFamilyObj?.fontLight },
                ]}
              >
                Applying signature...
              </Text>
            </View>
          )}

          {error ? (
            <View style={styles.errorContainer}>
              <Text
                style={[
                  styles.errorText,
                  { fontFamily: fontFamilyObj?.fontBold },
                ]}
              >
                Unable to load document
              </Text>
              <Text
                style={[
                  styles.errorText,
                  { fontFamily: fontFamilyObj?.fontLight },
                ]}
              >
                {error}
              </Text>
              <View style={styles.openButton}>
                <Button
                  title="Open in browser"
                  onPress={openInBrowser}
                  color={colors.primary}
                />
              </View>
            </View>
          ) : isPdfFile ? (
            <Pdf
              source={{ uri: viewUrl, cache: true }}
              style={styles.pdf}
              onLoadComplete={(numberOfPages, filePath) => {
                setLoading(false);
                setError(null);
              }}
              onPageSingleTap={(page, x, y) => {
                if (isSigningMode) {
                  setTapCoordinate({ page, x, y });
                  setSignatureModalVisible(true);
                }
              }}
              onError={(error: any) => {
                setError(error?.message || "Could not load document");
                setLoading(false);
              }}
              trustAllCerts={false}
            />
          ) : (
            <WebView
              source={{ uri: webViewUrl }}
              style={styles.pdf}
              onLoadStart={() => {
                setLoading(true);
                setError(null);
              }}
              onLoadEnd={() => setLoading(false)}
              onError={(syntheticEvent) => {
                setError(
                  syntheticEvent.nativeEvent.description ||
                    "Could not load document",
                );
                setLoading(false);
              }}
              startInLoadingState
            />
          )}
        </View>
      )}

      {/* Signature Modal */}
      <Modal
        visible={signatureModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureHeader}>
              <Text
                style={[
                  styles.signatureTitle,
                  { fontFamily: fontFamilyObj?.fontBold },
                ]}
              >
                Draw your signature
              </Text>
              <TouchableOpacity onPress={() => setSignatureModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.grey} />
              </TouchableOpacity>
            </View>

            <View style={styles.canvasContainer}>
              <SignatureScreen
                ref={signatureRef}
                onOK={onSignSignature}
                webStyle={
                  "\\n" +
                  "    .m-signature-pad { box-shadow: none; border: none; margin: 0; padding: 0; }\\n" +
                  "    .m-signature-pad--body { border: none; }\\n" +
                  "    .m-signature-pad--footer { display: none; margin: 0; }\\n" +
                  "    body,html { width: 100%; height: 100%; margin: 0; padding: 0; }\\n" +
                  "  "
                }
                autoClear={false}
                backgroundColor={colors.white}
              />
            </View>

            <View style={styles.signatureActions}>
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={handleClearSignature}
              >
                <Text
                  style={[
                    styles.clearBtnText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  Clear
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleConfirmSignature}
              >
                <Text
                  style={[
                    styles.saveBtnText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  Save Signature
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  signingModeBanner: {
    backgroundColor: colors.primary,
    padding: 10,
    alignItems: "center",
  },
  signingModeText: {
    color: colors.white,
    fontSize: 14,
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: colors.greyLighter,
    width: "100%",
  },
  pdf: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.85)",
    zIndex: 10,
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.darkText,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: colors.aiText,
    textAlign: "center",
  },
  openButton: {
    marginTop: 14,
    width: "75%",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  signatureBox: {
    width: "90%",
    height: 400,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
    padding: 15,
  },
  signatureHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  signatureTitle: {
    fontSize: 16,
    color: colors.darkText,
  },
  canvasContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.greyLight,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 15,
  },
  signatureActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  clearBtn: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.grey,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  clearBtnText: {
    color: colors.grey,
    fontSize: 14,
  },
  saveBtn: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    flex: 1,
    alignItems: "center",
  },
  saveBtnText: {
    color: colors.white,
    fontSize: 14,
  },
});
