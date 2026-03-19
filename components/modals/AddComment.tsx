import { colors } from "@/constants/colors";
import { useAppContext } from "@/contexts/AppContext";
import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import AisInput from "../forms/AisInput";

interface AddCommentProps {
  attr: {
    onModalClose: (response: { action: string; value: string }) => void;
    actionType?: string;
    placeholder?: string;
  };
}

export default function AddComment({ attr }: AddCommentProps) {
  const { setModalState } = useAppContext();
  const [formData, setFormData] = useState({ comment: "" });
  const handleChange = (field: string, value: string) =>
    setFormData((v) => ({ ...v, [field]: value }));

  const actionType = attr?.actionType || "comment";
  const placeholder = attr?.placeholder || "Enter notes or comment";

  return (
    <ScrollView>
      <AisInput
        attr={{
          field: "comment",
          icon: {
            name: "list",
            type: "Ionicons",
            min: 5,
            color: colors.header,
          },
          keyboardType: null,
          placeholder: placeholder,
          color: colors.accent,
          handleChange,
        }}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => {
            setModalState({ isVisible: false });
            attr.onModalClose({ action: actionType, value: formData.comment });
          }}
        >
          <FontAwesome name="check-circle" size={120} color="green" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: "center",
    marginTop: 30,
  },
});
