import { StyleSheet, Text, View, Image, SafeAreaView, Dimensions, TextInput, TouchableOpacity, KeyboardAvoidingView, BackHandler, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
// import bgFoodPattern from '../assets/img/Images';
// import bgFoodPattern from '../assets/img/bg-food-pattern.png'
import { checkLocationPermission, requestLocationPermission } from '../helper/location-permission';
import { PrimaryGreen, TextColor1, TextColor2, TextDark } from '../helper/styles.helper';
import { Modal, Portal } from 'react-native-paper';
import DeviceInfo, { getBatteryLevel, getPhoneNumber, getUniqueId } from 'react-native-device-info';
import messaging from '@react-native-firebase/messaging';
import { api, storage } from '../services/index';
import axios from 'axios';
import LottieView from 'lottie-react-native';
import {
    getHash,
    requestHint,
    startOtpListener,
    useOtpVerify,
} from 'react-native-otp-verify';
import deviceInfoModule from 'react-native-device-info';
import LocationEnabler from 'react-native-location-enabler';
import Loader from './Loader';

const {
    PRIORITIES: { HIGH_ACCURACY },
    useLocationSettings,
} = LocationEnabler;


const window = Dimensions.get('window');

export default function LocationPermissionScreen({ navigation, route }) {
    // console.log('device phone number', DeviceInfo.getPhoneNumber());

    const [showModal, setShowModal] = useState(false);
    const [fcm_token, setFcm_token] = useState(null);
    const [mobileNumber, setMobileNumber] = useState();
    const [hash, setHash] = useState();
    const [loaderModal, setLoaderModal] = useState(false);


    const [enabled, requestResolution] = useLocationSettings(
        {
            priority: HIGH_ACCURACY, // default BALANCED_POWER_ACCURACY
            alwaysShow: true, // default false
            needBle: true, // default false
        },
        false /* optional: default undefined */
    );

    useEffect(() => {
        { !enabled && requestResolution() }
    }, [])


    const getActivityStatus = async () => {
        await api.getActivityStatus({ history_type: 1 })
    };

    const reqLocPer = async () => {
        const result = await checkLocationPermission({ navigation, login: false });
        console.log("ranjith loca", result);
    }

    const get_Token = async () => {
        // setModal(true);
        await storage.setDiffLocationAlert("TRUE");
        var fcm_token = await messaging().getToken();
        //  console.log('token*****',fcm_token);
        setFcm_token(fcm_token);
        var id = await storage.getToken();
        if (id != null) {
            console.log("Bearer Token", id);
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + id;
            getActivityStatus();
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }]
            });
            navigation.navigate('Home');
        }
        // setModal(false);
    };

    useEffect(() => {
        get_Token();
    }, []);

    const onProceed = async () => {
        // console.log('onproceed');
        // setModal(true);
        setShowModal(false);
        setLoaderModal(true);
        var payload = {};
        if (fcm_token === null) {
            payload = { mobile: mobileNumber, user_language_id: 2, hash_key: hash };
        } else {
            payload = {
                mobile: mobileNumber,
                user_language_id: 2,
                fcm_id: fcm_token,
                hash_key: hash
            };
        }
        // console.log('onproceed22', payload);

        let res = await api.login(payload);
        if (res?.user) {
            // console.log(res.user.otp);
            setLoaderModal(false);
            navigation.navigate('Otp', { user: res.user });
            if (mobileNumber == ('6381024264' || '9514619276') && res?.user?.otp) {
                alert(
                    `Your OTP is : ${data.user.otp}.\n This is for only testing purpose`,
                    // `Your OTP is : ${res.user.otp}.\n App in Debug Mode.\nNeed to remove otp key in production mode and this alert will also disabled`,
                );
            }
        }
        setShowModal(false);
        // setModal(false);
    };

    // console.log('showModal', showModal);

    const getDeviceNumber = async () => {
        const response = await checkLocationPermission({ navigation, login: true });
        // console.log("response", response);
        // if (response) {
        setShowModal(true);
        getHash().then(val => setHash(val[0])).catch(console.log);
        // const hash = await getUniqueId();
        // setHash(hash)
        // console.log("hashFromMethod", hash);
        requestHint().then(num => setMobileNumber(num.slice(-10))).catch(console.log);
        // }
    };

    // useEffect(() => {
    //     const handleBackButton = () => {
    //         return true;
    //     };

    //     const backHandler = BackHandler.addEventListener(
    //         'hardwareBackPress',
    //         handleBackButton,
    //     );

    //     return () => backHandler.remove();
    // }, [navigation]);
    useEffect(() => {
        const backAction = () => {
            Alert.alert("Hold on!", "Are you sure you want to exit App?", [
                {
                    text: "Cancel",
                    onPress: () => null,
                    style: "cancel"
                },
                { text: "YES", onPress: () => BackHandler.exitApp() }
            ]);
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        setTimeout(() => setLoaderModal(false), 5000);
    }, [loaderModal, setLoaderModal])

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f4fbf8' }}>
            <LottieView source={require('../assets/img/json.json')} autoPlay loop style={{ position: 'absolute', height: '100%', width: 'auto', }} autoSize />
            <View style={styles.content}>
                <Text style={styles.textSmall}>Ready to start from top cooks?</Text>
                <Text style={styles.textBold}>Share Your Location</Text>
                <Text style={styles.textSmall}>We are operational at your nearest place...</Text>
                <TouchableOpacity style={styles.button} onPress={() => { getDeviceNumber() }}>
                    <Text style={styles.buttonText}>Login & Explore</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', marginTop: 5 }}>
                    <TouchableOpacity onPress={() => reqLocPer()}>
                        <Text style={styles.haveAccount}>Get My Current Location</Text>
                        {/* <Text style={styles.login}>Login</Text> */}
                    </TouchableOpacity>
                </View>
            </View>
            {showModal &&
                <Portal>
                    <Modal
                        visible
                        dismissable
                        onDismiss={() => setShowModal(false)}
                        contentContainerStyle={styles.modalContainer}
                    >
                        <View style={styles.card}>
                            <Text style={styles.enterNumber}>Enter Your Phone Number</Text>
                            <View style={styles.inputContainer}>
                                <Text style={styles.countryCode}>+91</Text>
                                <TextInput value={mobileNumber} keyboardType='number-pad' style={styles.input} maxLength={10} onChangeText={(text) => { setMobileNumber(text); }} />
                            </View>
                            <TouchableOpacity style={styles.getOTPbutton} onPress={onProceed}>
                                <Text style={styles.getOTPtext}>Get OTP</Text>
                            </TouchableOpacity>
                        </View>
                    </Modal>
                </Portal>}
            {loaderModal &&
                <Modal transparent={false} visible={loaderModal}>
                    <Loader />
                </Modal>
            }

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    button: {
        width: window.width - 40,
        backgroundColor: PrimaryGreen,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginTop: 25
    },
    buttonText: {
        color: 'white',
        fontSize: 24,
        paddingVertical: 15,
        fontFamily: 'Poppins-Medium',
        fontWeight: '700'
    },
    card: {
        width: '100%',
        height: window.height / 3.5,
        marginTop: 30,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        paddingHorizontal: 25,
        marginHorizontal: '5%'
    },
    countryCode: {
        fontFamily: 'Poppins-Bold',
        fontSize: 18,
        marginRight: 10
    },
    containerStyle: {
        alignSelf: 'center',
        width: window.width,
        overflow: 'hidden',
        height: window.width
    },
    content: {
        flex: 1,
        width: window.width,
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: window.height / 1.8
    },
    enterNumber: {
        // marginLeft: 10,
        marginBottom: 10,
        fontFamily: 'Poppins-Bold',
    },
    getOTPbutton: {
        minWidth: '90%',
        backgroundColor: PrimaryGreen,
        marginTop: 25,
        paddingVertical: 7,
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    getOTPtext: {
        color: 'white',
        fontSize: 22,
        fontFamily: 'Poppins-Medium'
    },
    haveAccount: {
        fontSize: 18,
        fontWeight: '400',
        fontFamily: 'Poppins-Medium',
        color: TextColor2,
        marginTop: 5
    },
    input: {
        width: '80%',
        fontFamily: 'Poppins-Bold',
        fontSize: 18,
        fontWeight: '800',
        color: '#000'
        // borderWidth: 2,
        // borderColor: 'red'
    },
    inputContainer: {
        width: '90%',
        flexDirection: 'row',
        backgroundColor: '#fbfbfb',
        borderBottomWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    login: {
        fontSize: 20,
        marginLeft: 10,
        fontFamily: 'Poppins-Bold',
        color: TextDark

    },
    modalContainer: {
        backgroundColor: 'white',
        borderColor: '#eeeeee',
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        maxHeight: Dimensions.get('window').height - 65,
        zIndex: 5,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30
    },
    sliderContainerStyle: {
        borderRadius: window.width,
        width: window.width * 2,
        height: window.width * 2,
        marginLeft: -(window.width / 2),
        position: 'absolute',
        bottom: 0,
        overflow: 'hidden'
    },
    slider: {
        height: window.width,
        width: window.width,
        position: 'absolute',
        bottom: 0,
        marginLeft: window.width / 2,
        backgroundColor: '#9DD6EB'
    },
    bgPattern: {
        width: window.width,
        height: '60%',
        zIndex: -1,
    },
    textSmall: {
        fontSize: 16,
        fontWeight: '400',
        fontFamily: 'Poppins-Bold',
        color: TextColor2
    },
    textBold: {
        fontSize: 30,
        fontWeight: '800',
        fontFamily: 'Poppins-Bold',
        marginTop: 5,
        marginBottom: 10,
        color: TextColor1
    }

})