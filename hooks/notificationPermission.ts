import notifee from "@notifee/react-native";

async function requestPermisions () {
    const settings = await notifee.requestPermission();

    if(settings.authorizationStatus >= 1) {
        //  this means permission granted
        return true;
    } else {
        return false;
    }
}

export default requestPermisions