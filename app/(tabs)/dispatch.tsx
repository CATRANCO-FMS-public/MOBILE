import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid
} from "react-native";
import { useRouter } from "expo-router";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE  } from "react-native-maps";
import Icon from "react-native-vector-icons/Ionicons";
import Sidebar from "../components/Sidebar";
import DispatchModal from "../components/DispatchModal";
import AlleyModal from "../components/AlleyModal";
import echo from "../../constants/utils/pusherConfig"; 
import RNPickerSelect from 'react-native-picker-select';
import BusList from "../components/Buslist";
import Timer from "../components/Timer";
import SwipeToRefresh from "../components/Refresh";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from "expo-router";
import { endDispatch } from "@/services/dispatch/dispatchServices";
import { createOverspeedRecord } from "@/services/overspeedTracking/overspeedServices";
import SimulatedMarker from "../components/simulatedMarker";
import { routeData } from "../components/routeData";
import locations from "../components/locations";
import OverspeedAlert from "../components/OverspeedAlert";
import { resetBlockedLocationsForAllVehicles } from "@/services/resetBlockedLocations/resetBlockedLocationsServices";

const App = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [dispatchModalVisible, setDispatchModalVisible] = useState(false);
  const [alleyModalVisible, setAlleyModalVisible] = useState(false);
  const [selectedBus, setSelectedBus] = useState<{ vehicle_id: string; status: string } | null>(null);
  const [isHidden, setIsHidden] = useState(false); // To toggle visibility of components
  const [trackersData, setTrackersData] = useState([]);
  const [paths, setPaths] = useState({});
  const [busIcons, setBusIcons] = useState<{ [tracker_ident: string]: any }>({
    "default": require("../../assets/images/bus_idle.png"),
  });
  const [renderMap, setRenderMap] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const [mapKey, setMapKey] = useState(0);
  const timerRef = useRef(null);
  const busListRef = useRef(null);
  const [filter, setFilter] = useState<string>('all');
  const [initialRegion, setInitialRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [showOverspeedAlert, setShowOverspeedAlert] = useState(false);
  const [overspeedVehicleId, setOverspeedVehicleId] = useState<string | null>(null);

  // Load data from AsyncStorage when the component mounts or the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const loadTrackerData = async () => {
        try {
          const savedTrackerData = await AsyncStorage.getItem("trackersData");
          if (savedTrackerData) {
            const parsedTrackerData = JSON.parse(savedTrackerData);
            setTrackersData(parsedTrackerData); // Set the state with saved trackers data
          }

          const savedBusIcons = await AsyncStorage.getItem("busIcons");
          if (savedBusIcons) {
            const parsedBusIcons = JSON.parse(savedBusIcons);
            setBusIcons(parsedBusIcons); // Set the state with saved busIcons
          }
        } catch (error) {
          console.error("Error loading data from AsyncStorage", error);
        }
      };

      loadTrackerData(); // Load data when screen is focused

      return () => {
        // Optional cleanup if necessary when screen is unfocused
      };
    }, []) // Empty dependency array means this effect runs when the screen is focused
  );

  // Set up listener when the component mounts
  useEffect(() => {
    console.log('Running Real Timer Listener...')
    // Function to setup real-time listener
    const setupRealTimeListener = () => {
      const channel = echo.channel("flespi-data");

      // Handle incoming event data
      const handleEvent = async (event: any) => {
        console.log("Real-time Data Received:", event);

        if (event && event.location) {
          const { tracker_ident, vehicle_id, location, timestamp, dispatch_log } = event;

          // Check if location data is available and valid
          if (location && location.latitude && location.longitude) {

            // Check for overspeed
            const speedThreshold = 50; // Define your speed threshold
            if (location.speed > speedThreshold) {
              console.log("Overspeed detected for tracker:", tracker_ident);

              // Prepare overspeed data
              const overspeedData = {
                dispatch_logs_id: dispatch_log?.dispatch_logs_id,
                vehicle_id: vehicle_id,
                speed: location.speed,
                latitude: location.latitude,
                longitude: location.longitude,
              };

              try {
                // Call the service to create the overspeed record
                const response = await createOverspeedRecord(overspeedData);
                console.log("Overspeed data successfully logged:", response);

                // Show the overspeed alert with vehicle_id
                setOverspeedVehicleId(vehicle_id); // Set the vehicle_id
                setShowOverspeedAlert(true); // Trigger modal visibility
                
              } catch (error) {
                console.error("Error logging overspeed data:", error);
              }
            }
            
            // Updating trackers data
            setTrackersData((prevTrackers) => {
              // Check if tracker already exists
              const existingTrackerIndex = prevTrackers.findIndex(
                (tracker) => tracker.tracker_ident === tracker_ident
              );

              const updatedTrackers = [...prevTrackers];

              if (existingTrackerIndex !== -1) {
                // Update existing tracker
                updatedTrackers[existingTrackerIndex] = {
                  tracker_ident,
                  vehicle_id,
                  location,
                  timestamp,
                  dispatch_log,
                };
              } else {
                // Add new tracker
                updatedTrackers.push({
                  tracker_ident,
                  vehicle_id,
                  location,
                  timestamp,
                  dispatch_log,
                });
              }

              // Save the updated state to AsyncStorage
              (async () => {
                try {
                  const trackersDataString = JSON.stringify(updatedTrackers); // Correctly stringify updated state
                  await AsyncStorage.setItem("trackersData", trackersDataString);
                } catch (error) {
                  console.error("Error saving trackers data to AsyncStorage", error);
                }
              })();

              return updatedTrackers; // Return updated state
            });

            // Update path for this tracker
            setPaths((prevPaths) => ({
              ...prevPaths,
              [tracker_ident]: [
                ...(prevPaths[tracker_ident] || []),
                { latitude: location.latitude, longitude: location.longitude },
              ],
            }));

              // Check if the real-time data matches any coordinate in the coverage area
              const matchedLocation = locations.find((loc) =>
                loc.coordinates.some(
                  (coord) =>
                    Math.abs(coord.latitude - location.latitude) < 0.0001 &&
                    Math.abs(coord.longitude - location.longitude) < 0.0001
                )
              );
              
              console.log("Matched Location:", matchedLocation);

              if (matchedLocation && dispatch_log?.dispatch_logs_id && dispatch_log.status === "on road") {
                console.log("Ending Dispatch for Matched Tracker:", tracker_ident);
                endDispatch(dispatch_log.dispatch_logs_id)
                  .then(() => {
                    console.log(`Dispatch ended successfully for tracker: ${tracker_ident}`);
                    setPaths((prevPaths) => {
                      const updatedPaths = { ...prevPaths };
                      delete updatedPaths[tracker_ident]; // Clear path for this tracker
                      return updatedPaths;
                    });
                    handleRefresh();
                  })
                  .catch((error) => {
                    console.error(`Error ending dispatch for tracker: ${tracker_ident}`, error.response || error.message);
                  });
              }

              // Update bus icon based on dispatch_log status
              if (dispatch_log) {
                let iconPath;

                // Determine the icon path based on dispatch_log status
                if (dispatch_log.status === "on road") {
                  iconPath = require("../../assets/images/bus_on_road.png");
                } else if (dispatch_log.status === "on alley") {
                  iconPath = require("../../assets/images/bus_on_alley.png");
                }

                // If an icon path was determined, update busIcons state
                if (iconPath) {
                  setBusIcons((prevIcons) => {
                    const updatedIcons = {
                      ...prevIcons,
                      [tracker_ident]: iconPath,
                    };

                    // Save updated busIcons to AsyncStorage
                    AsyncStorage.setItem("busIcons", JSON.stringify(updatedIcons));
                    return updatedIcons;
                  });
                }
              } else {
                // If dispatch_log is null, set bus to idle
                setBusIcons((prevIcons) => {
                  const updatedIcons = {
                    ...prevIcons,
                    [tracker_ident]: require("../../assets/images/bus_idle.png"),
                  };

                  // Save updated busIcons to AsyncStorage
                  AsyncStorage.setItem("busIcons", JSON.stringify(updatedIcons));
                  return updatedIcons;
                });
              }
          } else {
            console.warn(`Invalid location for tracker: ${tracker_ident}`);
          }
        } else {
          console.warn("Invalid or empty data received:", event);
        }
      };

      // Listen for the "FlespiDataReceived" event and handle incoming data
      channel.listen("FlespiDataReceived", handleEvent);

      // Return cleanup function to stop the listener and disconnect
      return () => {
        console.log("Cleaning up listener...");
        channel.stopListening("FlespiDataReceived");
        echo.disconnect();
      };
    };

    const cleanupListener = setupRealTimeListener();

    return cleanupListener; // Cleanup listener on component unmount
  }, []); // Empty dependency array means this effect runs only once
  
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
    setRenderMap(false);

      try {
          // Call the function to reset blocked locations for all vehicles
          const resetResponse = await resetBlockedLocationsForAllVehicles();
          console.log('Blocked locations reset:', resetResponse);

          if (busListRef.current) {
              busListRef.current.refreshData();
          }

          setTimeout(() => {
              // Increment mapKey to trigger a re-render of the MapView
              setMapKey((prevKey) => prevKey + 1);
              setRenderMap(true);
              setPaths({}); // Clear the path if necessary
              setRefreshing(false);
          }, 5000); // Hide the map for 5 seconds

      } catch (error) {
          console.error('Error resetting blocked locations:', error);
          setRefreshing(false);
      }
  };

  const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Idle', value: 'idle' },
    { label: 'On Alley', value: 'on alley' },
    { label: 'On Road', value: 'on road' },
  ];

  const pickerStyles = {
    inputAndroid: {
      backgroundColor: filter === 'all' ? '#f7f7f7' : filter === 'idle' ? '#D3D3D3' : filter === 'on alley' ? 'rgba(255, 165, 0, 1)' : 'rgba(173, 255, 47, 1)', // Custom background based on selection
    },
    inputIOS: {
      backgroundColor: '#f1f1f1',
    },
  };

  useEffect(() => {
    if (locations.length > 0) {
      // Get all latitude and longitude values from static locations
      const latitudes = locations.map((loc) => loc.primaryCoordinate.latitude);
      const longitudes = locations.map((loc) => loc.primaryCoordinate.longitude);

      // Calculate the center point of all static locations
      const minLatitude = Math.min(...latitudes);
      const maxLatitude = Math.max(...latitudes);
      const minLongitude = Math.min(...longitudes);
      const maxLongitude = Math.max(...longitudes);

      // Update initial region
      setInitialRegion({
        latitude: (minLatitude + maxLatitude) / 2, // Center latitude
        longitude: (minLongitude + maxLongitude) / 2, // Center longitude
        latitudeDelta: maxLatitude - minLatitude + 0.01, // Small padding
        longitudeDelta: maxLongitude - minLongitude + 0.01, // Small padding
      });
    }
  }, []); // Run whenever `locations` changes
  

  return (
    <View style={styles.container}>
      {/* Map with Real-Time Marker and Polyline */}
      {renderMap ? (
          <MapView
          key={mapKey}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={initialRegion}
        >
          {/* Render a polyline and marker for each tracker */}
          {trackersData.map((tracker) => (
            <React.Fragment key={tracker.tracker_ident}>
              {/* Polyline for the tracker route */}
              <Polyline
                coordinates={paths[tracker.tracker_ident] || []} // Path for this tracker
                strokeWidth={3}
                strokeColor="blue"
              />

              {/* Marker for the tracker */}
              <Marker
                coordinate={tracker.location}
                title={`BUS ${tracker.vehicle_id || "Unknown"}`}
                description={`Speed: ${tracker.location.speed || 0} km/h`}
                icon={busIcons[tracker.tracker_ident]} // Icon specific to the tracker
              />
            </React.Fragment>
          ))}

          {/* Static Markers with Custom Icons */}
          {locations.map((location) => (
            <Marker
              key={location.id}
              coordinate={location.primaryCoordinate} // Use primaryCoordinate for the marker
              title={location.title}
              icon={location.icon} // Custom icon for each location
            />
          ))}

          {/* Simulated Marker */}
            {/* <SimulatedMarker
            title="BUS 002"
            description="Simulated route for Bus 002"
            initialIcon={require("../../assets/images/bus_on_alley.png")}
            movingIcon={require("../../assets/images/bus_on_road.png")}
            routeData={routeData.canitoanToSilverCreek}
            />

            <SimulatedMarker
              title="BUS 003"
              description="Simulated route for Bus 003"
              initialIcon={require("../../assets/images/bus_on_alley.png")}
              movingIcon={require("../../assets/images/bus_on_road.png")}
              routeData={routeData.silverCreekToCogon}
            /> */}

        </MapView>
      ) : (
        // Show a loading state while waiting for the map to render
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text>Loading map...</Text>
        </View>
      )}

      {/* Sidebar */}
      <Sidebar isVisible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        
      {/* Swipe Refresh */}
      <SwipeToRefresh refreshing={refreshing} onRefresh={onRefresh} />

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
            <RNPickerSelect
              onValueChange={(value) => setFilter(value)}  // Set filter value
              items={filterOptions}
              value={filter}  // Set the current value
              style={pickerStyles}
              placeholder={{}}
            />

          {/* Swipeable Bus Status */}
          <View style={styles.busContainer}>
            <BusList
              ref={busListRef}
              selectedBus={selectedBus}
              setSelectedBus={setSelectedBus}
              filter={filter} // Pass filter state to BusList
              setFilter={setFilter} // Pass setFilter function to BusList if needed
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
                    ToastAndroid.show("Please select a bus first!", ToastAndroid.BOTTOM);
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
                  ToastAndroid.show("Please select a bus first!", ToastAndroid.BOTTOM);
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

      {/* Pass the vehicle_id to the OverspeedAlert modal */}
      <OverspeedAlert
        isVisible={showOverspeedAlert}
        onClose={() => setShowOverspeedAlert(false)} // Hide modal on close
        vehicleId={overspeedVehicleId} // Pass vehicle_id
      />
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
  freeSpace: {
    flex: 1, 
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
  busContainer: {
    height: "12%"
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
    backgroundColor: "#FFA500",
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