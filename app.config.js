import "dotenv/config";

export default {
  expo: {
    name: "NutriSenseApplication",
    slug: "NutriSenseApplication",
    displayName: "NutriSense",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    scheme: "nutrisense",
    owner: "kartikey004",
    assetBundlePatterns: ["**/*"],

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.kartikey004.nutrisense",
    },

    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#FFFFFF",
      },
      package: "com.kartikey004.nutrisense",

      edgeToEdgeEnabled: true,
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    plugins: ["expo-router"],

    experiments: {
      typedRoutes: true,
    },
  },
};
