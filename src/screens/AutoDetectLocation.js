import {
  Alert,
  Dimensions,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useRef} from 'react';
import LottieView from 'lottie-react-native';
import {location_loading} from '../assets/img/Images';
import {api, storage} from '../services';
import Geolocation from '@react-native-community/geolocation';
import Geocoder from 'react-native-geocoding';
import {useEffect} from 'react';
import {useState} from 'react';
import {useDispatch} from 'react-redux';
import {set_Profile} from '../redux/actions/authAction';
import axios from 'axios';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

const {width, height} = Dimensions.get('window');

const AutoDetectLocation = ({navigation, route}) => {
  // const [currentLocation, setCurrentLocation] = useState(null);
  // const [addressComponent, setAddressComponent] = useState(null);
  const [addressDetail, setAddressDetail] = useState(null);

  const dispatch = useDispatch();

  console.log('fromAutoDetectLocation');
  Geocoder.init('AIzaSyAT-XE0L77pBWbwTL3PC04JUGSykZ3uB_Q');

  console.log('propss fromAutoDetectLocation', route?.params);
  const mobile = route?.params;

  const mapRef = useRef(null);

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
    Geolocation.getCurrentPosition(
      async location => {
        const latitude = location.coords.latitude;
        const longitude = location.coords.longitude;
        console.log('r');
        const parsedAddress = await mapRef.current.addressForCoordinate({
          latitude,
          longitude,
        });
        console.log('parsed', parsedAddress);
        register({addressComponent: parsedAddress, latitude, longitude});
        // await Geocoder.from(latitude, longitude)
        //   .then(json => {
        //     var addressComponent = json.results[0].address_components;
        //     console.log('addddddddddd', addressComponent, addressDetail);
        //     register({addressComponent, latitude, longitude});
        //     // setAddressComponent(addressComponent)
        //   })
        //   .catch(error => console.warn(error));
        // setCurrentLocation(location.coords);
      },
      error => {
        Alert.alert('', 'Unable to get Your Current Location');
      },
      {
        enableHighAccuracy: false,
        timeout: 2000,
        maximumAge: 360000,
      },
    );
  };

  const userLocation = async () => {
    Geolocation.setRNConfiguration({
      authorizationLevel: 'always',
      skipPermissionRequests: false,
    });
    await requestLocationPermission();
    // console.log("ranjithefbugnusvs", addressComponent, addressDetail);

    // setTimeout(async () => {
    //     // console.log("fmksnfjnrujribrbr", currentLocation);
    //     // const address = await Geocoder.from(currentLocation.latitude, currentLocation.longitude);
    //     // console.log("adddddddddddddddddd", address);
    //     await Geocoder.from(latitude,longitude)
    //         .then(json => {
    //             var addressDetail = json.results[0].formatted_address;
    //             var addressComponent = json.results[0].address_components;
    //             console.log("addddddddddd", addressComponent, addressDetail);
    //             // setAddressComponent(json.results[0].address_components);

    //         })
    //         .catch(error => console.warn(error));
    //     // Geolocation.setRNConfiguration({authorizationLevel:'always', skipPermissionRequests:false})
    // }, 3000)
  };

  const register = async ({addressComponent, latitude, longitude}) => {
    let payload = {
      mobile,
      address: JSON.stringify(addressComponent),
      latitude: latitude,
      longitude: longitude,
      auto_detected: 1,
    };
    console.log('payload', payload);
    let response = await api.register(payload);
    console.log('response from registerrrrrrrr', response);
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
    // setModal(false);
  };

  useEffect(() => {
    userLocation();
  }, []);

  return (
    <>
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
          Hold Tight! {`\n`} We are getting your Location 📍{'\n'} To serve you
          better 🥰
        </Text>
      </View>
      <View style={{display: 'none'}}>
        <MapView
          ref={mapRef}
          showsUserLocation={true}
          showsMyLocationButton={true}
          initialRegion={{
            latitude: 13.007519778022951,
            longitude: 80.25388327589093,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
          provider={PROVIDER_GOOGLE}
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginBottom: 1,
          }}
          showsCompass
          zoomTapEnabled
          zoomControlEnabled
          showsPointsOfInterest
          // showsTraffic
          // showsUserLocation={true}
          showsUserLocationButton={true}
          zoomEnabled={true}
        />
      </View>
    </>
  );
};

export default AutoDetectLocation;

const styles = StyleSheet.create({});
