import { Dimensions, Image, Linking, Modal, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import * as Images from '../../assets/img/Images'
import Geolocation from 'react-native-geolocation-service';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Geocoder from 'react-native-geocoding';
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet";
import { useRef } from 'react';
import { useMemo } from 'react';
import Loader from '../Loader';
import * as api from '../../services/api';
import moment from 'moment';
import LottieView from 'lottie-react-native';
import Carousel from 'react-native-snap-carousel';
import FastImage from 'react-native-fast-image';
import { calculateMovementDirection } from '../../helper/deliveryBoyMovementCalculation';
import { useCallback } from 'react';

const { width, height } = Dimensions.get('screen');

const titleCase = (text) => {
    if (!!text) return text.charAt(0)?.toUpperCase() + text?.slice(1)
}

const PndOrderTrack = ({ navigation, route }) => {
    const [mapMarginBottom, setMapMarginBottom] = useState(1);
    const [modal, setModal] = useState(false);
    const [initialRegion, setInitialRegion] = useState(null);
    const [deliveryBoyDetails, setDeliveryBoyDetails] = useState(null);
    const [orderInfo, setOrderInfo] = useState(null);
    const [stepIndicatorHeight, setStepIndicatorHeight] = useState(10);
    const [deliveryBoySearchMsg, setDeliveryBoySearchMsg] = useState(['Searching for the Perfect Rider for you']);
    const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(0);
    const [deliveryBoyPrevLocation, setDeliveryBoyPrevLocation] = useState(0);

    const order_no = route.params.id;

    const sheetRef = useRef(null);
    const snapPoints = useMemo(() => ["50%", "60%", "70%", "80%", "90%", "92.3%"], []);

    const getOrderInfo = async () => {
        setModal(true);
        const response = await api.getpndOrderInfo({ order_no });
        console.log("response from order info", response);
        if (response.status = 'success') setOrderInfo(response.pickndrop)
        // console.log("response from order info", response.pickndrop);
        setModal(false);
    }

    const getPndSearchMessages = async () => {
        const response = await api.getPndSearchMessages();
        setDeliveryBoySearchMsg(response.searchMsg);
    };

    const getDeliveryInfo = async () => {
        // getPndSearchMessages();
        const response = await api.getpndDeliveryInfo({ order_no });
        if (response.status = 'success') {
            console.log("response.deliveryboyyyy", response.deliveryboy_details);
            setDeliveryBoyDetails(response.deliveryboy_details)
            const newDeliveryBoyLocation = {
                latitude: response.deliveryboy_details.current_latitude,
                longitude: response.deliveryboy_details.current_longitude,
            };
            deliveryBoyLocation && setDeliveryBoyPrevLocation(deliveryBoyLocation);
            setDeliveryBoyLocation(newDeliveryBoyLocation);
            if (orderInfo?.delivery_status == 5) { navigation.navigate('Home') }
        }
    }

    useEffect(() => {
        getPndSearchMessages();
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setInitialRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                });
            },
            (error) => {
                console.error(error);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
        getOrderInfo();
    }, []);

    useEffect(() => {
        getDeliveryInfo();
        const locationUpdateInterval = setInterval(() => {
            getDeliveryInfo();
        }, 4000);
        return () => clearInterval(locationUpdateInterval);
    }, []);

    const _onMapReady = () => {
        setTimeout(() => { setMapMarginBottom(0) }, 100);
        setModal(false);
    };

    const dialCall = (number) => {
        let phoneNumber = ''
        if (Platform.OS === 'android') { phoneNumber = `tel:${number}`; }
        else { phoneNumber = `telprompt:${number}`; }
        Linking.openURL(phoneNumber);
    };

    const SearchingDeliveryBoy = useCallback(() => {
        return (
            <>
                {/* <View style={{ width, height: 75, justifyContent: 'center', alignItems: 'center', }}> */}

                <View style={styles.deliveryBoySearching}>
                    {/* <View style={styles.deliveryBoyContainer}> */}
                    <LottieView source={Images.SearchingLoader} autoPlay useNativeLooping loop style={{ width: '100%', height: 30 }} speed={0.5} />
                    <Carousel
                        enableSnap
                        style={{ borderRadius: 25, overflow: 'hidden', }}
                        loop
                        data={deliveryBoySearchMsg}
                        renderItem={({ item, index }) => {
                            // console.log("deliveryBoySearchMsg", item);
                            return (
                                <Text key={index} style={{ width: '75%', fontFamily: 'Poppins-Medium', fontSize: 14, }} >{item}</Text>
                            )
                        }}
                        sliderWidth={width / 1.3}
                        itemWidth={width}
                        autoplay
                        autoplayDelay={1500}
                        autoplayInterval={3000}
                        activeSlideAlignment={'center'}
                        contentContainerCustomStyle={{
                            // height: 210,
                            borderRadius: 10,
                            overflow: 'hidden',
                        }}
                    />

                    {/* </View> */}
                </View>

                {/* </View> */}
            </>
        )
    }, [deliveryBoySearchMsg, setDeliveryBoyDetails, deliveryBoyDetails]);

    const DeliveryBoydetails = () => {
        return (
            <View style={styles.deliveryBoyDetails}>
                <View style={styles.deliveryBoyContainer}>
                    <FastImage source={Images.DeliveryBoyImage} style={styles.deliveryBoyImage} resizeMode={FastImage.resizeMode.contain} />
                    <View style={styles.deliveryBoyNameContainer}>
                        <Text style={styles.vehicleNumberText}>{deliveryBoyDetails?.vehicle_number}</Text>
                        <Text style={styles.deliveryBoyName}>{titleCase(deliveryBoyDetails?.name)}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.phoneContainer} onPress={() => dialCall(deliveryBoyDetails?.mobile)}>
                    <FastImage source={Images.Phone} style={styles.phone} resizeMode={FastImage.resizeMode.contain} />
                </TouchableOpacity>
            </View>
        )
    }

    const ItemDetails = () => {
        const pickupLocation = orderInfo?.pickup_location[0];
        const dropLocation = orderInfo?.drop_location[0];
        return (
            <View style={{ marginTop: 20, marginHorizontal: "5%", paddingBottom: 30, borderRadius: 7, borderWidth: 0.5, borderColor: '#EBEBEB', backgroundColor: '#fff', elevation: 5, paddingHorizontal: 15, paddingVertical: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                    <View>
                        <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 12, color: '#ABABAB' }}>Order Id</Text>
                        <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 13, color: '#4D4D4D' }}>{orderInfo?.order_no}</Text>
                    </View>
                    <View>
                        <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 12, color: '#ABABAB' }}>Order Date & Time</Text>
                        <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 13, color: '#4D4D4D' }}>{moment(orderInfo?.created_at).format('DD/MM/YYYY, hh:mm A')}</Text>
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <View style={{ paddingRight: 7 }}>
                        <FastImage source={Images.Location} style={styles.icon} resizeMode={FastImage.resizeMode.center} />
                        <View style={{ width: 1.8, height: stepIndicatorHeight - 25, backgroundColor: '#E0E0E0', alignSelf: 'center', marginVertical: 3 }} />
                        <FastImage source={Images.Box} style={styles.icon} resizeMode={FastImage.resizeMode.center} />
                    </View>
                    <View >
                        <View style={{ paddingBottom: 5 }} onLayout={(event) => {
                            var { x, y, width, height } = event.nativeEvent.layout;
                            setStepIndicatorHeight(height);
                        }} >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 13, fontFamily: 'Poppins-Medium', color: '#B78C8C' }}>Pickup Location</Text>
                                <Text style={{ fontSize: 12, fontFamily: 'Poppins-Medium', color: '#B78C8C' }}>{`Distance: ${orderInfo?.km}Km`}</Text>
                            </View>
                            <Text style={{ fontSize: 13, fontFamily: 'Poppins-Bold', color: '#4D4D4D' }}>{titleCase(pickupLocation?.type)}</Text>
                            <Text style={{ fontSize: 13, fontFamily: 'Poppins-Medium', color: '#8B8B8B', width: width - 100 }}>{!!pickupLocation?.door_no && pickupLocation?.door_no != null && pickupLocation?.door_no != 'null' && pickupLocation?.door_no != '' ? pickupLocation?.door_no + ", " : ''}{
                                !!pickupLocation?.apartment_name && pickupLocation?.apartment_name != null && pickupLocation?.apartment_name != 'null' && pickupLocation?.apartment_name != '' ? pickupLocation?.apartment_name + ", " : ''}{
                                    !!pickupLocation?.street && pickupLocation?.street != null && pickupLocation?.street != 'null' && pickupLocation?.street != '' ? pickupLocation?.street + ", " : ''}{
                                    !!pickupLocation?.sublocality && pickupLocation?.sublocality != null && pickupLocation?.sublocality != 'null' && pickupLocation?.sublocality != '' ? pickupLocation?.sublocality + ", " : ''}{
                                    !!pickupLocation?.city && pickupLocation?.city != null && pickupLocation?.city != 'null' && pickupLocation?.city != '' ? pickupLocation?.city + ", " : ''}{
                                    !!pickupLocation?.state && pickupLocation?.state != null && pickupLocation?.state != 'null' && pickupLocation?.state != '' ? pickupLocation?.state + ", " : ''}{
                                    !!pickupLocation?.pin_code && pickupLocation?.pin_code != null && pickupLocation?.pin_code != 'null' && pickupLocation?.pin_code != '' ? pickupLocation?.pin_code + ", " : ''
                                }</Text>
                            {/* <Text>{Pickup Location}</Text> */}
                        </View>
                        <View style={{ paddingTop: 5 }}>
                            <Text style={{ fontSize: 13, fontFamily: 'Poppins-Medium', color: '#B78C8C' }}>Drop Location</Text>
                            <Text style={{ fontSize: 13, fontFamily: 'Poppins-Bold', color: '#4D4D4D' }}>{titleCase(dropLocation?.type)}</Text>
                            <Text style={{ fontSize: 13, fontFamily: 'Poppins-Medium', color: '#8B8B8B', width: width - 100 }}>
                                {!!dropLocation?.door_no && dropLocation?.door_no != null && dropLocation?.door_no != 'null' && dropLocation?.door_no != '' ? dropLocation?.door_no + ", " : ''}{
                                    !!dropLocation?.apartment_name && dropLocation?.apartment_name != null && dropLocation?.apartment_name != 'null' && dropLocation?.apartment_name != '' ? dropLocation?.apartment_name + ", " : ''}{
                                    !!dropLocation?.street && dropLocation?.street != null && dropLocation?.street != 'null' && dropLocation?.street != '' ? dropLocation?.street + ", " : ''}{
                                    !!dropLocation?.sublocality && dropLocation?.sublocality != null && dropLocation?.sublocality != 'null' && dropLocation?.sublocality != '' ? dropLocation?.sublocality + ", " : ''}{
                                    !!dropLocation?.city && dropLocation?.city != null && dropLocation?.city != 'null' && dropLocation?.city != '' ? dropLocation?.city + ", " : ''}{
                                    !!dropLocation?.state && dropLocation?.state != null && dropLocation?.state != 'null' && dropLocation?.state != '' ? dropLocation?.state + ", " : ''}{
                                    !!dropLocation?.pin_code && dropLocation?.pin_code != null && dropLocation?.pin_code != 'null' && dropLocation?.pin_code != '' ? dropLocation?.pin_code + ", " : ''
                                }</Text>
                        </View>
                    </View>

                </View>
                <View style={styles.divider} />
                <View style={{ flexDirection: 'row' }}>
                    <FastImage source={!!orderInfo?.item_type?.icon ? { uri: orderInfo?.item_type?.icon } : Images.itemsImage} style={styles.icon}
                        resizeMode={FastImage.resizeMode.center} />
                    <View style={{ marginLeft: 10 }}>
                        <Text style={{ fontSize: 14, fontFamily: 'Poppins-Bold', color: '#4D4D4D' }}>Item Type</Text>
                        <Text style={{ fontSize: 13, fontFamily: 'Poppins-Medium', color: '#8B8B8B' }}>{orderInfo?.item_type?.name}</Text>
                    </View>
                </View>
                {!!orderInfo?.goods_image?.length &&
                    <>
                        <View style={styles.divider} />
                        <View style={{ flexDirection: 'row', width }}>
                            <FastImage
                                source={Images.Box1}
                                style={styles.icon}
                                resizeMode={FastImage.resizeMode.center}
                            /><View style={{ width: '75%' }}>
                                <Text style={{ marginLeft: 10, fontFamily: 'Poppins-Bold', fontSize: 14, color: '#4D4D4D' }}>Goods Images</Text>
                                {/* <View style={{ flexDirection: 'row' }}> */}
                                <ScrollView horizontal style={{ width: '100%' }} showsHorizontalScrollIndicator={false}>
                                    {console.log("images", orderInfo?.goods_image)}
                                    {orderInfo?.goods_image?.map((image, index) => {
                                        return (<View style={{ width: 75, height: 75 }} key={index}>
                                            {/* <Image source={{ uri: image }} style={{ width: 100, height: 100, resizeMode: 'center' }} /> */}
                                            <FastImage
                                                style={{ width: 75, height: 75 }}
                                                source={{
                                                    uri: image,
                                                    priority: FastImage.priority.normal, // Adjust priority as needed
                                                }}
                                                resizeMode={FastImage.resizeMode.center} // Adjust resizeMode as needed
                                            />
                                        </View>)
                                    })}
                                </ScrollView>
                            </View>
                        </View>
                    </>
                }
            </View>
        )
    }

    const BillingDetails = () => {
        return (
            <>
                <Text style={styles.billsHeadText}>Billing Details</Text>
                <View style={{ marginTop: 10, marginHorizontal: "5%", paddingBottom: 5, borderRadius: 7, borderWidth: 0.5, borderColor: '#EBEBEB', backgroundColor: '#fff', elevation: 5, paddingHorizontal: 15, paddingVertical: 10, marginBottom: 50 }}>
                    <View style={styles.billDetailsContainer}>
                        <View style={styles.billInfo}>
                            <Text style={styles.billDetailsText}>Ride Fare</Text>
                            <Text style={styles.billDetailsTextBold}>{`₹ ${orderInfo?.total_amount}`}</Text>
                        </View>
                        <View style={{ ...styles.billingDivider, backgroundColor: '#E2E2E2' }} />
                        {orderInfo?.discount && <>
                            <View style={styles.billInfo}>
                                <Text style={styles.billDetailsText}>Discount</Text>
                                <Text style={{ ...styles.billDetailsTextBold, color: '#AA8B56' }}>{`₹ ${orderInfo?.discount}`}</Text>
                            </View>
                            <View style={{ ...styles.billingDivider, backgroundColor: '#E2E2E2' }} />
                        </>
                        }
                        <View style={styles.billInfo}>
                            <Text style={styles.billDetailsText}>Tax & Charges</Text>
                            <Text style={styles.billDetailsTextBold}>{`₹ ${orderInfo?.tax}`}</Text>
                        </View>
                        <View style={{ ...styles.billingDivider, backgroundColor: '#AA8B56' }} />
                        <View style={styles.billInfo}>
                            <Text style={styles.billDetailsTextBold}>Grand Total</Text>
                            <Text style={styles.billDetailsTextBold}>{`₹ ${orderInfo?.total_amount_withtax}`}</Text>
                        </View>
                    </View>
                </View>
            </>
        )
    };

    const _driverImageHandler = () => {
        if (!!deliveryBoyPrevLocation && !!deliveryBoyLocation) {
            const direction = calculateMovementDirection(deliveryBoyPrevLocation, deliveryBoyLocation);
            switch (direction) {
                case 'up':
                    return '0deg'
                case 'down':
                    return '180deg'
                case 'left':
                    return '270deg'
                case 'right':
                    return '90deg'
                default:
                    return '0deg'
            }
        } else return '0deg'
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            setModal(false);
        }, 5000);
        return clearTimeout(timeout);
    }, [modal, setModal]);


    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar backgroundColor="#000" barStyle={'light-content'} networkActivityIndicatorVisible={true} />
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerTouchable} onPress={() => navigation.navigate('Home')}>
                    <FastImage source={Images.leftArrow} style={styles.leftArrow}
                        resizeMode={FastImage.resizeMode.contain} tintColor={'#03894E'} />
                    <Text style={styles.headerText} >Track Your Order</Text>
                </TouchableOpacity>
            </View>
            {orderInfo?.delivery_status < 5 && <><View style={{ height: height / 2, width, position: 'absolute', marginTop: 55 }}>
                {initialRegion && (
                    <MapView
                        style={{
                            flex: 1,
                            marginBottom: mapMarginBottom,
                            borderBottomRightRadius: 20,
                            borderBottomLeftRadius: 20,
                            paddingBottom: 30
                        }}
                        initialRegion={initialRegion}
                        showsUserLocation={true} // Optional: Show user's location with a blue dot
                        showsMyLocationButton={true}
                        showsCompass
                        onMapReady={_onMapReady}
                    >
                        <MapViewDirections
                            origin={{
                                latitude: orderInfo?.pickup_location?.[0]?.latitude,
                                longitude: orderInfo?.pickup_location?.[0]?.longitude
                            }}
                            destination={{
                                latitude: orderInfo?.drop_location?.[0]?.latitude,
                                longitude: orderInfo?.drop_location?.[0]?.longitude
                            }}
                            apikey={'AIzaSyAT-XE0L77pBWbwTL3PC04JUGSykZ3uB_Q'}
                            strokeColor={'#002259'}
                            strokeWidth={4}
                            optimizeWaypoints={true}
                            // onStart={onChangeRegion}
                            // lineDashPattern={[30]}
                            onReady={_onMapReady}
                        />
                        {orderInfo?.pickup_location?.[0] && <Marker
                            coordinate={{
                                latitude: parseFloat(orderInfo?.pickup_location?.[0]?.latitude),
                                longitude: parseFloat(orderInfo?.pickup_location?.[0]?.longitude)
                            }}
                            anchor={{ x: 0.5, y: 0.5 }}
                            flat={true}
                        >
                            <FastImage
                                source={Images.Location}
                                style={{
                                    resizeMode: 'center',
                                    position: 'absolute',
                                    // top: '50%',
                                    // left: '50%',
                                    zIndex: 9999,
                                    width: 30,
                                    height: 30,
                                    // marginLeft: -20,
                                    // marginTop: -35,
                                }}
                                tintColor={'tomato'}
                                resizeMode={FastImage.resizeMode.center}
                            />
                        </Marker>}
                        {orderInfo?.drop_location?.[0] && <Marker
                            coordinate={{
                                latitude: parseFloat(orderInfo?.drop_location?.[0]?.latitude),
                                longitude: parseFloat(orderInfo?.drop_location?.[0]?.longitude)
                            }}
                            anchor={{ x: 0.5, y: 0.5 }}
                            flat={true}
                        >
                            <FastImage
                                source={Images.Location}
                                style={{
                                    resizeMode: 'center',
                                    position: 'absolute',
                                    // top: '50%',
                                    // left: '50%',
                                    zIndex: 9999,
                                    width: 30,
                                    height: 30,
                                    // marginLeft: -20,
                                    // marginTop: -35,
                                }}
                                resizeMode={FastImage.resizeMode.center}
                            />
                        </Marker>}
                        {deliveryBoyDetails?.current_latitude && deliveryBoyDetails?.current_longitude && <Marker
                            coordinate={{
                                latitude: deliveryBoyDetails?.current_latitude ? parseFloat(deliveryBoyDetails?.current_latitude) : 0.00,
                                longitude: deliveryBoyDetails?.current_longitude ? parseFloat(deliveryBoyDetails?.current_longitude) : 0.00,
                            }}
                            anchor={{ x: 0.5, y: 0.5 }}
                            flat={true}
                        >
                            <FastImage
                                source={Images.Driver}
                                style={{
                                    transform: [{ rotate: _driverImageHandler() }],
                                    position: 'absolute',
                                    resizeMode: 'center',
                                    // top: '50%',
                                    // left: '50%',
                                    zIndex: 9999,
                                    width: 40,
                                    height: 40,
                                    // marginLeft: -20,
                                    // marginTop: -35,
                                }}
                                resizeMode={FastImage.resizeMode.center}
                            />
                        </Marker>}
                    </MapView>
                )}
            </View>
                <BottomSheet
                    ref={sheetRef}
                    snapPoints={snapPoints}
                >
                    <BottomSheetScrollView>
                        {!(deliveryBoyDetails.length || deliveryBoyDetails.name) && <SearchingDeliveryBoy />}
                        {!!(deliveryBoyDetails.length || deliveryBoyDetails.name) && <DeliveryBoydetails />}
                        {orderInfo && <ItemDetails />}
                        <BillingDetails />
                    </BottomSheetScrollView>
                </BottomSheet>
                <View >
                    {modal && (
                        <Modal transparent={true} visible={modal}>
                            <Loader />
                        </Modal>
                    )}
                </View>
            </>}
            {orderInfo?.delivery_status == 5 &&
                <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center' }}>
                    <LottieView source={Images.DeliverySuccess} autoPlay useNativeLooping loop style={{ width: "100%" }} />
                    <Text style={{ fontSize: 18, fontFamily: 'Poppins-Medium' }}>Order Delivered Successfully</Text>
                </View>}

            {/* {!orderInfo?.delivery_status && (
                <Modal transparent={true} visible={!orderInfo?.delivery_status}>
                    <Loader />
                </Modal>
            )} */}
        </SafeAreaView>
    )
}

