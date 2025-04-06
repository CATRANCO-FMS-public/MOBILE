import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ToastAndroid,
  StyleSheet,
  Alert,
  ActivityIndicator
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

import Sidebar from "../../components/layout/Sidebar";
import TimerEdit from "../../components/interval/TimerEdit";

import {
  getAllTimers,
  createTimer,
  updateTimer,
  deleteTimer,
} from "@/services/timer/timersServices";

interface Interval {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  timerLimit: number;
}

const ClockSetting: React.FC = () => {
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentInterval, setCurrentInterval] = useState<Interval>({
    id: "",
    name: "",
    startTime: "",
    endTime: "",
    timerLimit: 0,
  });
  const [loading, setLoading] = useState(true);

  // Helper functions for time conversion
  const formatTo12Hour = (time: string) => {
    const [hour, minute] = time.split(":");
    const date = new Date();
    date.setHours(parseInt(hour), parseInt(minute));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatTo24Hour = (time: string) => {
    const [timePart, modifier] = time.split(" ");
    let [hour, minute] = timePart.split(":");
    if (modifier === "PM" && parseInt(hour) !== 12) {
      hour = String(parseInt(hour) + 12);
    }
    if (modifier === "AM" && parseInt(hour) === 12) {
      hour = "00";
    }
    return `${hour}:${minute}`;
  };

  // Fetch intervals from AsyncStorage
  const fetchStoredIntervals = async () => {
    try {
      const storedIntervals = await AsyncStorage.getItem("intervals");
      if (storedIntervals) {
        // Parse intervals from AsyncStorage
        setIntervals(JSON.parse(storedIntervals));
      }
    } catch (error) {
      console.error("Failed to fetch intervals from AsyncStorage", error);
    }
  };

  // Fetch intervals from API
  const fetchIntervalsFromAPI = async () => {
    setLoading(true);
    try {
      const response = await getAllTimers();
      const formattedIntervals = response.timers.map((timer: any) => ({
        id: timer.timer_id,
        name: timer.title,
        startTime: formatTo12Hour(timer.start_time),
        endTime: formatTo12Hour(timer.end_time),
        timerLimit: timer.minutes_interval,
      }));
      setIntervals(formattedIntervals);
      // Save fetched intervals to AsyncStorage
      await AsyncStorage.setItem("intervals", JSON.stringify(formattedIntervals));
    } catch (error) {
      ToastAndroid.show("Failed to fetch intervals from API. Please try again.", ToastAndroid.BOTTOM);
    } finally {
      setLoading(false);
    }
  };

  // Fetch intervals when the component mounts
  useEffect(() => {
    fetchStoredIntervals();
  }, []);

  // If no intervals are in AsyncStorage, fetch from API
  useEffect(() => {
    if (intervals.length === 0) {
      fetchIntervalsFromAPI();
    }
  }, [intervals]);

  // Save updated intervals to AsyncStorage whenever intervals state changes
  useEffect(() => {
    if (intervals.length > 0) {
      AsyncStorage.setItem("intervals", JSON.stringify(intervals));
    }
  }, [intervals]);

  const handleAddInterval = () => {
    setCurrentInterval({
      id: "",
      name: "",
      startTime: "",
      endTime: "",
      timerLimit: 0,
    });
    setModalVisible(true);
  };

  const handleEditInterval = (id: string) => {
    const intervalToEdit = intervals.find((interval) => interval.id === id);
    if (intervalToEdit) {
      setCurrentInterval(intervalToEdit);
      setModalVisible(true);
    }
  };

  const handleSaveInterval = async (newInterval: Interval) => {
    try {
      const sanitizedInterval = {
        ...newInterval,
        start_time: newInterval.startTime.replace(/\s+/g, ' ').trim(), 
        end_time: newInterval.endTime.replace(/\s+/g, ' ').trim(),   
      };
  
      console.log("Sending data:", sanitizedInterval);
  
      if (sanitizedInterval.id) {
        await updateTimer(sanitizedInterval.id, {
          title: sanitizedInterval.name,
          start_time: sanitizedInterval.start_time,
          end_time: sanitizedInterval.end_time,
          minutes_interval: sanitizedInterval.timerLimit,
        });
        ToastAndroid.show("Interval updated successfully!", ToastAndroid.SHORT);
      } else {
        await createTimer({
          title: sanitizedInterval.name,
          start_time: sanitizedInterval.start_time,
          end_time: sanitizedInterval.end_time,
          minutes_interval: sanitizedInterval.timerLimit,
        });
        ToastAndroid.show("New interval created successfully!", ToastAndroid.SHORT);
      }
      
      fetchIntervalsFromAPI();
      setModalVisible(false);
    } catch (error) {
      console.error(`Error updating timer with ID ${newInterval.id}:`, error.response?.data || error.message);
      ToastAndroid.show("Failed to save the interval. Please try again.", ToastAndroid.BOTTOM);
    }
  };
  
  const handleDeleteInterval = (id: string) => {
    Alert.alert(
      "Delete Interval",
      "Are you sure you want to delete this interval?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteTimer(id);
              
              // Filter out the deleted interval from the state
              const updatedIntervals = intervals.filter((interval) => interval.id !== id);
              setIntervals(updatedIntervals);

              // Save the updated intervals list back to AsyncStorage
              await AsyncStorage.setItem("intervals", JSON.stringify(updatedIntervals));
              
              ToastAndroid.show("Interval deleted successfully!", ToastAndroid.SHORT);
            } catch (error) {
              ToastAndroid.show("Failed to delete the interval. Please try again.", ToastAndroid.BOTTOM);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Sidebar isVisible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      <Text style={styles.title}>Manage Intervals</Text>
      <Text style={styles.description}>
        Here you can manage the intervals for normal and rush hour schedules, as
        well as add new intervals.
      </Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text>Loading intervals...</Text>
        </View>
      ) : (
        <FlatList
          data={intervals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.intervalItem}>
              <Text>{item.name}</Text>
              <Text>
                {item.startTime} - {item.endTime}
              </Text>
              <Text>Interval: {item.timerLimit} {item.timerLimit === 1 ? "minute" : "minutes"}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditInterval(item.id)}
                >
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteInterval(item.id)}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity 
        style={styles.addButton} 
        onPress={handleAddInterval}
      >
        <Text style={styles.addButtonText}>Add New Interval</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setSidebarVisible(!sidebarVisible)}
        style={styles.menuButton}
      >
        <Ionicons name="menu" size={25} color="black" />
      </TouchableOpacity>

      <TimerEdit
        visible={modalVisible}
        interval={currentInterval}
        onSave={handleSaveInterval}
        onCancel={() => setModalVisible(false)}
        onChange={setCurrentInterval}
        title={currentInterval.id ? "Edit Interval" : "Create New Interval"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 70,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    color: "#666",
  },
  intervalItem: {
    padding: 15,
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  editButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: "#FF6347",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  editText: {
    color: "#fff",
  },
  deleteText: {
    color: "#fff",
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuButton: {
    position: "absolute",
    top: 20,
    left: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ClockSetting;