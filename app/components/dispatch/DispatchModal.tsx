import React, { useState } from "react";

import { View, Text, TouchableOpacity, Modal, StyleSheet, ToastAndroid, ActivityIndicator } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { startDispatch, endAlley } from "@/services/dispatch/dispatchServices"; 

interface DispatchModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedBus: { vehicle_id: string; status: string; vehicle_assignment_id: number; dispatch_logs_id?: number } | null;
  onConfirm: () => void;
  timerRef: React.RefObject<{
    startTimer: () => void;
    stopTimer: () => void;
    isRunning: () => boolean;
  }>;
}

const DispatchModal: React.FC<DispatchModalProps> = ({
  isVisible,
  onClose,
  selectedBus,
  onConfirm,
  timerRef,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleConfirm = async () => {
    if (!selectedBus) return;
  
    setLoading(true);
  
    try {
      if (timerRef?.current?.isRunning()) {
        setLoading(false);
        ToastAndroid.show("Cannot dispatch until the timer is completed.", ToastAndroid.BOTTOM);
        return;
      }
  
      // Ensure the vehicle is "on alley" before proceeding
      if (selectedBus.status !== "on alley" || !selectedBus.dispatch_logs_id) {
        setLoading(false);
        ToastAndroid.show(
          "The bus must be on alley before it can be dispatched.",
          ToastAndroid.BOTTOM
        );
        return;
      }
  
      // End the alley
      await endAlley(selectedBus.dispatch_logs_id);
  
      // Start the dispatch
      const data = {
        route: selectedOption,
        vehicle_assignment_id: selectedBus.vehicle_assignment_id,
      };
      await startDispatch(data);
  
      onConfirm();
      onClose();
    } catch (error) {
      console.error("Error handling dispatch confirm:", error);
      ToastAndroid.show(
        "An unexpected error occurred. Please try again later.",
        ToastAndroid.BOTTOM
      );
    } finally {
      setLoading(false);
    }
  };  

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Icon, Dynamic Bus Title, and Status */}
          <View style={styles.header_wrapper}>
            <View style={styles.header}>
              <Ionicons name="bus" size={50} color="black" />
              <View style={styles.titleWrapper}>
                <Text style={styles.busTitle}>
                  {selectedBus?.vehicle_id || "No Bus Selected"} {/* Display selected bus */}
                </Text>
                <Text style={styles.busStatus}>
                  {selectedBus?.status || "No Status Available"} {/* Display bus status */}
                </Text>
                <Text style={styles.StatusText}>CURRENT STATUS</Text>
              </View>
            </View>
          </View>

          {/* Dispatch Label */}
          <Text style={styles.dispatchLabel}>Dispatch Going To:</Text>

          {/* Dispatch Options */}
          <View style={styles.dispatchOptions}>
            {["Canitoan", "Silver Creek", "Cogon"].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  selectedOption === option && styles.selectedOptionButton,
                ]}
                onPress={() => handleOptionSelect(option)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dispatchButton}
              onPress={handleConfirm}
              disabled={loading} // Disable button when loading
            >
              {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.dispatchText}>Confirm</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 15,
    elevation: 5,
  },
  header_wrapper: {
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleWrapper: {
    marginLeft: 15,
  },
  busTitle: {
    fontSize: 30,
    fontWeight: "bold",
  },
  busStatus: {
    fontSize: 18,
    color: "gray",
    marginTop: 5,
  },
  StatusText: {
    color: "red",
    fontSize: 15,
  },
  dispatchLabel: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
    color: "black",
    textAlign: "center",
  },
  dispatchOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: "#ADFF2F", // Default background color
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: "transparent", // Default border color
  },
  selectedOptionButton: {
    borderColor: "#3b82f6", // Red border for the selected option
    borderWidth: 2,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "black",
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 15,
  },
  cancelButton: {
    backgroundColor: "#FF6347",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  dispatchButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginLeft: 10,
    width: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  dispatchText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});

export default DispatchModal;