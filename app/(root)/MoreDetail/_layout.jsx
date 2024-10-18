import * as React from "react";
import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false, headerShadowVisible: false }}>
      <Stack.Screen name="[mid]/[id]" />
    </Stack>
  );
};

export default Layout;
