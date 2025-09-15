import { COLORS } from "@/utils/stylesheet";
import React from "react";
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const { width } = Dimensions.get("window");

interface AlertModalProps {
  visible: boolean;
  title?: string;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  onClose: () => void;
  primaryButton?: {
    text: string;
    onPress: () => void;
  };
  secondaryButton?: {
    text: string;
    onPress: () => void;
  };
}

const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message,
  type = "info",
  onClose,
  primaryButton,
  secondaryButton,
}) => {
  const getIconConfig = () => {
    switch (type) {
      case "success":
        return { name: "checkmark-circle", color: "#4CAF50" };
      case "error":
        return { name: "close-circle", color: "#ff4757" };
      case "warning":
        return { name: "warning", color: "#FF9800" };
      default:
        return { name: "information-circle", color: "#2196F3" };
    }
  };

  const iconConfig = getIconConfig();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.content}>
                {title && <Text style={styles.title}>{title}</Text>}
                <Text style={styles.message}>{message}</Text>
              </View>

              <View style={styles.buttonContainer}>
                {secondaryButton && (
                  <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={secondaryButton.onPress}
                  >
                    <Text style={styles.secondaryButtonText}>
                      {secondaryButton.text}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.primaryButton,
                    { backgroundColor: iconConfig.color },
                    secondaryButton && styles.buttonWithMargin,
                  ]}
                  onPress={primaryButton?.onPress || onClose}
                >
                  <Text style={styles.primaryButtonText}>
                    {primaryButton?.text || "OK"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: scale(20),
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    width: width * 0.85,
    maxWidth: scale(400),
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: verticalScale(20),
    paddingHorizontal: scale(20),
  },
  iconContainer: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  content: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(8),
  },
  title: {
    fontSize: moderateScale(20),
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: verticalScale(8),
    textAlign: "center",
  },
  message: {
    fontSize: moderateScale(16),
    color: COLORS.textSecondary,
    lineHeight: moderateScale(24),
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    padding: scale(20),
    paddingTop: verticalScale(16),
  },
  button: {
    flex: 1,
    height: verticalScale(38),
    borderRadius: moderateScale(12),
    justifyContent: "center",
    alignItems: "center",
  },
  buttonWithMargin: {
    marginLeft: scale(12),
  },
  primaryButton: {
    backgroundColor: "#2196F3",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: COLORS.textSecondary,
    fontSize: moderateScale(16),
    fontWeight: "500",
  },
});

export default AlertModal;
