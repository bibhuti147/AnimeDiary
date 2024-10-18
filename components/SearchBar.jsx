import {
  TextInput,
  Image,
  View,
  TouchableOpacity,
  Text,
  Modal,
  SafeAreaView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { icons } from "../constants";
import { router } from "expo-router";
import { FlatList } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const SearchBar = ({ handleModal }) => {
  const [search, setSearch] = useState("");
  const [searchList, setSearchList] = useState([]);
  const [openClist, setOpenClist] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Anime");

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setOpenClist(false);
  };

  const handleClick = (id) => {
    setSearch("");
    setSearchList([]);
    handleModal();
    if (selectedCategory === "Anime") {
      router.push(`/AnimeDetail/${id}`);
    } else {
      router.push(`/MangaDetail/${id}`);
    }
  };

  const handleCross = () => {
    if (search.length > 0) {
      setSearch("");
    } else {
      handleModal();
    }
  };

  const handleSearch = () => {
    fetch(
      `https://api.jikan.moe/v4/${selectedCategory.toLowerCase()}?q=${search}`
    )
      .then((response) => response.json())
      .then((data) => setSearchList(data.data))
      .catch((error) => console.error("Error fetching anime:", error));
  };

  useEffect(() => {
    if (search.length > 0) {
      const delayDebounceFn = setTimeout(() => {
        handleSearch();
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchList([]);
    }
  }, [search]);

  return (
    <SafeAreaView>
      <View className="flex flex-row justify-evenly items-center relative">
        <TouchableOpacity
          onPress={() => setOpenClist(true)}
          className="bg-secondary-900 w-[25%] h-10 flex flex-row px-2 py-[10px]"
        >
          <Text className="text-white text-center mx-auto">
            {selectedCategory}
          </Text>
          <Image source={icons.arrowDown} className="w-5 h-5 text-white" />
        </TouchableOpacity>
        <TextInput
          className="border-2 border-gray-400 bg-white h-10 px-2 w-[75%] text-sm focus:outline-none"
          placeholder="Search anime,manga..."
          value={search}
          onChangeText={(value) => setSearch(value)}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity
          onPress={handleCross}
          className="h-10 justify-center items-center absolute right-4"
        >
          <Image source={icons.close} className="w-5 h-5" />
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        visible={openClist}
        animationType="fade"
        onRequestClose={() => setOpenClist(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center"
          onPressOut={() => setOpenClist(false)}
        >
          <View className="w-52 bg-white rounded-lg p-2">
            <TouchableOpacity
              className="p-2 border-b border-gray-200"
              onPress={() => handleCategorySelect("Anime")}
            >
              <Text className="text-center">Anime</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="p-2"
              onPress={() => handleCategorySelect("Manga")}
            >
              <Text className="text-center">Manga</Text>
            </TouchableOpacity>
            {/*<TouchableOpacity
              className="p-2"
              onPress={() => handleCategorySelect("VN")}
            >
              <Text className="text-center">Visual Novel</Text>
            </TouchableOpacity>*/}
          </View>
        </TouchableOpacity>
      </Modal>

      <View className="h-full">
        {searchList.length > 0 && (
          <FlatList
            data={searchList}
            scrollEnabled={true}
            initialNumToRender={5}
            keyExtractor={(item) => item.mal_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex flex-row py-2 px-3 border-b-2 border-zinc-100"
                onPress={() => handleClick(item.mal_id)}
              >
                <Image
                  source={{ uri: item.images.jpg.image_url }}
                  style={{ width: 50, height: 50 }}
                />
                <Text className="my-auto px-5 w-4/5">{item.title}</Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default SearchBar;
