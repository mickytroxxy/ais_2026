import { colors } from "@/constants/colors";
import { getComments, getNetworkStatus } from "@/contexts/Api";
import { useAppContext } from "@/contexts/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Note {
  id?: number;
  note: string;
  Key_Ref: string;
  user: string;
  date: string;
  time: string;
  status: number;
}

export default function NotesScreen() {
  const { activeKeyRef } = useLocalSearchParams<{ activeKeyRef: string }>();
  const navigation = useNavigation();
  const { fontFamilyObj, setModalState, modalState } = useAppContext();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast, appState, accountInfo } = useAppContext();
  const router = useRouter();
  const userId = accountInfo?.user;
  const loadNotes = useCallback(() => {
    if (!activeKeyRef) return;
    setIsLoading(true);
    getComments(activeKeyRef, (result) => {
      const sortedNotes = (result || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );
      setNotes(sortedNotes);
      setIsLoading(false);
    });
  }, [activeKeyRef]);

  const showCurrentGallery = (options: any) => {
    router.push({
      pathname: "/gallery",
      params: { options: JSON.stringify(options), from: "STAFF" },
    });
  };
  const onModalClose = (response: any) => {
    if (response) {
      if (response.action == "wip") {
        showCurrentGallery({
          category: "WORK IN PROGRESS",
          subCategory: response.value,
        });
      } else if (response.action == "comment" || response.action == "sms") {
        console.log("Modal response:", response.sendSms, response.value);

        const notes = response.value;
        if (notes.length > 0) {
          getNetworkStatus((socket, url) => {
            socket.emit(
              !response.sendSms ? "saveChat" : "saveNotes",
              notes,
              activeKeyRef,
              userId,
              (cb: any) => {
                if (cb) {
                  showToast("Notes saved successfully!");
                  loadNotes();
                } else {
                  showToast("There was an error while trying to save notes!");
                }
              },
            );
          });
        } else {
          showToast("Please add something to proceed!");
        }
      } else if (response.action == "sms") {
        const message = response.value;
        if (message.length > 0) {
          // TODO: Implement SMS sending via socket
          getNetworkStatus((socket, url) => {
            socket.emit("sendSMS", message, activeKeyRef, userId, (cb: any) => {
              if (cb) {
                showToast("SMS sent successfully!");
              } else {
                showToast("There was an error while trying to send SMS!");
              }
            });
          });
        } else {
          showToast("Please enter a message to send!");
        }
      }
    }
  };

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    const wasVisible = modalState.isVisible;
    const isAddNotes = modalState.attr?.headerText === "ADD NOTES";

    if (wasVisible && !modalState.isVisible && isAddNotes) {
      loadNotes();
    }
  }, [modalState.isVisible, modalState.attr?.headerText, loadNotes]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            setModalState({
              isVisible: true,
              attr: { headerText: "ADD NOTES", onModalClose: onModalClose },
            });
          }}
          style={{ marginRight: 16 }}
        >
          <Ionicons name="add-circle" size={28} color={colors.white} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, setModalState, loadNotes]);

  const renderNoteItem = ({ item }: { item: Note }) => (
    <View style={styles.noteCard}>
      <View style={styles.noteHeader}>
        <Text
          style={[styles.noteUser, { fontFamily: fontFamilyObj?.fontBold }]}
        >
          {item.user}
        </Text>
        <Text style={styles.noteDate}>
          {item.date} {item.time}
        </Text>
      </View>
      <Text
        style={[styles.noteContent, { fontFamily: fontFamilyObj?.fontLight }]}
      >
        {item.note}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderNoteItem}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={loadNotes}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="document-text-outline"
              size={64}
              color={colors.grey}
            />
            <Text
              style={[
                styles.emptyText,
                { fontFamily: fontFamilyObj?.fontLight },
              ]}
            >
              No notes found
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  listContent: {
    padding: 16,
  },
  noteCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  noteUser: {
    fontSize: 14,
    color: colors.primary,
  },
  noteDate: {
    fontSize: 12,
    color: colors.grey,
  },
  noteContent: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.grey,
  },
});
