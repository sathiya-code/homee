import { Alert, Linking } from "react-native";
import deviceInfoModule from "react-native-device-info";
import checkVersion from "react-native-store-version";

export const toCamelCase = (string) => {
    let convertedStr = '';
    string?.toLowerCase()
        .split(" ")
        .map(item => {
            convertedStr = convertedStr + item.charAt(0).toUpperCase() + item.slice(1) + " ";
        });
    return convertedStr;
};

export const checkForUpdate = async () => {
    const storeURL = 'https://play.google.com/store/apps/details?id=com.homeeuser';
    try {
        const check = await checkVersion({
            version: deviceInfoModule.getVersion(), // app local version
            iosStoreURL: 'ios app store url',
            androidStoreURL: storeURL,
            country: 'in', // default value is 'jp'
        });
        if (check.result === 'new') {
            Alert.alert(
                'Please Update',
                'You will have to update your app to the latest version to continue using.',
                [
                    {
                        text: 'Update',
                        onPress: () => {
                            // BackHandler.exitApp();
                            Linking.openURL(storeURL);
                        },
                    },
                ],
                { cancelable: false },
            );
            // if app store version is new
        }
    } catch (e) {
        console.log(e);
    }
};

