import React, {useEffect, useState, useRef, useMemo, useContext} from 'react';
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
  Platform,
  Alert,
  Pressable,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import {
  mapPin,
  locationImage,
  arrow,
  location_loading,
  ContactBook,
} from '../assets/img/Images';
// import Geocoder from 'react-native-geocoding';
import Loader from './Loader';
import RadioGroup, {RadioButtonProps} from 'react-native-radio-buttons-group';
import {api, storage} from '../services';
import axios from 'axios';
import {useDispatch} from 'react-redux';
import {set_Profile} from '../redux/actions/authAction';
import {useTranslation} from 'react-i18next';
import {SafeAreaView} from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
// import LocationEnabler from 'react-native-location-enabler';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {useCallback} from 'react';
import Contacts from 'react-native-contacts';
import {checkContactPermissionStatus} from '../helper/checkContactsPermission';
import ContactsModal from '../helper/contactsModal';
import {
  checkLocationEnabled,
  enableLocationHandler,
} from '../helper/location-permission';
import {PndContext} from '../context/pnd.context';
import {formatAddress} from '../helper/addressFormatter';

// const {
//   PRIORITIES: { HIGH_ACCURACY },
//   useLocationSettings,
// } = LocationEnabler;

const {width, height} = Dimensions.get('screen');

