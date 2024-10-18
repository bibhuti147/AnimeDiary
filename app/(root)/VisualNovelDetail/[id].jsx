import { Image, ScrollView, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

const MangaDetail = () => {
  const { id } = useLocalSearchParams();
  const [entry, setEntry] = useState([]);

  useEffect(() => {
    fetch(`https://api.jikan.moe/v4/manga/${id}/full`)
      .then((response) => response.json())
      .then((data) => setEntry(data.data))
      .catch((error) => {
        console.error("Error fetching anime:", error);
      });
  });

  if (!entry) {
    return (
      <SafeAreaView>
        <Text>No Manga data found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView>
      <SafeAreaView>
        <Text>{entry.title}</Text>
        {entry.images && entry.images.jpg && (
          <Image
            source={{ uri: entry.images.jpg.image_url }}
            style={{ width: 200, height: 300 }}
          />
        )}
        <Text>Status: {entry.status}</Text>
        <Text>{entry.synopsis}</Text>
        <Text>Rating: {entry.score}</Text>
        <Text>Chapters: {entry.chapters}</Text>
        <Text>Volumes: {entry.volumes}</Text>
      </SafeAreaView>
    </ScrollView>
  );
};

export default MangaDetail;
