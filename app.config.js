import "dotenv/config";

export default {
  expo: {
    name: "GeoNudge",
    slug: "geonudge",
    extra: {
      googleClientId: process.env.GOOGLE_CLIENT_ID,
    },
  },
};
