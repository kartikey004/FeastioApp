import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { Ionicons } from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { Colors } from "../constants/Colors";
import { googleSignIn } from "../redux/thunks/authThunks";

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { loading, error, user } = useAppSelector((state) => state.auth);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: Constants.expoConfig?.extra?.googleClientId,
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

  const handleLogin = () => {
    console.log("Login pressed", { email, password });
    //todo: Implement email/password login logic
  };

  const handleGoogleSignIn = () => {
    console.log("Google Sign-In pressed");
    promptAsync();
  };

  const handleFacebookSignIn = () => {
    console.log("Facebook Sign-In pressed");
    //todo: Implement Facebook Sign-In
  };

  return (
    <LinearGradient
      colors={[Colors.white, Colors.white]}
      style={styles.container}
    >
      {/* Logo and Title */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/geoNudgeLogo.png")}
          style={styles.logo}
          resizeMode="cover"
        />
        <Text style={styles.title}>Welcome to GeoNudge</Text>
        <Text style={styles.subtitle}>Sign in to continue your journey</Text>
      </View>

      {/* Email and Password Fields */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={Colors.accent}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={Colors.accent}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.orLoginText}>Or Login with</Text>

      {/* Social Login Buttons */}
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
    color: Colors.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: Colors.accent,
    textAlign: "center",
    marginTop: verticalScale(5),
  },
  input: {
    height: verticalScale(45),
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    fontSize: moderateScale(14),
    marginBottom: verticalScale(12),
    color: Colors.primary,
    backgroundColor: Colors.white,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: scale(8),
    paddingVertical: verticalScale(12),
    alignItems: "center",
    marginBottom: verticalScale(20),
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  orLoginText: {
    fontSize: moderateScale(16),
    color: Colors.accent,
    textAlign: "center",
    marginTop: verticalScale(5),
    marginBottom: verticalScale(15),
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
    color: Colors.white,
    fontSize: moderateScale(16),
    marginLeft: scale(10),
    fontWeight: "600",
  },
});
