import { colors } from "@/constants/colors";
import { useAppContext } from "@/contexts/AppContext";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity
} from "react-native";

const stages = [
  "STRIPPING STAGE",
  "PANEL BEATING STAGE",
  "PAINT PREP STAGE",
  "PAINTING STAGE",
  "ASSEMBLY STAGE",
  "MECHANICAL STAGE",
  "DIAGNOSTICS STAGE",
  "POLISHING STAGE",
  "CLEANING STAGE",
];

interface WipStagePickerProps {
  attr: {
    onModalClose: (response: { action: string; value: string }) => void;
  };
}

export default function WipStagePicker({ attr }: WipStagePickerProps) {
  const { fontFamilyObj, setModalState } = useAppContext();

  return (
    <ScrollView>
      {stages.map((item, i) => (
        <TouchableOpacity
          key={i}
          style={styles.stageItem}
          onPress={() => {
            setModalState({ isVisible: false });
            attr.onModalClose({ action: "wip", value: item });
          }}
        >
          <Feather name="disc" color={colors.header} size={24} />
          <Text
            style={[styles.stageText, { fontFamily: fontFamilyObj?.fontBold }]}
          >
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  stageItem: {
    padding: 10,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.greyLight,
  },
  stageText: {
    marginTop: 5,
    marginLeft: 10,
  },
});
