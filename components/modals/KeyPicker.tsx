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

interface KeyPickerProps {
  attr: {
    result: Array<{ Key_Ref: string; [key: string]: any }>;
    onModalClose: (response: { action: string; value: any }) => void;
  };
}

export default function KeyPicker({ attr }: KeyPickerProps) {
  const { fontFamilyObj, setModalState } = useAppContext();

  return (
    <ScrollView>
      {attr.result.map((item, i) => (
        <TouchableOpacity
          key={i}
          style={styles.keyItem}
          onPress={() => {
            setModalState({ isVisible: false });
            attr.onModalClose({ action: "key", value: item });
          }}
        >
          <Feather name="disc" color={colors.header} size={24} />
          <Text
            style={[styles.keyText, { fontFamily: fontFamilyObj?.fontBold }]}
          >
            {item.Key_Ref}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  keyItem: {
    padding: 10,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.greyLight,
  },
  keyText: {
    marginTop: 5,
    marginLeft: 10,
  },
});
