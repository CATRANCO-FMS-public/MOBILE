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
import { Table, TableWrapper, Row } from "react-native-reanimated-table";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import { Calendar } from "react-native-calendars";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { getAllDispatches } from "@/services/dispatch/dispatchServices";

const History = () => {
  const [dispatchData, setDispatchData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Column widths
  const widthArr = [120, 120, 100, 150, 150, 150, 120, 120];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllDispatches();
        const transformedData = data.map((log) => {
          const driver = log.vehicle_assignments.user_profiles.find(
            (profile) => profile.position === "driver"
          );
          const pao = log.vehicle_assignments.user_profiles.find(
            (profile) => profile.position === "passenger_assistant_officer"
          );
          return [
            log.vehicle_assignments?.vehicle_id || "N/A",
            log.start_time,
            log.end_time || "N/A",
            log.status,
            log.route,
            log.created_dispatch?.username || "N/A",
            log.updated_dispatch?.username || "N/A",
            driver?.last_name || "N/A",
            pao?.last_name || "N/A",
          ];
        });
        setDispatchData(transformedData);
        console.log("Dispatch Data:", dispatchData);
        setLoading(false);
      } catch (error) {
        Alert.alert("Error", "Failed to fetch dispatch logs.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const tableHead = [
    "Bus Number",
    "Start Time",
    "End Time",
    "Status",
    "Route",
    "Created By",
    "Updated By",
    "Driver",
    "PAO",
  ];

  const sharePDF = async (uri) => {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    } else {
      Alert.alert("Error", "Sharing is not available on this device.");
    }
  };
  

  const handlePrint = async () => {
    try {
      if (!dispatchData || dispatchData.length === 0) {
        Alert.alert("Error", "No data available to print.");
        return;
      }
  
      const htmlContent = `
        <html>
          <head>
            <style>
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                border: 1px solid black;
                text-align: center;
                padding: 8px;
              }
              th {
                background-color: #f2f2f2;
              }
            </style>
          </head>
          <body>
            <h1>Dispatch History</h1>
            <table>
              <thead>
                <tr>
                  <th>Bus Number</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Status</th>
                  <th>Route</th>
                  <th>Created By</th>
                  <th>Updated By</th>
                  <th>Driver</th>
                  <th>PAO</th>
                </tr>
              </thead>
              <tbody>
                ${dispatchData
                  .map(
                    (row) => `
                  <tr>
                    <td>${row[0]}</td>
                    <td>${row[1]}</td>
                    <td>${row[2]}</td>
                    <td>${row[3]}</td>
                    <td>${row[4]}</td>
                    <td>${row[5]}</td>
                    <td>${row[6]}</td>
                    <td>${row[7]}</td>
                    <td>${row[8]}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </body>
        </html>
      `;
  
      // Create PDF
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await sharePDF(uri);
      // Alert with file location
      Alert.alert("PDF Created", `Your PDF file is saved at: ${uri}`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert("Error", "An error occurred while generating the PDF.");
    }
  };

  const goBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={goBack}>
          <Icon name="caret-back-outline" size={28} color="#333" />
        </TouchableOpacity>

        <Text style={styles.title}>Dispatch History</Text>

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
                {dispatchData.map((rowData, index) => (
                  <Row
                    key={index}
                    data={rowData}
                    widthArr={widthArr}
                    style={[
                      styles.row,
                      index % 2 === 0 ? styles.rowEven : styles.rowOdd,
                    ]}
                    textStyle={styles.rowText}
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
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setShowCalendar(false);
              }}
            />
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
    padding: 10,
    justifyContent: "space-between",
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
  rowEven: {
    backgroundColor: "#E7E6E1",
  },
  rowOdd: {
    backgroundColor: "#F7F6E7",
  },
  rowText: {
    padding: 5,
    fontSize: 12,
    textAlign: "center",
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

export default History;
