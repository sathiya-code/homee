import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    ActivityIndicator,
    Image,
    Text,
    ToastAndroid,
    TouchableOpacity,
    PermissionsAndroid,
    Modal,
    TextInput,
    Pressable,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { mapPin, locationImage, arrow } from '../assets/img/Images';
import Geocoder from 'react-native-geocoding';
import Loader from './Loader';
import RadioGroup, { RadioButtonProps } from 'react-native-radio-buttons-group';
import { api, storage } from '../services';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { set_Profile } from '../redux/actions/authAction';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedSearchbox from '../helper/animatedSearchBar';
const EditAddress = ({ navigation, route }) => {
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    Geocoder.init('AIzaSyBHkDZcJWMhylGafddN7JyQCpZfZRz9pO4');
    const mapRef = useRef(null);
    const [modal, setModal] = useState(false);
    const [street, setStreet] = useState(route?.params?.street);
    const [street_err, setStreet_err] = useState(null);
    const [door, setDoor] = useState(route?.params?.door_no);
    const [door_err, setDoor_err] = useState(null);

    const [addressLocation, setAddressLocation] = useState(null);
    const [EditLocation, setEditLocation] = useState(null);
    const [addressComponent, setAddressComponent] = useState(null);
    const [searchIconColor, setSearchIconColor] = useState('#fff')
    const searchBoxRef = useRef(null);

    var editLoc = {
        editLat: route?.params?.latitude,
        editLong: route?.params?.longitude,
    };

    const onChangeRegion = location => {
        updateAddress(location.latitude, location.longitude);
        setEditLocation(location);
    };

    const updateAddress = (latitude, longitude) => {
        Geocoder.from(latitude, longitude)
            .then(json => {
                var addressDetail = json.results[0].formatted_address;
                setAddressLocation(addressDetail);
                setAddressComponent(json.results[0].address_components);
            })
            .catch(error => console.warn(error));
    };

    const updateLocation = (data, address = null) => {
        Geocoder.from(address.formatted_address)
            .then(json => {
                var location = json.results[0].geometry.location;
                changeRegion(location.lat, location.lng);
            })
            .catch(error => console.warn(error));
    };

    const addrConfirm = async () => {
        console.log("edit locationnn", EditLocation, editLoc);
        if (street_err) {
            ToastAndroid.show('Enter Your Street', ToastAndroid.SHORT)
            // alert("Enter your street");
        } else if (door_err) {
            ToastAndroid.show('Enter Your Door No', ToastAndroid.SHORT)
        } else {
            var address_type = null;
            radioButtons.map((item, index) => {
                if (item.selected == true) {
                    address_type = item.value;
                }
            });
            var payload = {
                door_no: door,
                street: street,
                address_type: address_type,
                address: JSON.stringify(addressComponent),
                longitude: EditLocation.longitude ? EditLocation.longitude : editLoc?.editLong,
                latitude: EditLocation.latitude ? EditLocation.latitude : editLoc?.editLat,
            }
            setModal(true);
            let response = await api.addressEdit(payload, route?.params?.id);
            setModal(false);
            if (response.status == 'success') {
                let res = await api.userDetail();
                storage.setUserData(res.user);
                dispatch(set_Profile(res.user));
                navigation.navigate('Home');
            }
        }
    };

    async function requestLocationPermission() {
        try {
            if (Platform.OS === "ios") {
                // your code using Geolocation and asking for authorisation with
                getCurrentLocation();
                Geolocation.setRNConfiguration({
                    skipPermissionRequests: false,
                    authorizationLevel: 'whenInUse' | 'auto',
                });
                Geolocation.requestAuthorization()
            } else {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Homee',
                        message: 'Homee access to your location ',
                    },
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    setTimeout(() => {
                        changeRegion(editLoc.editLat, editLoc.editLong);
                    }, 1000);
                } else {
                    alert('Location permission denied');
                }
            }
        } catch (err) {
        }
    }

    const getCurrentLocation = () => {
        Geolocation.getCurrentPosition(location => {
            changeRegion(location.coords.latitude, location.coords.longitude);
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
                },
                1000,
            );
        }
    };

    const onMapReady = () => {
        requestLocationPermission();
    };
    const StreetChange = e => {
        setStreet(e);
        if (e == null || e == "") {
            setStreet_err(true);
        } else {
            setStreet_err(false);
        }
    };
    const doorChange = e => {
        setDoor(e);
        if (e == null || e == "") {
            setDoor_err(true);
        } else {
            setDoor_err(false);
        }
    };
    const radioButtonsData = [
        {
            id: '1',
            label: 'Home',
            value: 'Home',
            selected: route?.params?.type == "Home" || route?.params?.type == "home" ? true : false,
        },
        {
            id: '2',
            label: 'Work',
            value: 'Work',
            selected: route?.params?.type == "Work" || route?.params?.type == "work" ? true : false,
        },
        {
            id: '3',
            label: 'Other',
            value: 'Other',
            selected: route?.params?.type == "Other" || route?.params?.type == "other" ? true : false,
        },
    ];
    const [radioButtons, setRadioButtons] = useState(radioButtonsData);

    const onPressRadioButton = radioButtonsArray => {
        setRadioButtons(radioButtonsArray);
    };
    const openSearchBox = () => searchBoxRef.open();
    const closeSearchBox = () => searchBoxRef.close();
    return (
        <SafeAreaView style={{ flex: 1, flexDirection: 'column', backgroundColor: '#fff' }}>
            <View
                style={{
                    backgroundColor: '#09b44d',
                    // borderBottomLeftRadius: 25,
                    // borderBottomRightRadius: 25,
                    justifyContent: 'center',
                    height: 50
                }}>
                <Pressable
                    onPress={() => navigation.goBack()}
                    style={{
                        flexDirection: 'row',
                        paddingHorizontal: 15,
                        height: 30,
                        alignItems: 'center'
                    }}>
                    <Image style={{ width: 9, height: 16 }} source={arrow} />
                    <Text style={{
                        color: '#fff',
                        fontSize: 18,
                        fontFamily: 'Poppins-Bold',
                        paddingLeft: 10,
                        // marginTop: -5
                    }}>Choose Location</Text>
                </Pressable>
            </View>
            <View
                style={{
                    position: 'absolute', top: 0, left: 0, zIndex: 111, width: '100%', backgroundColor: '#fff', marginTop: 50
                }}>
                <GooglePlacesAutocomplete
                    placeholder="Search Your Locality"
                    minLength={2}
                    autoFocus={false}
                    returnKeyType={'search'}
                    listViewDisplayed="auto"
                    fetchDetails={true}
                    renderDescription={row => row.description}
                    onPress={updateLocation}
                    getDefaultValue={() => ''}
                    currentLocation={false}
                    currentLocationLabel="Current location"
                    nearbyPlacesAPI="GooglePlacesSearch"
                    GoogleReverseGeocodingQuery={{}}
                    enablePoweredByContainer={false}
                    GooglePlacesSearchQuery={{
                        rankby: 'distance',
                        type: 'cafe',
                    }}
                    GooglePlacesDetailsQuery={{ fields: 'formatted_address' }}
                    filterReverseGeocodingByTypes={[
                        'locality',
                        'administrative_area_level_3',
                    ]}
                    debounce={200}
                    query={{
                        key: 'AIzaSyBHkDZcJWMhylGafddN7JyQCpZfZRz9pO4',
                        language: 'en',
                        type: 'establishment',
                    }}
                    textInputProps={{
                        placeholderTextColor: '#000',
                        returnKeyType: "search"
                    }}
                    styles={{
                        textInputContainer: {
                            paddingBottom: 5,
                            paddingHorizontal: 10,
                            backgroundColor: '#09b44d',
                        },
                        textInput: {
                            height: 38,
                            color: '#5d5d5d',
                            fontSize: 16,
                        },
                        predefinedPlacesDescription: {
                            color: '#1faadb',
                        },
                    }}
                />
            </View>

            <View style={{ flex: 7, width: '100%', marginTop: 50 }}>
                <MapView
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                    initialRegion={{
                        latitude: parseFloat(editLoc.editLat),
                        longitude: parseFloat(editLoc.editLong),
                        latitudeDelta: 0.015,
                        longitudeDelta: 0.0121,
                    }}
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE}
                    style={{
                        height: '100%',
                        width: '100%',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                    }}
                    showsCompass
                    zoomTapEnabled
                    zoomControlEnabled
                    showsPointsOfInterest
                    // showsTraffic
                    // showsUserLocation={true}
                    showsUserLocationButton={true}
                    zoomEnabled={true}
                    onRegionChangeComplete={onChangeRegion}
                    onMapReady={onMapReady}
                />
                <Image
                    source={mapPin}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        zIndex: 2,
                        width: 40,
                        height: 40,
                        marginLeft: -20,
                        marginTop: -35,
                    }}
                    title={'title'}
                    description={'description'}
                />

                {/* <TouchableOpacity
                style={{
                    position: 'absolute',
                    top: 50,
                    right: 10,
                    width: 40,
                    height: 40,
                    backgroundColor: '#fff',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 50,
                }}
                onPress={getCurrentLocation}
                accessibilityLabel="Learn more about this purple button">
                <Image
                    source={locationImage}
                    style={{ width: 25, height: 25, tintColor: '#000' }}
                />
            </TouchableOpacity> */}
            </View>
            <View
                style={{
                    // flex:3.5,
                    height: 'auto',
                    width: '100%',
                    backgroundColor: '#fff',
                    zIndex: 11,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderTopLeftRadius: 5,
                    borderTopRightRadius: 5,
                    borderColor: '#e5e5e5',
                    borderWidth: 2,
                    paddingHorizontal: 25,
                    paddingBottom: 20,
                }}>
                <Text
                    style={{
                        width: '100%',
                        fontFamily: 'Poppins-Bold',
                        fontSize: 14,
                        textAlign: 'justify',
                        marginTop: 15,
                    }}>
                    {t('addressPage.deliveryLocation')}
                </Text>
                <Text
                    style={{
                        width: '100%',
                        fontFamily: 'Poppins-Regular',
                        fontSize: 13,
                        lineHeight: 21,
                        textAlign: 'justify',
                        // paddingBottom: 10,
                        paddingTop: 5,
                        // height: 80,
                    }}>
                    {addressLocation}
                </Text>
                <View>
                    <TextInput
                        value={door}
                        onChangeText={doorChange}
                        placeholder="Enter your Door No*"
                        placeholderTextColor={'#000'}
                        style={{
                            borderColor: '#09b44d',
                            borderStyle: 'solid',
                            borderWidth: 1,
                            paddingVertical: 5,
                            paddingHorizontal: 15,
                            marginBottom: 3,
                            width: 250,
                            borderRadius: 7,
                            color: '#000',
                        }}
                    />
                </View>
                {door_err && (
                    <Text style={{ color: 'tomato', marginLeft: 10, marginBottom: 10 }}>
                        Please Enter Door Number
                    </Text>
                )}
                <View>
                    <TextInput
                        value={street}
                        onChangeText={StreetChange}
                        placeholder="Enter your street Name*"
                        placeholderTextColor={'#000'}
                        style={{
                            borderColor: '#09b44d',
                            borderStyle: 'solid',
                            borderWidth: 1,
                            paddingVertical: 5,
                            paddingHorizontal: 15,
                            marginVertical: 5,
                            width: 250,
                            borderRadius: 7,
                            color: '#000',
                        }}
                    />
                </View>
                {street_err && (
                    <Text style={{ color: 'tomato', marginLeft: 10 }}>
                        {t('addressPage.streetErr')}
                    </Text>
                )}
                <View style={{ margin: 10 }}>
                    <RadioGroup
                        layout="row"
                        radioButtons={radioButtons}
                        onPress={onPressRadioButton}
                    />
                </View>
                {/* <View style={{ width: 250, height: 250, backgroundColor: 'red' }}></View>
                <AnimatedSearchbox
                    ref={searchBoxRef}
                    placeholder={'Search...'}
                    searchIconColor={searchIconColor}
                    onClosed={() => { setSearchIconColor('#fff') }}
                    onOpening={() => { { setSearchIconColor('#555') } }} /> */}
                <TouchableOpacity
                    disabled={street == null ? true : false}
                    style={{
                        backgroundColor: street == null ? '#D1F0DD' : '#09b44d',
                        borderRadius: 40,
                        padding: 10,
                        margin: 0,
                    }}
                    onPress={addrConfirm}>
                    <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 14, color: '#fff' }}>
                        {t('addressPage.confirmAddress')}
                    </Text>
                </TouchableOpacity>
                {modal && (
                    <Modal animationType="fade" transparent={true} visible={modal}>
                        <Loader></Loader>
                    </Modal>
                )}
            </View>
        </SafeAreaView>
    );
};

export default EditAddress;
