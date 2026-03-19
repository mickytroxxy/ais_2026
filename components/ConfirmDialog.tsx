import { colors } from "@/constants/colors";
import { useAppContext } from "@/contexts/AppContext";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ConfirmDialogProps {
  modalState: {
    isVisible: boolean;
    text: string;
    okayBtn: string;
    cancelBtn: string;
    response: (result: boolean) => void;
  };
  setConfirmDialog: (state: any) => void;
}

export default function ConfirmDialog({
  modalState,
  setConfirmDialog,
}: ConfirmDialogProps) {
  const { fontFamilyObj } = useAppContext();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalState.isVisible}
      onRequestClose={() => setConfirmDialog({ isVisible: false })}
    >
      <View style={styles.overlay}>
        <View style={styles.centeredView}>
          <Text
            style={[
              styles.messageText,
              { fontFamily: fontFamilyObj?.fontLight },
            ]}
          >
            {modalState.text}
          </Text>
          <View style={styles.buttonRow}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => {
                  setConfirmDialog({ isVisible: false });
                  modalState.response(false);
                }}
                style={[styles.button, styles.cancelButton]}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  {modalState.cancelBtn}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => {
                  setConfirmDialog({ isVisible: false });
                  modalState.response(true);
                }}
                style={[styles.button, styles.okayButton]}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  {modalState.okayBtn}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(52, 52, 52, 0.5)",
  },
  centeredView: {
    width: "80%",
    backgroundColor: colors.white,
    borderRadius: 5,
    padding: 15,
    justifyContent: "center",
    elevation: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    marginBottom: 15,
  },
  messageText: {
    fontSize: 15,
  },
  buttonRow: {
    flexDirection: "row",
    borderTopWidth: 0.7,
    marginTop: 15,
    paddingTop: 15,
    borderTopColor: colors.greyLight,
  },
  buttonContainer: {
    width: "50%",
    alignContent: "center",
    alignItems: "center",
  },
  button: {
    padding: 15,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: "tomato",
  },
  okayButton: {
    backgroundColor: "green",
  },
  buttonText: {
    color: colors.white,
    fontSize: 11,
  },
});
