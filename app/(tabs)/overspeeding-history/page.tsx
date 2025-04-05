import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { Table, Row } from "react-native-reanimated-table";
import Sidebar from "../../components/layout/Sidebar";
import Icon from "react-native-vector-icons/Ionicons";
import { Calendar } from "react-native-calendars";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { getAllOverspeedRecords } from "@/services/overspeedTracking/overspeedServices";
import { deleteOverspeedRecord, deleteOverspeedRecordsByDate } from "@/services/overspeedTracking/overspeedServices";

const OverspeedHistory = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [overspeedData, setOverspeedData] = useState([]);
  const [filteredOverspeedData, setFilteredOverspeedData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState(null);

  const widthArr = [150, 120, 100, 150, 150];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllOverspeedRecords();
        setOverspeedData(data);
        setFilteredOverspeedData(data);
        setLoading(false);
      } catch (error) {
        Alert.alert("Error", "Failed to fetch overspeed records.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
      // Set today's date if no date is selected
      const today = new Date().toISOString().split('T')[0]; // Get today's date in 'YYYY-MM-DD' format
      if (!selectedDate) {
        setSelectedDate(today);
      }
    }, []);

  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
    const filteredData = overspeedData.filter((record) =>
      record.overspeed_timestamp.startsWith(day.dateString)
    );
    setFilteredOverspeedData(filteredData);
    setShowCalendar(false);
  };

  const tableHead = [
    "Date and Time",
    "Bus Number",
    "Speed (km/h)",
    "Latitude",
    "Longitude",
  ];

  const handlePrint = async () => {
    try {
      if (!filteredOverspeedData || filteredOverspeedData.length === 0) {
        Alert.alert("Error", "No data available to print.");
        return;
      }

      const htmlContent = `
        <html>
          <head>
            <style>
              body {
                margin: 10px;
                font-family: Arial, sans-serif;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
              }
              th, td {
                border: 1px solid black;
                text-align: center;
                padding: 6px;
              }
              th {
                background-color: #f2f2f2;
              }
            </style>
          </head>
          <body>
            <h1>Overspeed Records</h1>
            <table>
              <thead>
                <tr>
                  ${tableHead.map((heading) => `<th>${heading}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${filteredOverspeedData
                  .map(
                    (row) => `
                  <tr>
                    <td>${row.overspeed_timestamp}</td>
                    <td>${row.vehicle_id}</td>
                    <td>${row.speed}</td>
                    <td>${row.latitude}</td>
                    <td>${row.longitude}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to generate PDF.");
    }
  };

  const handleLongPress = async (id) => {
    try {
      // Set the selected row for highlighting
      setSelectedRow(id);
    
      // Show confirmation alert before deleting
      const confirmDeletion = await new Promise((resolve) => {
        Alert.alert(
          "Confirm Deletion",
          "Are you sure you want to delete this record?",
          [
            {
              text: "Cancel",
              onPress: () => resolve(false),
              style: "cancel",
            },
            { text: "OK", onPress: () => resolve(true) },
          ]
        );
      });
  
      if (confirmDeletion) {
        // Call the delete service
        await deleteOverspeedRecord(id);
  
        // Filter out the deleted row from the filtered data
        setFilteredOverspeedData((prevData) =>
          prevData.filter((record) => record.id !== id)
        );
  
        Alert.alert("Success", "Record deleted successfully");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to delete the record.");
      console.error("Error deleting overspeed record:", error);
    } finally {
      // Reset the selected row after the action (deletion or cancel)
      setSelectedRow(null);
    }
  };

  const handleDeleteByDate = async () => {
    try {
      if (!selectedDate) {
        Alert.alert("Error", "Please select a date first.");
        return;
      }

      // Confirm the deletion by date
      const confirmDeletion = await new Promise((resolve) => {
        Alert.alert(
          "Confirm Deletion",
          `Are you sure you want to delete all records for ${selectedDate}?`,
          [
            {
              text: "Cancel",
              onPress: () => resolve(false),
              style: "cancel",
            },
            { text: "OK", onPress: () => resolve(true) },
          ]
        );
      });

      if (confirmDeletion) {
        // Call the delete service by date
        await deleteOverspeedRecordsByDate(selectedDate);

        // Remove the deleted records from the filtered data
        setFilteredOverspeedData((prevData) =>
          prevData.filter(
            (record) => !record.overspeed_timestamp.startsWith(selectedDate)
          )
        );

        Alert.alert(
          "Success",
          `All records for ${selectedDate} deleted successfully.`
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to delete records.");
      console.error("Error deleting overspeed records:", error);
    }
  };
  

  return (
    <View style={styles.container}>
      <Sidebar isVisible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      <View style={styles.header}>
        <TouchableOpacity
                onPress={() => setSidebarVisible(!sidebarVisible)}
                style={styles.iconButton}
        >
        <Icon name="menu" size={25} color="black" />
        </TouchableOpacity>
        
        <Text style={styles.title}>Overspeed History</Text>

        <TouchableOpacity style={styles.iconButton} onPress={handlePrint}>
          <Icon name="print" size={28} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setShowCalendar(!showCalendar)}
        >
          <Icon name="calendar" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <ScrollView horizontal>
          <View>
            <Table borderStyle={styles.tableBorder}>
              <Row
                data={tableHead}
                widthArr={widthArr}
                style={styles.headerRow}
                textStyle={styles.headerText}
              />
            </Table>
            <ScrollView style={styles.dataWrapper}>
              <Table borderStyle={styles.tableBorder}>
                {filteredOverspeedData.map((rowData, index) => (
                  <Row
                    key={index}
                    data={[
                      rowData.overspeed_timestamp,
                      rowData.vehicle_id,
                      rowData.speed,
                      rowData.latitude,
                      rowData.longitude,
                    ]}
                    widthArr={widthArr}
                    style={[
                      styles.row,
                      index % 2 === 0 ? styles.rowEven : styles.rowOdd,
                      rowData.id === selectedRow ? styles.highlightedRow : null,
                    ]}
                    textStyle={styles.rowText}
                    onLongPress={() => handleLongPress(rowData.id)}
                  />
                ))}
              </Table>
            </ScrollView>
          </View>
        </ScrollView>
      )}

      <Modal
        visible={showCalendar}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.calendarModal}>
            <Calendar
              markedDates={{
                [selectedDate]: { selected: true, selectedColor: "blue" },
              }}
              onDayPress={handleDateSelect}
              current={selectedDate}
            />
            <TouchableOpacity
              style={styles.deleteButtonInsideModal}
              onPress={handleDeleteByDate}
            >
              <Icon name="trash" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCalendar(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  iconButton: {
    padding: 10,
  },
  tableBorder: {
    borderWidth: 2,
    borderColor: "#C1C0B9",
  },
  headerRow: {
    height: 50,
    backgroundColor: "#537791",
  },
  headerText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  dataWrapper: {
    marginTop: -1,
  },
  row: {
    height: 40,
  },
  highlightedRow: {
    backgroundColor: '#F44336', // Example highlight color (yellow)
  },
  rowEven: {
    backgroundColor: "#E7E6E1",
  },
  rowOdd: {
    backgroundColor: "#F7F6E7",
  },
  rowText: {
    textAlign: "center",
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  calendarModal: {
    width: 300,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  deleteButtonInsideModal: {
    marginTop: 20,
    backgroundColor: "#e74c3c",
    padding: 10,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#007bff",
    paddingVertical: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
});

export default OverspeedHistory;
