import {
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  ToastAndroid,
  AlertIOS,
} from 'react-native';
import React from 'react';
import Geolocation from '@react-native-community/geolocation';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import {Platform} from 'react-native';

export async function checkLocationPermission({navigation, login}) {
  // console.log("check", login);
  try {
    const check = await PermissionsAndroid.check(
      'android.permission.ACCESS_FINE_LOCATION',
    );
    const check1 = await PermissionsAndroid.check(
      'android.permission.ACCESS_COARSE_LOCATION',
    );
    if ((check || check1) === true) {
      // await navigation.navigate('Address')
      if (Platform.OS === 'android') {
        !login &&
          ToastAndroid.show(
            'Location Permission Already Active',
            ToastAndroid.SHORT,
          );
        return true;
      } else {
        AlertIOS.alert('Location Permission Already Active');
        return true;
      }
    } else {
      console.log('else part for check per');
      await requestLocationPermission();
      // navigation.navigate('LocationPermission');
    }
  } catch (err) {
    console.log('error', err);
  }
}
export async function requestLocationPermission() {
  console.log('reqLocPermission');
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Homee',
        message: 'Homee Needs access to your location ',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      setTimeout(() => {
        getCurrentLocation();
      }, 1000);
      // navigation.navigate('LogIn');
      return true;
    } else {
      alert('Location permission denied');
    }
    return false;
  } catch (err) {
    console.warn(err);
  }
}

export async function getCurrentLocation() {
  try {
    const location = Geolocation.getCurrentPosition(
      //Will give you the current location
      position => {
        //getting the Longitude from the location json
        const currentLongitude = JSON.stringify(position.coords.longitude);

        //getting the Latitude from the location json
        const currentLatitude = JSON.stringify(position.coords.latitude);
      },
      error => console.log(error.message),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
      },
    );
    return location;
  } catch (error) {
    console.log('error in getting current location', error);
  }
}

export async function checkLocationEnabled() {
  if (Platform.OS === 'android') {
    const checkEnabled = await isLocationEnabled();
    console.log('checkEnabled', checkEnabled);
  }
}

export async function enableLocationHandler() {
  if (Platform.OS === 'android') {
    try {
      const enableResult = await promptForEnableLocationIfNeeded();
      console.log('enableResult', enableResult);
      // The user has accepted to enable the location services
      // data can be :
      //  - "already-enabled" if the location services has been already enabled
      //  - "enabled" if user has clicked on OK button in the popup
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        // The user has not accepted to enable the location services or something went wrong during the process
        // "err" : { "code" : "ERR00|ERR01|ERR02|ERR03", "message" : "message"}
        // codes :
        //  - ERR00 : The user has clicked on Cancel button in the popup
        //  - ERR01 : If the Settings change are unavailable
        //  - ERR02 : If the popup has failed to open
        //  - ERR03 : Internal error
      }
    }
  }
}
