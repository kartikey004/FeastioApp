import { COLORS } from "@/utils/stylesheet";
import React from "react";
import {
  Animated,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface DropdownModalProps {
  visible: boolean;
  setVisible: (value: boolean) => void;
  options: string[];
  selectedValue?: string;
  setSelectedValue?: (value: string) => void;
  isMultiSelect?: boolean;
  selectedValues?: string[];
  setSelectedValues?: (values: string[]) => void;
  questionLabel: string;
  helperText?: string;
  modalAnim: Animated.Value;
  closeModal: (setter: (value: boolean) => void) => void;
  handleMultiSelect?: (
    item: string,
    selectedItems: string[],
    setSelectedItems: (values: string[]) => void
  ) => void;
}

const DropdownModal: React.FC<DropdownModalProps> = React.memo(
  ({
    visible,
    setVisible,
    options,
    selectedValue,
    setSelectedValue,
    isMultiSelect,
    selectedValues,
    setSelectedValues,
    questionLabel,
    helperText,
    modalAnim,
    closeModal,
    handleMultiSelect,
  }) => {
    return (
      <SafeAreaView>
        <Modal
          visible={visible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => closeModal(setVisible)}
        >
          <TouchableWithoutFeedback onPress={() => closeModal(setVisible)}>
            <View style={styles.modalOverlaySimple}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <Animated.View
                  style={[
                    styles.modalContentSimple,
                    {
                      opacity: modalAnim,
                      transform: [
                        {
                          translateY: modalAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [40, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.modalHeaderSimple}>
                    <Text style={styles.modalTitleSimple}>{questionLabel}</Text>
                    {helperText ? (
                      <Text style={styles.helperTextSimple}>{helperText}</Text>
                    ) : null}
                  </View>
                  <FlatList
                    data={options}
                    keyExtractor={(item) => item.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.optionItemSimple,
                          (isMultiSelect
                            ? selectedValues?.includes(item)
                            : selectedValue === item) &&
                            styles.selectedOptionSimple,
                        ]}
                        onPress={() => {
                          if (isMultiSelect && setSelectedValues) {
                            handleMultiSelect?.(
                              item,
                              selectedValues || [],
                              setSelectedValues
                            );
                          } else {
                            setSelectedValue?.(item);
                            closeModal(setVisible);
                          }
                        }}
                      >
                        <Text
                          style={[
                            styles.optionTextSimple,
                            (isMultiSelect
                              ? selectedValues?.includes(item)
                              : selectedValue === item) &&
                              styles.selectedOptionTextSimple,
                          ]}
                        >
                          {item}
                        </Text>
                        {/* {(isMultiSelect && selectedValues?.includes(item)) ||
                        (!isMultiSelect && selectedValue === item) ? (
                          <Text style={styles.checkmarkSimple}>✓</Text>
                        ) : null} */}
                      </TouchableOpacity>
                    )}
                    showsVerticalScrollIndicator={false}
                  />
                  {isMultiSelect && (
                    <TouchableOpacity
                      style={styles.doneButtonSimple}
                      onPress={() => closeModal(setVisible)}
                    >
                      <Text style={styles.doneButtonTextSimple}>Done</Text>
                    </TouchableOpacity>
                  )}
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    );
  }
);

const styles = StyleSheet.create({
  modalOverlaySimple: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  modalContentSimple: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  modalHeaderSimple: {
    marginBottom: 24,
    alignItems: "center",
  },
  modalTitleSimple: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  helperTextSimple: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  optionItemSimple: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
    marginVertical: 3,
    backgroundColor: COLORS.greyLight,
  },
  selectedOptionSimple: {
    backgroundColor: COLORS.greyMint,
    // borderWidth: 2,
    // borderColor: COLORS.primary,
  },
  optionTextSimple: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: "500",
    flex: 1,
  },
  selectedOptionTextSimple: {
    fontWeight: "600",
    fontSize: 16,
    color: COLORS.primary,
  },
  checkmarkSimple: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  doneButtonSimple: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    // elevation: 6,
  },
  doneButtonTextSimple: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
