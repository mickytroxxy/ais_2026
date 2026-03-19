import { colors } from "@/constants/colors";
import { getChats } from "@/contexts/Api";
import { useAppContext } from "@/contexts/AppContext";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ChatItem {
  fname: string;
  uniqueUser: string;
  messageTo: string;
  text: string;
  createdAt: Date;
}

export default function ChatListScreen() {
  const { fontFamilyObj } = useAppContext();
  const router = useRouter();
  const [chatList, setChatList] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getChats((chats: ChatItem[]) => {
      // Filter unique users
      const uniqueChats = [
        ...new Map(chats.map((item) => [item.uniqueUser, item])).values(),
      ];
      setChatList(uniqueChats);
      setIsLoading(false);
    });
  }, []);

  const getDisplayUser = (chat: ChatItem) => {
    if (chat.fname === "CUSTOMER SUPPORT") {
      return chat.messageTo;
    }
    return chat.fname;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.securityGradient as any}
        style={styles.gradient}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.grey} />
            <Text
              style={{
                fontFamily: fontFamilyObj?.fontLight,
                color: colors.grey,
                marginTop: 10,
              }}
            >
              Loading messages...
            </Text>
          </View>
        ) : (
          <>
            {chatList.length > 0 ? (
              chatList.map((chat, i) => {
                const user = getDisplayUser(chat);
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() =>
                      router.push({
                        pathname: "/chat",
                        params: { from: "STAFF", keyRef: user },
                      })
                    }
                    style={styles.chatItem}
                  >
                    <FontAwesome
                      name="user-circle-o"
                      size={48}
                      color={colors.primary}
                    />
                    <View style={styles.chatContent}>
                      <Text
                        style={{
                          fontFamily: fontFamilyObj?.fontBold,
                          color: colors.primary,
                        }}
                      >
                        {user}
                      </Text>
                      <Text
                        style={{ fontFamily: fontFamilyObj?.fontLight }}
                        numberOfLines={1}
                      >
                        {chat.text}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyContainer}>
                <FontAwesome name="comments-o" size={60} color={colors.grey} />
                <Text
                  style={{
                    fontFamily: fontFamilyObj?.fontLight,
                    color: colors.grey,
                    marginTop: 10,
                  }}
                >
                  No conversations yet
                </Text>
              </View>
            )}
          </>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    marginTop: 5,
    borderRadius: 10,
    elevation: 5,
  },
  gradient: {
    flex: 1,
    paddingTop: 10,
    borderRadius: 10,
    padding: 10,
  },
  chatItem: {
    flexDirection: "row",
    marginTop: 10,
    borderBottomWidth: 0.7,
    borderBottomColor: colors.selectedOptionBg,
    alignContent: "center",
    alignItems: "center",
    paddingBottom: 5,
  },
  chatContent: {
    marginLeft: 7,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
});
