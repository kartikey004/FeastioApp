import { registerUser } from "@/redux/thunks/authThunks";
import Ionicons from "@expo/vector-icons/Ionicons";
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

import AlertModal from "@/components/AlertModal";
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
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    type: "info" as "success" | "error" | "warning" | "info",
    primaryButton: undefined as
      | { text: string; onPress: () => void }
      | undefined,
    secondaryButton: undefined as
      | { text: string; onPress: () => void }
      | undefined,
  });

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, userId, isOtpSent } = useAppSelector(
    (state) => state.auth
  );

  // Combine all configuration into a single object
  // const [request, response, promptAsync] = Google.useAuthRequest({
  //   androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId,
  //   iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
  //   webClientId: Constants.expoConfig?.extra?.googleWebClientId,
  //   scopes: ["profile", "email"],
  // });

  useEffect(() => {
    if (error) {
      showModal({
        title: "Sign Up Failed",
        message: error || "An unexpected error occurred. Please try again.",
        type: "error",
        primaryButton: {
          text: "Try Again",
          onPress: () => setModalVisible(false),
        },
      });
    }
  }, [error]);

  const showModal = (
    config: Partial<typeof modalConfig> & { message: string }
  ) => {
    setModalConfig({ ...modalConfig, ...config });
    setModalVisible(true);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (!value) {
      setEmailError(""); // clear error if empty
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  // Phone validation
  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    if (!value) {
      setPhoneError(""); // clear error if empty
      return;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(value)) {
      setPhoneError("Phone number must be 10 digits");
    } else {
      setPhoneError("");
    }
  };

  // Password validation
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (!value) {
      setPasswordError(""); // clear error if empty
      setConfirmPasswordError(""); // also clear confirmPasswordError if password is cleared
      return;
    }
    if (value.length < 6) {
      setPasswordError("Password must be at least 6 characters");
    } else {
      setPasswordError("");
    }
    // Also validate confirm password if user typed it
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  // Confirm password validation
  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (!value) {
      setConfirmPasswordError(""); // clear error if empty
      return;
    }
    if (password !== value) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleSignup = () => {
    console.log("Signup clicked with:", {
      name,
      email,
      phoneNumber,
      password,
      confirmPassword,
    });

    if (
      !name ||
      !email ||
      !phoneNumber ||
      !password ||
      !confirmPassword ||
      !/\S+@\S+\.\S+/.test(email) ||
      phoneNumber.length < 10 ||
      password.length < 6
    ) {
      showModal({
        title: "Validation Error",
        message:
          "Please check all fields and ensure they are filled correctly.",
        type: "warning",
        primaryButton: {
          text: "OK",
          onPress: () => setModalVisible(false),
        },
      });
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
        router.replace({
          pathname: "/otpVerificationScreen",
          params: { userId: user.userId, email: email },
        });
      })
      .catch((err) => {
        console.log("Registration failed:", err);
        const errorMessage =
          err?.message ||
          "An unexpected error occurred while creating your account. Please try again.";

        showModal({
          title: "Registration Failed",
          message: errorMessage,
          type: "error",
          primaryButton: {
            text: "Try Again",
            onPress: () => setModalVisible(false),
          },
          // secondaryButton: {
          //   text: "Contact Support",
          //   onPress: () => {
          //     setModalVisible(false);
          //     // Optional: Navigate to support screen or open email client
          //     // router.push("/support");
          //   },
          // },
        });
      });
  };

  const handleGoogleSignUp = async () => {
    console.log("Google Sign-Up pressed");

    // Show info modal for Google Sign-In
    showModal({
      title: "Google Sign-Up",
      message:
        "Google Sign-Up feature is coming soon! Please use email and password for now.",
      type: "info",
      primaryButton: {
        text: "OK",
        onPress: () => setModalVisible(false),
      },
    });
    // await promptAsync();
  };

  const handleFacebookSignUp = () => {
    console.log("Facebook Sign-Up pressed");

    // Show info modal for Facebook Sign-In
    showModal({
      title: "Facebook Sign-Up",
      message:
        "Facebook Sign-Up feature is coming soon! Please use email and password for now.",
      type: "info",
      primaryButton: {
        text: "OK",
        onPress: () => setModalVisible(false),
      },
    });
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

            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={COLORS.textSecondary}
              value={name}
              onChangeText={setName}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
            {/* Email */}
            <TextInput
              ref={emailRef}
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
            />

            {/* Phone Number */}
            {phoneError ? (
              <Text style={styles.errorText}>{phoneError}</Text>
            ) : null}
            <TextInput
              ref={phoneRef}
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor={COLORS.textSecondary}
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
            <View style={styles.passwordContainer}>
              {/* Password */}
              <TextInput
                ref={passwordRef}
                style={styles.inputPassword}
                placeholder="Password"
                placeholderTextColor={COLORS.textSecondary}
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
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

            {confirmPasswordError ? (
              <Text style={styles.errorText}>{confirmPasswordError}</Text>
            ) : null}
            <View style={styles.passwordContainer}>
              <TextInput
                ref={confirmPasswordRef}
                style={styles.inputPassword}
                placeholder="Confirm Password"
                placeholderTextColor={COLORS.textSecondary}
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
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
                <Text style={styles.signupButtonText}>Send OTP</Text>
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

            {/* <View style={styles.buttonContainer}>
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
            </View> */}
          </LinearGradient>

          <AlertModal
            visible={modalVisible}
            title={modalConfig.title}
            message={modalConfig.message}
            type={modalConfig.type}
            onClose={() => setModalVisible(false)}
            primaryButton={modalConfig.primaryButton}
            secondaryButton={modalConfig.secondaryButton}
          />
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
    marginTop: verticalScale(30),
    marginBottom: verticalScale(25),
  },
  logo: {
    width: "90%",
    height: verticalScale(60),
    // marginLeft: 10,
    alignSelf: "center",
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
    marginBottom: verticalScale(10),
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
    marginBottom: verticalScale(10),
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
  errorText: {
    color: "red",
    fontSize: 13,
    marginBottom: 4,
    marginLeft: 5,
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
