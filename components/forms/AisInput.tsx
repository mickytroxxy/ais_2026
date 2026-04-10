import { colors } from "@/constants/colors";
import {
  AntDesign,
  Feather,
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import React, { memo, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import * as Animatable from "react-native-animatable";
import { useAppContext } from "../../contexts/AppContext";

interface AisInputProps {
  attr: {
    field: string;
    icon: {
      name: any;
      type: string;
      color: string;
      min: number;
    };
    keyboardType?: any;
    placeholder: string;
    color: string;
    maxLength?: number;
    value?: string;
    handleChange: (field: string, value: string) => void;
  };
}

const AisInput = memo(({ attr }: AisInputProps) => {
  const { fontFamilyObj } = useAppContext();
  const [showPassword, setShowPassword] = useState(true);
  const [value, setValue] = useState("");
  // useEffect(() => {
  //   setValue(attr.value || "");
  // }, []);
  const renderIcon = (type: string, name: any, color: string) => {
    const iconProps = { name, size: 24, color };

    switch (type) {
      case "FontAwesome":
        return <FontAwesome {...iconProps} />;
      case "MaterialIcons":
        return <MaterialIcons {...iconProps} />;
      case "Ionicons":
        return <Ionicons {...iconProps} />;
      case "Feather":
        return <Feather {...iconProps} />;
      case "FontAwesome5":
        return <FontAwesome5 {...iconProps} />;
      case "AntDesign":
        return <AntDesign {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchInputHolder}>
        <View style={styles.iconContainer}>
          {renderIcon(attr.icon.type, attr.icon.name, attr.icon.color)}
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder={attr.placeholder}
            autoCapitalize="none"
            keyboardType={attr.keyboardType || "default"}
            maxLength={attr?.maxLength || 20000}
            placeholderTextColor={"#000"}
            value={value || attr.value || ""}
            onChangeText={(val) => {
              setValue(val);
              attr.handleChange(attr.field, val);
            }}
            secureTextEntry={attr.field === "password" ? showPassword : false}
            style={[styles.input, { fontFamily: fontFamilyObj?.fontBold }]}
          />
        </View>
        <View style={styles.iconContainer}>
          {attr.field === "password" ? (
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {!showPassword ? (
                <Feather name="eye-off" color={colors.grey} size={24} />
              ) : (
                <Feather name="eye" color={colors.grey} size={20} />
              )}
            </TouchableOpacity>
          ) : (
            <View>
              {value.length > attr.icon.min && (
                <Animatable.View animation="bounceIn">
                  <Feather name="check-circle" color="green" size={20} />
                </Animatable.View>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    height: 60,
  },
  searchInputHolder: {
    height: 60,
    borderRadius: 10,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.darkGrey,
    width: "100%",
  },
  iconContainer: {
    flex: 0.15,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    flex: 1,
    justifyContent: "center",
  },
  input: {
    borderColor: colors.white,
    fontSize: 14,
    color: colors.grey,
  },
});

export default AisInput;
