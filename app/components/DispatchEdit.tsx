import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface TimerEditProps {
  visible: boolean;
  interval: Interval;
  onSave: (interval: Interval) => void;
  onCancel: () => void;
  onChange: (interval: Interval) => void;
  title: string;
}

const TimerEdit: React.FC<TimerEditProps> = ({
  visible,
  interval,
  onSave,
  onCancel,
  onChange,
  title,
}) => {
  const [isStartPickerVisible, setStartPickerVisible] = useState(false);
  const [isEndPickerVisible, setEndPickerVisible] = useState(false);

  // Format time in 12-hour format with AM/PM
  const formatTime12Hour = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit", // Ensure two-digit hour
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleTimeString("en-US", options).replace(/\s+/g, " ").trim(); // Remove extra spaces
  };
  

  const handleStartTimeConfirm = (date: Date) => {
    const formattedTime = formatTime12Hour(date);
    onChange({ ...interval, startTime: formattedTime });
    setStartPickerVisible(false);
  };

  const handleEndTimeConfirm = (date: Date) => {
    const formattedTime = formatTime12Hour(date);
    onChange({ ...interval, endTime: formattedTime });
    setEndPickerVisible(false);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.fieldLabel}>Title:</Text>
          <TextInput
            style={styles.input}
            placeholder="Interval Name"
            value={interval.name}
            onChangeText={(text) => onChange({ ...interval, name: text })}
          />
          <Text style={styles.fieldLabel}>Start Time:</Text>
          <TouchableOpacity
            onPress={() => setStartPickerVisible(true)}
            style={styles.input}
          >
            <Text>{interval.startTime || "Select Start Time"}</Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isStartPickerVisible}
            mode="time"
            onConfirm={handleStartTimeConfirm}
            onCancel={() => setStartPickerVisible(false)}
            is24Hour={false} // Ensures 12-hour format in picker
          />
          <Text style={styles.fieldLabel}>End Time:</Text>
          <TouchableOpacity
            onPress={() => setEndPickerVisible(true)}
            style={styles.input}
          >
            <Text>{interval.endTime || "Select End Time"}</Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isEndPickerVisible}
            mode="time"
            onConfirm={handleEndTimeConfirm}
            onCancel={() => setEndPickerVisible(false)}
            is24Hour={false} // Ensures 12-hour format in picker
          />
          <Text style={styles.fieldLabel}>Minutes Interval:</Text>
          <TextInput
            style={styles.input}
            placeholder="Timer Limit (minutes)"
            value={String(interval.timerLimit)}
            keyboardType="numeric"
            onChangeText={(text) =>
              onChange({ ...interval, timerLimit: parseInt(text) || 0 })
            }
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={() => onSave(interval)}>
              <Text style={styles.saveButtonText}>Save Interval</Text>
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
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "black",
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 10,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#3b82f6', // Green color
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TimerEdit;