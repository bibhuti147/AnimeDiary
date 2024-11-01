import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image } from "react-native";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import Header from "../../../../components/Header";

const MoreDetail = () => {
  const { id, sid } = useLocalSearchParams();
  const [moreList, setMoreList] = useState([]);
  const [hasmore, setHasmore] = useState(true);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Function to fetch details from API
  const getDetails = async () => {
    if (loading || !hasmore) return;

    setLoading(true);

    try {
      if (sid && id) {
        // Construct URL and log it for debugging
        const url = `https://api.jikan.moe/v4/${sid.toLowerCase()}?q=${id}&page=${page}`;

        // API call
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch data, status code: ${response.status}`
          );
        }

        const data = await response.json();
        const allpage = data.pagination.last_visible_page;
        const newAnimeList = data.data;

        setMoreList((prevList) => [...prevList, ...newAnimeList]);

        if (allpage >= page) {
          setPage((prevPage) => prevPage + 1);
        } else {
          setHasmore(false);
        }
      }
    } catch (error) {
      Alert.alert("Error", `Failed to load details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when component mounts
  useEffect(() => {
    getDetails();
  }, []);

  // Render each item in the list
  const renderItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        onPress={() =>
          router.push(
            sid === "Manga"
              ? `/(root)/MangaDetail/${item.mal_id.toString()}`
              : `/(root)/AnimeDetail/${item.mal_id.toString()}`
          )
        }
        style={{
          flex: 1,
          margin: 8,
        }}
      >
        <Image
          source={{ uri: item.images.jpg.image_url }}
          style={{ width: "100%", height: 225 }}
        />
        <Text
          numberOfLines={2}
          style={{ width: "100%", marginBottom: 5 }}
          className="text-[#ECDFCC] font-JakartaMedium mx-auto"
        >
          {item.title}
        </Text>
      </TouchableOpacity>
    ),
    [id]
  );

  return (
    <SafeAreaView className="bg-[#1E201E]">
      {/*Header*/}
      <Header />

      <View className="flex flex-row justify-center items-center px-1 py-2 mb-5 bg-[#697565]">
        <Text className="text-[#ECDFCC] font-JakartaSemiBold text-2xl">
          Search : {id}
        </Text>
      </View>
      <FlatList
        data={moreList}
        scrollEnabled={true}
        horizontal={false}
        onEndReached={getDetails}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" color="#0000ff" /> : null
        }
        numColumns={2}
        keyExtractor={(item) => item.mal_id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 150 }}
        windowSize={10} // Number of rows rendered outside the visible area
        initialNumToRender={10} // Initial items to render
        maxToRenderPerBatch={10} // Number of items rendered per batch
        removeClippedSubviews={true} // Removes off-screen items from memory
        updateCellsBatchingPeriod={50} // Batch updates at a lower interval (in ms)
      />
    </SafeAreaView>
  );
};

export default MoreDetail;
