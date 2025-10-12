import "dotenv/config";

export default {
  expo: {
    name: "Feastio",
    slug: "Feastio",
    displayName: "Feastio",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    scheme: "feastio",
    owner: "kartikey004",
    assetBundlePatterns: ["**/*"],

    extra: {
      eas: {
        projectId: "57b98852-2ac5-4f25-b368-2b69bdbadcbb",
      },
    },

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.kartikey004.feastio",
    },

    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#FFFFFF",
      },
      package: "com.kartikey004.feastio",

      edgeToEdgeEnabled: true,
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    plugins: ["expo-router", "expo-web-browser"],

    experiments: {
      typedRoutes: true,
    },

    notification: {
      icon: "./assets/images/icon.png",
      color: "#FF4500",
      iosDisplayInForeground: true,
    },
  },
};
