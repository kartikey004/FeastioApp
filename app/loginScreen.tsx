import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { Ionicons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { Colors } from "../constants/Colors";
import { googleSignIn, loginUser } from "../redux/thunks/authThunks";

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, user } = useAppSelector((state) => state.auth);
  WebBrowser.maybeCompleteAuthSession();
  const makeRedirect = AuthSession.makeRedirectUri as unknown as (
    opts: any
  ) => string;
  const redirectUri = makeRedirect({ useProxy: true });
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: Constants.expoConfig?.extra?.googleWebClientId,
    redirectUri,
    scopes: ["profile", "email"],
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (response?.type === "success") {
      const accessToken = response.authentication?.accessToken;

      if (accessToken) {
        dispatch(googleSignIn(accessToken));
      }
    }
  }, [response, dispatch]);

  useEffect(() => {
    if (user) {
      router.replace("/personalizationScreen");
    }
  }, [user, router]);

  const handleLogin = () => {
    dispatch(loginUser({ email, password }))
      .unwrap()
      .then(() => {
        router.replace("/personalizationScreen");
      })
      .catch((err) => {
        console.log("Login failed:", err);
      });
  };

  const handleGoogleSignIn = async () => {
    console.log("Google Sign-In pressed");
    await promptAsync();
  };

  const handleFacebookSignIn = () => {
    console.log("Facebook Sign-In pressed");
    //todo: Implement Facebook Sign-In
  };
  const theme = Colors.light;

  return (
    <LinearGradient
      colors={[theme.white, theme.white]}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/geoNudgeLogo.png")}
          style={styles.logo}
          resizeMode="cover"
        />
        <Text style={styles.title}>Welcome to GeoNudge</Text>
        <Text style={styles.subtitle}>Sign in to continue your journey</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={theme.accent}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={theme.accent}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={[styles.loginButton, loading && { opacity: 0.7 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.light.white} />
        ) : (
          <Text style={styles.loginButtonTextWhite}>Login</Text>
        )}
      </TouchableOpacity>

      <View style={styles.navigationButtonContainer}>
        <Text style={styles.loginText}>Don't have an account?</Text>
        <TouchableOpacity
          style={styles.loginText}
          onPress={() => router.push("/signupScreen")}
        >
          <Text style={styles.loginButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.orLoginText}>Or Login with</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.googleButton]}
          onPress={handleGoogleSignIn}
        >
          <Ionicons
            name="logo-google"
            size={moderateScale(35)}
            color="#DB4437"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.facebookButton]}
          onPress={handleFacebookSignIn}
        >
          <Ionicons
            name="logo-facebook"
            size={moderateScale(40)}
            color="#1877F2"
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(20),
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: verticalScale(30),
  },
  logo: {
    width: scale(120),
    height: scale(120),
    marginBottom: verticalScale(15),
    borderRadius: scale(60),
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: "700",
    color: Colors.light.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: Colors.light.accent,
    textAlign: "center",
    marginTop: verticalScale(5),
  },
  input: {
    height: verticalScale(45),
    borderWidth: 1,
    borderColor: Colors.light.accent,
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    fontSize: moderateScale(14),
    marginBottom: verticalScale(12),
    color: Colors.light.primary,
    backgroundColor: Colors.light.white,
  },
  loginButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: scale(8),
    paddingVertical: verticalScale(12),
    alignItems: "center",
    marginBottom: verticalScale(10),
  },
  loginButtonText: {
    color: Colors.light.primary,
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
  loginButtonTextWhite: {
    color: Colors.light.white,
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
  loginText: {
    fontSize: moderateScale(14),
    color: Colors.light.accent,
    textAlign: "center",
    // marginTop: verticalScale(1),
    marginBottom: verticalScale(15),
  },
  orLoginText: {
    fontSize: moderateScale(16),
    color: Colors.light.accent,
    textAlign: "center",
    marginTop: verticalScale(5),
    // marginBottom: verticalScale(10),
  },
  navigationButtonContainer: {
    flexDirection: "row",
    gap: verticalScale(2),
    alignSelf: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: verticalScale(10),
    alignSelf: "center",
    // marginHorizontal: moderateScale(70),
  },
  button: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(12),
    borderRadius: scale(30),
    justifyContent: "center",
  },
  googleButton: {
    padding: scale(15),
    // backgroundColor: "#DB4437", // Google Red
  },
  facebookButton: {
    padding: scale(15),
    // backgroundColor: "#1877F2", // Facebook Blue
  },
  buttonText: {
    color: Colors.light.white,
    fontSize: moderateScale(16),
    marginLeft: scale(10),
    fontWeight: "600",
  },
});
