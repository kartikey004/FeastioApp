/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  primary: "#79417E", // Deep purple
  primaryDark: "#6A2C70", // Stronger purple for accents
  background: "#F2EDF2", // Light background
  accent: "#B698B9", // Soft purple for buttons & highlights
  secondaryBackground: "#D2BFD3", // Alternate background or cards
  textPrimary: "#1E1E1E", // Dark text
  textSecondary: "#5A5A5A", // Muted text
  white: "#FEFEFE",
};

export const theme = {
  Colors,
  spacing: (factor: number) => factor * 8, // e.g., spacing(2) = 16px
  fontSizes: {
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 28,
  },
  fontFamily: {
    regular: "System",
    medium: "System",
    bold: "System",
  },
};
