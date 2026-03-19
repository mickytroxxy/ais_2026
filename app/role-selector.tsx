import { colors } from "@/constants/colors";
import { useAppContext } from "@/contexts/AppContext";
import { useRoleStore } from "@/stores/roleStore";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Animatable from "react-native-animatable";

// Role categories from app/main.tsx
const roleCategories = [
  { key: "security", title: "Security", icon: "security" },
  { key: "estimators", title: "Estimators", icon: "calculate" },
  { key: "marketers", title: "Marketers", icon: "campaign" },
  { key: "customerCare", title: "Customer Care", icon: "support-agent" },
  { key: "lineManagers", title: "Line Managers", icon: "supervisor-account" },
];

const renderRoleIcon = (
  icon: string,
  size: number = 32,
  color: string = "#fff",
) => {
  return <MaterialIcons name={icon as any} size={size} color={color} />;
};

export default function RoleSelectorScreen() {
  const router = useRouter();
  const { fontFamilyObj, accountInfo } = useAppContext();
  const { height } = Dimensions.get("screen");
  const { setSelectedRole } = useRoleStore();

  const handleRoleSelect = (roleKey: string) => {
    setSelectedRole(roleKey);
    router.replace({
      pathname: "/keyref",
      params: { role: roleKey },
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <LinearGradient
        colors={colors.loginGradient as any}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Animatable.View
          animation="bounceIn"
          duration={1500}
          useNativeDriver={true}
          style={styles.logoContainer}
        >
          <Feather name="users" color={colors.white} size={80} />
        </Animatable.View>

        <Text
          style={[styles.welcomeText, { fontFamily: fontFamilyObj?.fontBold }]}
        >
          Welcome, {accountInfo?.fname || "Staff"}
        </Text>

        <Text
          style={[
            styles.instructionText,
            { fontFamily: fontFamilyObj?.fontLight },
          ]}
        >
          Select your role to continue
        </Text>

        <View style={styles.rolesContainer}>
          {roleCategories.map((role, index) => (
            <Animatable.View
              key={role.key}
              animation="fadeInUp"
              duration={500}
              delay={index * 100}
              useNativeDriver={true}
            >
              <TouchableOpacity
                style={styles.roleButton}
                onPress={() => handleRoleSelect(role.key)}
                activeOpacity={0.8}
              >
                <View style={styles.roleIconContainer}>
                  {renderRoleIcon(role.icon)}
                </View>
                <Text
                  style={[
                    styles.roleButtonText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  {role.title}
                </Text>
                <Feather name="chevron-right" color={colors.white} size={24} />
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  gradient: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeText: {
    color: colors.white,
    fontSize: 28,
    textAlign: "center",
    marginBottom: 10,
  },
  instructionText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
  },
  rolesContainer: {
    flex: 1,
  },
  roleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
  },
  roleIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  roleButtonText: {
    flex: 1,
    color: colors.primary,
    fontSize: 18,
  },
});
