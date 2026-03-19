import { colors } from "@/constants/colors";
import { useAppContext } from "@/contexts/AppContext";
import {
  FIREBASE_CONFIG,
  GROUP_CHAT_COLLECTION,
} from "@/contexts/FirebaseConfig";
import {
  ChatMessage,
  EMPTY_CHAT_MESSAGES,
  MessageStatus,
  useChatStore,
} from "@/stores/chatStore";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getApps, initializeApp } from "firebase/app";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { getNetworkStatus } from "@/contexts/Api";
import {
  collection,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Animatable from "react-native-animatable";
import {
  Bubble,
  GiftedChat,
  IMessage,
  InputToolbar,
  Send,
} from "react-native-gifted-chat";

// ─── WhatsApp-style background pattern component ─────────────────────────────
const WhatsAppPatternBackground = () => (
  <View style={styles.patternContainer} pointerEvents="none">
    {Array.from({ length: 20 }).map((_, row) => (
      <View key={`row-${row}`} style={styles.patternRow}>
        {Array.from({ length: 10 }).map((__, col) => (
          <View
            key={`dot-${row}-${col}`}
            style={[
              styles.patternDot,
              {
                backgroundColor:
                  (row + col) % 2 === 0
                    ? "rgba(0, 0, 0, 0.03)"
                    : "rgba(0, 0, 0, 0.01)",
              },
            ]}
          />
        ))}
      </View>
    ))}
  </View>
);

// ─── Time formatting helper ────────────────────────────────────────────────
function formatMessageTime(timestamp: any): string {
  if (!timestamp) return "";

  // Firestore Timestamp objects have a toDate() method
  let date: Date;
  if (typeof timestamp === "number") {
    date = new Date(timestamp);
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else if (timestamp && typeof timestamp.toDate === "function") {
    date = timestamp.toDate();
  } else {
    // fallback: try coercing to Date
    date = new Date(timestamp);
  }

  if (!(date && typeof date.toLocaleTimeString === "function")) {
    return "";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ─── Generate unique ID ───────────────────────────────────────────────────
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ─── Firebase (singleton guard) ────────────────────────────────────────────────
const firebaseApp =
  getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApps()[0];
const db = getFirestore(firebaseApp);
const { height } = Dimensions.get("window");

// ─── Photo category options (mirrors main.tsx) ────────────────────────────────
const PHOTO_CATEGORIES = [
  {
    label: "Booking / Security",
    category: "BOOKING PHOTOS",
    subCategory: "Booking",
  },
  {
    label: "Work In Progress",
    category: "WORK IN PROGRESS",
    subCategory: "WIP",
  },
  { label: "Accident Photos", category: "ACCIDENT", subCategory: "ACCIDENT" },
  {
    label: "Additional Photos",
    category: "ADDITIONAL",
    subCategory: "ADDITIONAL",
  },
  { label: "Drivers Photos", category: "DRIVERS", subCategory: "DRIVERS" },
  { label: "Parcel Photos", category: "PARCEL", subCategory: "PARCEL" },
  {
    label: "Marketers Photos",
    category: "MARKETERS",
    subCategory: "MARKETERS",
  },
  {
    label: "Clearance Photos",
    category: "CLEARANCE",
    subCategory: "CLEARANCE",
  },
  {
    label: "Line Manager Photos",
    category: "LINE MANAGER PHOTOS",
    subCategory: "LINE MANAGER",
  },
];

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// ─── Push notification helpers ────────────────────────────────────────────────

async function sendPushNotifications(
  tokens: string[],
  title: string,
  body: string,
  keyRef: string,
) {
  console.log(`[GROUP CHAT] Sending push to ${tokens.length} tokens:`, {
    title,
    body,
    keyRef,
  });
  if (!tokens.length) return;

  try {
    const messages = tokens.map((token) => ({
      to: token,
      title,
      body,
      sound: "default",
      data: { screen: "group-chat", keyRef },
    }));
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
      },
      body: JSON.stringify(messages),
    });
    console.log("[GROUP CHAT] Push notifications sent successfully");
  } catch (err) {
    console.log("[GROUP CHAT] Push send error:", err);
  }
}

// ─── Message Status Tick Component (WhatsApp-style) ─────────────────────────────
const MessageStatusTick = ({
  status,
  isOutgoing,
}: {
  status?: MessageStatus;
  isOutgoing: boolean;
}) => {
  if (!isOutgoing) return null;

  const getColor = () => {
    switch (status) {
      case "delivered":
        return "#34B7F1";
      case "failed":
        return "#ff4444";
      default:
        return "#fff";
    }
  };

  return (
    <View style={styles.tickContainer}>
      {status === "delivered" ? (
        <MaterialIcons name="done-all" size={14} color={getColor()} />
      ) : status === "sent" ? (
        <Feather name="check" size={12} color={getColor()} />
      ) : status === "pending" ? (
        <Feather name="clock" size={12} color={getColor()} />
      ) : status === "failed" ? (
        <MaterialIcons name="error-outline" size={14} color={getColor()} />
      ) : null}
    </View>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function GroupChatScreen() {
  const { appState, fontFamilyObj, accountInfo, registerForPushNotifications } =
    useAppContext();
  const { imageUrl, setImageUrl, carObj } = appState;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  // navigation for header customization
  const navigation: any = useNavigation();

  const params = useLocalSearchParams<{ keyRef?: string }>();
  const keyRef: string = params.keyRef || carObj?.Key_Ref || "GLOBAL";

  const saveMsgAsNote = async (notes: string) => {
    if (notes.length > 0) {
      getNetworkStatus((socket, url) => {
        socket.emit("saveChat", notes, keyRef, senderId, (cb: any) => {
          if (cb) {
            console.log("Notes saved successfully!");
          } else {
            console.log("There was an error while trying to save notes!");
          }
        });
      });
    }
  };
  // set dynamic header title and add ask AI button
  useLayoutEffect(() => {
    navigation.setOptions({
      title: carObj?.regNumber || carObj?.Key_Ref || "AIS UPDATE",

      headerRight: () => (
        <TouchableOpacity
          onPress={() => router.push("/chat")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginRight: 0,
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 14,
              marginRight: 4,
              fontFamily: fontFamilyObj?.fontBold,
            }}
          >
            ASK AI
          </Text>
          <MaterialIcons name="chat" size={20} color={colors.white} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, router, carObj]);

  // Zustand store - use memoized function references to prevent re-renders
  // persist the empty constant so the selector is stable when there are no
  // messages yet for this keyRef (avoids infinite update loop)
  const storeMessages = useChatStore(
    useCallback(
      (state) => state.messages[keyRef] ?? EMPTY_CHAT_MESSAGES,
      [keyRef],
    ),
  );
  const pendingMessages = useChatStore((state) => state.pendingMessages);
  const isOnline = useChatStore((state) => state.isOnline);

  // Memoize store functions to prevent new references on each render
  const setStoreMessages = useMemo(
    () => useChatStore.getState().setMessages,
    [],
  );
  const addStoreMessage = useMemo(() => useChatStore.getState().addMessage, []);
  const updateMessageStatus = useMemo(
    () => useChatStore.getState().updateMessageStatus,
    [],
  );
  const addPendingMessage = useMemo(
    () => useChatStore.getState().addPendingMessage,
    [],
  );
  const removePendingMessage = useMemo(
    () => useChatStore.getState().removePendingMessage,
    [],
  );
  const setOnlineStatus = useMemo(
    () => useChatStore.getState().setOnlineStatus,
    [],
  );
  const getPendingMessages = useMemo(
    () => useChatStore.getState().getPendingMessages,
    [],
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // strip transient `pending` flag before handing to GiftedChat – the
  // library displays its own clock icon when that field is present, which
  // duplicates our custom tick component.
  const displayedMessages = useMemo(
    () => messages.map(({ pending, ...m }) => m as ChatMessage),
    [messages],
  );

  // lazy loading: only show a subset of messages initially
  const [visibleCount, setVisibleCount] = useState(20);
  const hasMore = displayedMessages.length > visibleCount;

  // reset visible count when switching channels or receiving new history
  useEffect(() => {
    setVisibleCount(20);
  }, [keyRef, displayedMessages.length]);
  const visibleMessages = useMemo(
    () => displayedMessages.slice(0, visibleCount),
    [displayedMessages, visibleCount],
  );

  // image zoom view
  const [zoomImageUri, setZoomImageUri] = useState<string | null>(null);

  const [isSending, setIsSending] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  // keyboardHeight removed; using KeyboardAwareScrollView instead
  const { pushToken } = useAppContext();

  // If the token was not yet obtained (permissions denied earlier or slow
  // registration), attempt again when this screen mounts.
  useEffect(() => {
    if (!pushToken) {
      registerForPushNotifications().catch(() => {});
    }
  }, [pushToken, registerForPushNotifications]);
  const messagesRef = useRef<ChatMessage[]>([]);
  // track IDs of messages we created so we can always treat them as
  // outgoing (alignment and tick) even if snapshot data loses the user
  // field or GiftedChat repositions them
  const outgoingIdsRef = useRef<Set<string>>(new Set());

  // Combine stored messages with pending messages
  useEffect(() => {
    // combine stored messages with pending messages; guard undefined
    const base = storeMessages || [];
    const combined = [...base];
    pendingMessages.forEach((pending) => {
      if (!combined.some((m) => m._id === pending._id)) {
        combined.unshift(pending);
      }
    });
    setMessages(combined);
    messagesRef.current = combined;
  }, [storeMessages, pendingMessages]);

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const sheetAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // ─── Sync pending messages when back online ─────────────────────────────
  const syncPendingMessages = useCallback(async () => {
    const pending = getPendingMessages();
    if (pending.length === 0) return;

    console.log(`[GROUP CHAT] Syncing ${pending.length} pending messages...`);

    for (const msg of pending) {
      try {
        const docRef = doc(collection(db, GROUP_CHAT_COLLECTION));
        await setDoc(docRef, {
          keyRef,
          text: msg.text || "",
          image: msg.image || null,
          createdAt: msg.createdAt,
          user: { _id: msg.user._id, name: msg.user.name, avatar: "" },
          pushToken: pushToken || "",
          selectedCategory: msg.selectedCategory || null,
          _localId: msg._id,
        });

        updateMessageStatus(keyRef, String(msg._id), "sent");
        removePendingMessage(String(msg._id));

        console.log(`[GROUP CHAT] Synced message: ${msg._id}`);

        // after successfully syncing, send push notifications just like we do
        // for live messages.  build token set from current cache (which now
        // includes the just-synced message) but exclude self.
        const seenTokens = new Set<string>();
        messagesRef.current.forEach((m: any) => {
          const t: string = m.pushToken || "";
          if (t && t !== pushToken && t.startsWith("ExponentPushToken")) {
            seenTokens.add(t);
          }
        });
        if (seenTokens.size > 0) {
          const body = msg.text
            ? `${senderName}: ${msg.text}`
            : `${senderName} sent a photo`;
          await sendPushNotifications(
            [...seenTokens],
            "AIS UPDATE",
            body,
            keyRef,
          );
        }
      } catch (err) {
        console.log(`[GROUP CHAT] Failed to sync message ${msg._id}:`, err);
        updateMessageStatus(keyRef, String(msg._id), "failed");
      }
    }
  }, [
    keyRef,
    getPendingMessages,
    updateMessageStatus,
    removePendingMessage,
    pushToken,
  ]);

  // Ref to store latest syncPendingMessages to avoid dependency issues
  const syncPendingMessagesRef = useRef(syncPendingMessages);
  syncPendingMessagesRef.current = syncPendingMessages;

  // ─── Network status listener ─────────────────────────────────────────────
  useEffect(() => {
    // Track previous online status to avoid redundant updates
    const previousOnlineRef = { current: null as boolean | null };

    const handleNetInfoChange = (state: any) => {
      const online = state.isConnected ?? false;

      // Only update if status actually changed
      if (previousOnlineRef.current !== online) {
        previousOnlineRef.current = online;
        setOnlineStatus(online);

        if (online) {
          // Call syncPendingMessages via ref to avoid dependency issues
          syncPendingMessagesRef.current?.();
        }
      }
    };

    const unsubscribe = NetInfo.addEventListener(handleNetInfoChange);

    // Fetch initial state
    NetInfo.fetch()
      .then(handleNetInfoChange)
      .catch(() => {
        setOnlineStatus(true); // Default to online on error
      });

    return () => unsubscribe();
  }, []);

  // ─── Notification tap → deep-link ───────────────────────────────────────
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as any;
        if (data?.screen === "group-chat" && data?.keyRef) {
          router.push({
            pathname: "/group-chat",
            params: { keyRef: data.keyRef },
          });
        }
      },
    );
    return () => sub.remove();
  }, []);

  // ─── Real-time Firestore listener (memory-safe) ──────────────────────────
  useEffect(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    const q = query(
      collection(db, GROUP_CHAT_COLLECTION),
      where("keyRef", "==", keyRef),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs: ChatMessage[] = snapshot.docs.map((doc) => {
          const d = doc.data();
          const msgUser = d.user || {};
          const msg: ChatMessage = {
            _id: doc.id,
            text: d.text ?? "",
            createdAt: d.createdAt?.toDate?.() ?? new Date(),
            user: {
              _id: msgUser._id || "unknown",
              name: msgUser?.name || "Unknown",
            },
            status: "delivered",
            pushToken: d.pushToken || "",
          };
          if (d.image) (msg as any).image = d.image;
          if (d.selectedCategory)
            (msg as any).selectedCategory = d.selectedCategory;
          return msg;
        });

        setStoreMessages(keyRef, msgs);
      },
      (error) => {
        console.log("[GROUP CHAT] onSnapshot error:", error.message);
      },
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [keyRef, setStoreMessages]);

  // ─── Ship image message after camera returns ─────────────────────────────
  useEffect(() => {
    if (!imageUrl) return;
    const uri = imageUrl;
    setImageUrl?.(null);
    handlePhotoReady(uri);
  }, [imageUrl]);

  // ─── Derived values ──────────────────────────────────────────────────────
  const senderId: string = accountInfo?.user || "staff";
  const senderName: string = accountInfo?.fname || accountInfo?.user || "Staff";

  // ─── Send text message (offline-capable) ─────────────────────────────────
  const handleSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      const text = (newMessages[0]?.text || "").trim();

      if (!text) {
        return;
      }
      setIsSending(true);

      const localId = generateId();
      // remember this id so the bubble/time renderer keeps it outgoing
      outgoingIdsRef.current.add(String(localId));
      const localMessage: ChatMessage = {
        _id: localId,
        text,
        createdAt: Date.now(),
        user: { _id: senderId, name: senderName },
        status: "pending",
        pending: true,
        pushToken: pushToken || "",
      };

      addStoreMessage(keyRef, localMessage);

      if (!isOnline) {
        addPendingMessage(localMessage);
        setIsSending(false);
        return;
      }

      try {
        const seenTokens = new Set<string>();
        messagesRef.current.forEach((m: any) => {
          const t: string = m.pushToken || "";
          if (
            t &&
            t !== pushToken &&
            t.startsWith("ExponentPushToken") &&
            !seenTokens.has(t)
          ) {
            seenTokens.add(t);
          }
        });
        console.log(
          `[GROUP CHAT] Sending message to Firestore with ${seenTokens.size} push tokens:`,
          {
            text,
            keyRef,
          },
        );
        const docRef = doc(collection(db, GROUP_CHAT_COLLECTION));
        await setDoc(docRef, {
          keyRef,
          text,
          createdAt: new Date(),
          user: { _id: senderId, name: senderName, avatar: "" },
          pushToken: pushToken || "",
          image: null,
          _localId: localId,
        });

        updateMessageStatus(keyRef, localId, "sent");
        saveMsgAsNote(text);
        if (seenTokens.size > 0) {
          await sendPushNotifications(
            [...seenTokens],
            "AIS UPDATE",
            `${senderName}: ${text}`,
            keyRef,
          );
        }
      } catch (err: any) {
        console.log("[GROUP CHAT] Send error:", err);
        addPendingMessage(localMessage);
        updateMessageStatus(keyRef, localId, "failed");
      } finally {
        setIsSending(false);
      }
    },
    [
      keyRef,
      senderId,
      senderName,
      messagesRef,
      pushToken,
      isOnline,
      addStoreMessage,
      addPendingMessage,
      updateMessageStatus,
    ],
  );

  const handlePhotoReady = useCallback(
    async (serverUrl: string) => {
      setIsUploadingPhoto(true);

      const localId = generateId();
      outgoingIdsRef.current.add(String(localId));
      const localMessage: ChatMessage = {
        _id: localId,
        text: "",
        createdAt: Date.now(),
        user: { _id: senderId, name: senderName },
        image: serverUrl,
        status: "pending",
        pending: true,
        selectedCategory: selectedCategory || undefined,
        pushToken: pushToken || "",
      };

      addStoreMessage(keyRef, localMessage);

      if (!isOnline) {
        addPendingMessage(localMessage);
        setIsUploadingPhoto(false);
        return;
      }

      try {
        const seenTokens = new Set<string>();
        messagesRef.current.forEach((m: any) => {
          const t: string = m.pushToken || "";
          if (t && t !== pushToken && t.startsWith("ExponentPushToken")) {
            seenTokens.add(t);
          }
        });

        const docRef = doc(collection(db, GROUP_CHAT_COLLECTION));
        await setDoc(docRef, {
          keyRef,
          text: "",
          image: serverUrl,
          createdAt: new Date(),
          selectedCategory,
          user: { _id: senderId, name: senderName, avatar: "" },
          pushToken: pushToken || "",
          _localId: localId,
        });

        updateMessageStatus(keyRef, localId, "sent");

        if (seenTokens.size > 0) {
          await sendPushNotifications(
            [...seenTokens],
            "AIS UPDATE",
            `${senderName} sent a photo`,
            keyRef,
          );
        }
      } catch (err: any) {
        console.log("[GROUP CHAT] Photo error:", err);
        addPendingMessage(localMessage);
        updateMessageStatus(keyRef, localId, "failed");
      } finally {
        setIsUploadingPhoto(false);
      }
    },
    [
      keyRef,
      senderId,
      senderName,
      messagesRef,
      pushToken,
      selectedCategory,
      isOnline,
      addStoreMessage,
      addPendingMessage,
      updateMessageStatus,
    ],
  );

  // ─── Navigate to camera ──────────────────────────────────────────────────
  const navigateToCamera = useCallback(
    (category: string, subCategory: string) => {
      setSelectedCategory(category);
      closeSheet(() => {
        router.push({
          pathname: "/camera",
          params: {
            options: JSON.stringify({ category, subCategory }),
            counter: "0",
            comment: "AIS UPDATE",
            isGroupChat: "true",
          },
        });
      });
    },
    [],
  );

  // ─── Bottom sheet helpers ───────────────────────────────────────────────
  const openSheet = () => {
    setShowCategories(true);
    Animated.spring(sheetAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 55,
      friction: 9,
    }).start();
  };

  const closeSheet = (cb?: () => void) => {
    Animated.timing(sheetAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setShowCategories(false);
      cb?.();
    });
  };

  // ─── Render helpers ───────────────────────────────────────────────────────
  const renderBubble = (props: any) => {
    const currentMessage = props.currentMessage as ChatMessage;

    const isOutgoing =
      props.position === "right" ||
      currentMessage?.user?._id === senderId ||
      outgoingIdsRef.current.has(String(currentMessage?._id));

    return (
      <Animatable.View animation="fadeIn" duration={200}>
        <Bubble
          {...props}
          // remove the default left margin that GiftedChat applies to
          // incoming messages (it reserves space for avatars/grouping). we
          // want every bubble flush against the left edge.
          containerStyle={{
            left: { marginLeft: 0 },
            right: { marginRight: 0 },
          }}
          wrapperStyle={{
            right: {
              backgroundColor: colors.primary,
              borderRadius: 16,
              borderBottomRightRadius: 2,
            },
            left: {
              backgroundColor: colors.bubbleLeftAI,
              borderRadius: 16,
              borderBottomLeftRadius: 2,
            },
          }}
          textStyle={{
            right: {
              color: colors.white,
              fontSize: 13,
              fontFamily: fontFamilyObj?.fontLight || undefined,
            },
            left: {
              color: colors.black,
              fontSize: 13,
              fontFamily: fontFamilyObj?.fontLight || undefined,
            },
          }}
          usernameStyle={{
            color: colors.primary,
            fontFamily: fontFamilyObj?.fontBold || undefined,
            fontSize: 11,
          }}
          renderUsernameOnMessage={false}
        />
      </Animatable.View>
    );
  };

  // Custom image renderer
  const renderMessageImage = (props: any) => {
    const uri: string = props.currentMessage?.image;
    const category: string = props.currentMessage?.selectedCategory;

    if (!uri) return null;

    let imageUri = uri;
    if (!uri.startsWith("http")) {
      imageUri = `http://154.117.189.170:3000/${uri}`;
    }

    return (
      <View style={[styles.imageContainer, { alignSelf: "center" }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            console.log("[IMAGE] tapped", imageUri);
            setZoomImageUri(imageUri);
          }}
        >
          <Image
            source={{ uri: imageUri }}
            style={styles.photoImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
        {category ? (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{category}</Text>
          </View>
        ) : null}
        {props.currentMessage?.text ? (
          <Text style={styles.imageCaption}>{props.currentMessage.text}</Text>
        ) : null}
      </View>
    );
  };

  const renderSend = (props: any) => (
    <Send {...props}>
      <View style={styles.sendBtn}>
        <Feather name="send" color={colors.primary} size={22} />
      </View>
    </Send>
  );

  const renderInputToolbar = (props: any) => (
    <InputToolbar
      {...props}
      containerStyle={styles.inputToolbar}
      textInputProps={{
        ...props.textInputProps,
        multiline: false,
        returnKeyType: "send",
        style: {
          fontSize: 14,
          minHeight: 38,
          color: colors.black,
          fontFamily: fontFamilyObj?.fontLight || undefined,
        },
      }}
    />
  );

  const renderActions = () => (
    <TouchableOpacity style={styles.cameraBtn} onPress={openSheet}>
      {isUploadingPhoto ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <MaterialIcons
          name="add-photo-alternate"
          size={26}
          color={colors.primary}
        />
      )}
    </TouchableOpacity>
  );

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        <LinearGradient
          colors={colors.groupChatGradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <WhatsAppPatternBackground />

          <KeyboardAwareScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flex: 1 }}
            enabled={true}
            // let the library handle all keyboard spacing automatically
          >
            <GiftedChat
              messages={visibleMessages}
              loadEarlierMessagesProps={{
                isAvailable: hasMore,
                isLoading: false,
                onPress: () => setVisibleCount((c) => c + 20),
                isInfiniteScrollEnabled: false,
              }}
              // removed by TS patch
              // removed by TS patch
              // removed by TS patch
              listProps={{ showsVerticalScrollIndicator: false }}
              onSend={handleSend}
              user={{ _id: senderId, name: senderName }}
              renderBubble={renderBubble}
              renderMessageImage={renderMessageImage}
              renderSend={renderSend}
              renderInputToolbar={renderInputToolbar}
              renderActions={renderActions}
              isUserAvatarVisible={false}
              isUsernameVisible={false}
              //renderAvatar={() => null}
              renderTime={(props: any) => {
                const msg = props.currentMessage as ChatMessage;
                const timeStr = formatMessageTime(msg?.createdAt);
                const isOutgoingTime =
                  msg?.user?._id === senderId ||
                  outgoingIdsRef.current.has(String(msg?._id));
                return (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: fontFamilyObj?.fontBold,
                          color: "#18c01e",
                        }}
                      >
                        {msg?.user?.name || "Unknown"}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 10,
                        color: isOutgoingTime ? "#fff" : "#555",
                        fontFamily: fontFamilyObj?.fontLight || undefined,
                      }}
                    >
                      {timeStr}
                    </Text>
                    <View>
                      <MessageStatusTick
                        status={msg?.status}
                        isOutgoing={isOutgoingTime}
                      />
                    </View>
                  </View>
                );
              }}
              isAvatarVisibleForEveryMessage={false}
              isTyping={isSending}
              // no manual offset; KeyboardAwareScrollView handles adjustments
            />
          </KeyboardAwareScrollView>

          {!isOnline && (
            <View style={styles.offlineIndicator}>
              <MaterialIcons name="cloud-off" size={16} color={colors.white} />
              <Text style={styles.offlineText}>
                Offline - Messages will be sent when connected
              </Text>
            </View>
          )}
        </LinearGradient>
      </View>

      {/* full‑screen zoom modal */}
      <Modal
        visible={!!zoomImageUri}
        transparent
        animationType="fade"
        onRequestClose={() => setZoomImageUri(null)}
      >
        <TouchableOpacity
          style={styles.zoomOverlay}
          activeOpacity={1}
          onPress={() => setZoomImageUri(null)}
        >
          {zoomImageUri && (
            <Image
              source={{ uri: zoomImageUri }}
              style={styles.zoomImage}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </Modal>

      {/* ── Photo category bottom sheet ──────────────────────────────── */}
      <Modal
        visible={showCategories}
        transparent
        animationType="none"
        onRequestClose={() => closeSheet()}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => closeSheet()}
        >
          <Animated.View
            style={[styles.sheet, { transform: [{ translateY: sheetAnim }] }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.sheetHandle} />
            <Text
              style={[
                styles.sheetTitle,
                { fontFamily: fontFamilyObj?.fontBold },
              ]}
            >
              📷 SELECT PHOTO CATEGORY
            </Text>
            <Text
              style={[
                styles.sheetSub,
                { fontFamily: fontFamilyObj?.fontLight },
              ]}
            >
              Choose what you want to photograph and share
            </Text>

            {PHOTO_CATEGORIES.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.catRow}
                onPress={() =>
                  navigateToCamera(item.category, item.subCategory)
                }
              >
                <MaterialIcons
                  name="photo-camera"
                  size={22}
                  color={colors.primary}
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={[
                    styles.catLabel,
                    { fontFamily: fontFamilyObj?.fontLight },
                  ]}
                >
                  {item.label}
                </Text>
                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  color="#ccc"
                  style={{ marginLeft: "auto" }}
                />
              </TouchableOpacity>
            ))}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.lightBackground },
  container: { flex: 1, backgroundColor: "#128C7E", borderRadius: 10 },
  gradient: { flex: 1, borderRadius: 10, overflow: "hidden" },

  patternContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    flexWrap: "wrap",
    opacity: 0.6,
  },
  patternRow: {
    flexDirection: "row",
    width: "100%",
  },
  patternDot: {
    width: 22,
    height: 22,
  },

  tickContainer: {
    marginLeft: 4,
    alignSelf: "flex-end",
  },

  bubbleBottomContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  offlineIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ff9800",
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  offlineText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "500",
  },

  sendBtn: { padding: 8, justifyContent: "center", alignItems: "center" },
  cameraBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: "center",
  },

  inputToolbar: {
    marginHorizontal: 5,
    marginBottom: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.greyLight,
    backgroundColor: colors.white,
  },

  messageImage: {
    width: 220,
    height: 160,
    borderRadius: 12,
    margin: 4,
  },

  imageContainer: {
    maxWidth: 250,
    marginBottom: 5,
    position: "relative",
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
  },
  photoImage: {
    width: 250,
    height: 180,
    borderRadius: 10,
    alignSelf: "center",
  },
  imageCaption: {
    fontSize: 12,
    color: colors.darkGrey,
    marginTop: 4,
    textAlign: "center",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
    maxHeight: SCREEN_HEIGHT * 0.75,
    elevation: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.greyLight,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 14,
    color: colors.primary,
    textAlign: "center",
    marginBottom: 4,
  },
  sheetSub: {
    fontSize: 12,
    color: colors.grey,
    textAlign: "center",
    marginBottom: 16,
  },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.greyLight,
  },
  catLabel: { fontSize: 14, color: "#333" },

  categoryBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  zoomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  zoomImage: {
    width: "100%",
    height: "100%",
  },
});
