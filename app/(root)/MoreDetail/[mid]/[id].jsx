import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image } from "react-native";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import Header from "../../../../components/Header";

const MoreDetail = () => {
  const { id, mid } = useLocalSearchParams();
  const [name, setName] = useState("");
  const [moreList, setMoreList] = useState([]);
  const [hasmore, setHasmore] = useState(true);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const containsLettersAndNumbers = (id) => {
    const hasLetters = /[a-zA-Z]/.test(id);
    const hasNumbers = /[0-9]/.test(id);

    return hasLetters && hasNumbers;
  };

  const getDetails = async () => {
    if (loading || !hasmore) return;
    setLoading(true);

    const extractTypeAndMalId = (id) => {
      const type = id.replace(/^\d+/, "").trim();
      const mal_id = id.match(/^\d+/)?.[0];

      return { type, mal_id };
    };

    if (containsLettersAndNumbers(id)) {
      const { mal_id, type } = extractTypeAndMalId(id);

      if (type && mal_id) {
        const response = await fetch(
          `https://api.jikan.moe/v4/${mid}?genres=${mal_id}&page=${page}&order_by=members&sort=desc`
        );

        const data = await response.json();
        const allpage = data.pagination.last_visible_page;
        const newAnimeList = data.data;
        setName(type.charAt(0).toUpperCase() + type.slice(1));

        setMoreList((prevList) => [...prevList, ...newAnimeList]);
        if (allpage >= page) {
          setPage((prevPage) => prevPage + 1);
        } else {
          setHasmore(false);
        }
        setLoading(false);
      }
    } else {
      const response = await fetch(
        `https://api.jikan.moe/v4/${mid}/${id}?page=${page}&order_by=members&sort=desc`
      );

      const data = await response.json();
      const allpage = data.pagination.last_visible_page;
      const newAnimeList = data.data;

      if (mid === "top") {
        setName(
          mid.charAt(0).toUpperCase() +
            mid.slice(1) +
            " " +
            id.charAt(0).toUpperCase() +
            id.slice(1)
        );
      } else {
        if (newAnimeList && newAnimeList[0]?.season && newAnimeList[0]?.year) {
          setName(
            newAnimeList[0].season.charAt(0).toUpperCase() +
              newAnimeList[0].season.slice(1) +
              " " +
              newAnimeList[0].year
          );
        }
      }

      setMoreList((prevList) => [...prevList, ...newAnimeList]);
      if (allpage >= page) {
        setPage((prevPage) => prevPage + 1);
      } else {
        setHasmore(false);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    getDetails();
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <>
        <TouchableOpacity
          onPress={() =>
            router.push(
              id === "manga"
                ? `/MangaDetail/${item.mal_id.toString()}`
                : `/AnimeDetail/${item.mal_id.toString()}`
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
      </>
    ),
    []
  );

  return (
    <SafeAreaView className="bg-[#1E201E]">
      {/*Header*/}
      <Header />

      <View className="flex flex-row justify-center items-center px-1 py-2 mb-5 bg-[#697565]">
        <Text className="text-[#ECDFCC] font-JakartaSemiBold text-2xl">
          {name && `${name}`}
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
        keyExtractor={(item) => item.mal_id.toString()}
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
