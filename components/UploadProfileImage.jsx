import React, { useState } from "react";
import { View, Image, TouchableOpacity, Text, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { icons } from "../constants";

// Pinata API credentials
const PINATA_API_KEY = `cc5f42c6bc0f6e53df1f`;
const PINATA_SECRET_API_KEY = `910e06ba5220d887377db0eccf66a0b655d5b288122da87e8555b05cddf0f20e`;

const UploadProfileImage = () => {
  const [image, setImage] = useState(null); // Stores the selected image link
  const [uploading, setUploading] = useState(false); // To handle loading state

  // Function to pick image from gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      // Set the image uri to the state
      setImage(result.assets[0].uri);
      // Upload to Pinata
      handleUploadToPinata(result.assets[0].uri);
    }
  };

  // Function to upload image to Pinata
  const handleUploadToPinata = async (imageUri) => {
    setUploading(true);
    const formData = new FormData();
    const fileName = imageUri.split("/").pop(); // Get the file name from the path
    const fileType = fileName.split(".").pop(); // Get the file type (extension)

    formData.append("file", {
      uri: imageUri,
      name: fileName,
      type: `image/${fileType}`,
    });

    try {
      const response = await axios.post(
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

      // Get the link to the image on IPFS
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
      setImage(imageUrl); // Update state with Pinata image URL
      setUploading(false);
      Alert.alert("Success", "Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploading(false);
      Alert.alert("Error", "Failed to upload image.");
    }
  };

  return (
    <View className="items-baseline bg-[#282A3A]">
      {/* Display the uploaded image or a placeholder */}
      {image ? (
        <Image
          source={{ uri: image }}
          style={{ width: 100, height: 100, borderRadius: 50 }}
        />
      ) : (
        <Image
          source={icons.profile} // Placeholder profile icon
          style={{ width: 100, height: 100, borderRadius: 50 }}
        />
      )}

      <TouchableOpacity
        onPress={pickImage}
        className="mt-4 w-20 h-10 rounded-full bg-gray-400 items-center justify-center"
      >
        <Image
          source={icons.edit}
          style={{ width: 20, height: 20, tintColor: "white" }}
        />
      </TouchableOpacity>

      {/* Show a loading indicator if uploading */}
      {uploading && <Text className="mt-2">Uploading...</Text>}
    </View>
  );
};

export default UploadProfileImage;
