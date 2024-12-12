import React from "react";
import { ScrollView, RefreshControl, StyleSheet, View } from "react-native";

interface SwipeToRefreshProps {
  refreshing: boolean;
  onRefresh: () => void;
}

const SwipeToRefresh: React.FC<SwipeToRefreshProps> = ({
  refreshing,
  onRefresh,
}) => {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      nestedScrollEnabled
      style={styles.scrollView}
    >
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    position: 'absolute',
    top: 0,          
    left: 0,         
    right: 0,        
    zIndex: 10,      
    height: 60, 
  },
});

export default SwipeToRefresh;
