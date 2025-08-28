import { googleSignIn, registerUser } from "@/redux/thunks/authThunks";
import Ionicons from "@expo/vector-icons/Ionicons";
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
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";

WebBrowser.maybeCompleteAuthSession();

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, user } = useAppSelector((state) => state.auth);

  // Combine all configuration into a single object
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId,
    iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
    webClientId: Constants.expoConfig?.extra?.googleWebClientId,
    scopes: ["profile", "email"],
  });

  useEffect(() => {
    if (response?.type === "success") {
      const accessToken = response.authentication?.accessToken;
      if (accessToken) {
        dispatch(googleSignIn(accessToken));
      }
    } else if (response?.type === "error") {
      console.log("Google Auth error:", response.error);
    }
  }, [dispatch, response]);

  useEffect(() => {
    if (user) {
      router.replace("/personalizationScreen");
    }
  }, [user, router]);

  const handleSignup = () => {
    console.log("Signup clicked with:", {
      name,
      email,
      phoneNumber,
      password,
      confirmPassword,
    });

    if (!name || !email || !phoneNumber || !password || !confirmPassword) {
      console.log("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      console.log("Passwords do not match");
      return;
    }

    dispatch(
      registerUser({
        username: name,
        email,
        password,
        phoneNumber,
      })
    )
      .unwrap()
      .then((user) => {
        console.log("Registration successful:", user);
        router.replace("personalizationScreen");
      })
      .catch((err) => {
        console.log("Registration failed:", err);
      });
  };

  const handleGoogleSignUp = async () => {
    if (request) {
      await promptAsync();
    } else {
      console.log("Google Auth request not ready");
    }
  };

  const handleFacebookSignUp = () => {
    console.log("Facebook signup clicked");
  };

  return (
    <LinearGradient
      colors={[Colors.light.white, Colors.light.white]}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/geoNudgeLogo.png")}
          style={styles.logo}
          resizeMode="cover"
        />
        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>Sign up to start your journey</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor={Colors.light.accent}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={Colors.light.accent}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor={Colors.light.accent}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={Colors.light.accent}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor={Colors.light.accent}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.signupButton, loading && { opacity: 0.7 }]}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.light.white} />
        ) : (
          <Text style={styles.signupButtonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <Text style={styles.loginText}>Already have an account?</Text>
        <TouchableOpacity
          style={styles.loginText}
          onPress={() => router.push("/loginScreen")}
        >
          <Text style={styles.loginButtonText}> Login</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.orText}>Or Sign up with</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.googleButton]}
          onPress={handleGoogleSignUp}
        >
          <Ionicons
            name="logo-google"
            size={moderateScale(35)}
            color="#DB4437"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.facebookButton]}
          onPress={handleFacebookSignUp}
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
  signupButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: scale(8),
    paddingVertical: verticalScale(12),
    alignItems: "center",
    marginBottom: verticalScale(10),
  },
  signupButtonText: {
    color: Colors.light.white,
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  loginText: {
    fontSize: moderateScale(14),
    color: Colors.light.accent,
    textAlign: "center",
    // marginTop: verticalScale(1),
    marginBottom: verticalScale(15),
  },
  loginButtonText: {
    fontSize: moderateScale(14),
    color: Colors.light.primary,
    fontWeight: "600",
  },
  orText: {
    fontSize: moderateScale(16),
    color: Colors.light.accent,
    textAlign: "center",
    marginTop: verticalScale(5),
    marginBottom: verticalScale(10),
  },
  buttonContainer: {
    flexDirection: "row",
    // gap: verticalScale(5),
    alignSelf: "center",
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
  },
  facebookButton: {
    padding: scale(15),
  },
  buttonText: {
    color: Colors.light.white,
    fontSize: moderateScale(16),
    marginLeft: scale(10),
    fontWeight: "600",
  },
});
