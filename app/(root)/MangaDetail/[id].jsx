import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { fetchAPI, useFetch } from "../../../lib/fetch";
import Header from "../../../components/Header";
import { Picker } from "@react-native-picker/picker";

const MangaDetail = () => {
  const { id } = useLocalSearchParams();
  const { user, isSignedIn } = useUser();
  const [manga, setManga] = useState([]);
  const [aloading, setaloading] = useState(false);
  const [relatedCovers, setRelatedCovers] = useState({});
  const [moreInfo, setMoreInfo] = useState({});
  const [openMinfo, setOpenMinfo] = useState(false);
  const [openListEdit, setOpenListEdit] = useState(false);
  const [selectedScore, setSelectedScore] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("Plan to Read");
  const [selectedChapters, setSelectedChapters] = useState(0);
  const [selectedVolumes, setSelectedVolumes] = useState(0);
  const [favourited, setFavourited] = useState(false);

  const bordercolors = {
    Completed: "border-green-600",
    "Plan to Read": "border-[#1E201E]",
    Reading: "border-blue-600",
    "On Hold": "border-yellow-600",
    Dropped: "border-red-600",
  };

  const textcolors = {
    Completed: "text-green-600",
    "Plan to Read": "text-black",
    Reading: "text-blue-600",
    "On Hold": "text-yellow-600",
    Dropped: "text-red-600",
  };

  // Throttle function to delay API calls
  const throttle = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const getDetails = async () => {
    if (aloading) {
      return (
        <SafeAreaView>
          <Text>No manga data found.</Text>
        </SafeAreaView>
      );
    }

    setaloading(true);

    try {
      // Fetch manga details from the Jikan API
      const response = await fetch(`https://api.jikan.moe/v4/manga/${id}/full`);
      const data = await response.json();
      setManga(data.data);

      // Check if there are any related entries (relations)
      if (data.data && data.data.relations) {
        const coverMap = {};
        for (let i = 0; i < data.data.relations.length; i++) {
          const relation = data.data.relations[i];

          // Fetch cover image for each related manga/anime
          const coverURL = await getCover(
            relation.entry[0].type,
            relation.entry[0].mal_id
          );

          // Save cover URL to the map if it exists
          if (coverURL) {
            coverMap[relation.entry[0].mal_id] = coverURL;
          }

          // Throttle between requests to avoid overwhelming the API
          await throttle(500); // Adjust the delay (in milliseconds) as needed
        }

        setRelatedCovers(coverMap);

        if (data.data) {
          const minfoMap = {};
          minfoMap["title"] = data.data.title || "N/A";
          minfoMap["title_english"] = data.data.title_english || "N/A";
          minfoMap["title_japanese"] = data.data.title_japanese || "N/A";
          minfoMap["type"] = data.data.type || "N/A";
          minfoMap["volumes"] = data.data.volumes || "N/A";
          minfoMap["chapters"] = data.data.chapters || "N/A";
          minfoMap["status"] = data.data.status || "N/A";
          minfoMap["published"] = data.data.published?.string || "N/A";

          // Handle genres with links
          minfoMap["genres"] =
            data.data.genres.length > 0 ? (
              data.data.genres.map((genre, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => router.push(`/genre/${genre.mal_id}`)}
                >
                  <Text style={{ color: "#6EACDA" }}>
                    {genre.name}
                    {index < data.data.genres.length - 1 && <Text>, </Text>}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text className="font-JakartaSemiBold text-sm">N/A</Text>
            );

          // Handle themes with links
          minfoMap["themes"] =
            data.data.themes.length > 0 ? (
              data.data.themes.map((theme, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => router.push(`/theme/${theme.mal_id}`)}
                >
                  <Text style={{ color: "#6EACDA" }}>
                    {theme.name}
                    {index < data.data.themes.length - 1 && <Text>, </Text>}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text className="font-JakartaSemiBold text-sm">N/A</Text>
            );

          minfoMap["demographics"] =
            data.data.demographics.length > 0 ? (
              data.data.demographics.map((demographic, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => router.push(`/theme/${theme.mal_id}`)}
                >
                  <Text style={{ color: "#6EACDA" }}>
                    {demographic.name}
                    {index < data.data.demographics.length - 1 && (
                      <Text>, </Text>
                    )}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text className="font-JakartaSemiBold text-sm -ml-[3px]">
                N/A
              </Text>
            );

          minfoMap["authors"] = data.data.authors.map((author, index) => (
            <TouchableOpacity key={index}>
              <Text style={{ color: "#ECDFCC" }}>
                {author.name}
                {data.data.authors.length === 1 ? (
                  <Text className="font-JakartaLight text-xs">
                    (Story & Art)
                  </Text>
                ) : (
                  <>
                    {index === 0 && (
                      <Text className="font-JakartaLight text-xs text-[#D6BD98]">
                        {" "}
                        (Story)
                      </Text>
                    )}
                  </>
                )}
                {index === 1 && (
                  <Text className="font-JakartaLight text-xs text-[#D6BD98]">
                    {" "}
                    (Art)
                  </Text>
                )}
              </Text>
            </TouchableOpacity>
          ));

          setMoreInfo(minfoMap);
        }
      }
    } catch (error) {
      console.error("Error fetching manga details:", error);
    } finally {
      setaloading(false); // Make sure to stop aloading after the request
    }
  };

  const getCover = async (type, mal_id) => {
    try {
      const response = await fetch(
        `https://api.jikan.moe/v4/${type}/${mal_id}`
      );
      const data = await response.json();

      // Check if 'data' exists and contains the 'images' property
      if (data && data.data && data.data.images && data.data.images.jpg) {
        return data.data.images.jpg.image_url; // Return the cover image URL
      } else {
        console.error(`No image data available for ${type} with id ${mal_id}`);
        return null; // Return null if the image data is not available
      }
    } catch (error) {
      console.error("Error fetching cover image:", error);
      return null; // Return null in case of any error
    }
  };

  const modalRowItems = (para, val) => {
    return (
      <View className="flex-row gap-x-2 mx-2 mb-[2px]">
        <Text className="w-[31.5%] text-[#D6BD98] font-JakartaMedium text-sm text-right">
          {para}
        </Text>
        <Text className="w-[68.5%] text-[#D6BD98] font-JakartaSemiBold text-sm text-left">
          {val}
        </Text>
      </View>
    );
  };

  const userFavouriteAdd = async () => {
    if (user && isSignedIn) {
      if (favourited) {
        await fetchAPI(
          "https://animediary-backend.vercel.app/pages/api/userFavourites/deletemangaapi",
          {
            method: "DELETE",
            body: JSON.stringify({
              malId: id,
              userId: user.id,
            }),
          }
        );
      } else {
        await fetchAPI(
          "https://animediary-backend.vercel.app/pages/api/userFavourites/mangaapi",
          {
            method: "POST",
            body: JSON.stringify({
              name: manga.title,
              coverurl: manga.images.jpg.image_url,
              malId: id,
              userId: user.id,
            }),
          }
        );
      }
      frefetch();
    } else {
      router.push("/(auth)/SignIn");
    }
  };

  const {
    data: isFavourite,
    loading: floading,
    error: ferror,
    refetch: frefetch,
  } = useFetch(
    isSignedIn
      ? `https://animediary-backend.vercel.app/pages/api/isFavourite/manga/${id}=${user.id}`
      : null
  );

  useEffect(() => {
    if (user && isSignedIn) {
      if (isFavourite && !floading && !ferror) {
        setFavourited(isFavourite.length > 0 ? true : false);
      }
    }
  }, [isSignedIn, isFavourite, floading, ferror, favourited]);

  const handleEditButton = () => {
    if (user && isSignedIn) {
      setOpenListEdit(true);
    } else {
      router.push("/(auth)/SignIn");
    }
  };

  const addToList = async () => {
    try {
      const response = await fetchAPI(
        "https://animediary-backend.vercel.app/pages/api/userList/mangaapi",
        {
          method: "POST",
          body: JSON.stringify({
            name: manga.title,
            malid: id,
            coverurl: manga.images.jpg.image_url,
            status: `${selectedStatus}`,
            score: `${selectedScore}`,
            volumes: `${selectedVolumes}`,
            chapters: `${selectedChapters}`,
            userid: user.id,
          }),
        }
      );
      refetch();
      setOpenListEdit(false);
    } catch (error) {
      console.error("Error while adding to list:", error);
    }
  };

  const deleteEntry = async () => {
    try {
      const response = await fetchAPI(
        `https://animediary-backend.vercel.app/pages/api/userList/deletemangaapi`,
        {
          method: "DELETE",
          body: JSON.stringify({
            malid: id,
            userid: user.id,
          }),
        }
      );
      refetch();
    } catch (error) {
      console.error("Error while deleting from list:", error);
    }
  };

  const handleChapters = () => {
    if (manga?.chapters > parseInt(selectedChapters)) {
      const newChapters = (parseInt(selectedChapters) || 0) + 1;
      setSelectedChapters(newChapters);
    }
  };

  const handleVolumes = () => {
    if (manga?.volumes > parseInt(selectedVolumes)) {
      const newVolumes = (parseInt(selectedVolumes) || 0) + 1;
      setSelectedVolumes(newVolumes);
    }
  };

  const updateVolumes = () => {
    if (selectedStatus === "Completed") {
      setSelectedVolumes(manga?.volumes?.toString() || "");
    }
  };

  const updateChapters = () => {
    if (selectedStatus === "Completed") {
      setSelectedChapters(manga?.chapters?.toString() || "");
    }
  };

  useEffect(() => {
    updateVolumes();
    updateChapters();
  }, [selectedStatus, currentmanga]);

  const {
    data: currentmanga,
    loading,
    error,
    refetch,
  } = useFetch(
    isSignedIn
      ? `https://animediary-backend.vercel.app/pages/api/entryDetail/manga/${id}=${user.id}`
      : null
  );

  useEffect(() => {
    getDetails();
  }, [id]);

  useEffect(() => {
    if (isSignedIn) {
      if (currentmanga && !loading && !error) {
        setSelectedVolumes(currentmanga[0] ? currentmanga[0].volumes : 0);
        setSelectedChapters(currentmanga[0] ? currentmanga[0].chapters : 0);
        setSelectedStatus(
          currentmanga[0] ? currentmanga[0].status.toString() : "Plan to Read"
        );
        setSelectedScore(
          currentmanga[0] ? currentmanga[0].score.toString() : 0
        );
      }
    }
  }, [isSignedIn, currentmanga, loading, error]);

  return (
    <SafeAreaView className="bg-[#1E201E] min-h-screen">
      {/*Header*/}
      <Header />

      {!aloading ? (
        <ScrollView className="my-auto">
          <View className="px-1 pb-2 bg-[#697565]">
            <Text className="text-[#ECDFCC] font-JakartaSemiBold text-lg">
              {manga.title}
            </Text>
            {manga.title_english ? (
              <Text className="text-[#ECDFCC] font-JakartaLight text-sm">
                {manga.title_english}
              </Text>
            ) : null}
          </View>
          <View className="flex flex-row gap-x-2">
            {manga.images && manga.images.jpg && (
              <Image
                source={{ uri: manga.images.jpg.image_url }}
                style={{ width: 150, height: 225 }}
              />
            )}
            <View className="">
              <View className="flex-row">
                <Text className="text-[#ECDFCC] font-JakartaSemiBold text-lg">
                  ⭐ {manga.score || "N/A"}
                </Text>
                <Text className="text-[#ECDFCC] font-JakartaLight text-xs ml-1 mt-2">
                  ({manga.scored_by || "-"} users)
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/MoreDetail/top/manga")}
              >
                <Text className="text-[#6EACDA] font-JakartaMedium text-base mb-5">
                  Ranked #{manga.rank || "N/A"}
                </Text>
              </TouchableOpacity>

              <Text className="text-[#ECDFCC] text-base font-JakartaMedium">
                Manga {manga.volumes ? `(${manga.volumes}vols)` : ""}
              </Text>

              <TouchableOpacity onPress={() => setOpenMinfo(true)}>
                <Text className="text-[#6EACDA] text-base font-JakartaMedium mt-5">
                  ᐳMore Information
                </Text>
              </TouchableOpacity>
              <Modal
                transparent={true}
                visible={openMinfo}
                animationType="fade"
                onRequestClose={() => setOpenMinfo(false)}
              >
                <TouchableWithoutFeedback onPress={() => setOpenMinfo(false)}>
                  <View className="flex-1 justify-start mt-10 items-center">
                    <View className="w-80 bg-[#40534C] rounded-md">
                      <Text className="p-2 text-[#D6BD98] border-b-2 border-gray-400 text-base font-JakartaSemiBold">
                        Information
                      </Text>
                      <View className="p-2">
                        {modalRowItems(
                          "Alternative Title",
                          <>
                            <Text className="font-JakartaLight mb-[2px]">
                              English{"\n"}
                            </Text>
                            <Text className="font-JakartaMedium text-sm">
                              {moreInfo.title}
                            </Text>
                            {"\n"}
                            <Text className="font-JakartaLight mb-[2px]">
                              Synonym{"\n"}
                            </Text>
                            <Text className="font-JakartaMedium text-sm">
                              {moreInfo.title_english}
                            </Text>
                            {"\n"}
                            <Text className="font-JakartaLight mb-[2px]">
                              Japanese{"\n"}
                            </Text>
                            <Text className="font-JakartaMedium text-sm">
                              {moreInfo.title_japanese}
                            </Text>
                          </>
                        )}

                        {modalRowItems("Type", `${moreInfo.type}`)}
                        {modalRowItems("Volumes", `${moreInfo.volumes}`)}
                        {modalRowItems("Chapters", `${moreInfo.chapters}`)}
                        {modalRowItems("Status", `${moreInfo.status}`)}
                        {modalRowItems("Published", `${moreInfo.published}`)}

                        {/* Render Genres (render JSX directly instead of passing as text) */}
                        <View className="flex-row gap-x-2 mx-2 mb-[2px]">
                          <Text className="w-[31.5%] text-[#D6BD98] font-JakartaMedium text-sm text-right">
                            Genres
                          </Text>
                          <View className="w-[68.5%] font-JakartaSemiBold text-sm text-left flex-row flex-wrap">
                            {moreInfo.genres}
                          </View>
                        </View>

                        {/* Render Themes (render JSX directly instead of passing as text) */}
                        <View className="flex-row gap-x-2 mx-2 mb-[2px]">
                          <Text className="w-[31.5%] text-[#D6BD98] font-JakartaMedium text-sm text-right">
                            Themes
                          </Text>
                          <View className="w-[68.5%] font-JakartaSemiBold text-sm text-left flex-row flex-wrap">
                            {moreInfo.themes}
                          </View>
                        </View>

                        <View className="flex-row gap-x-2 mx-1 mb-[2px]">
                          <Text className="w-[31.5%] text-[#D6BD98] font-JakartaMedium text-sm text-right">
                            Demographic
                          </Text>
                          <View className="w-[68.5%] font-JakartaSemiBold text-sm text-left flex-row flex-wrap">
                            {moreInfo.demographics}
                          </View>
                        </View>

                        <View className="flex-row gap-x-2 mx-2 mb-[2px]">
                          <Text className="w-[31.5%] text-[#D6BD98] font-JakartaMedium text-sm text-right">
                            Authors
                          </Text>
                          <View className="w-[68.5%] font-JakartaSemiBold text-sm text-left flex-row flex-wrap mt-1">
                            {moreInfo.authors}
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity
                        className="items-center py-1 mx-24 mb-2 bg-[#4B70F5] rounded-md"
                        onPressOut={() => setOpenMinfo(false)}
                      >
                        <Text className="font-JakartaSemiBold text-[#D6BD98] mb-1 text-lg">
                          Close
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
            </View>
          </View>

          <View className="bg-[#ECDFCC] flex-row justify-around items-center p-2">
            <TouchableOpacity
              onPress={userFavouriteAdd}
              className={`${
                favourited ? "border-danger-800" : "border-[#1E201E]"
              } border-[1px] w-[40%] items-center py-1 rounded-md`}
            >
              <Text
                className={`${
                  favourited && "text-danger-800"
                }  mb-1 font-JakartaMedium`}
              >
                {favourited ? "*Favourited" : "Favourite"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleEditButton}
              className={`${
                bordercolors[
                  currentmanga &&
                  currentmanga.length > 0 &&
                  currentmanga[0]?.status
                    ? currentmanga[0]?.status
                    : "Plan to Read"
                ]
              } border-[1px] w-[40%] items-center py-1 rounded-md`}
            >
              <Text
                className={`mb-1 font-JakartaMedium ${
                  textcolors[
                    currentmanga &&
                    currentmanga.length > 0 &&
                    currentmanga[0]?.status
                      ? currentmanga[0]?.status
                      : "Plan to Read"
                  ]
                }`}
              >
                {currentmanga &&
                currentmanga.length > 0 &&
                currentmanga[0]?.status
                  ? currentmanga[0]?.status
                  : "Plan to Read"}
              </Text>
            </TouchableOpacity>
          </View>

          <Modal
            transparent={true}
            visible={openListEdit}
            animationType="slide"
            onRequestClose={() => setOpenListEdit(false)}
          >
            <TouchableWithoutFeedback onPress={() => setOpenListEdit(false)}>
              <View className="flex-1 justify-start items-center">
                <View className="bg-[#1E201E] w-full p-1 rounded-b-md">
                  <Text className="text-[#ECDFCC] font-JakartaExtraBold text-lg px-1">
                    {manga.title}
                  </Text>
                  <View className="flex-row mt-3 mb-2 px-3 items-center">
                    <Text className="text-[#ECDFCC] font-JakartaBold text-sm w-1/3">
                      Status
                    </Text>
                    <View className="w-2/3 border-[#ECDFCC] border-[1px] rounded-md flex justify-center h-10">
                      <Picker
                        selectedValue={selectedStatus}
                        onValueChange={(itemValue) =>
                          setSelectedStatus(itemValue)
                        }
                        style={{ color: "#ECDFCC" }}
                      >
                        <Picker.Item
                          label="Plan to Read"
                          value="Plan to Read"
                        />
                        <Picker.Item label="Reading" value="Reading" />
                        <Picker.Item label="Completed" value="Completed" />
                        <Picker.Item label="On Hold" value="On Hold" />
                        <Picker.Item label="Dropped" value="Dropped" />
                      </Picker>
                    </View>
                  </View>
                  <View className="flex-row mb-2 px-3 items-center">
                    <Text className="text-[#ECDFCC] font-JakartaBold text-sm w-1/3">
                      Score
                    </Text>
                    <View className="w-2/3 border-[#ECDFCC] border-[1px] rounded-md flex justify-center h-9">
                      <Picker
                        selectedValue={selectedScore}
                        onValueChange={(itemValue) =>
                          setSelectedScore(itemValue)
                        }
                        style={{ color: "#ECDFCC" }}
                      >
                        <Picker.Item label="0" value="0" />
                        <Picker.Item label="1" value="1" />
                        <Picker.Item label="2" value="2" />
                        <Picker.Item label="3" value="3" />
                        <Picker.Item label="4" value="4" />
                        <Picker.Item label="5" value="5" />
                        <Picker.Item label="6" value="6" />
                        <Picker.Item label="7" value="7" />
                        <Picker.Item label="8" value="8" />
                        <Picker.Item label="9" value="9" />
                        <Picker.Item label="10" value="10" />
                      </Picker>
                    </View>
                  </View>
                  <View className="flex-row mb-2 px-3 items-center">
                    <Text className="text-[#ECDFCC] font-JakartaBold text-sm w-1/3">
                      Chapters
                    </Text>
                    <View className="w-2/3 flex-row gap-x-1">
                      <View className="border-[#ECDFCC] border-[1px] rounded-md p-1 w-[86%] items-center flex-row justify-between h-9">
                        <TextInput
                          onChangeText={setSelectedChapters}
                          value={selectedChapters.toString()}
                          keyboardType="numeric"
                          className="text-sm px-3 flex-1 text-[#ECDFCC]"
                        />
                        <Text className="text-sm text-[#ECDFCC]">
                          / {manga.chapters ? manga.chapters : "?"}
                        </Text>
                      </View>
                      <Text
                        onPress={handleChapters}
                        className="w-[14%] font-JakartaMedium text-sm bg-blue-500 rounded-full"
                      >
                        +
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row mb-5 px-3 items-center">
                    <Text className="text-[#ECDFCC] font-JakartaBold text-sm w-1/3">
                      Volumes
                    </Text>
                    <View className="w-2/3 flex-row gap-x-1">
                      <View className="border-[#ECDFCC] border-[1px] rounded-md p-1 w-[86%] items-center flex-row justify-between h-9">
                        <TextInput
                          onChangeText={setSelectedVolumes}
                          value={selectedVolumes.toString()}
                          keyboardType="numeric"
                          className="text-sm flex-1 px-3 text-[#ECDFCC]"
                        />
                        <Text className="text-sm text-[#ECDFCC]">
                          / {manga.volumes ? manga.volumes : "?"}
                        </Text>
                      </View>
                      <Text
                        onPress={handleVolumes}
                        className="w-[14%] font-JakartaMedium text-sm bg-blue-500 rounded-full"
                      >
                        +
                      </Text>
                    </View>
                  </View>

                  {currentmanga && currentmanga.length > 0 && (
                    <Text
                      onPress={deleteEntry}
                      className="text-danger-600 font-JakartaBold underline text-center -mt-3 mb-3"
                    >
                      Delete this Entry
                    </Text>
                  )}

                  <View className="flex-row justify-evenly mb-5 items-center">
                    <TouchableOpacity onPress={() => setOpenListEdit(false)}>
                      <Text className="font-JakartaMedium text-sm text-[#ECDFCC] bg-blue-500 border-[#1E201E] border-[1px] rounded-md p-1 px-2">
                        cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={addToList}>
                      <Text className="font-JakartaMedium text-sm text-[#ECDFCC] bg-blue-500 border-[#1E201E] border-[1px] rounded-md p-1 px-2">
                        submit
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
          <View className="px-2 mb-3">
            <Text className="text-[#ECDFCC] font-JakartaBold text-lg my-1">
              Synopsis
            </Text>
            <Text className="text-[#ECDFCC] font-JakartaMedium">
              {manga.synopsis || ""}
            </Text>
          </View>

          <View className="flex flex-row justify-between items-center px-1 py-2 bg-[#697565]">
            <Text className="text-[#ECDFCC] font-JakartaSemiBold text-2xl">
              Related Entries
            </Text>
          </View>
          <FlatList
            data={manga.relations}
            horizontal={true}
            scrollEnabled={true}
            keyExtractor={(item) => item.entry[0].mal_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  router.push(
                    item.entry[0].type === "anime"
                      ? `/AnimeDetail/${item.entry[0].mal_id.toString()}`
                      : `/MangaDetail/${item.entry[0].mal_id.toString()}`
                  )
                }
                className="pb-3"
              >
                {item.entry && item.entry[0] && item.entry[0].mal_id && (
                  <Image
                    source={{ uri: relatedCovers[item.entry[0].mal_id] }}
                    style={{ width: 120, height: 160 }}
                  />
                )}
                <Text
                  className="text-[#ECDFCC]"
                  style={{ width: 100, height: 60 }}
                >
                  {item.relation}
                </Text>
              </TouchableOpacity>
            )}
          />
        </ScrollView>
      ) : (
        <ActivityIndicator size="large" color="#00ff00" />
      )}
    </SafeAreaView>
  );
};

export default MangaDetail;
