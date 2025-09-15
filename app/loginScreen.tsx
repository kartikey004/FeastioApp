import AlertModal from "@/components/AlertModal";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { COLORS } from "@/utils/stylesheet";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { Colors } from "../constants/Colors";
import { forgotPassword, loginUser } from "../redux/thunks/authThunks";

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, user } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

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

  useEffect(() => {
    if (user) {
      router.replace("/(tabs)/homeScreen");
    }
  }, [user, router]);

  useEffect(() => {
    if (user) {
      showModal({
        title: "Welcome Back!",
        message: "You have successfully signed in to your account.",
        type: "success",
        primaryButton: {
          text: "Continue",
          onPress: () => {
            setModalVisible(false);
            router.replace("/(tabs)/homeScreen");
          },
        },
      });
    }
  }, [user, router]);

  useEffect(() => {
    if (error) {
      showModal({
        title: "Sign In Failed",
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

  const handleLogin = () => {
    let hasError = false;

    if (!email) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Enter a valid email");
      hasError = true;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (hasError) {
      showModal({
        title: "Validation Error",
        message: "Please check your email and password and try again.",
        type: "warning",
        primaryButton: {
          text: "OK",
          onPress: () => setModalVisible(false),
        },
      });
      return;
    }

    dispatch(loginUser({ email, password }))
      .unwrap()
      .then(() => {
        router.replace("/(tabs)/homeScreen");
      })
      .catch((err) => {
        console.log("Login failed:", err);
      });
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showModal({
        title: "Email Required",
        message:
          "Please enter your email address first to reset your password.",
        type: "warning",
        primaryButton: { text: "OK", onPress: () => setModalVisible(false) },
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      showModal({
        title: "Invalid Email",
        message: "Please enter a valid email address.",
        type: "error",
        primaryButton: { text: "OK", onPress: () => setModalVisible(false) },
      });
      return;
    }

    setForgotPasswordLoading(true);

    try {
      await dispatch(forgotPassword({ email })).unwrap();

      setForgotPasswordLoading(false);
      showModal({
        title: "OTP Sent",
        message: `An OTP has been sent to ${email}. Please check your inbox to continue resetting your password.`,
        type: "success",
        primaryButton: {
          text: "Continue",
          onPress: () => {
            setModalVisible(false);
            router.push({
              pathname: "/resetPasswordScreen",
              params: { email },
            });
          },
        },
      });
    } catch (error: any) {
      setForgotPasswordLoading(false);
      showModal({
        title: "Reset Failed",
        message: error || "Failed to send OTP. Please try again.",
        type: "error",
        primaryButton: {
          text: "Try Again",
          onPress: () => setModalVisible(false),
        },
      });
    }
  };

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS == "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS == "ios" ? 60 : 0}
      >
        <LinearGradient
          colors={[COLORS.white, COLORS.white]}
          style={styles.container}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/feastioLogo.png")}
              style={styles.logo}
              resizeMode="cover"
            />
            <Text style={styles.subtitle}>Eat smarter. Live better.</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.textSecondary}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError("");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            ref={emailRef}
          />
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.inputPassword}
              placeholder="Password"
              placeholderTextColor={COLORS.textSecondary}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError("");
              }}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              ref={passwordRef}
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

          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}

          <View style={styles.forgotPasswordContainer}>
            <TouchableOpacity
              onPress={handleForgotPassword}
              disabled={forgotPasswordLoading}
              style={styles.forgotPasswordButton}
            >
              {forgotPasswordLoading ? (
                <View style={styles.forgotPasswordLoadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.forgotPasswordTextLoading}>
                    Sending...
                  </Text>
                </View>
              ) : (
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors.light.white} />
            ) : (
              <Text style={styles.loginButtonTextWhite}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.navigationButtonContainer}>
            <Text style={styles.loginText}>Don't have an account?</Text>
            <TouchableOpacity
              style={styles.loginText}
              onPress={() => router.replace("/signupScreen")}
            >
              <Text style={styles.loginButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(20),
    justifyContent: "center",
    marginTop: verticalScale(20),
  },
  logoContainer: {
    alignItems: "center",
    // marginBottom: verticalScale(30),
    marginVertical: verticalScale(15),
  },
  logo: {
    width: "60%",
    height: verticalScale(60),
    alignSelf: "center",
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: "700",
    color: COLORS.primaryDark,
    textAlign: "center",
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: COLORS.textPrimary,
    textAlign: "center",
    fontWeight: "500",
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
    marginTop: verticalScale(10),
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
    marginTop: verticalScale(10),
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
  loginButton: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: scale(8),
    paddingVertical: verticalScale(12),
    alignItems: "center",
    // marginBottom: verticalScale(10),
    marginVertical: verticalScale(20),
  },
  loginButtonText: {
    color: COLORS.primaryDark,
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
  loginButtonTextWhite: {
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
  orLoginText: {
    fontSize: moderateScale(16),
    color: COLORS.primaryDark,
    textAlign: "center",
    fontWeight: "700",
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
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 1,
    marginLeft: 10,
    marginBottom: 5,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    // marginBottom: verticalScale(20),
    marginTop: verticalScale(5),
  },
  forgotPasswordButton: {
    // padding: moderateScale(5),
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: moderateScale(14),
    fontWeight: "600",
    // textDecorationLine: "underline",
  },
  forgotPasswordLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(8),
  },
  forgotPasswordTextLoading: {
    color: COLORS.primary,
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
});
