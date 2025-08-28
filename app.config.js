import "dotenv/config";

export default {
  expo: {
    name: "GeoNudge",
    slug: "geonudge",
    scheme: "geonudge",
 
    android: {
      package: "com.kartikey004.geonudge"
    },
    ios: {
      bundleIdentifier: "com.kartikey004.geonudge"
    },
    extra: {
      googleAndroidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID,
      googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
      googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
      eas: {
        projectId: "67109d05-efb9-4525-8e84-3b6915858c04",
      },
    },
  },
};
