import * as React from "react";
import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="[pid]/index" options={{ headerShown: false }} />
      <Stack.Screen name="[pid]/AnimeList" options={{ headerShown: false }} />
      <Stack.Screen name="[pid]/MangaList" options={{ headerShown: false }} />
      <Stack.Screen
        name="[pid]/FavouriteList"
        options={{ headerShown: false }}
      />
    </Stack>
  );
};

export default Layout;
