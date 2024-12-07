import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { getAllTimers } from "@/services/timer/timersServices";

const Timer = forwardRef((props, ref) => {
  const [timer, setTimer] = useState(0); // Timer in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [intervals, setIntervals] = useState([]); // Available intervals
  const [selectedInterval, setSelectedInterval] = useState<any>(null); // Selected interval
  const [settingsVisible, setSettingsVisible] = useState(false);

  // Expose functions to the parent component
  useImperativeHandle(ref, () => ({
    startTimer: () => {
      if (selectedInterval) {
        setTimer(selectedInterval.minutesInterval * 60); // Reset timer based on selected interval
        setIsRunning(true); // Start the timer
      }
    },
    stopTimer: () => {
      setIsRunning(false); // Stop the timer
    },
    isRunning: () => isRunning, // Expose isRunning state
  }));

  // Fetch interval data from API
  useEffect(() => {
    const fetchIntervals = async () => {
      try {
        const response = await getAllTimers();
        const formattedIntervals = response.timers.map((timer: any) => ({
          id: timer.timer_id,
          title: timer.title,
          minutesInterval: timer.minutes_interval,
        }));
        setIntervals(formattedIntervals);

        // Set the default interval (e.g., first one)
        if (formattedIntervals.length > 0) {
          setSelectedInterval(formattedIntervals[0]);
          setTimer(formattedIntervals[0].minutesInterval * 60); // Initialize timer
        }
      } catch (error) {
        Alert.alert("Error", "Failed to fetch intervals. Please try again.");
      }
    };

    fetchIntervals();
  }, []);

  // Handle timer countdown
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isRunning) {
      intervalId = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            // Stop timer and reset to the selected interval
            setIsRunning(false); // Stop the timer
            return selectedInterval ? selectedInterval.minutesInterval * 60 : 0; // Reset timer
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, timer, selectedInterval]);

  // Update timer when interval changes
  useEffect(() => {
    if (selectedInterval) {
      setTimer(selectedInterval.minutesInterval * 60); // Reset timer when a new interval is selected
    }
  }, [selectedInterval]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  const toggleSettings = () => {
    setSettingsVisible(!settingsVisible);
  };

  return (
    <View style={styles.container}>
      {selectedInterval && (
        <>
          <Text style={styles.timer}>{formatTime(timer)}</Text>
          <Text style={styles.timerLabel}>for next dispatch</Text>
        </>
      )}

      <TouchableOpacity onPress={toggleSettings} style={styles.settingsButton}>
        <Icon name="settings-outline" size={30} color="black" />
      </TouchableOpacity>

      {/* Settings Modal */}
      <Modal
        transparent={true}
        visible={settingsVisible}
        animationType="fade"
        onRequestClose={toggleSettings}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Interval Type</Text>
            {intervals.map((interval: any) => (
              <TouchableOpacity
                key={interval.id}
                style={[
                  styles.modalOption,
                  selectedInterval?.id === interval.id && styles.selectedOption,
                ]}
                onPress={() => {
                  setSelectedInterval(interval); // Update the selected interval
                  toggleSettings(); // Close the modal
                }}
              >
                <Text style={styles.modalText}>{interval.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  timer: {
    fontSize: 40,
    fontWeight: "bold",
  },
  timerLabel: {
    fontSize: 16,
    color: "#888",
    marginTop: 5,
  },
  settingsButton: {
    position: "absolute",
    top: 30,
    left: 30,
    padding: 5,
    borderRadius: 50,
    backgroundColor: "#f7f7f7",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 5,
    backgroundColor: "#f7f7f7",
    width: "100%",
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#32CD32",
  },
  modalText: {
    fontSize: 16,
    color: "black",
  },
});

export default Timer;
