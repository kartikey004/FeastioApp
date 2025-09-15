import { COLORS } from "@/utils/stylesheet";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
import { verticalScale } from "react-native-size-matters";
import { useDispatch, useSelector } from "react-redux";
import { addUserMessage } from "../../redux/slices/aiChatSlice";
import { AppDispatch, RootState } from "../../redux/store";
import { sendMessageToAI } from "../../redux/thunks/aiChatThunks";

export default function AIAssistantScreen() {
  const [input, setInput] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const { messages, loading } = useSelector((state: RootState) => state.aiChat);

  const handleSend = () => {
    if (!input.trim()) return;
    dispatch(addUserMessage(input));
    dispatch(sendMessageToAI({ message: input }));
    setInput("");
  };

  const EmptyState = () => (
    <SafeAreaView style={styles.emptyStateContainer}>
      <View style={styles.emptyStateContainerView}>
        <Text style={styles.emptyStateTitle}>Hey! I'm Sage AI</Text>
        <Text style={styles.emptyStateSubtitle}>
          Your personal nutrition assistant ready to help with meal planning,
          dietary questions, and healthy living tips.
        </Text>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <Image
                source={require("../../assets/images/assistantIconFilled.png")}
                style={styles.sageEmoji}
              ></Image>
              <Text style={styles.title}>Sage AI</Text>
            </View>
            <Text style={styles.subtitle}>Nutrition Assistant</Text>
          </View>
        </View>

        <View style={styles.messagesContainer}>
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <FlatList
              data={messages}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.messageContainer}>
                  <View
                    style={[
                      styles.messageBubble,
                      item.role === "user"
                        ? styles.userBubble
                        : styles.aiBubble,
                    ]}
                  >
                    {item.role === "ai" && (
                      <Text style={styles.aiLabel}>Sage</Text>
                    )}
                    <Text
                      style={[
                        styles.messageText,
                        item.role === "user" ? styles.userText : styles.aiText,
                      ]}
                    >
                      {item.content}
                    </Text>
                  </View>
                </View>
              )}
              inverted={true}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            />
          )}

          {loading && (
            <View style={styles.typingIndicator}>
              <View style={styles.typingBubble}>
                <Text style={styles.typingText}>Sage is thinking</Text>
                <ActivityIndicator
                  size="small"
                  color={COLORS.sage}
                  style={styles.typingSpinner}
                />
              </View>
            </View>
          )}
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <TextInput
              value={input}
              onChangeText={setInput}
              style={styles.textInput}
              placeholder="Ask Sage about..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: input.trim()
                    ? COLORS.primaryDark
                    : COLORS.greyMint,
                },
              ]}
              onPress={handleSend}
              disabled={!input.trim() || loading}
            >
              <Image
                style={styles.sendButtonIcon}
                source={require("../../assets/images/sendButton.png")}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginTop: Platform.OS === "android" ? 25 : 0,
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomColor: COLORS.greyLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  headerContent: {
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  sageEmoji: {
    width: verticalScale(24),
    height: verticalScale(24),
    marginRight: 10,
    resizeMode: "contain",
    color: COLORS.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    alignSelf: "center",
    fontWeight: "500",
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "column-reverse",
  },
  messageContainer: {
    marginVertical: 6,
  },
  messageBubble: {
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxWidth: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // elevation: 1,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.greyMint,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.greyLight,
  },
  aiLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.sage,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  userText: {
    color: COLORS.white,
    fontWeight: "500",
  },
  aiText: {
    color: COLORS.textPrimary,
  },
  typingIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.sageLight,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-start",
    maxWidth: "70%",
    // elevation: 10,
  },
  typingText: {
    color: COLORS.sage,
    fontSize: 14,
    fontWeight: "500",
  },
  typingSpinner: {
    marginLeft: 8,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  emptyStateContainerView: {
    justifyContent: "center",
    alignItems: "center",
  },
  sageIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.sageLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  sageIcon: {
    fontSize: 36,
  },
  emptyStateTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  suggestionsContainer: {
    width: "100%",
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 16,
    textAlign: "center",
  },
  suggestion: {
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.greyLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    // elevation: 1,
  },
  suggestionText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    fontWeight: "500",
  },
  inputSection: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    // borderTopWidth: 1,
    borderTopColor: COLORS.greyLight,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: COLORS.greyMint,
    borderRadius: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    maxHeight: 120,
    paddingVertical: 8,
    paddingRight: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonIcon: {
    fontSize: 16,
    color: COLORS.primaryDark,
    fontWeight: "600",
    marginLeft: 2,
  },
});
