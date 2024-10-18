import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../../components/Header";
import { useLocalSearchParams } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { useUser } from "@clerk/clerk-expo";
import { useFetch } from "../../../../lib/fetch"; // Assuming you have a custom fetch hook
import { useRouter } from "expo-router"; // Assuming you're using router from Expo
import { useFocusEffect } from "@react-navigation/native";

const FavouriteList = () => {
  const { pid } = useLocalSearchParams();
  const { user } = useUser();
  const router = useRouter(); // useRouter hook to handle navigation
  const [category, setCategory] = useState("Anime");
  const { data, loading, error, refetch } = useFetch(
    category === "Anime"
      ? `/(api)/getFavourite/anime/${user.id}`
      : `/(api)/getFavourite/manga/${user.id}`
  );

  // useEffect to trigger re-fetching when the category changes
  useEffect(() => {
    refetch();
  }, [category, refetch]);

  // Callback for rendering items
  const renderItem = useCallback(
    ({ item }) => {
      return (
        <TouchableOpacity
          onPress={() =>
            category === "Anime"
              ? router.push(`/(root)/AnimeDetail/${item.malid}`)
              : router.push(`/(root)/MangaDetail/${item.malid}`)
          }
          style={{
            flex: 1,
            margin: 5,
          }}
        >
          <ImageBackground
            source={{ uri: item.coverurl }}
            style={{ width: "100%", height: 225 }}
          >
            <View
              className="mt-auto p-1"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.7)",
              }}
            >
              <Text
                className="font-JakartaSemiBold text-[#ECDFCC]"
                numberOfLines={2}
                style={{
                  marginBottom: 5,
                }}
              >
                {item.name}
              </Text>
              <View className="flex-row justify-between">
                {item.episodes || item.chapters ? (
                  <Text className="text-xs text-[#ECDFCC] font-JakartaMedium">
                    {category === "Anime"
                      ? `Watched: ${item.episodes}`
                      : `Read: ${item.chapters}`}
                  </Text>
                ) : (
                  <Text className="text-xs text-[#ECDFCC] font-JakartaMedium">
                    {item.status ? item.status : "Not Added"}
                  </Text>
                )}
                <Text className="text-xs text-[#ECDFCC] font-JakartaMedium">
                  ⭐ {item.score ? item.score : "N/A"}
                </Text>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      );
    },
    [category, router] // The router dependency is added to avoid stale closures
  );

  useFocusEffect(
    useCallback(() => {
      if (refetch) {
        refetch(); // This will refetch the data when the screen is focused
      }
    }, [refetch])
  );

  return (
    <SafeAreaView className="bg-[#1E201E]">
      <Header pid={pid} />
      <ScrollView className="bg-[#282A3A] min-h-screen">
        <Text className="text-[#ECDFCC] bg-[#697565] font-JakartaSemiBold text-2xl text-center py-2">
          My Favourite List
        </Text>
        <View className="my-3 mx-1 border-[#1E201E] bg-[#ECDFCC] border-[1px] rounded-md flex justify-center h-11">
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
          >
            <Picker.Item label="Anime" value="Anime" />
            <Picker.Item label="Manga" value="Manga" />
          </Picker>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#ECDFCC" />
        ) : error ? (
          <Text className="text-red-500">Error loading data</Text>
        ) : (
          <FlatList
            data={data}
            scrollEnabled={false}
            horizontal={false}
            numColumns={2}
            keyExtractor={(item) => item.malid}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 150 }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default FavouriteList;
