import { colors } from "@/constants/colors";
import { useAppContext } from "@/contexts/AppContext";
import { Feather, FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AddComment from "./modals/AddComment";
import KeyPicker from "./modals/KeyPicker";
import WipStagePicker from "./modals/WipStagePicker";

interface ModalControllerProps {
  modalState: {
    isVisible: boolean;
    attr: {
      headerText: string;
      onModalClose?: (response: any) => void;
      result?: any[];
    };
  };
  setModalState: (state: any) => void;
}

export default function ModalController({
  modalState,
  setModalState,
}: ModalControllerProps) {
  const { fontFamilyObj } = useAppContext();

  // Safely access modalState properties with fallbacks
  const isVisible = modalState?.isVisible ?? false;
  const attr = modalState?.attr;
  const headerText = attr?.headerText ?? "";

  // Safe attr objects for each modal component
  const wipStageAttr = {
    onModalClose:
      attr?.onModalClose ??
      ((response: { action: string; value: string }) => {}),
  };

  const addCommentAttr = {
    onModalClose:
      attr?.onModalClose ??
      ((response: { action: string; value: string }) => {}),
    actionType: headerText === "SEND SMS" ? "sms" : "comment",
    placeholder:
      headerText === "SEND SMS"
        ? "Enter SMS message"
        : "Enter notes or comment",
  };

  const keyPickerAttr = attr
    ? {
        result: attr.result ?? [],
        onModalClose:
          attr.onModalClose ??
          ((response: { action: string; value: any }) => {}),
      }
    : undefined;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => setModalState({ isVisible: false })}
    >
      <View style={styles.centeredView}>
        <View style={styles.ProfileFooterHeader}>
          <View style={styles.ellipsisContainer}>
            <FontAwesome name="ellipsis-h" color={colors.header} size={36} />
          </View>
          <TouchableOpacity
            onPress={() => setModalState({ isVisible: false })}
            style={styles.statsContainer}
          >
            <Feather name="arrow-left-circle" color={colors.grey} size={24} />
            <Text
              style={[
                styles.headerText,
                { fontFamily: fontFamilyObj?.fontBold },
              ]}
            >
              {headerText}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.contentContainer}>
          {headerText === "TAP TO SELECT STAGE" && (
            <WipStagePicker attr={wipStageAttr} />
          )}
          {headerText === "ADD NOTES" && <AddComment attr={addCommentAttr} />}
          {headerText === "SEND SMS" && <AddComment attr={addCommentAttr} />}
          {headerText === "PICK A KEY" && keyPickerAttr && (
            <KeyPicker attr={keyPickerAttr} />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    alignSelf: "center",
    marginTop: -5,
    justifyContent: "center",
    padding: 5,
  },
  ProfileFooterHeader: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomWidth: 1,
    borderColor: colors.greyLight,
    height: 70,
  },
  centeredView: {
    minHeight: "60%",
    marginTop: "auto",
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginLeft: 0,
    marginRight: 0,
    paddingHorizontal: 10,
  },
  ellipsisContainer: {
    alignContent: "center",
    alignItems: "center",
    marginTop: -10,
  },
  headerText: {
    textTransform: "uppercase",
    fontSize: 18,
    color: colors.header,
    marginLeft: 10,
  },
  contentContainer: {
    marginTop: 5,
  },
});
