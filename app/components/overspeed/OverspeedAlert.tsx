import React, { useState, useEffect } from 'react';

import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { Audio } from 'expo-av';

const OverspeedAlert = ({
  isVisible,
  onClose,
  vehicleId, // Accept vehicle_id as a prop
}: {
  isVisible: boolean;
  onClose: () => void;
  vehicleId: string | null; // Define type for vehicle_id
}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    const loadAndPlaySound = async () => {
      try {
        const { sound: newSound } = await Audio.Sound.createAsync(
          require('./../../assets/sound/timer_alarm.mp3')
        );
        setSound(newSound);

        // Play the sound after it's loaded
        await newSound.playAsync();
      } catch (error) {
        console.error('Error loading or playing sound:', error);
      }
    };

    if (isVisible) {
      loadAndPlaySound();
    } else {
      if (sound) {
        sound.stopAsync();
        sound.unloadAsync();
      }
    }

    return () => {
      if (sound) {
        sound.stopAsync();
        sound.unloadAsync();
      }
    };
  }, [isVisible]);

  const handleClose = () => {
    if (sound) {
      sound.stopAsync();
      sound.unloadAsync();
    }
    onClose();
  };

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Overspeed Alert</Text>
          <Text style={[styles.modalText, { marginBottom: 20 }]}>
            {vehicleId ? `BUS ${vehicleId} is overspeeding!` : 'A vehicle is overspeeding!'}
          </Text>

          <TouchableOpacity
            onPress={handleClose}
            style={[styles.modalOption, { backgroundColor: '#FF6347' }]}
          >
            <Text style={[styles.modalText, { color: '#fff' }]}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  modalOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 5,
    backgroundColor: '#f7f7f7',
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },
});

export default OverspeedAlert;
