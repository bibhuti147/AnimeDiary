import { Image, Text, View } from "react-native";
import CustomButton from "./CustomButton";
import { icons } from "../constants";
import { useOAuth } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect } from "react";
import { fetchAPI } from "../lib/fetch";

export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

const OAuth = () => {
  useWarmUpBrowser();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const handleGoogleSignIn = useCallback(async () => {
    try {
      const { createdSessionId, setActive, signUp } = await startOAuthFlow({
        redirectUrl: Linking.createURL("/"),
      });

      if (createdSessionId) {
        if (setActive) {
          await setActive({ session: createdSessionId });

          if (signUp.createdUserId) {
            await fetchAPI(
              "https://animediary-backend.vercel.app/pages/api/userapi",
              {
                method: "POST",
                body: JSON.stringify({
                  name: `${signUp.firstName} ${signUp.lastName}`,
                  profileurl: "icons.profile",
                  email: signUp.emailAddress,
                  clerkId: signUp.createdUserId,
                }),
              }
            );
          }

          return {
            success: true,
            code: "success",
            message: "You have successfully signed in with Google",
          };
        }
      }

      return {
        success: false,
        message: "An error occurred while signing in with Google",
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        code: err.code,
        message: err?.errors[0]?.longMessage,
      };
    }
  }, [startOAuthFlow]);

  return (
    <View>
      <View className="flex flex-row justify-center items-center mt-4 gap-x-3">
        <View className="flex-1 h-[1px] bg-general-100" />
        <Text className="text-lg">Or</Text>
        <View className="flex-1 h-[1px] bg-general-100" />
      </View>

      <CustomButton
        title="Log in with Google"
        ClassName="mt-5 w-full shadow-none"
        IconLeft={() => (
          <Image
            source={icons.google}
            resizeMode="contain"
            className="w-5 h-5 mx-2"
          />
        )}
        bgVariant="outline"
        textVariant="primary"
        onPress={handleGoogleSignIn}
      />
    </View>
  );
};

export default OAuth;
