import "dotenv/config";

export default {
  expo: {
    name: "NutriSenseApplication",
    slug: "NutriSenseApplication",
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
      googleServicesFile: "./GoogleService-Info.plist",
    },

    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#FFFFFF",
      },
      package: "com.kartikey004.nutrisense",
      googleServicesFile: "./google-services.json",
      edgeToEdgeEnabled: true,
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    plugins: [
      "expo-router",
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: `com.googleusercontent.apps.${process.env.GOOGLE_IOS_CLIENT_ID}`,
        },
      ],
    ],

    experiments: {
      typedRoutes: true,
    },

    extra: {
      googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
      googleAndroidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID,
      googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
    },
  },
};