const Address = ({navigation, route}) => {
  console.log('address started');
  const {t, i18n} = useTranslation();
  const dispatch = useDispatch();
  // Geocoder.init('AIzaSyAT-XE0L77pBWbwTL3PC04JUGSykZ3uB_Q');
  const mapRef = useRef(null);
  const [modal, setModal] = useState(false);
  const [street, setStreet] = useState(null);
  const [street_err, setStreet_err] = useState(null);
  const [door, setDoor] = useState(route?.params?.door_no);
  const [door_err, setDoor_err] = useState(null);
  const [autoProceed, setAutoProceed] = useState(1);
  const [mobile, setMobile] = useState(null);
  const [userName, setUserName] = useState(null);
  const [addressType, setAddressType] = useState('');
  const [visible, setVisible] = useState(false);

  const [others, setOthers] = useState(null);

  const [addressLocation, setAddressLocation] = useState(null);
  const [EditLocation, setEditLocation] = useState(null);
  const [addressComponent, setAddressComponent] = useState(null);

  const address = route?.params?.address;
  const [addressEditTempFix, setAddressEditTempFix] = useState(0);
  const [mapMarginBottom, setMapMarginBottom] = useState(1);

  const {setPickupAddressId, setDropAddressId} = useContext(PndContext);

  useEffect(() => {
    console.log('addrestempfix', addressEditTempFix);
    if (!!address && addressEditTempFix === 0) {
      console.log('address.typeaddress.type', address.type);
      setDoor(address.door_no);
      setStreet(address.street);
      const radioButtonsData = [
        {
          id: '1',
          label: 'Home',
          value: 'Home',
          selected:
            address?.type == 'Home' || address?.type == 'home' ? true : false,
        },
        {
          id: '2',
          label: 'Work',
          value: 'Work',
          selected:
            address?.type == 'Work' || address?.type == 'work' ? true : false,
        },
        {
          id: '3',
          label: 'Other',
          value: 'Other',
          selected:
            address?.type == 'Other' || address?.type == 'other' ? true : false,
        },
      ];
      setRadioButtons(radioButtonsData);
      if (
        address.type != 'Home' &&
        address.type != 'home' &&
        address.type != 'Work' &&
        address.type != 'work'
      ) {
        setOthers(true);
        setAddressType(address.type);
      }
      setTimeout(() => {
        setAddressEditTempFix(1);
      }, 1500);
    }
  }, []);

  // const [enabled, requestResolution] = useLocationSettings(
  //   {
  //     priority: HIGH_ACCURACY, // default BALANCED_POWER_ACCURACY
  //     alwaysShow: true, // default false
  //     needBle: true, // default false
  //   },
  //   false /* optional: default undefined */
  // );

  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ['30%', '40%', '50%', '60%'], []);
  const addressAddType = route?.params?.type;
  const pndAddressSelectType = route?.params?.addressSelectType;
  console.log('addressSelectType', pndAddressSelectType);

  // useEffect(() => {
  //   const keyboardDidShowListener = Keyboard.addListener(
  //     'keyboardDidShow',
  //     keyboardDidShow,
  //   );
  //   const keyboardDidHideListener = Keyboard.addListener(
  //     'keyboardDidHide',
  //     keyboardDidHide,
  //   );

  //   return () => {
  //     keyboardDidShowListener.remove();
  //     keyboardDidHideListener.remove();
  //   };
  // }, []);

  // const keyboardDidShow = event => {
  //   const height = event.endCoordinates.height;
  //   // sheetRef?.current?.snapToIndex(5)
  //   // setKeyboardHeight(height);
  // };

  // const keyboardDidHide = () => {
  //   // sheetRef?.current?.snapToIndex(3)
  //   // setKeyboardHeight(0);
  // };

  // const handleAddressModel = (type) => {
  //   console.log("typeeee", type);
  //   // sheetRef.current?.present();
  //   setAddressSelectType(type);
  //   sheetRef.current?.snapToIndex(2);
  // }

  // const handleSheetChanges = useCallback(index => {
  //   console.log('handleSheetChanges', index);
  // }, []);
  // const handleModalClose = useCallback(() => {
  //   sheetRef.current?.close();
  //   imageModalSheetRef.current?.close();
  //   setAddressSelectType(null);
  //   setIsGoodsImgModalOpen(false);
  // });

  // useEffect(() => {
  //   { !enabled && requestResolution() }
  // }, [])

  useEffect(() => {
    (async () => {
      const isLocationEnabled = await checkLocationEnabled();
      if (!isLocationEnabled) {
        await enableLocationHandler();
      }
    })();
  }, []);

  useEffect(() => {
    !!route?.params?.auto_detected && setModal(true);
    onChangeRegion();
  }, []);

  const onChangeRegion = (location = null) => {
    console.log('location', location);
    if (!!address && addressEditTempFix === 0) {
      // !!address?.latitude ? parseFloat(address.latitude)
      updateAddress(parseFloat(address.latitude), parseFloat(address.longitude));
      setEditLocation(address);
    }
    if (!!location) {
      updateAddress(location.latitude, location.longitude);
      setEditLocation(location);
    }
  };

  const updateAddress = async (latitude, longitude) => {
    const parsedAddress = await mapRef.current.addressForCoordinate({
      latitude,
      longitude,
    });
    console.log('parsed', parsedAddress);
    const formattedAddress = formatAddress(parsedAddress);
    setAddressLocation(formattedAddress);
    setAddressComponent(parsedAddress);
  };

  const updateLocation = (data, address = null) => {
    console.log('daaaaaaaaaaaa', address);
    changeRegion(address?.geometry?.location?.lat, address?.geometry?.location?.lng);
    // Geocoder.from(address.formatted_address)
    //   .then(json => {
    //     var location = json.results[0].geometry.location;
    //   })
    //   .catch(error => console.warn(error));
  };
  // console.log("ran", route?.params);

  const addrConfirm = async () => {
    // console.log("locationnnn", addressLocation);
    // console.log("locationnnn comp", addressComponent);
    var address_type = null;
    radioButtons.map((item, index) => {
      if (item.selected == true) {
        address_type = item.value;
      }
    });
    if (street_err) {
      ToastAndroid.show('Enter Your Street', ToastAndroid.SHORT);
      // alert("Enter your street");
      setModal(false);
    } else if (door_err) {
      ToastAndroid.show('Enter Your Door No', ToastAndroid.SHORT);
      setModal(false);
    } else if (addressAddType == 'PND' && !mobile) {
      ToastAndroid.show('Enter Mobile Number', ToastAndroid.SHORT);
    } else if (addressAddType == 'PND' && !userName) {
      ToastAndroid.show('Enter Name', ToastAndroid.SHORT);
    } else {
      // console.warn('route.params.auto_detected', route.params);
      if (!!route?.params?.type && route?.params?.type == 'PND') {
        var parload = {
          door_no: door,
          street: street,
          address_type: !!addressType.length ? addressType : address_type,
          address: JSON.stringify(addressComponent),
          longitude: EditLocation.longitude,
          latitude: EditLocation.latitude,
          mobile,
          name: userName,
        };
        console.log('payloadd', parload);
        let response = await api.pndAddAddresses(parload);

        if ((response.status = 'success')) {
          const type = route?.params?.type;
          const addressSelectType = route?.params?.addressSelectType;
          const addressId = route?.params?.address?.id;
          console.log('tttttttttttttttttttt', {
            type,
            addressSelectType,
            addressId,
          });
          if (addressSelectType == 'pickup') {
            setPickupAddressId(response.user_address_id);
          }
          if (addressSelectType == 'drop') {
            setDropAddressId(response.user_address_id);
          }
          navigation.navigate('PickAndDrop', {
            type,
            addressSelectType,
            addressId,
          });
        } else {
          Alert.alert('Unable to complete your request, try again later');
        }
      } else if (!!route?.params?.type && route?.params?.type != 'PND') {
        var parload = {
          door_no: door,
          street: street,
          address_type: addressType.length > 1 ? addressType : address_type,
          address: JSON.stringify(addressComponent),
          longitude: EditLocation.longitude,
          latitude: EditLocation.latitude,
          mobile,
          name: userName,
        };
        console.log('payloadd', parload);
        let response = await api.address(parload);

        if (response.status == 'success') {
          navigation.navigate('Home');
        } else {
          Alert.alert('Unable to complete your request, try again later');
        }
      } else if (
        !!route?.params?.auto_detected &&
        addressLocation &&
        addressComponent
      ) {
        console.log(
          'JSON.stringify(addressComponent)',
          JSON.stringify(addressLocation),
        );
        let payload = {
          mobile: route?.params?.mobile,
          door_no: door,
          street: street,
          address: JSON.stringify(addressComponent),
          longitude: EditLocation.longitude,
          latitude: EditLocation.latitude,
          auto_detected: route?.params?.auto_detected,
        };
        console.log('payload', payload);
        let response = await api.register(payload);
        console.log('response from registerrrrrrrr', response);
        setAutoProceed(2);
        if ((await response.status) == 'success') {
          await storage.setToken(response.token);
          await storage.setUserData(response.user);
          await dispatch(set_Profile(response.user));
          axios.defaults.headers.common['Authorization'] =
            'Bearer ' + response.token;
          await navigation.navigate('Home');
        } else {
          Alert.alert('Unable to complete your request');
        }
        setModal(false);
      } else {
        console.log(
          'JSON.stringify(addressComponent)222222222234e32',
          JSON.stringify(addressComponent),
        );
        let payload = {
          name: route?.params?.name,
          mobile: route?.params?.mobile,
          email: route?.params?.email,
          door_no: door,
          street: street,
          address_type: address_type,
          address: JSON.stringify(addressComponent),
          longitude: EditLocation.longitude,
          latitude: EditLocation.latitude,
          terms_conditions: route?.params?.terms_conditions,
        };
        setModal(true);
        let response = await api.register(payload);
        if (response.status == 'success') {
          console.log('response from registerrrrsaffsdfcsd', response);
          await storage.setToken(response.token);
          await storage.setUserData(response.user);
          dispatch(set_Profile(response.user));
          axios.defaults.headers.common['Authorization'] =
            'Bearer ' + response.token;
          await navigation.navigate('Home');
        } else {
          Alert.alert('Unable to complete your request');
        }
        setModal(false);
      }
      setModal(false);
    }
  };

  useEffect(() => {
    if (
      !!addressLocation &&
      !!addressComponent &&
      autoProceed == 1 &&
      !route?.params?.type
    ) {
      setModal(true);
      setTimeout(() => {
        addrConfirm();
      }, 1000);
    }
  }, [
    addressComponent,
    setAddressComponent,
    addressLocation,
    setAddressLocation,
  ]);

  async function requestLocationPermission() {
    try {
      if (Platform.OS === 'ios') {
        // your code using Geolocation and asking for authorisation with
        getCurrentLocation();
        Geolocation.setRNConfiguration({
          skipPermissionRequests: false,
          authorizationLevel: 'whenInUse',
        });
        Geolocation.requestAuthorization();
      } else {
        // ask for PermissionAndroid as written in your code
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Homee App',
            message: 'Homee App needs access to your location ',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setTimeout(() => {
            getCurrentLocation();
          }, 1000);
        } else {
          Alert.alert('Location permission denied');
        }
      }
    } catch (err) {}
  }

  const getCurrentLocation = () => {
    if (!!address && addressEditTempFix === 0)
      changeRegion(parseFloat(address.latitude), parseFloat(address.longitude));
    else
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
    setTimeout(() => {
      setMapMarginBottom(0);
    }, 100);
    requestLocationPermission();
  };
  const StreetChange = e => {
    setStreet(e);
    if (e == null || e == '') {
      setStreet_err(true);
    } else {
      setStreet_err(false);
    }
  };

  const doorChange = e => {
    setDoor(e);
    if (e == null || e == '') {
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
      selected: true,
    },
    {
      id: '2',
      label: 'Work',
      value: 'Work',
      selected: false,
    },
    {
      id: '3',
      label: 'Other',
      value: 'Other',
      selected: false,
    },
  ];
  const [radioButtons, setRadioButtons] = useState(radioButtonsData);
  const [selectedRadioIndex, setSelectedRadioIndex] = useState('1');

  const onPressRadioButton = buttonIndex => {
    setSelectedRadioIndex(buttonIndex);
    console.log('buttonIndex', buttonIndex);
    const newRadioButtons = [...radioButtons];
    newRadioButtons.forEach(button => {
      button.selected = false;
    });
    newRadioButtons[buttonIndex - 1].selected = true;
    setRadioButtons(newRadioButtons);
    if (buttonIndex == 3) setOthers(true);
    else setOthers(false);
  };

  const openContacts = async () => {
    setVisible(true);
    // await Contacts.checkPermission().then(async permission => {
    //   // Contacts.PERMISSION_AUTHORIZED || Contacts.PERMISSION_UNDEFINED || Contacts.PERMISSION_DENIED
    //   if (permission === 'undefined') {

    //     await Contacts.requestPermission().then(permission => {
    //       // ...
    //       console.log("undefinedundefined", permission);
    //     })
    //   }
    //   if (permission === 'authorized') {
    //     console.log("authorizedauthorized");
    //     const data = await Contacts.getAllWithoutPhotos();
    //     // console.log("dataaaaaa", await data[0].phoneNumbers?.[0].number);
    //     const contactsArray = [];
    //     data?.forEach((contact, index) => {
    //       contact?.displayName == "Saranya (c. f)" && console.log("contacccccc", contact);
    //       const props = {
    //         name: contact?.displayName,
    //         mobile: contact?.phoneNumbers?.[0]?.number
    //       }
    //       if (!!contact?.phoneNumbers?.[0]?.number) contactsArray.push(props);
    //     });
    //     setContacts(contactsArray);
    //   }
    //   if (permission === 'denied') {
    //     console.log("denieddenied");
    //     // x.x
    //   }
    // });
  };

  const onRequestClose = onRequestCloseprop => {
    console.log('onRequestClose', onRequestCloseprop);
    setVisible(false);
  };

  const selectedContact = number => {
    setMobile(number?.toString()?.replace(' ', '').slice(-10));
    console.log('data', number);
    setVisible(false);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        flexDirection: 'column',
      }}>
      <>
        <View
          style={{
            backgroundColor: '#09b44d',
            // borderBottomLeftRadius: 25,
            // borderBottomRightRadius: 25,
            justifyContent: 'center',
            height: 50,
            zIndex: 999,
          }}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={{
              flexDirection: 'row',
              paddingHorizontal: 15,
              height: 30,
              alignItems: 'center',
            }}>
            <Image style={{width: 9, height: 16}} source={arrow} />
            <Text
              style={{
                color: '#fff',
                fontSize: 18,
                fontFamily: 'Poppins-Bold',
                paddingLeft: 10,
                // marginTop: -5
              }}>
              Back
            </Text>
          </Pressable>
        </View>
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 111,
            width: '100%',
            backgroundColor: '#fff',
            marginTop: 50,
          }}>
          <GooglePlacesAutocomplete
          enableHighAccuracyLocation={true}
            placeholder="Search Your Locality Here"
            onFail={(err)=>console.log("errrr", err)}
            minLength={2}
            autoFocus={false}
            returnKeyType={'search'}
            // listViewDisplayed="auto"
            fetchDetails={true}
            renderDescription={row => row.description}
            onPress={updateLocation}
            getDefaultValue={() => ''}
            currentLocation={false}
            currentLocationLabel="Current location"
            nearbyPlacesAPI="GooglePlacesSearch"
            // GoogleReverseGeocodingQuery={{}}
            enablePoweredByContainer={false}
            GooglePlacesSearchQuery={{
              rankby: 'distance',
              location:'IN'
              // type: 'cafe',
            }}
            GooglePlacesDetailsQuery={{fields: 'geometry,formatted_address'}}
            filterReverseGeocodingByTypes={[
              'locality',
              'administrative_area_level_3',
            ]}
            debounce={500}
            query={{
              key: 'AIzaSyBw1Ju4RtlNJUJHqt7y8VW03zBUesUfUak',
              language: 'en',
              type: 'establishment',
            }}
            textInputProps={{
              placeholderTextColor: '#000',
              returnKeyType: 'search',
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
        <View style={{flex: 7, width: '100%', marginTop: 50}}>
          <MapView
            showsUserLocation={true}
            showsMyLocationButton={true}
            initialRegion={{
              latitude: !!address?.latitude
                ? parseFloat(address.latitude)
                : 13.007519778022951,
              longitude: !!address?.longitude
                ? parseFloat(address.longitude)
                : 80.25388327589093,
              latitudeDelta: 0.015,
              longitudeDelta: 0.0121,
            }}
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              alignItems: 'center',
              marginBottom: mapMarginBottom,
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
              // zIndex: 1,
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
        <BottomSheet
          ref={sheetRef}
          // index={0}
          snapPoints={snapPoints}
          keyboardBehavior="fillParent"
          // onChange={handleSheetChanges}
          // enablePanDownToClose
          // onClose={() =>
          //   sheetRef.current?.snapToIndex(0)
          // }
          // handleStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
          // backdropComponent={addressSelectType && CustomBackdrop}
        >
          <BottomSheetScrollView
            keyboardShouldPersistTaps={'always'}
            // contentContainerStyle={styles.contentContainer}
          >
            <View
              style={{
                // flex:3.5,
                // height: height / 3,
                width: '100%',
                backgroundColor: '#fff',
                zIndex: 11,
                alignItems: 'center',
                justifyContent: 'center',
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5,
                borderColor: '#e5e5e5',
                // borderWidth: 2,
                paddingHorizontal: 25,
                paddingBottom: 20,
              }}>
              {/* <ScrollView style={{ paddingBottom: 0 }}> */}
              <Text
                style={{
                  width: '100%',
                  fontFamily: 'Poppins-Bold',
                  fontSize: 16,
                  textAlign: 'justify',
                  marginTop: 15,
                }}>
                {`This Will be your ${
                  pndAddressSelectType == 'pickup'
                    ? 'Pickup'
                    : pndAddressSelectType == 'drop'
                    ? 'Drop'
                    : 'Delivery'
                } Location`}
              </Text>
              <Text
                style={{
                  width: '100%',
                  fontFamily: 'Poppins-Regular',
                  fontSize: 13,
                  lineHeight: 21,
                  textAlign: 'justify',
                  paddingBottom: 10,
                  paddingTop: 5,
                  // height: 80,
                }}>
                {addressLocation}
              </Text>
              {addressAddType == 'PND' && (
                <View>
                  <TextInput
                    value={userName}
                    onChangeText={name => setUserName(name)}
                    placeholder="Enter Name"
                    // keyboardType='phone-pad'
                    placeholderTextColor={'#c9c9c9'}
                    style={{
                      borderColor: !!userName ? '#09b44d' : 'tomato',
                      borderStyle: 'solid',
                      borderWidth: 1,
                      paddingVertical: 5,
                      paddingHorizontal: 15,
                      marginVertical: 5,
                      width: 300,
                      borderRadius: 7,
                      color: '#000',
                    }}
                  />
                </View>
              )}
              <View>
                <TextInput
                  value={door}
                  onChangeText={doorChange}
                  placeholder="Enter your Door No*"
                  placeholderTextColor={'#c9c9c9'}
                  style={{
                    borderColor: !!door ? '#09b44d' : 'tomato',
                    borderStyle: 'solid',
                    borderWidth: 1,
                    paddingVertical: 5,
                    paddingHorizontal: 15,
                    marginBottom: 3,
                    width: 300,
                    borderRadius: 7,
                    color: '#000',
                  }}
                />
              </View>
              {door_err && (
                <Text
                  style={{color: 'tomato', marginLeft: 10, marginBottom: 10}}>
                  Please Enter Door Number
                </Text>
              )}
              <View>
                <TextInput
                  value={street}
                  onChangeText={StreetChange}
                  placeholder="Enter your street Name*"
                  placeholderTextColor={'#c9c9c9'}
                  style={{
                    borderColor: !!street ? '#09b44d' : 'tomato',
                    borderStyle: 'solid',
                    borderWidth: 1,
                    paddingVertical: 5,
                    paddingHorizontal: 15,
                    marginVertical: 5,
                    width: 300,
                    borderRadius: 7,
                    color: '#000',
                  }}
                />
              </View>
              {street_err && (
                <Text style={{color: 'tomato', marginLeft: 10}}>
                  {t('addressPage.streetErr')}
                </Text>
              )}
              {addressAddType == 'PND' && (
                <View
                  style={{
                    flexDirection: 'row',
                    borderColor: !!mobile ? '#09b44d' : 'tomato',
                    borderStyle: 'solid',
                    borderWidth: 1,
                    height: 40,
                    // paddingVertical: 5,
                    paddingHorizontal: 10,
                    // marginVertical: 5,
                    width: 300,
                    borderRadius: 7,
                  }}>
                  <TextInput
                    value={mobile}
                    maxLength={10}
                    onChangeText={number => setMobile(number)}
                    placeholder="Enter Mobile"
                    keyboardType="phone-pad"
                    placeholderTextColor={'#c9c9c9'}
                    style={{
                      width: '90%',
                      color: '#000',
                    }}
                  />
                  <TouchableOpacity
                    style={{justifyContent: 'center'}}
                    onPress={openContacts}>
                    <Image
                      source={ContactBook}
                      style={{width: 25, height: 25, tintColor: '#000'}}
                    />
                  </TouchableOpacity>
                </View>
              )}
              <View style={{margin: 10}}>
                <RadioGroup
                  layout="row"
                  selectedId={selectedRadioIndex}
                  radioButtons={radioButtons}
                  onPress={onPressRadioButton}
                />
                {others && (
                  <View>
                    <TextInput
                      value={addressType}
                      onChangeText={type => setAddressType(type)}
                      placeholder="Address Type"
                      placeholderTextColor={'#c9c9c9'}
                      style={{
                        borderColor: '#09b44d',
                        borderStyle: 'solid',
                        borderWidth: 1,
                        paddingVertical: 5,
                        paddingHorizontal: 15,
                        marginBottom: 3,
                        marginTop: 7,
                        marginLeft: 5,
                        width: 300,
                        borderRadius: 7,
                        color: '#000',
                      }}
                    />
                  </View>
                )}
              </View>
              <TouchableOpacity
                disabled={street == null ? true : false}
                style={{
                  backgroundColor: street == null ? '#D1F0DD' : '#09b44d',
                  borderRadius: 40,
                  padding: 10,
                  margin: 10,
                }}
                onPress={addrConfirm}>
                <Text
                  style={{
                    fontFamily: 'Poppins-Bold',
                    fontSize: 14,
                    color: '#fff',
                  }}>
                  {t('addressPage.confirmAddress')}
                </Text>
              </TouchableOpacity>
              {/* </ScrollView> */}
            </View>
            <ContactsModal
              visible={visible}
              onRequestClose={onRequestClose}
              selectedContact={selectedContact}
            />
          </BottomSheetScrollView>
        </BottomSheet>
      </>
      {!!route?.params?.auto_detected && modal && (
        <View
          style={{
            width,
            height,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f5f5f5',
            position: 'absolute',
            zIndex: 99999,
          }}>
          <LottieView
            source={location_loading}
            autoPlay
            useNativeLooping
            loop
            style={{width: width / 1.5, height: height / 4, marginBottom: 25}}
          />
          <Text
            style={{
              textAlign: 'center',
              fontFamily: 'Poppins-Bold',
              fontSize: 16,
              paddingHorizontal: 20,
              marginBottom: 150,
            }}>
            Hold Tight! {`\n`} We are getting your Location 📍{'\n'} To serve
            you better 🥰
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Address;
