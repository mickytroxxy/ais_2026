import { colors } from "@/constants/colors";
import { useAppContext } from "@/contexts/AppContext";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function CommentsScreen() {
  const { fontFamilyObj } = useAppContext();

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Text style={[styles.title, { fontFamily: fontFamilyObj?.fontBold }]}>
            Comments
          </Text>
          <Text
            style={[styles.subtitle, { fontFamily: fontFamilyObj?.fontLight }]}
          >
            Vehicle comments and notes will be displayed here
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: colors.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.grey,
  },
});
