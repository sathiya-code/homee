import { StyleSheet, Text, View, Dimensions } from 'react-native'
import React from 'react';
import LottieView from 'lottie-react-native';
import { coming_soon } from '../assets/img/Images';
import { AppBackground } from '../helper/app.helper';

export default function NoServiceArea() {
    const { width, height } = Dimensions.get('window')
    return (
        <View style={{ width, height: height, justifyContent: 'flex-start', alignItems: 'center', backgroundColor: '#bbedc9', paddingTop: 150 }}>
            <Text style={{ fontSize: 40, fontFamily: 'Poppins-Medium', }}>Homee  </Text>
            <LottieView source={coming_soon} autoPlay useNativeLooping loop style={{ width: width / 2.5, height: height / 5, marginBottom: 10, marginTop: -25 }} />
            <Text style={{ fontSize: 30, fontFamily: 'Poppins-Medium', }}>To Your City</Text>
        </View>
    )
}

const styles = StyleSheet.create({})