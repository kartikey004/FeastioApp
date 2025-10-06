import AlertModal from "@/components/AlertModal";
import { resendOTP, verifyOTP } from "@/redux/thunks/authThunks";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { COLORS } from "../utils/stylesheet";

export default function OtpVerificationScreen() {
  const params = useLocalSearchParams<{ tempToken: string; email: string }>();
  const { tempToken, email } = params;

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

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

  const inputRefs = useRef<(TextInput | null)[]>([]);
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

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && !canResend) {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeLeft, canResend]);

  useEffect(() => {
    if (error) {
      showModal({
        title: "Verification Failed",
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

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== "") && newOtp.join("").length === 6) {
      handleVerifyOTP(newOtp.join(""));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
    }
  };

  const handleVerifyOTP = (otpString: string = otp.join("")) => {
    if (otpString.length !== 6) {
      shakeInputs();
      showModal({
        title: "Invalid OTP",
        message: "Please enter all 6 digits.",
        type: "error",
        primaryButton: {
          text: "Try Again",
          onPress: () => setModalVisible(false),
        },
      });
      return;
    }

    setIsVerifying(true);

    dispatch(
      verifyOTP({
        tempToken,
        otp: otpString,
      })
    )
      .unwrap()
      .then((user) => {
        console.log("OTP verified successfully:", user);
        Animated.sequence([
          Animated.timing(scaleAnimation, {
            toValue: 1.1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnimation, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();

        setTimeout(() => {
          router.replace("/personalizationScreen");
        }, 500);
      })
      .catch((error) => {
        console.log("OTP verification failed:", error);
        shakeInputs();
        clearOtp();
        Vibration.vibrate(200);
      })
      .finally(() => {
        setIsVerifying(false);
      });
  };

  const handleResendOTP = () => {
    if (!canResend) return;

    setResendLoading(true);
    setCanResend(false);
    setTimeLeft(300);
    clearOtp();

    dispatch(resendOTP({ email: email! }))
      .unwrap()
      .then((res) => {
        console.log("OTP resent successfully:", res);
        showModal({
          title: "OTP Sent",
          message: "A new OTP has been sent to your email.",
          type: "success",
          primaryButton: {
            text: "OK",
            onPress: () => setModalVisible(false),
          },
        });
      })
      .catch((error) => {
        console.log("Resend OTP failed:", error);
        setCanResend(true);
        setTimeLeft(0);
        showModal({
          title: "Error",
          message: "Failed to send OTP. Please try again.",
          type: "error",
          primaryButton: {
            text: "Try Again",
            onPress: () => setModalVisible(false),
          },
        });
      })
      .finally(() => {
        setResendLoading(false);
      });
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

  const clearOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

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

              <Text style={styles.title}>Verify Your Email</Text>
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
                      inputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.otpInput,
                      digit ? styles.otpInputFilled : null,
                      isVerifying ? styles.otpInputVerifying : null,
                    ]}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={({ nativeEvent: { key } }) =>
                      handleKeyPress(key, index)
                    }
                    keyboardType="numeric"
                    maxLength={1}
                    selectTextOnFocus
                    textContentType="oneTimeCode"
                    editable={!isVerifying}
                  />
                ))}
              </Animated.View>

              <TouchableOpacity
                style={[styles.verifyButton, styles.verifyButtonActive]}
                onPress={() => handleVerifyOTP()}
                disabled={isVerifying || otp.join("").length !== 6}
              >
                {isVerifying ? (
                  <View style={styles.loadingContainer}>
                    <Animated.View
                      style={[
                        styles.loadingDot,
                        {
                          opacity: fadeAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.3, 1],
                          }),
                        },
                      ]}
                    />
                    <Animated.View
                      style={[
                        styles.loadingDot,
                        {
                          opacity: fadeAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.6, 1],
                          }),
                        },
                      ]}
                    />
                    <Animated.View
                      style={[
                        styles.loadingDot,
                        {
                          opacity: fadeAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.9, 1],
                          }),
                        },
                      ]}
                    />
                    <Text style={styles.loadingText}>Verifying...</Text>
                  </View>
                ) : (
                  <Text style={styles.verifyButtonText}>Verify OTP</Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the code?</Text>

                {canResend ? (
                  <TouchableOpacity
                    onPress={handleResendOTP}
                    style={styles.resendButton}
                    disabled={resendLoading}
                  >
                    {resendLoading ? (
                      <Text style={styles.resendButtonTextLoading}>
                        Sending...
                      </Text>
                    ) : (
                      <Text style={styles.resendButtonText}>Resend OTP</Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <View style={styles.timerContainer}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={COLORS.textSecondary}
                    />
                    <Text style={styles.timerText}>
                      Resend in {formatTime(timeLeft)}
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
    // flex: 1,
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
  header: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    zIndex: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // elevation: 4,
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
    // elevation: 12,
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
    marginBottom: 40,
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
    // elevation: 6,
    borderWidth: 2,
    borderColor: "transparent",
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    transform: [{ scale: 1.02 }],
  },
  otpInputVerifying: {
    backgroundColor: COLORS.white,
  },
  verifyButton: {
    paddingVertical: 18,
    marginHorizontal: 12,
    borderRadius: 16,
    marginBottom: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    // elevation: 8,
  },
  verifyButtonActive: {
    backgroundColor: COLORS.white,
  },
  verifyButtonInactive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  verifyButtonText: {
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
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: COLORS.google,
    // paddingHorizontal: 6,
    // paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: 20,
    gap: 8,
  },
  errorText: {
    color: COLORS.google,
    fontSize: 14,
    fontWeight: "500",
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
    // marginBottom: 12,
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
    // textDecorationLine: "underline",
  },
  resendButtonTextLoading: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
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
    // marginLeft: 2,
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
