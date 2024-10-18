import * as React from "react";
import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="Home" options={{ headerShown: false }} />
      <Stack.Screen name="AnimeDetail" options={{ headerShown: false }} />
      <Stack.Screen name="MangaDetail" options={{ headerShown: false }} />
      <Stack.Screen name="Profile" options={{ headerShown: false }} />
      <Stack.Screen name="MoreDetail" options={{ headerShown: false }} />
      <Stack.Screen name="GenreDetail" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;
