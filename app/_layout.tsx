import React from "react";
import { LogBox } from "react-native";
import { Stack } from "expo-router";
import { AuthProvider } from "@/services/authentication/authContext";

export default function RootLayout() {
  LogBox.ignoreAllLogs();
  console.log("RootLayout Loaded with");
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AuthProvider>
  );
}
