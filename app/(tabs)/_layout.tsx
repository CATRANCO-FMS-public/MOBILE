import React from "react";

import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Screens will inherit the `headerShown: false` setting */}
    </Stack>
  );
}
