import Button from "@/components/Button";
import { Strings } from "@/constants";
import { router } from "expo-router";
import { Text, View } from "react-native";
import Notification from "@/assets/svg/onboarding/notifications.svg";
import Progress from "@/assets/svg/onboarding/progress4.svg";
import notifee from "@notifee/react-native";



export default function Notifications() {

  const getPermissions = async () => {
    await notifee.requestPermission();
  }
  return (
    <View
      className="mt-10 flex-1 relative"
      style={{ backgroundColor: "transparent" }}
    >
      <View className="mx-8 mb-5">
        <Progress />
      </View>
      <View className="flex-1 items-center justify-between ">
        <View className="flex">
          <Text className="text-white text-4xl font-SoraBold text-center">
            {Strings.notificationsHeading}
          </Text>
        </View>

        <View>
          <Notification />
        </View>

        <View className="justify-center items-center mx-4">
          <Text className="font-SoraSemiBold text-white text-lg text-center">
            {Strings.notificationsContent}
          </Text>
        </View>
        <View className="w-full mb-10">
          <View>
            <Button
              buttonText={Strings.notificationsBtn1}
              nextPage={() => {getPermissions(); router.push("/completeSetup");}}
            />
          </View>
          <View className="mt-5">
            <Button
              buttonText={Strings.notificationsBtn2}
              nextPage={() => router.push("/(onboarding)/completeSetup")}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
