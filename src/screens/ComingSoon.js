import { Dimensions, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import * as Images from '../assets/img/Images'
import LottieView from 'lottie-react-native';
import { PrimaryGreen } from '../helper/styles.helper';
// import Shimmer from 'react-native-shimmer';
import Shimmer from 'react-native-shimmer-placeholder';

const ComingSoon = ({ navigation, route }) => {

    const { width, height } = Dimensions.get('window');

    console.log("route?.params?.typeroute?.params?.type", route?.params);
    
    const pageType = route?.params.type;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: pageType == 'Pick & Drop' ? '#fff' : '#dff0e3', }}>
            <View
                style={{
                    flexDirection: 'column',
                    backgroundColor: '#09b44d',
                    height: 40,
                    borderBottomLeftRadius: 25,
                    borderBottomRightRadius: 25,
                }}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{
                        flexDirection: 'row',
                        paddingHorizontal: 15,
                        paddingTop: 5,
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                    }}>
                    <Image style={{ width: 9, height: 16 }} source={Images.arrow} />
                    <Text style={{
                        color: '#fff',
                        fontSize: 18,
                        fontFamily: 'Poppins-Bold',
                        paddingLeft: 5,
                        marginTop: 2

                    }}>Back</Text>
                </TouchableOpacity>
            </View>
            {pageType == 'Pick & Drop' ?
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                    <Image source={Images.pnd_comming} style={{ height: height / 2, aspectRatio: 1, resizeMode: 'center', padding: 0, margin: 0, marginBottom: 25, }} />
                </View>
                :
                <>
                    <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center' }}>
                        <Image source={ pageType == 'Groceries & Meat' ? Images.Groceries : Images.services_comming_soon} style={{ height: height / 2.2, aspectRatio: 1, resizeMode: 'center', padding: 0, margin: 0, marginVertical: 25, }} />
                        {/* <Shimmer tilt={30} duration={100} pauseDuration={1500}> */}
                            <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 24, color: PrimaryGreen, textAlign: 'center' }}>
                                {`${!!route?.params?.type ? route?.params?.type : ''} \n`}
                                <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 24, color: PrimaryGreen, textAlign: 'center' }}>
                                    Comming Soon
                                </Text>
                            </Text>
                        {/* </Shimmer> */}
                    </View>
                </>}
        </SafeAreaView>
    )
}

export default ComingSoon

const styles = StyleSheet.create({})