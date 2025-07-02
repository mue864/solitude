import * as Notifications from "expo-notifications";

export const notificationPermissions = async () => {
    const {status} = await Notifications.requestPermissionsAsync();
    if (status === Notifications.PermissionStatus.GRANTED){
        return true;
    }
    return false;
}