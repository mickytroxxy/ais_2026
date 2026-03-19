import AsyncStorage from "@react-native-async-storage/async-storage";
import { IMessage } from "react-native-gifted-chat";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Message status enum
export type MessageStatus = "pending" | "sent" | "delivered" | "failed";

// Extended message type with status
export interface ChatMessage extends IMessage {
  status?: MessageStatus;
  pending?: boolean;
  selectedCategory?: string;
  pushToken?: string;
}

// stable empty array used by selectors to avoid reference churn
export const EMPTY_CHAT_MESSAGES: ChatMessage[] = [];

interface ChatState {
  // Messages by keyRef
  messages: Record<string, ChatMessage[]>;

  // Pending messages queue (offline messages waiting to sync)
  pendingMessages: ChatMessage[];

  // Network status
  isOnline: boolean;

  // Actions
  setMessages: (keyRef: string, messages: ChatMessage[]) => void;
  addMessage: (keyRef: string, message: ChatMessage) => void;
  updateMessageStatus: (
    keyRef: string,
    messageId: string,
    status: MessageStatus,
  ) => void;
  addPendingMessage: (message: ChatMessage) => void;
  removePendingMessage: (messageId: string) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  getPendingMessages: () => ChatMessage[];
  clearMessages: (keyRef: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: {},
      pendingMessages: [],
      isOnline: true,

      setMessages: (keyRef, messages) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [keyRef]: messages,
          },
        })),

      addMessage: (keyRef, message) =>
        set((state) => {
          const existing = state.messages[keyRef] || [];
          // Check if message already exists
          const exists = existing.some((m) => m._id === message._id);
          if (exists) {
            return state;
          }
          return {
            messages: {
              ...state.messages,
              [keyRef]: [message, ...existing],
            },
          };
        }),

      updateMessageStatus: (keyRef, messageId, status) =>
        set((state) => {
          const keyMessages = state.messages[keyRef] || [];
          return {
            messages: {
              ...state.messages,
              [keyRef]: keyMessages.map((m) =>
                m._id === messageId ? { ...m, status } : m,
              ),
            },
          };
        }),

      addPendingMessage: (message) =>
        set((state) => ({
          pendingMessages: [
            ...state.pendingMessages,
            { ...message, status: "pending", pending: true },
          ],
        })),

      removePendingMessage: (messageId) =>
        set((state) => ({
          pendingMessages: state.pendingMessages.filter(
            (m) => m._id !== messageId,
          ),
        })),

      setOnlineStatus: (isOnline) => set({ isOnline }),

      getPendingMessages: () => get().pendingMessages,

      clearMessages: (keyRef) =>
        set((state) => {
          const { [keyRef]: _, ...rest } = state.messages;
          return { messages: rest };
        }),
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        messages: state.messages,
        pendingMessages: state.pendingMessages,
      }),
    },
  ),
);
