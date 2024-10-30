import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image } from "react-native";
import { FlatList, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import Header from "../../components/Header";

const Home = () => {
  const [mangaList, setMangaList] = useState([]);
  const [animeList, setAnimeList] = useState([]);
  const [seasonList, setSeasonList] = useState([]);
  const [season, setSeason] = useState([]); 

  useEffect(() => {
    fetch("https://api.jikan.moe/v4/top/anime")
      .then((response) => response.json())
      .then((data) => setAnimeList(data.data))
      .catch((error) => console.error("Error fetching anime:", error));

    fetch("https://api.jikan.moe/v4/top/manga")
      .then((response) => response.json())
      .then((data) => setMangaList(data.data))
      .catch((error) => console.error("Error fetching manga:", error));

    fetch("https://api.jikan.moe/v4/seasons/now")
      .then((response) => response.json())
      .then((data) => {
        setSeasonList(data.data);
        if (data.data && data.data.length > 0) {
          setSeason({
            time: data.data[0].season.toUpperCase(),
            year: data.data[0].year,
          });
        }
      })
      .catch((error) => console.error("Error fetching anime:", error));
  }, []);

  return (
    <SafeAreaView className="bg-[#1E201E]">
      <ScrollView keyboardShouldPersistTaps="handled" className="bg-[#282A3A]">
        {/*Header*/}
        <Header />

        <View className="flex flex-row justify-between items-center px-1 py-2 bg-[#697565]">
          <Text className="text-[#ECDFCC] font-JakartaSemiBold text-2xl">
            {season.time} {season.year} Anime
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/MoreDetail/seasons/now")}
            className="mr-5 bg-[#181C14] py-1 px-2 rounded-md"
          >
            <Text className="text-[#ECDFCC]">More &gt;</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={seasonList}
          horizontal={true}
          scrollEnabled={true}
          initialNumToRender={3}
          keyExtractor={(item) => item.mal_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/AnimeDetail/${item.mal_id}`)}
              className="pb-3"
            >
              <Image
                source={{ uri: item.images.jpg.image_url }}
                style={{ width: 120, height: 190 }}
              />
              <Text
                className="text-[#ECDFCC] font-JakartaSemiBold text-sm pl-2"
                style={{ width: 120, height: 60 }}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          )}
        />

        <View className=" flex flex-row justify-between items-center px-1 py-2 bg-[#697565]">
          <Text className="text-[#ECDFCC] font-JakartaSemiBold text-2xl">
            Top Anime
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/MoreDetail/top/anime")}
            className="mr-5 bg-[#181C14] py-1 px-2 rounded-md"
          >
            <Text className="text-[#ECDFCC]">More &gt;</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={animeList}
          horizontal={true}
          scrollEnabled={true}
          initialNumToRender={3}
          keyExtractor={(item) => item.mal_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/AnimeDetail/${item.mal_id}`)}
              className="pb-3"
            >
              <Image
                source={{ uri: item.images.jpg.image_url }}
                style={{ width: 120, height: 190 }}
              />
              <Text
                className="text-[#ECDFCC] font-JakartaSemiBold text-sm pl-2"
                style={{ width: 120, height: 60 }}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          )}
        />

        <View className=" flex flex-row justify-between items-center px-1 py-2 bg-[#697565]">
          <Text className="text-[#ECDFCC] font-JakartaSemiBold text-2xl">
            Top Manga
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/MoreDetail/top/manga")}
            className="mr-5 bg-[#181C14] py-1 px-2 rounded-md"
          >
            <Text className="text-[#ECDFCC]">More &gt;</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={mangaList}
          horizontal={true}
          scrollEnabled={true}
          initialNumToRender={3}
          keyExtractor={(item) => item.mal_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/MangaDetail/${item.mal_id}`)}
              className="pb-3"
            >
              <Image
                source={{ uri: item.images.jpg.image_url }}
                style={{ width: 120, height: 190 }}
              />
              <Text
                className="text-[#ECDFCC] font-JakartaSemiBold text-sm pl-2"
                style={{ width: 120, height: 60 }}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
