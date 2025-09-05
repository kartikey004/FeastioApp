import { googleSignIn, registerUser } from "@/redux/thunks/authThunks";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { COLORS } from "@/utils/stylesheet";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        router.replace("/personalizationScreen");
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

  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  return (
    <SafeAreaView style={{ flex: 1, marginVertical: 10 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <LinearGradient
            colors={[Colors.light.white, Colors.light.white]}
            style={styles.container}
          >
            <View style={styles.logoContainer}>
              <Image
                source={require("../assets/images/nutrisenseLogo.png")}
                style={styles.logo}
                resizeMode="cover"
              />
              <Text style={styles.subtitle}>Sign up to start your journey</Text>
            </View>

            {/* Full Name */}
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={COLORS.textSecondary}
              value={name}
              onChangeText={setName}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
            />

            {/* Email */}
            <TextInput
              ref={emailRef}
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
              blurOnSubmit={false}
            />

            {/* Phone Number */}
            <TextInput
              ref={phoneRef}
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor={COLORS.textSecondary}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
            />
            <View style={styles.passwordContainer}>
              {/* Password */}
              <TextInput
                ref={passwordRef}
                style={styles.inputPassword}
                placeholder="Password"
                placeholderTextColor={COLORS.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.passwordContainer}>
              <TextInput
                ref={confirmPasswordRef}
                style={styles.inputPassword}
                placeholder="Confirm Password"
                placeholderTextColor={COLORS.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                returnKeyType="done"
                onSubmitEditing={handleSignup}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={22}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Signup Button */}
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

            {/* Navigation */}
            <View style={styles.buttonContainer}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <TouchableOpacity
                style={styles.loginText}
                onPress={() => router.replace("/loginScreen")}
              >
                <Text style={styles.loginButtonText}> Sign In</Text>
              </TouchableOpacity>
            </View>

            {/* Social Signup */}
            {/* <Text style={styles.orText}>OR</Text> */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.googleButton]}
                onPress={handleGoogleSignUp}
              >
                <Ionicons name="logo-google" size={35} color="#DB4437" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.facebookButton]}
                onPress={handleFacebookSignUp}
              >
                <Ionicons name="logo-facebook" size={40} color="#1877F2" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    marginTop: verticalScale(20),
    marginBottom: verticalScale(25),
  },
  logo: {
    width: "90%",
    height: verticalScale(60),
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: "700",
    color: Colors.light.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: COLORS.textPrimary,
    textAlign: "center",
    marginTop: verticalScale(5),
  },
  input: {
    height: verticalScale(45),
    borderWidth: 1,
    borderLeftWidth: 6,
    borderTopLeftRadius: scale(10),
    borderBottomLeftRadius: scale(10),
    borderColor: COLORS.primaryDark,
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    fontSize: moderateScale(14),
    marginBottom: verticalScale(12),
    color: COLORS.textPrimary,
    backgroundColor: COLORS.greyLight,
  },
  passwordContainer: {
    height: verticalScale(45),
    borderWidth: 1,
    borderLeftWidth: 6,
    borderTopLeftRadius: scale(10),
    borderBottomLeftRadius: scale(10),
    borderColor: COLORS.primaryDark,
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    fontSize: moderateScale(14),
    marginBottom: verticalScale(12),
    color: COLORS.textPrimary,
    backgroundColor: COLORS.greyLight,
    flexDirection: "row",
    alignItems: "center",
  },
  inputPassword: {
    flex: 1,
    height: 48,
    color: COLORS.textPrimary,
  },
  eyeIcon: {
    padding: 5,
  },
  signupButton: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: scale(8),
    paddingVertical: verticalScale(12),
    alignItems: "center",
    marginVertical: verticalScale(16),
  },
  signupButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  loginText: {
    fontSize: moderateScale(14),
    color: COLORS.textPrimary,
    textAlign: "center",
    // marginTop: verticalScale(1),
    marginBottom: verticalScale(5),
  },
  loginButtonText: {
    fontSize: moderateScale(14),
    color: COLORS.primaryDark,
    fontWeight: "600",
  },
  orText: {
    fontSize: moderateScale(16),
    color: COLORS.primaryDark,
    textAlign: "center",
    marginTop: verticalScale(5),
    marginBottom: verticalScale(5),
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
