import { colors } from "@/constants/colors";
import { useAppContext } from "@/contexts/AppContext";
import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AisInput from "../forms/AisInput";

interface AddCommentProps {
  attr: {
    onModalClose: (response: {
      action: string;
      value: string;
      sendSms: boolean;
    }) => void;
    actionType?: string;
    placeholder?: string;
  };
}

export default function AddComment({ attr }: AddCommentProps) {
  const { setModalState, fontFamilyObj } = useAppContext();
  const [formData, setFormData] = useState({ comment: "" });
  const [sendSms, setSendSms] = useState(true);
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
      <View>
        <TouchableOpacity
          onPress={() => {
            setSendSms(!sendSms);
          }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 15,
            marginTop: 20,
            backgroundColor: "#f9f9f9",
            paddingVertical: 10,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#eee",
          }}
        >
          <Text style={{ fontSize: 16, fontFamily: fontFamilyObj?.fontBold }}>
            Send SMS
          </Text>
          <Switch
            value={sendSms}
            onValueChange={setSendSms}
            trackColor={{ false: "#767577", true: colors.primary }}
            thumbColor={sendSms ? colors.primary : "#f4f3f4"}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => {
            setModalState({ isVisible: false });
            attr.onModalClose({
              action: actionType,
              value: formData.comment,
              sendSms,
            });
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
