import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  TextInput,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import Header from "../../../../components/Header";
import { fetchAPI, useFetch } from "../../../../lib/fetch";
import { icons } from "../../../../constants";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

const Profile = () => {
  const { pid } = useLocalSearchParams();
  const { signOut } = useAuth();
  const { user } = useUser();
  const [udetails, setUdetails] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [openEdit, setOpenEdit] = useState(false);
  const [uploading, setUploading] = useState(false);

  const PINATA_API_KEY = `cc5f42c6bc0f6e53df1f`;
  const PINATA_SECRET_API_KEY = `910e06ba5220d887377db0eccf66a0b655d5b288122da87e8555b05cddf0f20e`;

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      handleUploadToPinata(result.assets[0].uri);
    }
  };

  const handleUploadToPinata = async (imageUri) => {
    setUploading(true);

    try {
      // **Step 1: Check Image Size**
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      const fileSizeInMB = fileInfo.size / (1024 * 1024); // Convert to MB

      if (fileSizeInMB > 2) {
        Alert.alert(
          "Error",
          "Image size exceeds 2MB. Please upload a smaller file."
        );
        setUploading(false);
        return; // Exit if the file is too large
      }

      // **Step 2: Delete existing image from Pinata (if it's not the default image)**
      if (udetails.profileimg !== "icons.profile") {
        const ipfsHash = udetails.profileimg.split("/ipfs/")[1]; // Extract IPFS hash from the URL
        if (ipfsHash) {
          try {
            const response = await axios.delete(
              `https://api.pinata.cloud/pinning/unpin/${ipfsHash}`,
              {
                headers: {
                  pinata_api_key: PINATA_API_KEY,
                  pinata_secret_api_key: PINATA_SECRET_API_KEY,
                },
              }
            );
            console.log(
              "Image deleted successfully from Pinata:",
              response.data
            );
          } catch (error) {
            console.error("Error deleting image from Pinata:", error);
            throw error; // You can decide whether to throw or handle it differently
          }
        }
      }

      // **Step 3: Upload new image to Pinata**
      const formData = new FormData();
      const fileName = imageUri.split("/").pop(); // Get the file name from URI
      const fileType = fileName.split(".").pop(); // Extract file type

      formData.append("file", {
        uri: imageUri,
        name: fileName,
        type: `image/${fileType}`,
      });

      const pinataResponse = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_API_KEY,
          },
        }
      );

      // **Step 4: Construct the IPFS URL**
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${pinataResponse.data.IpfsHash}`;
      setImage(imageUrl); // Update state with the new image URL

      // **Step 5: Update the image URL in your database via API**
      const updateResponse = await fetchAPI(`/(api)/profileDetails/updateimg`, {
        method: "PUT",
        body: JSON.stringify({
          userid: user.id,
          imageurl: imageUrl, // The new image URL to be saved in the database
        }),
      });
    } catch (error) {
      console.error("Error uploading or updating image:", error);
      Alert.alert("Error", "Failed to upload or update image.");
    } finally {
      // **Step 6: Reset state after process finishes**
      setUploading(false); // Stop the loading indicator
      setModalVisible(false); // Close the modal
    }
  };

  const handleModal = () => {
    setModalVisible(!modalVisible);
  };

  const handleSignOut = () => {
    signOut();
    router.push("/");
  };

  const {
    data: currentuser,
    loading,
    error,
    refetch,
  } = useFetch(`/(api)/profileDetails/${user?.id}`);

  useEffect(() => {
    if (currentuser && !loading && !error) {
      setUdetails(currentuser[0]);
      setName(currentuser[0].name);
    }
  }, [currentuser, loading, error, image]);

  const handleEdit = async () => {
    try {
      await fetchAPI("/(api)/profileDetails/updatename", {
        method: "PUT",
        body: JSON.stringify({
          userid: user.id,
          newname: name,
        }),
      });
      refetch();
    } catch (error) {
      console.error("Error while updating from list:", error);
    }
    setOpenEdit(false);
  };

  if (!user) {
    return (
      <SafeAreaView>
        <Text>No User</Text>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView className="bg-[#1E201E]">
      <ScrollView keyboardShouldPersistTaps="handled">
        {/*Header*/}
        <Header pid={pid} />

        {loading ? (
          <ActivityIndicator size="large" color="#ECDFCC" />
        ) : (
          <View className="bg-[#282A3A] min-h-screen">
            <View className="flex-row items-center gap-x-2 p-4 border-b border-[#ECDFCC]">
              <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleModal}
              >
                <TouchableWithoutFeedback onPress={handleModal}>
                  <View className="flex-1 mt-[120px]">
                    <View className="min-h-[200px] m-5 rounded-lg">
                      <View className="flex-col -mt-[80px] items-center">
                        <Image
                          className="w-[230px] h-[230px] bg-[#ECDFCC] mb-10"
                          source={
                            udetails?.profileimg === "icons.profile"
                              ? icons.profile
                              : { uri: udetails?.profileimg }
                          }
                        />
                        <TouchableOpacity
                          onPress={pickImage}
                          className="w-[230px]"
                        >
                          <Text className="font-JakartaMedium text-lg text-[#1E201E] bg-[#ECDFCC] border-[1px] border-secondary-600 px-3 pb-2 pt-1">
                            Change
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="w-[230px]"
                          onPress={handleModal}
                        >
                          <Text className="font-JakartaMedium text-lg text-[#1E201E] bg-[#ECDFCC] border-[1px] border-secondary-600 px-3 pb-2 pt-1">
                            Cancel
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>

              <TouchableOpacity
                onPress={handleModal}
                className="items-center justify-center"
              >
                <Image
                  className="w-24 h-24"
                  source={
                    udetails?.profileimg === "icons.profile"
                      ? icons.profile
                      : { uri: udetails?.profileimg }
                  }
                />
              </TouchableOpacity>
              <View className="flex-col gap-y-2 items-center">
                {openEdit ? (
                  <TextInput
                    onChangeText={setName}
                    value={name.split(" ")[0]}
                    className="font-JakartaSemiBold text-2xl flex-1 bg-[#ECDFCC] px-2 ml-1"
                  />
                ) : (
                  <Text className="text-[#ECDFCC] font-JakartaSemiBold text-2xl">
                    {name.split(" ")[0]}
                  </Text>
                )}
                <View className="flex-row justify-around items-center">
                  <TouchableOpacity
                    onPress={handleSignOut}
                    className="ml-3 p-1 bg-red-600 rounded"
                  >
                    <Text className="text-white text-sm font-JakartaSemiBold w-[65px] pl-1">
                      Sign Out
                    </Text>
                  </TouchableOpacity>
                  {openEdit ? (
                    <TouchableOpacity
                      onPress={handleEdit}
                      className="ml-3 p-1 bg-red-600 rounded"
                    >
                      <Text className="text-white text-sm font-JakartaSemiBold w-[65px] pl-4">
                        Save
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => setOpenEdit(!openEdit)}
                      className="ml-3 p-1 bg-red-600 rounded"
                    >
                      <Text className="text-white text-sm font-JakartaSemiBold">
                        Edit Name
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
            <Text
              onPress={() => router.push(`(root)/Profile/${pid}/FavouriteList`)}
              className="text-[#ECDFCC] font-JakartaSemiBold text-xl p-3 border-b border-[#ECDFCC]"
            >
              My Favourite List
            </Text>
            <Text
              onPress={() => router.push(`(root)/Profile/${pid}/AnimeList`)}
              className="text-[#ECDFCC] font-JakartaSemiBold text-xl p-3 border-b border-[#ECDFCC]"
            >
              My Anime List
            </Text>
            <Text
              onPress={() => router.push(`(root)/Profile/${pid}/MangaList`)}
              className="text-[#ECDFCC] font-JakartaSemiBold text-xl p-3 border-b border-[#ECDFCC]"
            >
              My Manga List
            </Text>
            <Text
              onPress={() => router.push("/GenreDetail/anime")}
              className="text-[#ECDFCC] font-JakartaSemiBold text-xl p-3 border-b border-[#ECDFCC]"
            >
              Anime Search
            </Text>
            <Text
              onPress={() => router.push("/MoreDetail/top/anime")}
              className="text-[#ECDFCC] font-JakartaSemiBold text-xl p-3 border-b border-[#ECDFCC]"
            >
              Top Anime
            </Text>
            <Text
              onPress={() => router.push("/MoreDetail/seasons/now")}
              className="text-[#ECDFCC] font-JakartaSemiBold text-xl p-3 border-b border-[#ECDFCC]"
            >
              Seasonal Anime
            </Text>
            <Text
              onPress={() => router.push("/GenreDetail/manga")}
              className="text-[#ECDFCC] font-JakartaSemiBold text-xl p-3 border-b border-[#ECDFCC]"
            >
              Manga Search
            </Text>
            <Text
              onPress={() => router.push("/MoreDetail/top/manga")}
              className="text-[#ECDFCC] font-JakartaSemiBold text-xl p-3 border-b border-[#ECDFCC]"
            >
              Top Manga
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