export default PndOrderTrack

const styles = StyleSheet.create({
    billDetailsContainer: {
        // marginHorizontal: "5%",
        backgroundColor: '#FBFBFB',
        borderBottomWidth: 0.5,
        borderBottomColor: '#E0E0E075',
        borderRadius: 7,
    },
    billDetailsText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
    },
    billDetailsTextBold: {
        fontFamily: 'Poppins-Bold',

    },
    billingDivider: {
        width: "95%",
        height: 1,
        alignSelf: 'center'
    },
    billsHeadText: {
        fontFamily: 'Poppins-Bold',
        fontSize: 14,
        paddingTop: 25,
        // marginBottom: 10,
        marginLeft: '5%',
        color: '#000'

    },
    billInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 7,
        // borderBottomWidth: 1,
        // borderBottomColor: '#E2E2E2'
    },
    deliveryBoyContainer: {
        width: '75%',
        flexDirection: 'row',
        alignItems: 'center'
    },
    deliveryBoyDetails: {
        flexDirection: 'row',
        marginHorizontal: "5%",
        padding: 10,
        // paddingVertical: 20,
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: '#EBEBEB',
        borderRadius: 7,
        elevation: 5,
        backgroundColor: '#fff'
    },
    deliveryBoyImage: {
        width: 70,
        aspectRatio: 1,
        marginRight: 20
    },
    deliveryBoyName: {
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        color: '#8B8B8B'
    },
    deliveryBoyNameContainer: {
        // width: '60%'
    },
    deliveryBoySearching: {
        // height: 75,
        marginHorizontal: "5%",
        // padding: 10,
        borderWidth: 0.5,
        borderColor: '#EBEBEB',
        borderRadius: 7,
        elevation: 5,
        backgroundColor: '#fff',
        marginHorizontal: '5%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 7,
        marginBottom: 15
    },
    divider: {
        width: '95%',
        alignSelf: 'center',
        height: 1.5,
        backgroundColor: '#E8E8E8',
        marginBottom: 10,
        marginTop: 15
    },
    header: {
        width: '100%',
        height: 55,
        flexDirection: 'row',
        backgroundColor: '#FFE3E3',
        zIndex: 3
    },
    headerText: {
        marginLeft: 10,
        fontFamily: 'Poppins-Medium',
        fontSize: 17,
        color: '#03894E',
        marginTop: 5,
    },
    headerTouchable: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    icon: {
        width: 25,
        height: 25,
    },
    leftArrow: {
        width: 25,
        height: 25,
        tintColor: '#03894E',
        color: '#03894E'
    },
    phone: {
        width: 30,
        aspectRatio: 1,
    },
    phoneContainer: {
        width: '25%',
        alignItems: 'flex-end',
        paddingRight: 5
    },
    vehicleNumberText: {
        fontFamily: 'Poppins-Bold',
        fontSize: 16,
        color: '#4D4D4D',

    }
})