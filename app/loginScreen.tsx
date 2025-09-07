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
import { loginUser } from "../redux/thunks/authThunks";

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, user } = useAppSelector((state) => state.auth);
  // WebBrowser.maybeCompleteAuthSession();
  // const makeRedirect = AuthSession.makeRedirectUri as unknown as (
  //   opts: any
  // ) => string;
  // const redirectUri = makeRedirect({ useProxy: true });
  // const [request, response, promptAsync] = Google.useAuthRequest({
  //   clientId: Constants.expoConfig?.extra?.googleExpoClientId,
  //   iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
  //   androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId,
  //   webClientId: Constants.expoConfig?.extra?.googleWebClientId,
  //   redirectUri,
  //   scopes: ["profile", "email"],
  // } as any);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

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
      // Show success modal when user logs in successfully
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
      // Show validation error modal
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

  const handleGoogleSignIn = async () => {
    console.log("Google Sign-In pressed");

    // Show info modal for Google Sign-In
    showModal({
      title: "Google Sign-In",
      message:
        "Google Sign-In feature is coming soon! Please use email and password for now.",
      type: "info",
      primaryButton: {
        text: "OK",
        onPress: () => setModalVisible(false),
      },
    });

    // await promptAsync();
  };

  const handleFacebookSignIn = () => {
    console.log("Facebook Sign-In pressed");

    // Show info modal for Facebook Sign-In
    showModal({
      title: "Facebook Sign-In",
      message:
        "Facebook Sign-In feature is coming soon! Please use email and password for now.",
      type: "info",
      primaryButton: {
        text: "OK",
        onPress: () => setModalVisible(false),
      },
    });
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
              source={require("../assets/images/nutrisenseLogo.png")}
              style={styles.logo}
              resizeMode="cover"
            />
            {/* <Text style={styles.title}>Welcome to GeoNudge</Text> */}
            <Text style={styles.subtitle}>Eat smarter. Live better.</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.textSecondary}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError(""); // Clear error when user starts typing
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
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
                if (passwordError) setPasswordError(""); // Clear error when user starts typing
              }}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
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

          {/* <Text style={styles.orLoginText}>OR</Text> */}

          {/* <View style={styles.buttonContainer}>
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
    width: "90%",
    height: verticalScale(60),
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
    marginBottom: 10,
  },
});
