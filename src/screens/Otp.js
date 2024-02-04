import React, { useState, useEffect, useRef } from 'react';
import {
    StatusBar,
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    TextInput,
    Pressable,
    ImageBackground,
    TouchableOpacity,
    Image,
    Modal,
    Dimensions,
    ToastAndroid,
    Platform,
} from 'react-native';
import { backImg, loaderIcon, arrow, reload, WAlogo } from '../assets/img/Images';
import Loader from './Loader';
import axios from 'axios';
import { api, storage } from '../services/index';
import { useDispatch } from 'react-redux';
import { set_Profile } from '../redux/actions/authAction';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryGreen, SecondaryGreen } from '../helper/styles.helper';
import RNOtpVerify from 'react-native-otp-verify';
// import { requestReadSMSPermission, startReadSMS } from 'react-native-sms-receiver/Receiver';
import { getUniqueId } from 'react-native-device-info';
// import { startOtpListener } from 'react-native-otp-verify';

var { width, height } = Dimensions.get('window');

// getHash = () =>
//     RNOtpVerify.getHash()
//     .then(console.log)
//     .catch(console.log);

// startListeningForOtp = () =>
//     RNOtpVerify.getOtp()
//     .then(p => RNOtpVerify.addListener(this.otpHandler))
//     .catch(p => console.log(p));

// otpHandler = (message) => {
//     const otp = /(\d{4})/g.exec(message)[1];
//     this.setState({ otp });
// }

// componentWillUnmount() {
//     RNOtpVerify.removeListener();
// }

