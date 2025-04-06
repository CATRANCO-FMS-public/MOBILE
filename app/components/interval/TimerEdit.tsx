import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";

import DateTimePickerModal from "react-native-modal-datetime-picker";

interface Interval {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  timerLimit: number;
}

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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    title: "",
    startTime: "",
    endTime: "",
    minutesInterval: "",
  });

  const formatTime12Hour = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleTimeString("en-US", options).replace(/\s+/g, " ").trim();
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

  const validate = () => {
    const newErrors = {
      title: "",
      startTime: "",
      endTime: "",
      minutesInterval: "",
    };

    if (!interval.name || interval.name.trim() === "") {
      newErrors.title = "Title is required.";
    } else if (interval.name.length > 255) {
      newErrors.title = "Title must not exceed 255 characters.";
    }

    if (!interval.startTime) {
      newErrors.startTime = "Start time is required.";
    }

    if (!interval.endTime) {
      newErrors.endTime = "End time is required.";
    }

    if (
      !interval.timerLimit ||
      isNaN(interval.timerLimit) ||
      interval.timerLimit < 1
    ) {
      newErrors.minutesInterval = "Minutes interval must be at least 1.";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSave = async () => {
    if (!validate()) {
      ToastAndroid.show(
        "Validation Error: Please fix the errors before saving.",
        ToastAndroid.LONG
      );
      return;
    }

    setLoading(true);
    await onSave(interval);
    setLoading(false);
  };

  const handleCancel = () => {
    setErrors({
      title: "",
      startTime: "",
      endTime: "",
      minutesInterval: "",
    });
    onCancel();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.fieldLabel}>Title:</Text>
          <TextInput
            style={[styles.input, errors.title && styles.errorInput]}
            placeholder="Interval Name"
            value={interval.name}
            onChangeText={(text) => onChange({ ...interval, name: text })}
          />
          {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}

          <Text style={styles.fieldLabel}>Start Time:</Text>
          <TouchableOpacity
            onPress={() => setStartPickerVisible(true)}
            style={[styles.input, errors.startTime && styles.errorInput]}
          >
            <Text>{interval.startTime || "Select Start Time"}</Text>
          </TouchableOpacity>
          {errors.startTime ? <Text style={styles.errorText}>{errors.startTime}</Text> : null}
          <DateTimePickerModal
            isVisible={isStartPickerVisible}
            mode="time"
            onConfirm={handleStartTimeConfirm}
            onCancel={() => setStartPickerVisible(false)}
            is24Hour={false}
          />

          <Text style={styles.fieldLabel}>End Time:</Text>
          <TouchableOpacity
            onPress={() => setEndPickerVisible(true)}
            style={[styles.input, errors.endTime && styles.errorInput]}
          >
            <Text>{interval.endTime || "Select End Time"}</Text>
          </TouchableOpacity>
          {errors.endTime ? <Text style={styles.errorText}>{errors.endTime}</Text> : null}
          <DateTimePickerModal
            isVisible={isEndPickerVisible}
            mode="time"
            onConfirm={handleEndTimeConfirm}
            onCancel={() => setEndPickerVisible(false)}
            is24Hour={false}
          />

          <Text style={styles.fieldLabel}>Minutes Interval:</Text>
          <TextInput
            style={[styles.input, errors.minutesInterval && styles.errorInput]}
            placeholder="Timer Limit (minutes)"
            value={String(interval.timerLimit)}
            keyboardType="numeric"
            onChangeText={(text) =>
              onChange({ ...interval, timerLimit: parseInt(text) || 0 })
            }
          />
          {errors.minutesInterval ? (
            <Text style={styles.errorText}>{errors.minutesInterval}</Text>
          ) : null}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Interval</Text>
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
    width: 135,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 5,
  },
  errorInput: {
    borderColor: "red",
  },
});

export default TimerEdit;