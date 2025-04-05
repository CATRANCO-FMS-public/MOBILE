import React, { useState } from "react";

import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert, ActivityIndicator } from "react-native";

import Icon from "react-native-vector-icons/Ionicons";

import { startAlley } from "@/services/dispatch/dispatchServices";

interface AlleyModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedBus: { vehicle_id: string; status: string; vehicle_assignment_id: number } | null;
  onConfirm
}

const AlleyModal: React.FC<AlleyModalProps> = ({
  isVisible,
  onClose,
  selectedBus,
  onConfirm,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleConfirm = async () => {

    setLoading(true);

    if (!selectedOption) {
      Alert.alert("Error", "Please select an alley to start.");
      return;
    }

    if (!selectedBus) {
      Alert.alert("Error", "No bus selected.");
      return;
    }

    const data = {
      route: selectedOption, // The selected alley option
      vehicle_assignment_id: selectedBus.vehicle_assignment_id, // The vehicle assignment ID
    };

    try {
      // Call the startAlley service
      const response = await startAlley(data);
      // On success, you can trigger a callback to reset the timer, or show a success message
      console.log("Alley started successfully:", response);
      onConfirm();
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error starting alley:", error);
      Alert.alert("Error", "Failed to start the alley. Please try again.");
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
              <Icon name="bus" size={50} color="black" />
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

          {/* Alley Label */}
          <Text style={styles.dispatchLabel}>Alley On:</Text>

          {/* Alley Options */}
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
              disabled={loading}
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
    backgroundColor: "#FFA500",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedOptionButton: {
    borderColor: "red",
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

export default AlleyModal;