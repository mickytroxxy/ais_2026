// ─────────────────────────────────────────────────────────────────────────────
// AIS UPDATE — Firebase Configuration
// Replace the placeholder values below with your real Firebase project config.
// You can find these in: Firebase Console → Project Settings → Your apps → SDK setup
// ─────────────────────────────────────────────────────────────────────────────

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCn2Xi_cC-QOoelq-ZUOyRf6OMnB8aVjgs",
  authDomain: "aissnapshot.firebaseapp.com",
  projectId: "aissnapshot",
  storageBucket: "aissnapshot.appspot.com",
  messagingSenderId: "432055632242",
  appId: "1:432055632242:web:6480fe488bb1796f681deb",
};

// Firestore collection used by AIS UPDATE group chat
export const GROUP_CHAT_COLLECTION = "ais_group_chat";

// Firebase Storage folder for group chat images
export const GROUP_CHAT_STORAGE_PATH = "ais_group_chat_images";

// Collection for storing device push tokens
export const DEVICE_TOKENS_COLLECTION = "device_tokens";
