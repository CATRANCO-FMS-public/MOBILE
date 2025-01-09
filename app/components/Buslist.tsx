import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { FlatList, View, Text, TouchableOpacity, StyleSheet, Modal, ToastAndroid} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { getVehicleAssignments } from "@/services/vehicle/vehicleServices";
import { getAllOnAlley, getAllOnRoad,deleteDispatchRecord } from "@/services/dispatch/dispatchServices"; // Update the import
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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDispatchLogId, setSelectedDispatchLogId] = useState<number | null>(null);

  const fetchAssignmentsAndDispatches = async () => {
    try {
      console.log('fetching data....');
      const vehicleAssignmentsResponse = await getVehicleAssignments();
      
      // Fetch on-alley and on-road dispatches separately
      const onAlleyDispatches = await getAllOnAlley();
      const onRoadDispatches = await getAllOnRoad();

      // Combine the two dispatch data sets
      const allDispatches = [...onAlleyDispatches, ...onRoadDispatches];

      // Filter out dispatches with 'alley_completed' status
      const filteredDispatches = allDispatches.filter((dispatch) => dispatch.status !== 'alley_completed');

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

  const handleLongPress = (dispatch_logs_id: number | null) => {
    if (dispatch_logs_id) {
      setSelectedDispatchLogId(dispatch_logs_id);
      setModalVisible(true);
    } else {
      ToastAndroid.show("This bus is currently idle.", ToastAndroid.SHORT);
    }
  };
  
  const confirmCancelDispatch = async () => {
    if (selectedDispatchLogId) {
      try {
        await deleteDispatchRecord(selectedDispatchLogId);
        ToastAndroid.show("Canceled successfully!", ToastAndroid.SHORT);
        fetchAssignmentsAndDispatches();
      } catch (error) {
        ToastAndroid.show("Failed to cancel.", ToastAndroid.SHORT);
      } finally {
        setModalVisible(false);
      }
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
              onLongPress={() => handleLongPress(item.dispatch_logs_id)}
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

      {/* Cancel Confirmation Modal */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Are you sure you want to cancel this?</Text>
            <View style={styles.resetButtonContainer}>
              <TouchableOpacity onPress={confirmCancelDispatch} style={[styles.modalOption, styles.resetButtonYes]}>
                <Text style={[styles.modalText, { color: "#fff" }]}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.modalOption, styles.resetButtonNo]}>
                <Text style={[styles.modalText, { color: "#fff" }]}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  resetButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
  },
  resetButtonYes: {
    flex: 1,
    marginRight: 10,
    backgroundColor: "#4CAF50",
  },
  resetButtonNo: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: "#F44336",
  },
  modalOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 5,
    width: "100%",
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
  },
});

export default BusList;
