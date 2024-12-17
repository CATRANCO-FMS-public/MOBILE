import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { FlatList, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { getVehicleAssignments } from "@/services/vehicle/vehicleServices";
import { getAllDispatches } from "@/services/dispatch/dispatchServices";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface BusData {
  vehicle_id: string;
  status: string;
  color: string;
  route: string;
  vehicle_assignment_id: number;
  dispatch_logs_id: number | null;
}

interface BusListProps {
  selectedBus: { vehicle_id: string; status: string; vehicle_assignment_id: number; dispatch_logs_id: number | null } | null;
  setSelectedBus: (bus: { vehicle_id: string; status: string; vehicle_assignment_id: number; dispatch_logs_id: number | null }) => void;
  filter: string; // Add filter prop
}

const BusList = forwardRef(({ selectedBus, setSelectedBus, filter }: BusListProps, ref) => {
  const [busData, setBusData] = useState<BusData[]>([]);

  const fetchAssignmentsAndDispatches = async () => {
    try {
      console.log('fetching data....');
      const vehicleAssignmentsResponse = await getVehicleAssignments();
      const dispatchesResponse = await getAllDispatches();

      // Filter out dispatches with 'alley_completed' status
      const filteredDispatches = dispatchesResponse.filter((dispatch) => dispatch.status !== 'alley_completed');

      const transformedData = vehicleAssignmentsResponse.map((assignment) => {
        const dispatch = filteredDispatches.find(
          (dispatch) => dispatch.vehicle_assignment_id === assignment.vehicle_assignment_id
        );
        const status = dispatch ? dispatch.status : 'idle';
        const route = dispatch ? dispatch.route : '';
        const dispatch_logs_id = dispatch ? dispatch.dispatch_logs_id : null;

        let color = '#D3D3D3'; // Default to idle color
        if (status === 'on alley') {
          color = 'rgba(255, 165, 0, 1)';
        } else if (status === 'on road') {
          color = 'rgba(173, 255, 47, 1)';
        }

        return {
          vehicle_id: `BUS ${assignment.vehicle.vehicle_id}`,
          status,
          color,
          route,
          vehicle_assignment_id: assignment.vehicle_assignment_id,
          dispatch_logs_id,
        };
      });

      // Sort by vehicle_id
      const sortedData = transformedData.sort((a, b) => a.vehicle_id.localeCompare(b.vehicle_id));

      setBusData(sortedData);

       // Save data to AsyncStorage
       await AsyncStorage.setItem("@busData", JSON.stringify(sortedData));
    } catch (error) {
      console.error('Error fetching vehicle assignments and dispatches:', error);
    }
  };

  const loadCachedData = async () => {
    try {
      const cachedData = await AsyncStorage.getItem("@busData");
      if (cachedData) {
        setBusData(JSON.parse(cachedData));
        console.log("Loaded data from AsyncStorage.");
      }
    } catch (error) {
      console.error("Error loading cached data:", error);
    }
  };

  useEffect(() => {
    // Load cached data first
    loadCachedData();

    // Fetch immediately on mount
    fetchAssignmentsAndDispatches();
  }, []);

  useImperativeHandle(ref, () => ({
    refreshData: fetchAssignmentsAndDispatches,
  }));

  // Filter buses based on selected filter
  const filteredBusData = busData.filter((bus) => {
    if (filter === 'all') return true;
    return bus.status === filter;
  });

  const getSelectedCardBorderColor = (status: string) => {
    if (status === 'on alley') return '#FF6347';
    if (status === 'on road') return '#3b82f6';
    return 'black'; // Default border color
  };

  return (
    <>
      {filteredBusData.length > 0 ? (
        <FlatList
          data={filteredBusData}
          keyExtractor={(item) => item.vehicle_id}
          horizontal
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.busCard,
                { backgroundColor: item.color },
                selectedBus?.vehicle_id === item.vehicle_id && {
                  ...styles.selectedBusCard,
                  borderColor: getSelectedCardBorderColor(item.status),
                },
              ]}
              onPress={() =>
                setSelectedBus({
                  vehicle_id: item.vehicle_id,
                  status: item.status,
                  vehicle_assignment_id: item.vehicle_assignment_id,
                  dispatch_logs_id: item.dispatch_logs_id,
                })
              }
            >
              <Icon name="bus" size={20} color="black" />
              <View style={{ flex: 1, flexDirection: "column" }}>
                <Text style={styles.busText}>{item.vehicle_id}</Text>
                <Text style={styles.statusRouteText}>{`${item.route}\n| ${item.status}`} |</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.noBusesText}>No Vehicles Available...</Text>
      )}
    </>
  );
});

const styles = StyleSheet.create({
  busCard: {
    margin: 6,
    padding: 20,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    width: 175,
  },
  selectedBusCard: {
    borderWidth: 2,
  },
  busText: {
    fontWeight: "bold",
    marginLeft: 10,
    fontSize: 16,
  },
  statusRouteText: {
    marginLeft: 10,
    fontSize: 13,
    fontStyle: 'italic',
    color: "#000",
  },
  noBusesText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'black',
    marginTop: 20,
  },
});

export default BusList;
