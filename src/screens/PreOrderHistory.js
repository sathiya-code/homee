import { Text, View, Image, Pressable, SafeAreaView, StatusBar, TouchableOpacity, FlatList, Alert, Modal } from 'react-native';
import React, { useState } from 'react';
import { arrow } from '../assets/img/Images';
import { api } from '../services';
import { useEffect } from 'react';
import moment from 'moment';
import Loader from '../screens/Loader';

const convertDateString = ({ date, time }) => {
    const hrs = time.slice(0, 2);
    const mins = time.slice(3, 5);
    console.log("hrssssss", hrs + ':' + mins);
    var timeString;
    if (time.slice(-2) == 'PM') { timeString = `${parseInt(hrs) + 12}:${mins}:00.000Z` }
    else { timeString = `${hrs}:${mins}:00.000Z` };
    return (date.slice(0, 10) + 'T' + timeString).toString()
}

const PreOrderHistory = ({ navigation, route }) => {
    const [showHistory, setShowHistory] = useState(true);
    const [historyDetails, setHistoryDetails] = useState([]);
    const [upcomingDetails, setUpcomingDetails] = useState([]);
    const [modal, setModal] = useState(false);

    const cancelOrder = async (id) => {
        console.log("id cancell", id);
        const response = await api.preOrderCancel(id);
        console.log("response from cancel order: ", response);
        Alert.alert('Are you sure want to proceed?', response.message + ' will be provided',
            [{
                text: 'OK, Proceed', onPress: async () => {
                    setModal(true);
                    console.log("OK Pressed");
                    const res2 = await api.preOrderCancelConfirm({ order_id: id, cancel_phase: response?.cancelPhase });
                    console.log("response from cancelPhase", res2);
                    if (res2.status == 'success') Alert.alert(res2.message);
                    setModal(false);
                    getHistory();

                }
            },
            { text: `NO, Don't Proceed`, onPress: () => console.log("Cancel Pressed") }])
        getHistory();
    }

    const getHistory = async () => {
        setModal(true);
        const response = await api.preOrderHistory();
        // console.log("response from pre order history", response);
        const history = [];
        const upcoming = [];
        response?.orderData.forEach((item) => {
            const dateTime = convertDateString({ date: item?.preorder_date, time: item?.preorder_time });
            // console.log("ranjith test", new Date(), dateTime, moment(dateTime), moment(), moment(dateTime) > moment());
            console.log("ranjith test", item);
            if (moment().isAfter(dateTime) || (item?.preorder_status == 3 || item?.preorder_status == 4)) history.push(item);
            else upcoming.push(item);
        })
        setHistoryDetails(history);
        setUpcomingDetails(upcoming);
        setModal(false);
    };

    const temp = () => {
        setTimeout(() => {
            console.log("test", historyDetails);
            console.log("test2222", upcomingDetails);
        }, 3000)
    };

    useEffect(() => {
        getHistory();
        // temp();
    }, []);

    const _renderHistory = ({ item, index }) => {
        console.log("response from pre order history", item);
        const address = JSON.parse(item?.cook_address);
        return (
            <View
                style={{
                    marginHorizontal: 15,
                    marginTop: 15,
                    borderColor: '#e5e5e5',
                    borderWidth: 1,
                }}>
                <View
                    // onPress={() => null
                    // navigation.navigate('OrderedFoodz', { id: item.id })
                    // }
                    style={{
                        flexDirection: 'row',
                        padding: 10,
                        borderColor: '#e5e5e5',
                        borderBottomWidth: 1,
                    }}>
                    <View
                        style={{
                            flex: 4,
                            paddingLeft: 8,
                            justifyContent: 'center',
                        }}>
                        <Text
                            style={{ fontSize: 13, fontFamily: 'Poppins-Bold', marginBottom: 4 }}>
                            {item?.preorder_date ? "Delivery on:  " + moment(item.preorder_date).format('DD MMM, YYYY') + ' - ' + item?.preorder_time : null}
                        </Text>
                        <Text
                            style={{ fontSize: 13, fontFamily: 'Poppins-Bold', marginBottom: 4 }}>
                            {item?.order_no ? "ORDER ID : " + item.order_no : null}
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text
                                style={{ fontSize: 13, fontFamily: 'Poppins-Bold', marginBottom: 4 }}>
                                {item?.cook_name ? item.cook_name : null}
                            </Text>
                            <Text style={{ fontSize: 13, fontFamily: 'Poppins-Bold', marginBottom: 4 }}>{`₹ ${item?.total_amount}`}</Text>
                        </View>
                        <Text
                            style={{ width: 200, fontSize: 12, fontFamily: 'Poppins-Regular', marginBottom: 4 }}>
                            {address?.apartment_name && address?.apartment_name != "null" ? address?.apartment_name + ', ' : null}
                            {address?.door_no && address?.door_no != "null" ? address?.door_no + ', ' : null}
                            {address?.block && address?.block != "null" ? address?.block + ', ' : null}
                            {address?.street && address?.street != "null" ? address?.street + ', ' : null}
                            {address?.area && address?.area != "null" ? address?.area + ', ' : null}
                            {address?.city && address?.city != "null" ? address?.city + ', ' : null}
                            {address?.pin_code && address?.pin_code != "null" ? address?.pin_code + '. ' : null}
                        </Text>
                    </View>
                </View>
                <View style={{ padding: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text
                            style={{
                                fontFamily: 'Poppins-Regular',
                                fontSize: 14.5,
                                color: item?.preorder_status == 2 ? '#09b44d' : '#cc0600',
                            }}>{`Order `}
                            {item?.preorder_status == 1 ? 'Pending' : null}
                            {item?.preorder_status == 2 ? 'Success' : null}
                            {item?.preorder_status == 3 ? 'Cancelled' : null}
                            {item?.preorder_status == 4 ? 'Failed' : null}
                        </Text>
                        <Text
                            style={{
                                fontFamily: 'Poppins-Regular',
                                fontSize: 14.5,
                                color: '#000',
                            }}>
                            {/* {`Payment : `} */}
                            {item?.delivery_status == 1 ? 'Cook Not Accepted Yet' : null}
                            {item?.delivery_status == 2 ? 'Rejected' : null}
                            {item?.delivery_status == 3 ? 'Under Preparation' : null}
                            {item?.delivery_status == 4 ? 'Prepared' : null}
                            {item?.delivery_status == 5 ? 'Accepted' : null}
                            {item?.delivery_status == 6 ? 'Delivered' : null}
                        </Text>
                        {/* <Text
                            style={{
                                fontFamily: 'Poppins-Regular',
                                fontSize: 14,
                                color: '#000',
                            }}>
                            {item?.total_amount ? "₹ " + item?.total_amount : null}
                        </Text> */}
                        {/* <Text
                            style={{
                                fontFamily: 'Poppins-Regular',
                                fontSize: 13,
                                color: '#000',
                            }}>
                            {item?.date ? item?.date : null}
                        </Text> */}
                    </View>
                </View>
            </View>
        )
    };
    const _renderUpcoming = ({ item, index }) => {
        console.log("response from pre order history", item);
        const address = JSON.parse(item?.cook_address);
        return (
            <View
                style={{
                    marginHorizontal: 15,
                    marginTop: 15,
                    borderColor: '#e5e5e5',
                    borderWidth: 1,
                }}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('OrderedFoodz', { id: item.id })}
                    style={{
                        flexDirection: 'row',
                        padding: 10,
                        borderColor: '#e5e5e5',
                        borderBottomWidth: 1,
                    }}>
                    <View
                        style={{
                            flex: 4,
                            paddingLeft: 8,
                            justifyContent: 'center',
                        }}>
                        <Text
                            style={{ fontSize: 13, fontFamily: 'Poppins-Bold', marginBottom: 4 }}>
                            {item?.preorder_date ? "Delivery on:  " + moment(item.preorder_date).format('DD MMM, YYYY') + ' - ' + item?.preorder_time : null}
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text
                                style={{ fontSize: 13, fontFamily: 'Poppins-Bold', marginBottom: 4 }}>
                                {item?.order_no ? "ORDER ID : " + item.order_no : null}
                            </Text>
                            <Text style={{ fontSize: 13, fontFamily: 'Poppins-Bold', marginBottom: 4 }}>{`₹ ${item?.total_amount}`}</Text>
                        </View>
                        <Text
                            style={{ fontSize: 13, fontFamily: 'Poppins-Bold', marginBottom: 4 }}>
                            {item?.cook_name ? item.cook_name : null}
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text
                                style={{ width: 200, fontSize: 12, fontFamily: 'Poppins-Regular', marginBottom: 4 }}>
                                {address?.apartment_name && address?.apartment_name != "null" ? address?.apartment_name + ', ' : null}
                                {address?.door_no && address?.door_no != "null" ? address?.door_no + ', ' : null}
                                {address?.block && address?.block != "null" ? address?.block + ', ' : null}
                                {address?.street && address?.street != "null" ? address?.street + ', ' : null}
                                {address?.area && address?.area != "null" ? address?.area + ', ' : null}
                                {address?.city && address?.city != "null" ? address?.city + ', ' : null}
                                {address?.pin_code && address?.pin_code != "null" ? address?.pin_code + '. ' : null}
                            </Text>
                            {item?.preorder_status == 2 && item?.refund_status == 0 && <TouchableOpacity
                                style={{ height: 25, borderRadius: 10, marginLeft: 10, marginTop: 5, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'red' }}
                                onPress={() => { cancelOrder(item?.id); console.log("cancel") }}>
                                <Text style={{ color: 'red', paddingHorizontal: 20 }}>Cancel</Text>
                            </TouchableOpacity>}
                        </View>
                    </View>
                </TouchableOpacity >

                <View style={{ padding: 10, paddingTop: 5 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text
                            style={{
                                fontFamily: 'Poppins-Regular',
                                fontSize: 14.5,
                                color: item?.preorder_status == 2 ? '#09b44d' : '#cc0600',
                            }}>{`Order `}
                            {item?.preorder_status == 1 ? 'Pending' : null}
                            {item?.preorder_status == 2 ? 'Placed' : null}
                            {item?.preorder_status == 3 ? 'Cancelled' : null}
                            {item?.preorder_status == 4 ? 'Failed' : null}
                        </Text>
                        <Text
                            style={{
                                fontFamily: 'Poppins-Regular',
                                fontSize: 14.5,
                                color: '#000',
                            }}>
                            {/* {`Payment : `} */}
                            {item?.delivery_status == 1 ? 'Cook Not Accepted Yet' : null}
                            {item?.delivery_status == 2 ? 'Rejected' : null}
                            {item?.delivery_status == 3 ? 'Under Preparation' : null}
                            {item?.delivery_status == 4 ? 'Prepared' : null}
                            {item?.delivery_status == 5 ? 'Accepted' : null}
                            {item?.delivery_status == 6 ? 'Delivered' : null}
                        </Text>
                        {/* <Text
                            style={{
                                fontFamily: 'Poppins-Regular',
                                fontSize: 14,
                                color: '#000',
                            }}>
                            {item?.total_amount ? "₹ " + item?.total_amount : null}
                        </Text> */}
                        {/* <Text
                            style={{
                                fontFamily: 'Poppins-Regular',
                                fontSize: 13,
                                color: '#000',
                            }}>
                            {item?.date ? item?.date : null}
                        </Text> */}
                    </View>
                </View>
            </View >
        )
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar backgroundColor='#09B44D' barStyle={'light-content'} />
            <View
                style={{
                    backgroundColor: '#09b44d',
                    borderBottomLeftRadius: 25,
                    borderBottomRightRadius: 25,
                    justifyContent: 'center',
                    height: 60
                }}>
                <Pressable
                    onPress={() => navigation.goBack()}
                    style={{
                        flexDirection: 'row',
                        paddingHorizontal: 15,
                        alignItems: 'center'
                    }}>
                    <Image style={{ width: 9, height: 16 }} source={arrow} />
                    <Text style={{
                        color: '#fff',
                        fontSize: 18,
                        fontFamily: 'Poppins-Bold',
                        paddingLeft: 10,
                        marginTop: 5

                    }}>Pre Order List</Text>
                </Pressable>
            </View>
            <View style={{ width: '100%', height: 50, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginTop: 10 }}>
                <TouchableOpacity style={{ width: 120, borderColor: showHistory ? '#29C270' : '#000', borderWidth: showHistory ? 2 : 1, borderRadius: 7, justifyContent: 'center', alignItems: 'center' }} onPress={() => setShowHistory(true)}>
                    <Text style={{ paddingVertical: 5, fontSize: 16, fontFamily: showHistory ? 'Poppins-Bold' : 'Poppins-Regular', color: showHistory ? '#29C270' : '#000' }}>History</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ width: 120, borderColor: !showHistory ? '#29C270' : '#000', borderWidth: !showHistory ? 2 : 1, borderRadius: 7, justifyContent: 'center', alignItems: 'center' }} onPress={() => setShowHistory(false)}>
                    <Text style={{ paddingVertical: 5, fontSize: 16, fontFamily: !showHistory ? 'Poppins-Bold' : 'Poppins-Regular', color: !showHistory ? '#29C270' : '#000' }}>Upcoming</Text>
                </TouchableOpacity>
            </View>
            {showHistory ? <>
                <View style={{ paddingBottom: 150 }}>
                    <FlatList
                        data={historyDetails}
                        renderItem={_renderHistory}
                    />
                </View>
            </> : <>
                <View style={{ paddingBottom: 150 }}>
                    <FlatList
                        data={upcomingDetails}
                        renderItem={_renderUpcoming}
                    />
                </View>
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

export default PreOrderHistory

// import * as React from 'react';
// import { Text, View, TouchableOpacity } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
// import Animated from 'react-native-reanimated';

// function MyTabBar({ state, descriptors, navigation, position }) {
//     return (
//         <View style={{ flexDirection: 'row', paddingTop: 20, width: '100%', backgroundColor: 'red', justifyContent: 'center', alignItems: 'center' }}>
//             {state.routes.map((route, index) => {
//                 const { options } = descriptors[route.key];
//                 const label =
//                     options.tabBarLabel !== undefined
//                         ? options.tabBarLabel
//                         : options.title !== undefined
//                             ? options.title
//                             : route.name;

//                 const isFocused = state.index === index;

//                 const onPress = () => {
//                     const event = navigation.emit({
//                         type: 'tabPress',
//                         target: route.key,
//                     });

//                     if (!isFocused && !event.defaultPrevented) {
//                         navigation.navigate(route.name);
//                     }
//                 };

//                 const onLongPress = () => {
//                     navigation.emit({
//                         type: 'tabLongPress',
//                         target: route.key,
//                     });
//                 };
//                 // modify inputRange for custom behavior
//                 const inputRange = state.routes.map((_, i) => i);
//                 const opacity = Animated?.interpolateNode(position, {
//                     inputRange,
//                     outputRange: inputRange?.map((i) => (i === index ? 1 : 0)),
//                 });

//                 return (
//                     <TouchableOpacity
//                         accessibilityRole="button"
//                         accessibilityState={isFocused ? { selected: true } : {}}
//                         accessibilityLabel={options.tabBarAccessibilityLabel}
//                         testID={options.tabBarTestID}
//                         onPress={onPress}
//                         onLongPress={onLongPress}
//                         style={{ flex: 1 }}
//                     >
//                         <Animated.Text style={{ opacity }}>{label}</Animated.Text>
//                     </TouchableOpacity>
//                 );
//             })}
//         </View>
//     );
// }

// function HomeScreen() {
//     return (
//         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//             <Text>Home!</Text>
//         </View>
//     );
// }

// function SettingsScreen() {
//     return (
//         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//             <Text>Settings!</Text>
//         </View>
//     );
// }

// function ProfileScreen() {
//     return (
//         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//             <Text>Profile!</Text>
//         </View>
//     );
// }

// const Tab = createMaterialTopTabNavigator();

// export default function PreOrderHistory() {
//     return (
//         // <NavigationContainer>
//         <Tab.Navigator tabBar={(props) => <MyTabBar {...props} />}>
//             <Tab.Screen name="Home" component={HomeScreen} />
//             <Tab.Screen name="Settings" component={SettingsScreen} />
//             <Tab.Screen name="Profile" component={ProfileScreen} />
//         </Tab.Navigator>
//         // </NavigationContainer>
//     );
// }
