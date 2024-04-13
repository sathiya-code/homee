import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Image,
    Text,
    TouchableOpacity,
    PermissionsAndroid,
    Modal,
    ScrollView,
    Linking,
} from 'react-native';
import {
    mapPin,
    locationIcons,
    drawerIcon,
    mapBoy,
    callUsIcon,
    drawerFillIcon,
    bikeIcon,
    foodIcon,
    pickedIcon,
    buyIcon,
    moneyIcon,
    arrow,
} from '../assets/img/Images';
import { SafeAreaView } from 'react-native-safe-area-context';
import Geolocation from 'react-native-geolocation-service';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Geocoder from 'react-native-geocoding';
import { Dimensions, Platform, PixelRatio } from 'react-native';
import Loader from './Loader';
import { useFocusEffect } from '@react-navigation/core';
import { useTranslation } from 'react-i18next';
import { api } from '../services';
import { requestLocationPermission } from '../helper/location-permission';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const scale = SCREEN_WIDTH / 330;

function normalize(size) {
    const newSize = size * scale;
    if (Platform.OS === 'ios') {
        return Math.round(PixelRatio.roundToNearestPixel(newSize));
    } else {
        return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
    }
}

const TrackMap = ({ navigation, route }) => {
    const mapRef = useRef(null);
    Geocoder.init('AIzaSyBHkDZcJWMhylGafddN7JyQCpZfZRz9pO4');
    const [status, setStatus] = useState(1);
    const [addressLocation, setAddressLocation] = useState(null);
    const [addressComponent, setAddressComponent] = useState(null);
    const [latlong, setLatlong] = useState();
    const [addressGeometry, setAddressGeometry] = useState(null);
    const { t, i18 } = useTranslation();
    const [modal, setModal] = useState(true);
    const [orderDetails, setOrderDetails] = useState(null);
    const [OrderDelivery, setOrderDelivery] = useState(null);
    console.log("orderDetails", orderDetails?.delivery_status, new Date());
    const getOrderDetail = async () => {
        setModal(true);
        let response = await api.order_details(route?.params?.id);
        setModal(false);
        setOrderDetails(response?.order);
        setOrderDelivery(response?.order?.cook?.address);
        console.log(response.order.orderdetails);
    }

    useFocusEffect(
        React.useCallback(() => {
            getOrderDetail();
        }, [])
    );

    var latitude = addressGeometry?.lat;
    var longitude = addressGeometry?.lng;
    var longitudeDelta = addressGeometry?.longitudeDelta;
    var latitudeDelta = addressGeometry?.latitudeDelta;

    const dialCall = (number) => {
        let phoneNumber = ''
        if (Platform.OS === 'android') { phoneNumber = `tel:${number}`; }
        else { phoneNumber = `telprompt:${number}`; }
        Linking.openURL(phoneNumber);
    };

    const onChangeRegion = location => {
        setLatlong(location);
        updateAddress(location.latitude, location.longitude);
    };

    useEffect(() => {
        setInterval(() => {
            onChangeRegion
        }, 5000);
    }, [onChangeRegion])

    const updateAddress = (latitude, longitude) => {
        Geocoder.from(latitude, longitude)
            .then(json => {
                var addressDetail = json.results[0].formatted_address;
                setAddressLocation(addressDetail);
                setAddressGeometry(json.results[0].geometry.location)
                setAddressComponent(json.results[0].address_components[json.results[0].address_components.length - 1]);
            })
            .catch(error => console.warn(error));
    };

    // async function requestLocationPermission() {
    //     try {
    //         const granted = await PermissionsAndroid.request(
    //             PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    //             {
    //                 title: 'Example App',
    //                 message: 'Example App access to your location ',
    //             },
    //         );
    //         if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    //             setTimeout(() => {
    //                 getCurrentLocation();
    //             }, 1000);
    //         } else {
    //             alert('Location permission denied');
    //         }
    //     } catch (err) {
    //         console.warn(err);
    //     }
    // }

    const getCurrentLocation = () => {
        Geolocation.getCurrentPosition(location => {
            changeRegion(location.coords.latitude, location.coords.longitude);
            updateAddress(location.coords.latitude, location.coords.longitude);
        });
    };

    const changeRegion = (latitude, longitude) => {
        if (mapRef != null) {
            mapRef.current.animateToRegion(
                {
                    latitude: latitude,
                    longitude: longitude,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.0121,
                    locationUpdateInterval: 5000,
                    fastestLocationUpdateInterval: 5000,
                    allowIdenticalLocations: true,
                },
                5000,
            );
        }
    };

    const onMapReady = () => {
        requestLocationPermission();
    };
    useEffect(() => {
        const intervalCall = setInterval(() => {
            getCurrentLocation()
            getOrderDetail();
        }, 10000);
        return () => {
            clearInterval(intervalCall);
        };
    }, [getOrderDetail]);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#09b44d',
                    height: 60,
                    borderBottomLeftRadius: 25,
                    borderBottomRightRadius: 25,
                }}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{
                        paddingHorizontal: 15,
                        paddingVertical: 15,
                    }}>
                    <Image style={{ width: 10, height: 18 }} source={arrow} />
                </TouchableOpacity>
                <Text style={{
                    color: '#fff',
                    fontSize: 18,
                    fontFamily: 'Poppins-Bold',
                    marginLeft: 10,
                    marginTop: 5,
                }}>Order Track</Text>
            </View>
            {orderDetails != null &&
                <>
                    <View style={{ flex: 5 }}>
                        <MapView
                            initialRegion={{
                                latitude: 13.00751825313232,
                                longitude: 80.25387849187547,
                                latitudeDelta: 0.015,
                                longitudeDelta: 0.0121,
                            }}
                            ref={mapRef}
                            provider={PROVIDER_GOOGLE}
                            style={{
                                height: '100%',
                                width: '100%',
                                justifyContent: 'flex-end'
                            }}
                            scrollEnabled={true}
                            showsCompass={true}

                            compassOffset={{ x: 1, y: 1 }}
                            showsUserLocation={true}
                            showsUserLocationButton={true}
                            zoomEnabled={true}
                            // onRegionChangeComplete={onChangeRegion}
                            onMapReady={onMapReady}
                        // drawerIcon={mapPin}
                        >
                            {orderDetails?.delivery &&
                                <>
                                    {orderDetails?.delivery?.status == 1 || orderDetails?.delivery?.status == 2
                                        ?
                                        <MapViewDirections
                                            origin={{
                                                latitude: orderDetails?.delivery?.deliveryboy?.current_latitude ? parseFloat(orderDetails?.delivery?.deliveryboy?.current_latitude) : parseFloat(orderDetails?.delivery?.deliveryboy?.latitude),
                                                longitude: orderDetails?.delivery?.deliveryboy?.current_longitude ? parseFloat(orderDetails?.delivery?.deliveryboy?.current_longitude) : parseFloat(orderDetails?.delivery?.deliveryboy?.longitude)
                                            }}
                                            destination={{
                                                latitude: parseFloat(orderDetails?.cook?.address?.latitude),
                                                longitude: parseFloat(orderDetails?.cook?.address?.longitude)
                                            }}
                                            apikey={'AIzaSyBHkDZcJWMhylGafddN7JyQCpZfZRz9pO4'}
                                            strokeColor={'#09b44d'}
                                            strokeWidth={5}
                                            optimizeWaypoints={true}
                                            // onStart={onChangeRegion}
                                            // lineDashPattern={[30]}
                                            onReady={onMapReady}
                                        /> : orderDetails?.delivery?.status >= 4 ? null : <MapViewDirections
                                            origin={{
                                                latitude: orderDetails?.delivery?.deliveryboy?.current_latitude ? parseFloat(orderDetails?.delivery?.deliveryboy?.current_latitude) : parseFloat(orderDetails?.delivery?.deliveryboy?.latitude),
                                                longitude: orderDetails?.delivery?.deliveryboy?.current_longitude ? parseFloat(orderDetails?.delivery?.deliveryboy?.current_longitude) : parseFloat(orderDetails?.delivery?.deliveryboy?.longitude)
                                            }}
                                            destination={{
                                                latitude: parseFloat(orderDetails?.address_info?.latitude),
                                                longitude: parseFloat(orderDetails?.address_info?.longitude)
                                            }}
                                            apikey={'AIzaSyBHkDZcJWMhylGafddN7JyQCpZfZRz9pO4'}
                                            strokeColor={'#09b44d'}
                                            strokeWidth={5}
                                            optimizeWaypoints={true}
                                            // onStart={onChangeRegion}
                                            // lineDashPattern={[30]}
                                            onReady={onMapReady}
                                        />
                                    }
                                    {/* {status == 3 || status == 4 || status == 5
                        ?
                        <MapViewDirections
                            origin={{ latitude: latitude ? latitude : 0, longitude: longitude ? longitude : 0, longitudeDelta: longitudeDelta ? longitudeDelta : 0, latitudeDelta: latitudeDelta ? latitudeDelta : 0 }}
                            destination={{
                                latitude: 13.050985,
                                longitude: 80.208726,
                            }}
                            apikey={'AIzaSyBHkDZcJWMhylGafddN7JyQCpZfZRz9pO4'}
                            strokeColor={'#09b44d'}
                            strokeWidth={5}
                            optimizeWaypoints={true}
                            // onStart={onChangeRegion}
                            // lineDashPattern={[30]}
                            onReady={onMapReady}
                        /> : null
                    } */}
                                    {orderDetails?.delivery?.status >= 1 &&
                                        <Marker
                                            coordinate={{
                                                latitude: orderDetails?.delivery?.deliveryboy?.current_latitude ? parseFloat(orderDetails?.delivery?.deliveryboy?.current_latitude) : parseFloat(orderDetails?.delivery?.deliveryboy?.latitude),
                                                longitude: orderDetails?.delivery?.deliveryboy?.current_longitude ? parseFloat(orderDetails?.delivery?.deliveryboy?.current_longitude) : parseFloat(orderDetails?.delivery?.deliveryboy?.longitude),
                                            }}
                                            anchor={{ x: 0.5, y: 0.5 }}
                                            flat={true}
                                        >
                                            <Image
                                                source={mapBoy}
                                                style={{
                                                    position: 'absolute',
                                                    // top: '50%',
                                                    // left: '50%',
                                                    zIndex: 1030,
                                                    width: 40,
                                                    height: 40,
                                                    // marginLeft: -20,
                                                    // marginTop: -35,
                                                }}
                                                title={'title'}
                                                description={'description'}
                                            />
                                        </Marker>
                                    }
                                    {orderDetails?.delivery?.status == 1 || orderDetails?.delivery?.status == 2 ? <Marker coordinate={{
                                        latitude: parseFloat(orderDetails?.cook?.address?.latitude),
                                        longitude: parseFloat(orderDetails?.cook?.address?.longitude),
                                    }} /> : orderDetails?.delivery?.status >= 4 ? null : <Marker coordinate={{
                                        latitude: parseFloat(orderDetails?.address_info?.latitude),
                                        longitude: parseFloat(orderDetails?.address_info?.longitude),
                                    }} />
                                    }
                                </>
                            }
                        </MapView>
                    </View>
                    {orderDetails?.delivery?.status <= 5 &&
                        orderDetails?.delivery &&

                        <View style={{
                            backgroundColor: '#09b44d',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTopLeftRadius: 15,
                            borderTopRightRadius: 15,
                            paddingHorizontal: 25

                        }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <View style={{ backgroundColor: '#fff', borderRadius: 50, margin: 5, borderColor: '#8af5f5f5', borderWidth: 1.5 }}>
                                    <Image
                                        source={{ uri: orderDetails?.delivery?.deliveryboy?.image }}
                                        style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 50
                                        }} />
                                </View>
                                <View style={{ marginHorizontal: 10 }}>
                                    <Text style={{ color: '#8af5f5f5', fontSize: 12, fontFamily: 'Poppins-Regular', }}>
                                        Your Delivery Partner
                                    </Text>
                                    <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Poppins-Bold' }}>
                                        {orderDetails?.delivery?.deliveryboy?.name}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity disabled={orderDetails?.delivery?.status >= 5 ? true : false} onPress={() => { dialCall(orderDetails?.delivery?.deliveryboy?.mobile) }}>
                                <Image
                                    source={callUsIcon}
                                    style={{
                                        width: 18,
                                        height: 20,
                                        borderRadius: 50,
                                        tintColor: '#fff',
                                        resizeMode: 'stretch',
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                    }

                    {orderDetails?.delivery &&
                        <View
                            style={{
                                backgroundColor: '#fff',
                                // zIndex: 11,
                                borderColor: '#e5e5e5',
                                // borderWidth: 2,
                                paddingBottom: 0,
                                flex: 1,
                                // flexDirection: 'row',
                                // justifyContent: 'center',
                                paddingTop: 15,
                                alignItems: 'center',
                                paddingHorizontal: 20
                            }}>
                            <View style={{
                                flexDirection: 'row', justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                {/* <View
                                    style={{
                                        backgroundColor: orderDetails?.delivery?.status >= 1 ? '#09b44d' : '#c5c5c5',
                                        borderRadius: 50,
                                        width: 35,
                                        height: 35,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                    <Image
                                        source={bikeIcon}
                                        style={{
                                            width: 25,
                                            height: 25,
                                            tintColor: '#fff',
                                        }}
                                    />
                                </View>
                                <View style={{
                                    flex: 1,
                                    backgroundColor: orderDetails?.delivery?.status >= 1 ? '#09b44d' : '#c5c5c5',
                                    height: 1
                                }}></View> */}
                                <View>
                                    <View
                                        style={{
                                            backgroundColor: orderDetails?.delivery_status >= 4 ? '#09b44d' : '#c5c5c5',
                                            borderRadius: 50,
                                            width: 35,
                                            height: 35,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}>
                                        <Image
                                            source={foodIcon}
                                            style={{
                                                width: 25,
                                                height: 25,
                                                tintColor: '#fff',
                                            }}
                                        />
                                    </View>
                                    <Text style={{ position: 'absolute', width: 100, marginTop: 35, marginLeft: -10, color: orderDetails?.delivery_status >= 3 ? '#09b44d' : '#c5c5c5', }}>Preparing</Text>
                                </View>
                                <View style={{
                                    flex: 1,
                                    backgroundColor: orderDetails?.delivery_status >= 5 ? '#09b44d' : '#c5c5c5',
                                    height: 1
                                }}></View>
                                <View>
                                    <View
                                        style={{
                                            backgroundColor: orderDetails?.delivery_status >= 5 ? '#09b44d' : '#c5c5c5',
                                            borderRadius: 50,
                                            width: 35,
                                            height: 35,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}>
                                        <Image
                                            source={pickedIcon}
                                            style={{
                                                width: 22,
                                                height: 22,
                                                tintColor: '#fff',
                                            }}
                                        />
                                    </View>
                                    <Text style={{ position: 'absolute', width: 100, marginTop: 35, marginLeft: -10, color: orderDetails?.delivery_status >= 5 ? '#09b44d' : '#c5c5c5', }}>Picked-up </Text>

                                </View>
                                <View style={{ flex: 1, backgroundColor: orderDetails?.delivery_status >= 6 ? '#09b44d' : '#c5c5c5', height: 1 }}></View>
                                <View>
                                    <View
                                        style={{
                                            backgroundColor: orderDetails?.delivery_status >= 6 ? '#09b44d' : '#c5c5c5',
                                            borderRadius: 50,
                                            width: 35,
                                            height: 35,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}>
                                        <Image
                                            source={buyIcon}
                                            style={{
                                                width: 22,
                                                height: 22,
                                                tintColor: '#fff',
                                            }}
                                        />
                                    </View>
                                    <Text style={{ position: 'absolute', width: 100, marginTop: 35, marginLeft: -10, color: orderDetails?.delivery_status >= 6 ? '#09b44d' : '#c5c5c5', }}>Delivered</Text>

                                </View>
                                {/* <View style={{ flex: 1, backgroundColor: orderDetails?.delivery?.status >= 4 ? '#09b44d' : '#c5c5c5', height: 1 }}></View>
                                <View
                                    style={{
                                        backgroundColor: orderDetails?.delivery?.status >= 5 ? '#09b44d' : '#c5c5c5',
                                        borderRadius: 50,
                                        width: 35,
                                        height: 35,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                    <Image
                                        source={moneyIcon}
                                        style={{
                                            width: 25,
                                            height: 25,
                                            tintColor: '#fff',
                                        }}
                                    />
                                </View> */}
                            </View>
                        </View>
                    }

                    {orderDetails?.delivery && <>
                        <View style={{ width: '100%', backgroundColor: '#fff', paddingTop: 5, paddingBottom: 25, justifyContent: 'center', paddingLeft: 10 }}>
                            <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 16 }}>{orderDetails?.delivery_status < 3 ? `Your Order is being Prepared From:` : 'Your Order From - '} <Text style={{ fontFamily: 'Poppins-Bold' }}>{orderDetails?.cook?.first_name}</Text></Text>

                            <View style={{ marginTop: 7, }}>
                                <Text style={{ fontFamily: 'Poppins-Medium', color: '#ff9100' }}>Order Details:</Text>
                                {orderDetails?.orderdetails?.map(item => {
                                    const itemInfo = JSON.parse(item?.item_info);
                                    console.log("item: ", item?.menuitem?.englanguage?.name);
                                    return <Text style={{ fontFamily: 'Poppins-Regular', marginLeft: 10 }}>{`➣ ${item?.menuitem?.englanguage?.name}    x   ${item?.quantity}`}</Text>
                                })}
                            </View>
                        </View>
                    </>}
                </>
            }
            {modal && (
                <Modal transparent={true} visible={modal}>
                    <Loader />
                </Modal>
            )}

        </SafeAreaView>
    )
}

export default TrackMap;