import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { getAllTimers } from "@/services/timer/timersServices";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    saveTimerState: saveTimerState, // Expose saveTimerState to the parent
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
          // Do NOT start the timer here, just initialize the selected interval
        }
      } catch (error) {
        Alert.alert("Error", "Failed to fetch intervals. Please try again.");
      }
    };

    fetchIntervals();
  }, []);

  // Update timer when interval changes but don't start the timer automatically
  useEffect(() => {
    if (selectedInterval && !isRunning) {
      setTimer(selectedInterval.minutesInterval * 60); // Reset timer based on selected interval but don't start it
    }
  }, [selectedInterval, isRunning]);

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

  // Persist timer state to AsyncStorage
  const saveTimerState = async () => {
    if (isRunning) {
      await AsyncStorage.setItem("timer", JSON.stringify({ timer, isRunning }));
    } else {
      // If the timer is not running, remove the state from AsyncStorage
      await AsyncStorage.removeItem("timer");
    }
  };

  // Retrieve timer state from AsyncStorage
  const loadTimerState = async () => {
    try {
      const savedTimerState = await AsyncStorage.getItem("timer");
      if (savedTimerState) {
        const { timer: savedTimer, isRunning: savedIsRunning } = JSON.parse(savedTimerState);
        setTimer(savedTimer);
        setIsRunning(savedIsRunning);
      }
    } catch (error) {
      console.error("Failed to load timer state:", error);
    }
  };

  // Use useFocusEffect to start the timer when screen is focused and restore state
  useFocusEffect(
    useCallback(() => {
      loadTimerState(); // Load saved timer state when screen gains focus

      // No cleanup function here, so the timer will continue running even when the screen is blurred
    }, []) // Dependencies to trigger changes
  );

  // Save the timer state when component unmounts or loses focus
  useEffect(() => {
    return () => {
      saveTimerState(); // Save the current state to AsyncStorage
    };
  }, [timer, isRunning]); // Dependencies to trigger saving the state

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
