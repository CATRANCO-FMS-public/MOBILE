import React from "react";
import { ScrollView, RefreshControl, StyleSheet, View } from "react-native";

interface SwipeToRefreshProps {
  refreshing: boolean;
  onRefresh: () => void;
  children: React.ReactNode;
}

const SwipeToRefresh: React.FC<SwipeToRefreshProps> = ({
  refreshing,
  onRefresh,
  children,
}) => {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      nestedScrollEnabled
    >
      <View style={styles.content}>{children}</View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
});

export default SwipeToRefresh;
