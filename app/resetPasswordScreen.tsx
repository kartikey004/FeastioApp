import AlertModal from "@/components/AlertModal";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { resetPassword } from "@/redux/thunks/authThunks";
import { COLORS } from "@/utils/stylesheet";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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

export default function ResetPasswordScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const { email } = useLocalSearchParams<{ email: string }>();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpInputs = useRef<Array<TextInput | null>>([]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(true);
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

  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const showModal = (
    config: Partial<typeof modalConfig> & { message: string }
  ) => {
    setModalConfig({ ...modalConfig, ...config });
    setModalVisible(true);
  };
  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
    if (!value && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
    }
  };

  const clearOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    otpInputs.current[0]?.focus();
  };

  const shakeInputs = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split("@");
    const maskedLocal = localPart.slice(0, 2) + "***" + localPart.slice(-1);
    return `${maskedLocal}@${domain}`;
  };

  const handleResetPassword = async () => {
    if (!password || password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      shakeInputs();
      return;
    } else setPasswordError("");

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      shakeInputs();
      return;
    } else setConfirmPasswordError("");

    try {
      const resultAction = await dispatch(
        resetPassword({
          email: email as string,
          otp: otp.join(""),
          newPassword: password,
        })
      );

      if (resetPassword.fulfilled.match(resultAction)) {
        const user = resultAction.payload;
        console.log("Password reset successful, user:", user);
        router.replace("/(tabs)/homeScreen");
      } else {
        const errorMessage = resultAction.payload || "Reset password failed";
        showModal({ type: "error", message: errorMessage });
      }
    } catch (error) {
      showModal({ type: "error", message: "Something went wrong. Try again." });
      console.error("Reset password error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnimation,
                  transform: [{ scale: scaleAnimation }],
                },
              ]}
            >
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Ionicons
                    name="shield-checkmark"
                    size={40}
                    color={COLORS.primary}
                  />
                </View>
              </View>

              <Text style={styles.title}>Reset Your Password</Text>
              <Text style={styles.subtitle}>
                Enter the 6-digit code sent to{"\n"}
                <Text style={styles.emailText}>{maskEmail(email || "")}</Text>
              </Text>

              <Animated.View
                style={[
                  styles.otpContainer,
                  { transform: [{ translateX: shakeAnimation }] },
                ]}
              >
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      otpInputs.current[index] = ref;
                    }}
                    style={[
                      styles.otpInput,
                      digit ? styles.otpInputFilled : null,
                    ]}
                    value={digit}
                    onChangeText={(val) => handleOtpChange(val, index)}
                    onKeyPress={({ nativeEvent }) =>
                      handleKeyPress(nativeEvent.key, index)
                    }
                    keyboardType="numeric"
                    maxLength={1}
                    selectTextOnFocus
                    editable={!loading}
                    textContentType="oneTimeCode"
                  />
                ))}
              </Animated.View>

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.inputPassword}
                  placeholder="New Password"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="rgba(255,255,255,0.8)"
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="alert-circle"
                    size={16}
                    color={COLORS.google}
                  />
                  <Text style={styles.errorText}>{passwordError}</Text>
                </View>
              ) : null}

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.inputPassword}
                  placeholder="Confirm Password"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color="rgba(255,255,255,0.8)"
                  />
                </TouchableOpacity>
              </View>
              {confirmPasswordError ? (
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="alert-circle"
                    size={16}
                    color={COLORS.google}
                  />
                  <Text style={styles.errorText}>{confirmPasswordError}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                    }}
                  >
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={styles.resetButtonText}>Resetting...</Text>
                  </View>
                ) : (
                  <Text style={styles.resetButtonText}>Reset Password</Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the code?</Text>

                {canResend ? (
                  <TouchableOpacity
                    onPress={() => {
                      setTimer(60);
                      setCanResend(false);
                      clearOtp();
                    }}
                    style={styles.resendButton}
                  >
                    <Text style={styles.resendButtonText}>Resend OTP</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.timerContainer}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color="rgba(255,255,255,0.8)"
                    />
                    <Text style={styles.timerText}>
                      Resend in {formatTime(timer)}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.helpText}>
                Having trouble? Check your spam folder{"\n"}or contact support
                at{" "}
                <Text style={{ fontWeight: "600", color: "#fff" }}>
                  feastio.help@gmail.com
                </Text>
              </Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  gradient: {
    flex: 1,
  },
  keyboardContainer: {
    marginVertical: 30,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    minHeight: "100%",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 45,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
    fontWeight: "400",
  },
  emailText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 32,
    gap: 12,
    marginHorizontal: 20,
  },
  otpInput: {
    width: 40,
    height: 58,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.95)",
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    transform: [{ scale: 1.02 }],
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    // backgroundColor: COLORS.accent,
    paddingHorizontal: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputPassword: {
    flex: 1,
    height: 54,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "500",
  },
  eyeButton: {
    padding: 8,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    gap: 8,
  },
  errorText: {
    color: COLORS.google,
    fontSize: 14,
    fontWeight: "500",
  },
  resetButton: {
    paddingVertical: 16,
    // marginHorizontal: 6,
    borderRadius: 16,
    marginBottom: 22,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    backgroundColor: COLORS.white,
  },
  resetButtonText: {
    color: COLORS.primary,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  loadingText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  resendContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    flexDirection: "row",
    gap: 2,
  },
  resendText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "400",
  },
  resendButton: {
    paddingVertical: 10,
    marginHorizontal: 2,
    borderRadius: 8,
  },
  resendButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "500",
  },
  helpText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "400",
  },
});
