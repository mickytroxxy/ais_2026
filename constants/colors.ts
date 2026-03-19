// Central repository of color constants used throughout the app.
// Instead of littering magic strings in components, import from here.

// Individual color constants
export const primary = "#171718";
export const header = "#0f1114";
export const accent = "#932c00";

export const white = "#fff";
export const black = "#000";
export const lightBackground = "#e8e9f5";
export const lighterBackground = "#f1f7fa";
export const grey = "#757575";
export const greyLight = "#e3e6ea";
export const greyLighter = "#f2f5f9";
export const border = "#ccc";

export const bubbleRight = "#7ab6e6";
export const bubbleLeftAI = "#e8f5e9";
export const bubbleLeftUser = "#d7e5e5";
export const aiText = "#2e7d32";

// Gradient individual colors
export const loginGradientStart = "#BED0D8";
export const loginGradientMid = header;
export const loginGradientMid2 = primary;
export const loginGradientEnd = "#EFEFEF";

export const securityGradientStart = "#fff";
export const securityGradientMid1 = "#fff";
export const securityGradientMid2 = "#fff";
export const securityGradientEnd = "#f1f7fa";

export const groupChatGradientStart = "#727272";
export const groupChatGradientMid = "#edfff3";
export const groupChatGradientEnd = "#eefbe5";

export const darkGrey = "#555";
export const disabledButton = "#8eb8c7";

export const darkText = "#333";
export const lightGreyBorder = "#eee";
export const selectedOptionBg = "#f0f7ff";
export const headerLight = "#BED0D8";

// Linear gradients using individual color constants
export const loginGradient = [
  loginGradientStart,
  loginGradientMid,
  loginGradientMid2,
  loginGradientEnd,
];

export const securityGradient = [
  securityGradientStart,
  securityGradientMid1,
  securityGradientMid2,
  securityGradientEnd,
];

export const groupChatGradient = [
  groupChatGradientStart,
  groupChatGradientMid,
  groupChatGradientEnd,
];

// Main colors object for convenience (for backwards compatibility)
export const colors = {
  // primary branding colors
  primary,
  header,
  accent,

  // neutrals
  white,
  black,
  lightBackground,
  lighterBackground,
  grey,
  greyLight,
  greyLighter,
  border,

  // gift chat bubbles
  bubbleRight,
  bubbleLeftAI,
  bubbleLeftUser,
  aiText,

  // linear gradients
  loginGradient,
  securityGradient,
  groupChatGradient,

  // other colors
  darkGrey,
  disabledButton,
  darkText,
  lightGreyBorder,
  selectedOptionBg,
  headerLight,

  // Individual gradient colors for reference
  loginGradientStart,
  loginGradientMid,
  loginGradientMid2,
  loginGradientEnd,
  securityGradientStart,
  securityGradientMid1,
  securityGradientMid2,
  securityGradientEnd,
  groupChatGradientStart,
  groupChatGradientMid,
  groupChatGradientEnd,
};
