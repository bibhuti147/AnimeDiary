import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { icons } from "../constants";
import { router } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useFetch } from "../lib/fetch";
import { useFocusEffect } from "@react-navigation/native";

const Header = ({ pid }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { user, isSignedIn } = useUser();
  const [image, setImage] = useState(null);

  const {
    data: currentuser,
    loading,
    error,
    refetch,
  } = useFetch(
    `https://animediary-backend.vercel.app/api/profileDetails/${user?.id}`
  );

  useEffect(() => {
    if (currentuser && !loading && !error) {
      if (currentuser[0]?.profileimg && currentuser[0]?.profileimg !== image) {
        setImage(currentuser[0]?.profileimg);
      }
    }
  }, [currentuser, loading, error]);

  useFocusEffect(
    useCallback(() => {
      if (refetch) {
        refetch();
      }
    }, [refetch])
  );

  return (
    <View className="flex flex-row items-center justify-between px-4 py-2 bg-[#1E201E]">
      <Text
        onPress={() => router.push("/")}
        className="text-[#ECDFCC] font-JakartaExtraBold text-3xl"
      >
        AnimeDiary
      </Text>
      <View className="relative flex flex-row justify-center items-center gap-x-3">
        {!modalVisible && (
          <TouchableOpacity onPress={() => router.push("/(root)/SearchDetail")}>
            <Image
              className="w-7 h-6"
              source={icons.search}
              style={{ tintColor: "white" }}
            />
          </TouchableOpacity>
        )}

        {!isSignedIn ? (
          <Pressable
            onPress={() => router.push("(auth)/SignIn")}
            className="bg-orange-600 px-1 rounded-md"
          >
            <Text className="text-[#ECDFCC] font-JakartaMedium text-lg mb-[3px]">
              Login
            </Text>
          </Pressable>
        ) : (
          <View>
            {pid ? (
              <Pressable onPress={() => router.back()}>
                <Image
                  className="w-8 h-8 rounded-full"
                  source={icons.close}
                  style={{ tintColor: "white" }}
                />
              </Pressable>
            ) : (
              <Pressable
                onPress={() => router.push(`(root)/Profile/${user.id}`)}
              >
                <Image
                  className="w-8 h-8 bg-black rounded-full"
                  source={
                    image === "icons.profile" ? icons.profile : { uri: image }
                  }
                />
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default Header;
