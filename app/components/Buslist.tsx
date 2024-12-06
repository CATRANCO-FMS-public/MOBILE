import React, { useState, useEffect } from "react";
import { FlatList, View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { getVehicleAssignments } from "@/services/vehicle/vehicleServices";
import { getAllDispatches } from "@/services/dispatch/dispatchServices";

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
  setSelectedBus: (bus: { vehicle_id: string; status: string; vehicle_assignment_id: number; dispatch_logs_id: number | null }) => void; // Update the setSelectedBus type
}

const BusList: React.FC<BusListProps> = ({ selectedBus, setSelectedBus }) => {
  const [busData, setBusData] = useState<BusData[]>([]);

  useEffect(() => {
    const fetchAssignmentsAndDispatches = async () => {
      try {
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

        setBusData(transformedData);
      } catch (error) {
        console.error('Error fetching vehicle assignments and dispatches:', error);
      }
    };

    // Call fetchAssignmentsAndDispatches every 1 second
    const intervalId = setInterval(fetchAssignmentsAndDispatches, 1000);

    // Fetch immediately on mount
    fetchAssignmentsAndDispatches();

    // Clean up the interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <FlatList
      data={busData}
      keyExtractor={(item) => item.vehicle_id}
      numColumns={2}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.busCard, { backgroundColor: item.color }, selectedBus?.vehicle_id === item.vehicle_id && styles.selectedBusCard]}
          onPress={() => setSelectedBus({
            vehicle_id: item.vehicle_id,
            status: item.status,
            vehicle_assignment_id: item.vehicle_assignment_id,
            dispatch_logs_id: item.dispatch_logs_id,
          })}
        >
          <Icon name="bus" size={20} color="black" />
          <View style={{ flex: 1, flexDirection: "column" }}>
            <Text style={styles.busText}>{item.vehicle_id}</Text>
            <Text style={styles.statusRouteText}>{`${item.route} | ${item.status}`}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  busCard: {
    margin: 7,
    padding: 20,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    width: Dimensions.get("window").width - 225,
  },
  selectedBusCard: {
    borderWidth: 2,
    borderColor: "red",
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
    color: "#FFF",
  },
});

export default BusList;
