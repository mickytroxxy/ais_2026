import { colors } from "@/constants/colors";
import { useAppContext } from "@/contexts/AppContext";
import { FontAwesome } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { height, width } = Dimensions.get("screen");
const SCAN_BOX_WIDTH = width - 80;
const SCAN_BOX_HEIGHT = height - 300;

export default function BarcodeScanner() {
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();
  const { fontFamilyObj, appState } = useAppContext();
  const { setSearchResults } = appState;

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.white} />
        <Text
          style={[styles.loadingText, { fontFamily: fontFamilyObj?.fontLight }]}
        >
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.loadingContainer}>
        <Text
          style={[
            styles.permissionText,
            { fontFamily: fontFamilyObj?.fontLight },
          ]}
        >
          We need camera permission to scan barcodes
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text
            style={[
              styles.permissionButtonText,
              { fontFamily: fontFamilyObj?.fontBold },
            ]}
          >
            GRANT PERMISSION
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButtonAlt}
          onPress={() => router.back()}
        >
          <FontAwesome
            name="arrow-circle-o-left"
            color={colors.white}
            size={36}
          />
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = (result: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);

    // Parse the barcode data (AIS disc format: %field1%field2%...)
    const resultArray = result.data.split("%");

    if (resultArray.length > 9) {
      // AIS disc format parsing
      const searchResults = {
        regNo: resultArray[6],
        engineNo: resultArray[5],
        description: resultArray[8],
        make: resultArray[9],
        vinNo: resultArray[4] || "",
      };
      setSearchResults(searchResults);
    } else {
      // Generic barcode - just return the raw data
      setSearchResults({ rawData: result.data, type: result.type });
    }

    router.back();
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: [
            "qr",
            "ean13",
            "ean8",
            "upc_a",
            "upc_e",
            "code39",
            "code93",
            "code128",
            "codabar",
            "itf14",
            "pdf417",
            "aztec",
            "datamatrix",
          ],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { fontFamily: fontFamilyObj?.fontBold }]}>
            AIS DISC SCANNER
          </Text>
          <Text
            style={[styles.subtitle, { fontFamily: fontFamilyObj?.fontLight }]}
          >
            Position the barcode within the frame
          </Text>
        </View>

        {/* Scan Box */}
        <View style={styles.scanBoxContainer}>
          <View style={styles.scanBox}>
            {/* Corner decorations */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomContainer}>
          {scanned ? (
            <TouchableOpacity
              style={styles.scanAgainButton}
              onPress={() => setScanned(false)}
            >
              <Text
                style={[
                  styles.scanAgainText,
                  { fontFamily: fontFamilyObj?.fontBold },
                ]}
              >
                TAP TO SCAN AGAIN
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.scanningIndicator}>
              <ActivityIndicator size="small" color={colors.white} />
              <Text
                style={[
                  styles.scanningText,
                  { fontFamily: fontFamilyObj?.fontLight },
                ]}
              >
                Scanning...
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <FontAwesome
              name="arrow-circle-o-left"
              color={colors.white}
              size={48}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: colors.white,
    fontSize: 16,
    marginTop: 15,
  },
  permissionText: {
    color: colors.white,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: colors.white,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 30,
  },
  permissionButtonText: {
    color: colors.primary,
    fontSize: 16,
  },
  backButtonAlt: {
    marginTop: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  titleContainer: {
    alignItems: "center",
    paddingTop: 80,
  },
  title: {
    color: colors.white,
    fontSize: 24,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginTop: -15,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginTop: -1,
  },
  scanBoxContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanBox: {
    width: SCAN_BOX_WIDTH,
    height: SCAN_BOX_HEIGHT,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 20,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: colors.white,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 20,
  },
  bottomContainer: {
    alignItems: "center",
    paddingBottom: 60,
  },
  scanningIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  scanningText: {
    color: colors.white,
    fontSize: 16,
    marginLeft: 10,
  },
  scanAgainButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.white,
    marginBottom: 30,
  },
  scanAgainText: {
    color: colors.white,
    fontSize: 16,
  },
  backButton: {
    padding: 10,
  },
});
