import React, { useState, useEffect } from "react";
import { Marker, Polyline } from "react-native-maps";

const SimulatedMarker = ({ title, description, initialIcon, movingIcon, routeData }) => {
  const [markerPosition, setMarkerPosition] = useState(routeData[0]);
  const [polylineCoordinates, setPolylineCoordinates] = useState([routeData[0]]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [markerIcon, setMarkerIcon] = useState(initialIcon);

  useEffect(() => {
    if (isMoving && currentIndex < routeData.length - 1) {
      const intervalId = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          if (prevIndex + 1 < routeData.length) {
            setMarkerPosition(routeData[prevIndex + 1]);
            setPolylineCoordinates((prevCoordinates) => [
              ...prevCoordinates,
              routeData[prevIndex + 1],
            ]);
            return prevIndex + 1;
          } else {
            clearInterval(intervalId);
            return prevIndex;
          }
        });
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [isMoving, currentIndex]);

  const handleMarkerPress = () => {
    if (!isMoving) {
      setIsMoving(true);
      setMarkerIcon(movingIcon);
    }
  };

  return (
    <>
      <Marker
        coordinate={markerPosition}
        title={title}
        description={description}
        onPress={handleMarkerPress}
        icon={markerIcon}
      />
      <Polyline coordinates={polylineCoordinates} strokeWidth={3} strokeColor="blue" />
    </>
  );
};

export default SimulatedMarker;
