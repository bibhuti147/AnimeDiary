import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import Header from "../../../components/Header";

const GenreDetail = () => {
  const { id } = useLocalSearchParams();
  const [genres, setGenres] = useState([]);
  const [explicitGenres, setExplicitGenres] = useState([]);
  const [themes, setThemes] = useState([]);
  const [demographics, setDemographics] = useState([]);
  const [loading, setLoading] = useState(false);

  // Throttle function to delay API calls
  const throttle = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const getDetails = async () => {
    if (loading) {
      return (
        <SafeAreaView>
          <Text>No anime data found.</Text>
        </SafeAreaView>
      );
    }

    setLoading(true);

    try {
      // Fetch anime details from the Jikan API
      const response1 = await fetch(
        `https://api.jikan.moe/v4/genres/${id}?filter=genres`
      );
      const data1 = await response1.json();
      setGenres(data1.data);

      await throttle(300);

      const response2 = await fetch(
        `https://api.jikan.moe/v4/genres/${id}?filter=explicit_genres`
      );
      const data2 = await response2.json();
      setExplicitGenres(data2.data);

      await throttle(300);

      const response3 = await fetch(
        `https://api.jikan.moe/v4/genres/${id}?filter=themes`
      );
      const data3 = await response3.json();
      setThemes(data3.data);

      await throttle(300);

      const response4 = await fetch(
        `https://api.jikan.moe/v4/genres/${id}?filter=demographics`
      );
      const data4 = await response4.json();
      setDemographics(data4.data);

      await throttle(300);
    } catch (error) {
      console.error("Error fetching anime details:", error);
    } finally {
      setLoading(false); // Stop loading after the request
    }
  };

  useEffect(() => {
    getDetails();
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        onPress={() =>
          router.push(`/MoreDetail/anime/${item.mal_id + item.name}`)
        }
        className="px-[11px] py-2"
      >
        <Text
          style={{ width: 160 }}
          className="text-[#ECDFCC] font-JakartaMedium text-base mx-auto"
        >
          &gt;{item.name}
        </Text>
      </TouchableOpacity>
    ),
    []
  );

  return (
    <SafeAreaView className="bg-[#1E201E] min-h-screen">
      {/*Header*/}
      <Header />

      {!loading ? (
        <ScrollView className="bg-[#282A3A] mb-10">
          <Text className="text-[#ECDFCC] bg-[#697565] font-JakartaSemiBold text-2xl text-center py-2">
            Genres
          </Text>
          <FlatList
            data={genres}
            scrollEnabled={false}
            numColumns={2}
            keyExtractor={(item) => item.mal_id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 50 }}
            windowSize={10} // Number of rows rendered outside the visible area
            initialNumToRender={10} // Initial items to render
            maxToRenderPerBatch={10} // Number of items rendered per batch
            removeClippedSubviews={true} // Removes off-screen items from memory
            updateCellsBatchingPeriod={50} // Batch updates at a lower interval (in ms)
          />

          <Text className="text-[#ECDFCC] bg-[#697565] font-JakartaSemiBold text-2xl text-center py-2">
            Explicit Genres
          </Text>
          <FlatList
            data={explicitGenres}
            scrollEnabled={false}
            numColumns={2}
            keyExtractor={(item) => item.mal_id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 50 }}
            windowSize={10} // Number of rows rendered outside the visible area
            initialNumToRender={10} // Initial items to render
            maxToRenderPerBatch={10} // Number of items rendered per batch
            removeClippedSubviews={true} // Removes off-screen items from memory
            updateCellsBatchingPeriod={50} // Batch updates at a lower interval (in ms)
          />

          <Text className="text-[#ECDFCC] bg-[#697565] font-JakartaSemiBold text-2xl text-center py-2">
            Themes
          </Text>
          <FlatList
            data={themes}
            scrollEnabled={false}
            numColumns={2}
            keyExtractor={(item) => item.mal_id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 50 }}
            windowSize={10} // Number of rows rendered outside the visible area
            initialNumToRender={10} // Initial items to render
            maxToRenderPerBatch={10} // Number of items rendered per batch
            removeClippedSubviews={true} // Removes off-screen items from memory
            updateCellsBatchingPeriod={50} // Batch updates at a lower interval (in ms)
          />

          <Text
            onPress={() => Alert.alert(demographics.length.toString())}
            className="text-[#ECDFCC] bg-[#697565] font-JakartaSemiBold text-2xl text-center py-2"
          >
            Demographics
          </Text>
          <FlatList
            data={demographics}
            scrollEnabled={false}
            numColumns={2}
            keyExtractor={(item) => item.mal_id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 50 }}
            windowSize={10} // Number of rows rendered outside the visible area
            initialNumToRender={10} // Initial items to render
            maxToRenderPerBatch={10} // Number of items rendered per batch
            removeClippedSubviews={true} // Removes off-screen items from memory
            updateCellsBatchingPeriod={50} // Batch updates at a lower interval (in ms)
          />
        </ScrollView>
      ) : (
        <ActivityIndicator size="large" color="#00ff00" />
      )}
    </SafeAreaView>
  );
};

export default GenreDetail;
