import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE  } from "react-native-maps";
import Icon from "react-native-vector-icons/Ionicons";
import Sidebar from "../components/Sidebar";
import DispatchModal from "../components/DispatchModal";
import AlleyModal from "../components/AlleyModal";
import echo from "../../constants/utils/pusherConfig"; 
import BusList from "../components/Buslist";
import Timer from "../components/Timer";
import SwipeToRefresh from "../components/Refresh";

const App = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [dispatchModalVisible, setDispatchModalVisible] = useState(false);
  const [alleyModalVisible, setAlleyModalVisible] = useState(false);
  const [selectedBus, setSelectedBus] = useState<{ vehicle_id: string; status: string } | null>(null);
  const [isHidden, setIsHidden] = useState(false); // To toggle visibility of components
  const [trackerData, setTrackerData] = useState<any>(null);
  const [path, setPath] = useState<{ latitude: number; longitude: number }[]>([]);
  const [renderMap, setRenderMap] = useState(false);
  const [busIcon, setBusIcon] = useState(require("../../assets/images/bus_idle.png"));
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [mapKey, setMapKey] = useState(0);
  const timerRef = useRef(null);
  const busListRef = useRef(null);

  // Static locations with custom marker designs
  const locations = [
    {
      id: 1,
      title: "Canitoan",
      coordinate: { latitude: 8.4663228, longitude: 124.5853069 },
      icon: require("../../assets/images/canitoan.png"), // Replace with your custom icon
    },
    {
      id: 2,
      title: "Silver Creek",
      coordinate: { latitude: 8.475946, longitude: 124.6120194 },
      icon: require("../../assets/images/silver_creek.png"), // Replace with your custom icon
    },
    {
      id: 3,
      title: "Cogon",
      coordinate: { latitude: 8.4759094, longitude: 124.6514315 },
      icon: require("../../assets/images/cogon.png"), // Replace with your custom icon
    },
  ];

  // Handle incoming event data
  const handleEvent = (event: any) => {
    console.log("Real-time Data Received:", event);

    // Check if event.data exists and is an object
    if (event && event.location) {
      const { tracker_ident, location, timestamp, dispatch_log } = event;

      // Check if location data is available and valid
      if (location && location.latitude && location.longitude) {
        // Update path with new coordinates
        setPath((prevPath) => [
          ...prevPath,
          {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        ]);

        // Update trackerData with the latest data
        setTrackerData({
          tracker_ident,
          location,
          timestamp,
          dispatch_log,
        });

        // Update bus icon based on dispatch_log status
        if (dispatch_log) {
          if (dispatch_log.status === 'on road') {
            setBusIcon(require("../../assets/images/bus_on_road.png"));
          } else if (dispatch_log.status === 'on alley') {
            setBusIcon(require("../../assets/images/bus_on_alley.png"));
          }
        } else {
          // If dispatch_log is null, set bus to idle
          setBusIcon(require("../../assets/images/bus_idle.png"));
        }
      } else {
        // Clear tracker data if no valid location is available
        setTrackerData(null);
      }
    } else {
      // Handle the case where event.data is empty or undefined
      console.warn("Invalid or empty data received:", event);
      setTrackerData(null);
    }
  };

  // Function to setup real-time listener
  const setupRealTimeListener = () => {
    const channel = echo.channel("flespi-data");

    // Listen for the "FlespiDataReceived" event and handle incoming data
    channel.listen("FlespiDataReceived", handleEvent);

    // Return cleanup function to stop the listener and disconnect
    return () => {
      console.log("Cleaning up listener...");
      channel.stopListening("FlespiDataReceived");
      echo.disconnect();
    };
  };

  // Set up listener when the component mounts
  useEffect(() => {
    const cleanupListener = setupRealTimeListener();
    return cleanupListener; // Cleanup listener on component unmount
  }, []); // Empty dependency array means this effect runs only once

  // Adjust map to include all markers
  useEffect(() => {
    if (mapRef.current) {
      const allCoordinates = [
        ...locations.map((location) => location.coordinate),
        ...(trackerData?.PositionLatitude && trackerData?.PositionLongitude
          ? [{ latitude: trackerData.PositionLatitude, longitude: trackerData.PositionLongitude }]
          : []),
      ];
      mapRef.current.fitToCoordinates(allCoordinates, {
        edgePadding: { top: 10, right: 10, bottom: 10, left: 10 },
        animated: true,
      });
    }
  }, [trackerData]);

  const refreshTimeout = () => {
    const timeout = setTimeout(() => setRenderMap(true), 10000); // Adjust delay as needed
    return () => clearTimeout(timeout); // Cleanup the timeout on component unmount
  };

  // Delay rendering the map by 10 seconds
  useEffect(() => {
    refreshTimeout();
  }, []);

  useEffect(() => {
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    setCurrentDate(formattedDate);
  }, []);

  const toggleVisibility = () => {
    setIsHidden((prev) => !prev); // Toggle visibility of busPage, timerContainer, and bottomButtons
  };

  const handleAlleyConfirm = () => {
    handleEvent();
    console.log("Alley has confirmed");
    setSelectedBus(null);
  };

  const handleDispatchConfirm = () => {
    setSelectedBus(null);
    if (timerRef.current) {
      timerRef.current.startTimer(); // Start the timer
    }
    console.log("Timer started after dispatch confirm");
  };

  const handleRefresh = () => {
    if (busListRef.current) {
      busListRef.current.refreshData();
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (busListRef.current) {
      busListRef.current.refreshData();
    }
    setRefreshing(false);
  };

  return (
    <SwipeToRefresh refreshing={refreshing} onRefresh={onRefresh}>
      <View style={styles.container}>
        {/* Map with Real-Time Marker and Polyline */}
        {renderMap ? (
          <MapView
            key={mapKey}
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={{
              latitude: trackerData?.location?.latitude || 0,
              longitude: trackerData?.location?.longitude || 0,
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

            {/* Dynamic bus marker */}
            {trackerData && trackerData.location && (
              <Marker
                coordinate={trackerData.location}
                title={`BUS ${trackerData.tracker_ident}`}
                description={`Speed: ${trackerData.location.speed} km/h`}
                icon={busIcon} // Dynamically changing the icon
              />
            )}

            {/* Static Markers with Custom Icons */}
            {locations.map((location) => (
              <Marker
                key={location.id}
                coordinate={location.coordinate}
                title={location.title}
                icon={location.icon} // Custom icon for each location
              />
            ))}
          </MapView>
        ) : (
          // Show a loading state while waiting for the map to render
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text>Loading map...</Text>
          </View>
        )}

        {/* Tracker Details */}
        {/* <View style={styles.details}>
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
        </View> */}

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
                ref={busListRef}
                selectedBus={selectedBus}
                setSelectedBus={setSelectedBus}
              />
            </View>

            {/* Timer */}
            <View style={styles.timerContainer}>
              <Timer 
                ref={timerRef}
              />
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

        {/* Buttom Space */}
        <View style={styles.buttomSpace} />

        {/* Alley Modal */}
        <AlleyModal
          isVisible={alleyModalVisible}
          onClose={() => setAlleyModalVisible(false)}
          selectedBus={selectedBus}
          onConfirm={() => {
            handleAlleyConfirm();
            handleRefresh();
          }}
        />

        {/* Dispatch Modal */}
        <DispatchModal
          isVisible={dispatchModalVisible}
          onClose={() => setDispatchModalVisible(false)}
          selectedBus={selectedBus}
          onConfirm={() => {
            handleDispatchConfirm();
            handleRefresh();
          }}
          timerRef={timerRef}
        />
      </View>
    </SwipeToRefresh>
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
    flex: 1,
  },
  busContainer: {
    minHeight: "12%",
    maxHeight: "24%",
  },
  timerContainer:{
    marginBottom: 10,
  },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  buttomSpace: {
    height: "2%",
  },
});

export default App;