
import { Alert } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

export const openCamara = async () => {
    const options = {
        storageOptions: {
            path: 'images',
            mediaType: 'photo',

        },
        maxHeight: 300,
        maxWidth: 300,
        includeBase64: true,
    }
    // console.log("launchCameralaunchCameralaunchCameralaunchCamera", await launchCamera());

    let source;
    const data = await launchCamera(options, response => {
        // console.log('Response =', response);
        if (response.didCancel) {
            // console.log('User cancelled image picker');
            Alert.alert('User cancelled image picker');
        }
        else if (response.error) {
            // console.log('ImagePicker Error:', response.error);
            Alert.alert('ImagePicker Error:', response.error);
        }
        else if (response.customButton) {
            // console.log('User tapped custom button:', response.customButton);
            Alert.alert('User tapped custom button:', response.customButton);
        }
        else {
            // console.log('User fileName:', response);
            // You can also display the image using data:
            source = { ...response?.assets?.[0], base64: 'data:image/jpeg;base64,' + response?.assets?.[0]?.base64 };
            // setimageUri(source);
        }
    });
    // data?.assets?.[0]?.base64 = 'data:image/jpeg;base64,' + data?.assets?.[0]?.base64
    return source;
};

export const openGallery = async () => {
    const options = {
        storageOptions: {
            path: 'images',
            mediaType: 'photo',
        },
        maxHeight: 300,
        maxWidth: 300,
        includeBase64: true,
    };

    let source;

    const data = await launchImageLibrary(options, response => {
        console.log('Response = ', response);
        if (response.didCancel) {
            console.log('User cancelled image picker');
        } else if (response.error) {
            console.log('ImagePicker Error:', response.error);
        } else if (response.customButton) {
            console.log('User tapped custom button:', response.customButton);
        } else {
            // You can also display the image using data:
            // const source = { uri: 'data:image/jpeg;base64,' + response.base64 };
            source = { ...response?.assets?.[0], base64: 'data:image/jpeg;base64,' + response?.assets?.[0]?.base64 };
            // setimageUriGallary(source);
            // return source;
        }
    });
    return source;
};
