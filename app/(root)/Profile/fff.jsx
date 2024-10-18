import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import Header from "../../../components/Header";

const Profile = () => {
  const { pid } = useLocalSearchParams();
  const { signOut } = useAuth();
  const { user } = useUser();

  const handleSignOut = () => {
    signOut();
    router.push("/");
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

        <View className="bg-[#282A3A] min-h-screen">
          <TouchableOpacity className="flex-row items-center gap-x-3 p-4 border-b border-[#ECDFCC]">
            <Image
              className="w-8 h-8 bg-white"
              source={{ uri: user.imageUrl }}
            />
            <View className="flex-row items-center gap-x-2">
              <Text className="text-[#ECDFCC] font-JakartaSemiBold text-2xl">
                {user.firstName}
              </Text>

              <TouchableOpacity
                onPress={handleSignOut}
                className="ml-3 p-1 bg-red-600 rounded"
              >
                <Text className="text-white text-sm font-JakartaSemiBold">
                  Sign Out
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
          <Text className="text-[#ECDFCC] font-JakartaSemiBold text-xl p-3 border-b border-[#ECDFCC]">
            My Anime List
          </Text>
          <Text className="text-[#ECDFCC] font-JakartaSemiBold text-xl p-3 border-b border-[#ECDFCC]">
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
