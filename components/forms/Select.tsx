import { colors } from "@/constants/colors";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { useAppContext } from "../../contexts/AppContext";

interface SelectInputProps {
  attr: {
    field: string;
    list: Array<{ label: string; value: string }>;
    placeholder?: string;
    padding?: number;
    handleChange: (field: string, value: string) => void;
  };
}

const SelectInput = ({ attr }: SelectInputProps) => {
  const { fontFamilyObj } = useAppContext();

  if (Platform.OS === "ios") {
    return (
      <View style={[styles.iosContainer, { padding: attr.padding || 10 }]}>
        <RNPickerSelect
          onValueChange={(value) => attr.handleChange(attr.field, value)}
          items={attr.list}
          placeholder={{ label: attr.placeholder || "Select...", value: null }}
          style={{
            inputIOS: {
              fontFamily: fontFamilyObj?.fontLight,
              fontSize: 14,
              color: colors.grey,
            },
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.androidContainer}>
      <RNPickerSelect
        onValueChange={(value) => attr.handleChange(attr.field, value)}
        items={attr.list}
        placeholder={{ label: attr.placeholder || "Select...", value: null }}
        style={{
          inputAndroid: {
            fontFamily: fontFamilyObj?.fontLight,
            fontSize: 14,
            color: colors.grey,
          },
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  iosContainer: {
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 10,
  },
  androidContainer: {
    borderWidth: 0.5,
    borderColor: colors.greyLight,
    borderRadius: 10,
    padding: 5,
  },
});

export default SelectInput;
