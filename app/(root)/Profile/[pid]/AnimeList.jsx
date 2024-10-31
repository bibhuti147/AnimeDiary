import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../../components/Header";
import { Picker } from "@react-native-picker/picker";
import { useFetch } from "../../../../lib/fetch";
import { useUser } from "@clerk/clerk-expo";
import { useFocusEffect } from "@react-navigation/native";

const AnimeList = () => {
  const { pid } = useLocalSearchParams();
  const [category, setCategory] = useState("Watching");
  const { user } = useUser();
  const [allAnime, setAllAnime] = useState([]);

  const {
    data: recentanime,
    loading,
    error,
    refetch,
  } = useFetch(
    `https://animediary-backend.vercel.app/api/userDetails/anime/${user?.id}`
  );

  useEffect(() => {
    if (recentanime && !loading && !error) {
      const filteredAnime = recentanime.filter(
        (anime) => anime.status === category
      );
      setAllAnime(filteredAnime);
    }
  }, [recentanime, loading, error, category]);

  const renderItem = useCallback(
    ({ item }) => {
      return (
        <TouchableOpacity
          onPress={() => router.push(`/(root)/AnimeDetail/${item.malid}`)}
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
                numberOfLines={1}
                style={{
                  marginBottom: 5,
                }}
              >
                {item.name}
              </Text>
              <View
                className={`${
                  category === "Plan to Watch" && "hidden"
                } flex-row justify-between`}
              >
                <Text className="text-xs text-[#ECDFCC] font-JakartaMedium">
                  Watched: {item.episodes}
                </Text>
                <Text className="text-xs text-[#ECDFCC] font-JakartaMedium">
                  ⭐ {item.score}
                </Text>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      );
    },
    [category]
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
          AnimeList
        </Text>
        <View className="my-3 mx-1 border-[#1E201E] bg-[#ECDFCC] border-[1px] rounded-md flex justify-center h-11">
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => {
              setCategory(itemValue);
            }}
          >
            <Picker.Item label="Plan to Watch" value="Plan to Watch" />
            <Picker.Item label="Watching" value="Watching" />
            <Picker.Item label="Completed" value="Completed" />
            <Picker.Item label="On Hold" value="On Hold" />
            <Picker.Item label="Dropped" value="Dropped" />
          </Picker>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#ECDFCC" />
        ) : allAnime.length > 0 ? (
          <FlatList
            data={allAnime}
            scrollEnabled={false}
            horizontal={false}
            numColumns={2}
            keyExtractor={(item) => item.malid}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 150 }}
          />
        ) : (
          <View className="flex-1 justify-center items-center min-h-[400px]">
            <Text className="text-[#ECDFCC] text-center font-JakartaBold text-2xl">
              Nothing to Display
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AnimeList;
