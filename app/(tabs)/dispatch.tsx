import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE  } from "react-native-maps";
import Icon from "react-native-vector-icons/Ionicons";
import Sidebar from "../components/sidebar";
import DispatchModal from "../components/DispatchModal";
import AlleyModal from "../components/AlleyModal";
import echo from "../../constants/utils/pusherConfig"; 
import BusList from "../components/Buslist";

const App = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [dispatchModalVisible, setDispatchModalVisible] = useState(false);
  const [alleyModalVisible, setAlleyModalVisible] = useState(false);
  const [selectedBus, setSelectedBus] = useState<{ vehicle_id: string; status: string } | null>(null);
  const [timer, setTimer] = useState(600); // 10 minutes default (in seconds)
  const [isRunning, setIsRunning] = useState(false);
  const [isHidden, setIsHidden] = useState(false); // To toggle visibility of components
  const [intervalType, setIntervalTypeState] = useState<"normal" | "rush">("normal");
  const [trackerData, setTrackerData] = useState<any>(null);
  const [path, setPath] = useState<{ latitude: number; longitude: number }[]>([]);
  const [renderMap, setRenderMap] = useState(false);
  const router = useRouter();

  // Using useEffect to setup the real-time listener
  useEffect(() => {
    // Function to setup real-time listener
    const setupRealTimeListener = () => {
      const channel = echo.channel("flespi-data");

      const handleEvent = (event: any) => {
        console.log("Real-time Data Received:", event.data);

        if (Array.isArray(event.data) && event.data.length > 0) {
          const newTrackerData = event.data[0]; // Get the first item from the array

          // Apply logic similar to mock data:
          // Check if PositionLatitude and PositionLongitude are present
          if (newTrackerData.PositionLatitude && newTrackerData.PositionLongitude) {
            // Update path with new coordinates
            setPath((prevPath) => [
              ...prevPath,
              {
                latitude: newTrackerData.PositionLatitude,
                longitude: newTrackerData.PositionLongitude,
              },
            ]);

            // Update trackerData with the first object
            setTrackerData(newTrackerData);
          } else {
            setTrackerData(null); // Clear tracker data if no valid data is received
          }
        } else {
          setTrackerData(null); // Clear tracker data if event.data is empty
        }
      };

      // Listen for the "FlespiDataReceived" event
      channel.listen("FlespiDataReceived", handleEvent);

      // Return cleanup function to stop the listener and disconnect
      return () => {
        channel.stopListening("FlespiDataReceived");
        echo.disconnect();
      };
    }; 

    // Call setupRealTimeListener every 1 second
    const intervalId = setInterval(setupRealTimeListener, 1000);

    // Fetch immediately on mount
    setupRealTimeListener();

    // Clean up the interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []); 
  // Delay rendering the map by 3 seconds
  useEffect(() => {
    const timeout = setTimeout(() => setRenderMap(true), 10000); // Adjust delay as needed
    return () => clearTimeout(timeout); // Cleanup the timeout on component unmount
  }, []);


  useEffect(() => {
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    setCurrentDate(formattedDate);
  }, []);


  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (!isRunning && interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timer]);

  const toggleVisibility = () => {
    setIsHidden((prev) => !prev); // Toggle visibility of busPage, timerContainer, and bottomButtons
  };

  const resetTimer = () => {
    setTimer(intervalType === "normal" ? 600 : 300); // Reset based on interval type
  };

  const setIntervalType = (type: "normal" | "rush") => {
    setIntervalTypeState(type);
    setTimer(type === "normal" ? 600 : 300); // Update timer based on selected interval type
    setMenuVisible(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      {/* Map with Real-Time Marker and Polyline */}
      {renderMap ? ( // Conditionally render the MapView
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={{
            latitude: trackerData?.PositionLatitude || 0,
            longitude: trackerData?.PositionLongitude || 0,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
        >
          {/* Polyline for the trail */}
          <Polyline
            coordinates={path}
            strokeWidth={3}
            strokeColor="blue"
          />

          {/* Marker for the current position */}
          {trackerData?.PositionLatitude && trackerData?.PositionLongitude && (
            <Marker
              coordinate={{
                latitude: trackerData.PositionLatitude,
                longitude: trackerData.PositionLongitude,
              }}
              title="Tracker"
              description={`Speed: ${trackerData.PositionSpeed} km/h`}
            />
          )}
        </MapView>
      ) : (
        // Show a loading state while waiting for the map to render
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Map...</Text>
        </View>
      )}

      {/* Tracker Details */}
      <View style={styles.details}>
        {trackerData ? (
          <>
            <Text>Tracker: {trackerData.Ident}</Text>
            <Text>Latitude: {trackerData.PositionLatitude}</Text>
            <Text>Longitude: {trackerData.PositionLongitude}</Text>
            <Text>Speed: {trackerData.PositionSpeed} km/h</Text>
          </>
        ) : (
          <Text>Waiting for data...</Text>
        )}
      </View>

      {/* Sidebar */}
      <Sidebar isVisible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {/* Header */}
      <View style={styles.header}>
        {!isHidden && ( // Conditionally render the menu icon and date
          <>
            <TouchableOpacity onPress={() => setSidebarVisible(!sidebarVisible)}>
              <Icon name="menu" size={25} color="black" />
            </TouchableOpacity>
            <Text style={styles.date}>{currentDate}</Text>
            <TouchableOpacity style={styles.histogramIcon} onPress={() => {router.push("/(tabs)/history")}}>
              <Icon name="bar-chart-outline" size={25} color="black" />
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity onPress={toggleVisibility} style={styles.eyeIcon}>
          <Icon name={isHidden ? "eye-outline" : "eye-off-outline"} size={25} color="black" />
        </TouchableOpacity>
      </View>

      {/* Free Space */}
      <View style={styles.freeSpace} />

      {/* Conditionally Render Components */}
      {!isHidden && (
        <>
          {/* Swipeable Bus Status */}
          <View style={styles.busContainer}>
            <BusList
              selectedBus={selectedBus}
              setSelectedBus={setSelectedBus}
            />
          </View>
          

          {/* Timer */}
          <View style={styles.timerContainer}>
            <TouchableOpacity onPress={() => setIsRunning(!isRunning)} style={styles.playButton}>
              <Icon
                name={isRunning ? "pause-outline" : "play-outline"}
                size={30}
                color="black"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={resetTimer} style={styles.resetButton}>
              <Icon name="refresh-outline" size={30} color="black" />
            </TouchableOpacity>
            <Text style={styles.timer}>{formatTime(timer)}</Text>
            <Text style={styles.timerLabel}>for next dispatch</Text>
            <TouchableOpacity
              onPress={() => setMenuVisible(true)}
              style={styles.settingsIcon}
            >
              <Icon name="settings-outline" size={30} color="black" />
            </TouchableOpacity>
          </View>

          {/* Bottom Buttons */}
          <View style={styles.bottomButtons}>
            <TouchableOpacity
                style={[styles.button, styles.onAlleyButton]}
                onPress={() => {
                  if (selectedBus) {
                    setAlleyModalVisible(true); // Open DispatchModal only if a bus is selected
                  } else {
                    alert("Please select a bus first!");
                  }
                }}
              >
                <Text style={styles.buttonText}>Alley On</Text>
              </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.dispatchButton]}
              onPress={() => {
                if (selectedBus) {
                  setDispatchModalVisible(true); // Open DispatchModal only if a bus is selected
                } else {
                  alert("Please select a bus first!");
                }
              }}
            >
              <Text style={styles.buttonText}>Dispatch</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Alley Modal */}
      <AlleyModal
        isVisible={alleyModalVisible}
        onClose={() => setAlleyModalVisible(false)}
        selectedBus={selectedBus}
        onConfirm={resetTimer}
      />

      {/* Dispatch Modal */}
      <DispatchModal
        isVisible={dispatchModalVisible}
        onClose={() => setDispatchModalVisible(false)}
        selectedBus={selectedBus}
        onConfirm={() => resetTimer()}
      />

      {/* Settings Modal */}
      <Modal
        transparent={true}
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalMenu}>
              <TouchableOpacity
                onPress={() => setIntervalType("normal")}
                style={styles.modalOption}
              >
                <Text style={styles.modalText}>Normal Interval</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIntervalType("rush")}
                style={styles.modalOption}
              >
                <Text style={styles.modalText}>Rush Hour Interval</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    position: "relative", 
  },
  date: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    flex: 1, 
  },
  histogramIcon:{
    right: 40,
  },
  eyeIcon: {
    position: "absolute",
    right: 10, 
    top: 10,
  },
  map: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  details: {
    position: "absolute",
    padding: 10,
    backgroundColor: "#fff",
    top: 50,
    left: 50
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
  },
  freeSpace: {
    height: 415,
  },
  busContainer: {
    alignItems: "center",
    height: 200,
  },
  timerContainer: {
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
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
  settingsIcon: {
    position: "absolute",
    top: 17,
    left: 80,
    padding: 5,
    borderRadius: 50,
    backgroundColor: "#f7f7f7",
  },
  playButton: {
    position: "absolute",
    top: 17,
    right: 80,
    padding: 5,
    borderRadius: 50,
    backgroundColor: "#f7f7f7",
  },
  resetButton: {
    position: "absolute",
    top: 17,
    right: 30,
    padding: 5,
    borderRadius: 50,
    backgroundColor: "#f7f7f7",
  },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  dispatchButton: {
    backgroundColor: "#32CD32",
  },
  onAlleyButton: {
    backgroundColor: "orange",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  // Settings Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalMenu: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  modalOption: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  modalText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
});

export default App;