const Otp = ({ navigation, route }) => {
    const [hashFromMethod, setHashFromMethod] = useState();
    // const [otpFromMethod, setOtpFromMethod] = useState();
    // const [hint, setHint] = useState();
    // const { hash, otp, timeoutError, stopListener, startListener } = useOtpVerify();

    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    let otpInput = useRef(null);
    const lengthOtp = 4;
    var clockCall;
    const { params: { user: { id = 0, mobile = 0 } = {} } = {} } = route;
    const defaultCountdown = 30;
    const [otpValue, setOtpValue] = useState('');
    const [countDown, setCountDown] = useState(defaultCountdown);
    const [enableResend, setEnableResend] = useState(false);
    const [modal, setModal] = useState(false);
    const [showWaOtp, setShowWAOtp] = useState(false);
    const [executed, setExecuted] = useState(0);



    // const getOTP = async () => {
    //     getHash().then(val => setHashFromMethod(val[0])).catch(console.log);
    //     // requestHint().then(setHint).catch(console.log);
    //     await startOtpListener(message => {
    //         // extract the otp using regex e.g. the below regex extracts 4 digit otp from message
    //         console.log("meeeeeeeeeeeeeeee", message);
    //         if (!!message) {
    //             const otp = /(\d{4})/g?.exec(message)[1];
    //             setOtpValue(otp);
    //         }
    //     });
    //     return removeListener();
    // };
    const getOTP = async () => {
        console.log("11");
        RNOtpVerify.getHash().then(val => setHashFromMethod(val[0])).catch(console.log);
        console.log("22");
        // const deviceId = getUniqueId();
        // setHashFromMethod(deviceId);
        // console.log("deviceId: " + deviceId);
        // requestHint().then(setHint).catch(console.log);
        await RNOtpVerify.startOtpListener(message => {
            console.log("33");
            // extract the otp using regex e.g. the below regex extracts 4 digit otp from message
            try {
                const otp = /(\d{4})/g.exec(message)[1];
                console.log('otp', otp);
                setOtpValue(otp);
            }
            catch (e) {
                console.log('otp not receieved');
            }
            return RNOtpVerify.removeListener();
        });
        // await RNOtpVerify.startOtpListener(otpHandlers);

        // const otpHandlers = message => {
        //     console.log("33");
        //     try {
        //         console.log("44");
        //         const otp = /(\d{4})/g.exec(message)[1];
        //         console.log('otp', otp);
        //         console.log("55");
        //         setOtpValue(otp);
        //         console.log("66");
        //     }
        //     catch (e) {
        //         console.log("77", e);
        //         console.log('otp not receieved');
        //     }
        // };
    };
    // const startReadingMessages = async () => {
    //     const hasPermission = await requestReadSMSPermission();
    //     if (hasPermission) {
    //         startReadSMS((status, sms, error) => {
    //             if (status == "success") {
    //                 const otp = /(\d{4})/g?.exec(sms)[1];
    //                 setOtpValue(otp);
    //             }
    //         });
    //     }
    // }

    // useEffect(() => {
    //     startReadingMessages();
    // }, [otpValue, setOtpValue])


    React.useEffect(() => {
        getOTP();
    }, [enableResend]);

    // useEffect(() => {
    //     setOtpValue(2078)
    //     otpHandler()
    // }, [])

    // const getHash = async () => {
    //     const rn = await RNOtpVerify.getHash();
    //     console.log("afeneivesvsd", rn);
    //     otpHandler2(rn);
    //     // .then(i => { console.log("otp:", i); otpHandler2(i[0]) })
    //     // .catch(it => console.log("errrrr", it));
    // }
    // const startListeningForOtp = () =>
    //     RNOtpVerify.getOtp()
    //         .then(p =>
    //             // console.log("scasaccs", p))
    //             RNOtpVerify.addListener(otpHandler2))
    //         .catch(p => console.log("jivmsivvv", p));

    // const otpHandler2 = (message) => {
    //     if (message) {
    //         console.log("nudvudsuysgc kvjds", message);
    //         const otp = /(\d{4})/g.exec(message)[1];
    //         console.log("csvnvbdsvndskv sjvmewjviovneviosmv sdvmdskvgmsk ioev dsvqn viusd", otp);
    //         // this.setState({ otp });
    //     }
    // }

    // useEffect(() => {
    //     getHash();
    //     startListeningForOtp();
    //     // otpHandler2();
    //     return RNOtpVerify.removeListener();
    // }, []);


    const otpHandler = async () => {
        if (executed < 1) {
            setExecuted(1);
            setModal(true);
            let data = await api.verify({
                user_id: id,
                mobile: mobile,
                otp: parseInt(otpValue),
            });
            console.log("dataaaaaaaaaaaaaa from verify", data);
            if (data?.user?.id) {
                //axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.token;
                if (data?.registered_status) {
                    storage.setToken(data.token);
                    storage.setUserData(data.user);
                    storage.setIsOldUser("TRUE");
                    dispatch(set_Profile(data.user));
                    axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.token;
                    navigation.navigate('Home', { user: data.user });
                    // navigation.navigate('CartPage')
                } else {
                    // navigation.navigate('SignUp', { user: data.user });
                    // navigation.navigate('Address', { mobile: data.user.mobile, auto_detected: 1 });
                    navigation.navigate('AutoDetectLocation', data.user.mobile)
                }
            }
            // console.log(data?.user);
            // alert(data?.token)
            // console.log(data?.token)
            setOtpValue('');
            setModal(false);
        }
    };
    const otpProceed = async () => {
        setModal(true);
        let data = await api.verify({
            user_id: id,
            mobile: mobile,
            otp: parseInt(otpValue),
        });
        console.log("dataaaaaaaaaaaaaa from verify", data);
        if (data?.user?.id) {
            //axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.token;
            if (data?.registered_status) {
                storage.setToken(data.token);
                storage.setUserData(data.user);
                storage.setIsOldUser("TRUE");
                dispatch(set_Profile(data.user));
                axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.token;
                navigation.navigate('Home', { user: data.user });
                // navigation.navigate('CartPage')
            } else {
                // navigation.navigate('SignUp', { user: data.user });
                // navigation.navigate('Address', { mobile: data.user.mobile, auto_detected: 1 });
                navigation.navigate('AutoDetectLocation', data.user.mobile)
            }
        }
        // console.log(data?.user);
        // alert(data?.token)
        // console.log(data?.token)
        setOtpValue('');
        setModal(false);
    };

    const onChangeText = val => {
        setOtpValue(val);
    };

    useEffect(() => {
        otpInput.focus();
    }, []);

    useEffect(() => {
        clockCall = setInterval(() => {
            decrementClock();
        }, 1000);
        return () => {
            clearInterval(clockCall);
        };
    });

    const decrementClock = () => {
        if (countDown === 0) {
            setEnableResend(true);
            setCountDown(0);
            clearInterval(clockCall);
            setShowWAOtp(true);
        } else {
            setCountDown(countDown - 1);
        }
    };
    const resent_otp = async () => {
        let data = await api.login({
            mobile: mobile,
            user_language_id: route.params.user.selected_language_id,
            hash_key: hashFromMethod
        });
        if (data.status == 'success') {
            setOtpValue('');
            // alert(
            //   `Your OTP is : ${data.user.otp}.\n App in Debug Mode.\nNeed to remove otp key in production mode and this alert will also disabled`,
            // );
        }
    };
    const onResendOtp = () => {
        if (enableResend) {
            resent_otp();
            setEnableResend(false);
            setCountDown(defaultCountdown);
            clearInterval(clockCall);
            clockCall = setInterval(() => {
                decrementClock();
            }, 1000);
            // navigation.navigate('Otp', { user: data.user });
        }
    };

    useEffect(() => {
        if (otpValue.length == 4) otpHandler();
    }, [otpValue, setOtpValue])

    const sendWhatsappOtp = async () => {
        const response = await api.sendWAotp({ mobile });
        console.log("response", response);
        if (response.status == "success") {
            if (Platform.OS === 'android') {
                ToastAndroid.show(response.message, ToastAndroid.SHORT)
            } else {
                AlertIOS.alert(response.message);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor='#09B44D' barStyle={'light-content'} />
            {/* <ImageBackground source={backImg} style={styles.backgroundImg}> */}
            <KeyboardAvoidingView style={styles.containerAvoidngView}>
                <View
                    style={{
                        flex: 1,
                        color: '#fff',
                        padding: 10,
                    }}>
                    <View style={styles.headerStyle}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={{ paddingHorizontal: 5, paddingVertical: 2 }}>
                            <Image style={{ width: 11, height: 18, tintColor: '#000' }} source={arrow} />
                            <Text style={styles.headerText}>{t('otpPage.back')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View
                    style={{
                        // flex: 2,
                        color: '#fff',
                        justifyContent: 'center',
                        alignContent: 'center',
                        padding: 20,
                        marginTop: '-15%'
                    }}>
                    <Text style={styles.font1}>{t('otpPage.verifyYourMobileNo')} </Text>
                    <Text style={styles.font4}>{`Enter OTP Sent ${!!mobile ? 'To +91 ' + mobile : ''}`}</Text>
                </View>

                <View style={{ marginTop: '35%', flex: 3, paddingHorizontal: 2, alignContent: 'center' }}>
                    <View>
                        <TextInput
                            ref={input => (otpInput = input)}
                            value={otpValue}
                            onChangeText={onChangeText}
                            style={styles.textInputOtp}
                            maxLength={lengthOtp}
                            returnKeyType="done"
                            keyboardType="numeric"
                            onSubmitEditing={otpHandler}
                        />
                        <View style={styles.containerInput}>
                            {Array(lengthOtp)
                                .fill()
                                .map((data, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.cellView,
                                            {
                                                borderBottomColor:
                                                    index === otpValue.length ? '#78bf94' : '#c5c5c5',
                                            },
                                            { marginTop: index === otpValue.length ? 7 : 0 },
                                        ]}>
                                        <Text
                                            style={styles.cellText}
                                            onPress={() => otpInput.focus()}>
                                            {otpValue && otpValue.length > 0 ? otpValue[index] : ''}
                                        </Text>
                                    </View>
                                ))}
                        </View>
                    </View>
                    <Pressable
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 20
                        }}
                        onPress={onResendOtp}>
                        <Text
                            style={[
                                styles.resentOtp,
                                { color: enableResend ? '#000' : 'gray' },
                            ]}>
                            {`Resend OTP ${countDown != 0 ? ('in ' + countDown + ' seconds') : ''}`}
                        </Text>
                        {enableResend && (
                            <Image source={reload} style={[styles.loaderOtp]} />
                        )}
                    </Pressable>
                    {showWaOtp && <>
                        <Text style={{ alignSelf: 'center', marginBottom: 15, fontFamily: 'Poppins-Regular' }}>OR</Text>
                        <TouchableOpacity style={{
                            // marginTop: height - 550,
                            flexDirection: 'row',
                            backgroundColor: "seashell",
                            // width: "80%",
                            height: 50,
                            paddingHorizontal: 30,
                            borderRadius: 500,
                            borderWidth: 2,
                            borderColor: '#6ddea9',
                            alignItems: 'center',
                            justifyContent: 'center',
                            alignSelf: 'center',
                            marginBottom: 50,
                            elevation: 5
                        }}
                            onPress={sendWhatsappOtp}>
                            <Text style={{ fontFamily: 'Poppins-Bold', color: '#008245', }}>Send Otp Via Whatsapp</Text>
                            <Image source={WAlogo} style={{ width: 30, height: 30 }} />
                        </TouchableOpacity>
                    </>}
                    <Pressable onPress={otpProceed}
                        style={{
                            // marginTop: 100,
                            backgroundColor: PrimaryGreen,
                            // bottom: 50,
                            // position: 'absolute',
                            width: "90%",
                            height: 50,
                            borderRadius: 10,
                            alignItems: 'center',
                            justifyContent: 'center',
                            alignSelf: 'center'
                        }}>
                        <Text style={styles.buttonStyle}>{t('otpPage.proceed')}</Text>
                    </Pressable>

                </View>
            </KeyboardAvoidingView>
            {/* <View style={styles.container}>
                <View style={styles.resultView}>
                    <Text style={styles.resultHeader}>Using Methods</Text>
                    <Text>Your Hash is: {hashFromMethod}</Text>
                    <Text>Your message is: {otpFromMethod}</Text>
                    <Text>Selected Mobile Number is: {hint}</Text>
                </View>
                <View style={styles.resultView}>
                    <Text style={styles.resultHeader}>Using Hook</Text>
                    <Text>Your Hash is: {hash}</Text>
                    <Text>Your otp is: {otp}</Text>
                    <Text>Timeout Error: {String(timeoutError)}</Text>
                </View>
            </View> */}
            {/* </ImageBackground> */}
            <View>
                {modal && (
                    <Modal transparent={true}>
                        <Loader />
                    </Modal>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: SecondaryGreen
    },
    containerAvoidngView: {
        flex: 1,
        padding: 10,
    },
    containerInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    font6: {
        color: '#fff',
        fontFamily: 'Poppins-Regular',
        fontSize: 10,
        opacity: 0.7,
    },
    headerStyle: {
        flexDirection: 'row',
    },
    headerText: {
        fontSize: 20,
        color: '#000',
        fontFamily: 'Poppins-Bold',
        marginTop: -25,
        marginLeft: 25,
    },
    cellView: {
        paddingVertical: 1,
        width: 50,
        marginHorizontal: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1.5,
    },
    cellText: {
        textAlign: 'center',
        fontSize: 21,
        color: PrimaryGreen,
        fontFamily: 'Poppins-Bold',
        width: 60,
        height: 33,
    },
    backgroundImg: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    font1: {
        color: '#000',
        fontFamily: 'Poppins-Bold',
        fontSize: 27,
    },
    font4: {
        color: '#000',
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
        marginLeft: 7,
        marginTop: 7,
    },
    resentOtp: {
        color: '#fff',
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 25,
    },
    buttonStyle: {
        fontSize: width * 0.04,
        color: '#fff',
        fontFamily: 'Poppins-Bold',
    },
    textInputOtp: {
        width: 300,
        height: 50,
        position: 'absolute',
        opacity: 0,
        top: -3,
        left: 50,
        fontSize: 22,
        fontFamily: 'Poppins-Bold',
        zIndex: 5,
    },
    loaderOtp: {
        width: 15,
        height: 15,
        marginTop: 10,
        marginLeft: 10,
    },
});

export default Otp;
