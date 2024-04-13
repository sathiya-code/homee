import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, Image, Alert, BackHandler, FlatList, ScrollView, Dimensions, TextInput, ToastAndroid, } from 'react-native'
import React, { useState, useEffect } from 'react'
// import { Calendar } from 'react-native-calendars';
import {Calendar} from 'react-native-calendars';
import { api, storage } from '../services/index';
import { arrow, leftArrow, deleteIcon } from '../assets/img/Images';
import { usePreOrderHook } from '../helper/usePreOrderHook';
import moment from 'moment';
import { CustomAlert } from '../helper/customAlert';
import LinearGradient from 'react-native-linear-gradient';
import { PrimaryGreen } from '../helper/styles.helper';
import DatePicker from 'react-native-date-picker';

const { width, height } = Dimensions.get('window');

const PreOrder = ({ navigation, route }) => {
    const [dateIndex, setDateIndex] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [datesArr, setDatesArr] = useState([]);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showTimeList, setShowTimeList] = useState(false);
    const [addAnotherDate, setAddAnotherDate] = useState(true);
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
    const [showAlert, setShowAlert] = useState(false);
    const [cookList, setCookList] = useState([]);
    const [showCookList, setShowCookList] = useState(false);
    const [getCooksList, setGetCookList] = useState(false);
    const [time, setTime] = useState(moment().format('hh:mm'));
    const [showFoodList, setShowFoodList] = useState(false);
    const [foodList, setFoodList] = useState([]);
    const [cart, setCart] = useState([]);
    const [preOrderCart, setPreOrderCart] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [emptyCart, setEmptyCart] = useState(null);
    const [showDone, setShowDone] = useState(false);
    const [banner, setBanner] = useState(null);
    let refresh = route?.params?.refresh;


    const getCartDateTime = async () => {
        const response = await api.getPreOrderDateTimeDetails();
        console.log("response from date anfd time details", response);
        setPreOrderCart(response);
    }

    const getTimingsList = async () => {
        const timingList = await api.getTimingList();
        // console.log("timing list", timingList);
    }

    const addToCart = async (data) => {
        //required params {menu_item_id, cook_id, pre_order_date, pre_order_time}
        const response = await api.preOrderCartAdd(data)
        // console.log("response from add to cart", response);
    };

    const minusFromCart = async ({ id }) => {
        //required params {menu_item_id, cook_id, pre_order_date, pre_order_time}
        console.log(":id minus", id);
        const response = await api.preOrderCartMinus(id);
        getCartDateTime();
        // console.log("response from minus from cart", response);
    };
    const addMoreToCart = async (data) => {
        //required params {cart_id, quantity}
        const response = await api.preOrderCartAddMore(data);
        getCartDateTime();
        // console.log("response from add to cart", response);
    }

    const getCart = async () => {
        const getCart = await api.getPreOrderCart();
        console.log("getCart", getCart.cartData);
        // const filteredDate = [];
        // const data = getCart.foreach(item => {if (!filteredDate.includes(item.pre_order_date)) return filteredDate.push(item.pre_order_date)})
        // setCart(getCart.cartData);
    };

    const preOrderAddDate = async (data) => {
        console.log("pre_order_date", data);
        const response = await api.preOrderAddDate(data);
        console.log("response from date string", response);
        getCartDateTime();
    }

    const preOrderAddTiming = async (pre_order_time) => {
        console.log("pre_order_dateeeeeeeeeeeeeee", typeof pre_order_time);
        const response = await api.preOrderAddTiming({ cart_id: selectedItem?.cartId, pre_order_date: selectedItem?.pre_order_date, pre_order_time: pre_order_time });
        console.log("ressspsonseeeeeeeee", response);
        setSelectedItem(response);
        getCartDateTime();
    }

    // const cartAddDateAndUpdate = async ({ pre_order_date }) => {
    //     //{pre_order_date} required params
    //     const response = await api.preOrderAddDate(pre_order_date)
    //     console.log("response", response);
    // }
    const preOrderRemoveCartId = async (cartId) => {
        const response = await api.preOrderCartRemove({ cart_id: cartId });
        console.log("response from delete apiiiiiii", response);
        // Alert.alert("", response?.message);
        setShowCookList(false); setShowFoodList(false);
        ToastAndroid.show(response?.message, 3000);
        getCartDateTime();

    };

    const preOrderRemoveCart = async (cartId) => {
        //'pre_order_date' => 'required',
        //'pre_order_time' => 'required',
        console.log("cart_id", cartId);
        // const params = { pre_order_date: data?.pre_order_date, pre_order_time: data?.pre_order_time }
        Alert.alert('Are you Sure?', 'Do you Want to Delete the selected item?',
            [{
                text: 'Ok', onPress: () => preOrderRemoveCartId(cartId)
            },
            { text: 'Cancel', onPress: () => null }])

    }

    useEffect(() => {
        getCartDateTime();
        // if (preOrderCart?.length) return 1;
        // getCart();
        // cartAddDateAndUpdate({ pre_order_date: "2022-09-20" });
    }, []);

    useEffect(() => {
        // getTimingsList();
        const backAction = () => {
            const data = preOrderCart?.cart_date_time?.find(item => !item?.menu_list);
            if (data) { setShowAlert(true); setEmptyCart(data) }
            else navigation.goBack();
            return true
        };
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, []);
    useEffect(() => {
        const focusHandler = navigation.addListener('focus', () => {
            getCartDateTime();
            setShowCookList(false);
            setShowFoodList(false);
            setShowCalendar(false);
            setShowTimeList(false);
            setAddAnotherDate(true);
        });
        return focusHandler;
    }, [navigation]);

    // const refreshPage = () => {
    //     if (refresh) {
    //         getCartDateTime();
    //         refresh = false;
    //     }
    // };

    // useEffect(() => {
    //     refreshPage();
    // }, [refresh])



    // useEffect(() => {
    //     customAlert({ title: "ranjith", description: "Ranjith desc", buttons: [{ text: "okkkk", onPress: () => console.log("ok Pressed") }, { text: "Cancellllllkkk", onPress: () => console.log("Cancellllll  Pressed") }] })
    // }, [])

    // const { dateIndex, setDateIndex, datesArr, setDatesArr, selectedDate, setSelectedDate } = usePreOrderHook();

    const getPreOrderCooks = async () => {
        // console.log("response from pre order cooks", selectedItem);
        let response = await api.getPreOrderCooks({ pre_order_date: selectedItem?.pre_order_date });
        // console.log("response from pre order cooks", response);
        setCookList(response.cook_list);
        // setShowCookList(true);
    }
    const getFoodList = async ({ id }) => {
        console.log("selecetde item from foodList", selectedItem);
        let response = await api.getFoodListPreOrder({ cart_id: selectedItem?.cartId, cook_id: id, pre_order_time: selectedItem?.pre_order_time });
        console.log("reposnfincrnc of food list", response);
        setFoodList(response?.menu_items);
    };

    useEffect(() => {
        // if (datesArr.length != 0) {
        console.log("getCartDateTime.length && selectedItem", preOrderCart?.cart_date_time?.length, selectedItem);
        if (preOrderCart?.cart_date_time?.length && selectedItem) getPreOrderCooks();
        // }
    }, [showCookList, setShowCookList]);

    // useEffect(() => {
    //     if (datesArr.length == 0) {
    //         chooseDate({ index: 0, update: false })
    //     }
    // }, [])

    const chooseDate = ({ index, update }) => {
        // console.log("update index", index);
        setShowCalendar(true);
        if (!update) setSelectedIndex(datesArr?.length + 1)
        else setSelectedIndex(index);

    }
    // const chooseTime = ({ index, selectedDate }) => {
    //     setSelectedDate(selectedDate);
    //     setShowCalendar(false);
    //     setShowTimeList(true);
    //     setSelectedIndex(index);
    // }

    const ShowCalendar = () => {
        return (
            <>
                <View style={{ width: '100%', height: '100%', position: 'absolute', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
                    <TouchableOpacity style={{ width: '100%', height: '100%', position: 'absolute', backgroundColor: '#000', opacity: 0.9 }} onPress={() => setShowCalendar(false)} />
                    <Calendar
                        // Initially visible month. Default = now
                        // initialDate={new Date().toDateString()}
                        // hideExtraDays
                        current={moment().add(1, 'days').format('YYYY-MM-DD')}
                        style={{ borderRadius: 15, backgroundColor: '#09b44d', paddingVertical: 7 }}
                        headerStyle={{ backgroundColor: '#fff' }}
                        showSixWeeks={true}
                        enableSwipeMonths
                        // disableArrowLeft={true}
                        // disableArrowRight={true}
                        // disableMonthChange={true}
                        markingType={'dot'}
                        minDate={moment().add(1, 'days').format('YYYY-MM-DD')}
                        maxDate={moment().add(7, 'days').format('YYYY-MM-DD')}
                        // markedDates={{ "2022-09-17": { selected: true } }}
                        onDayPress={day => {
                            console.log("selectedItemmmm", day.dateString);
                            // if (!!selectedItem) preOrderAddDate({ pre_order_date: day.dateString });
                            // else 
                            preOrderAddDate({ cart_id: selectedItem?.cartId, pre_order_date: day.dateString });
                            // setSelectedDate(day.dateString);
                            // const updateVal = datesArr.filter(item => item.index == selectedIndex);
                            // console.log("updateVal", updateVal);
                            // if (updateVal.length > 0) {
                            //     const datesArrUpdate = datesArr.filter(item => item.index !== selectedIndex);
                            //     console.log("datesAaaaaaaaa", datesArrUpdate);
                            //     setDatesArr([...datesArrUpdate, { index: updateVal?.[0]?.index, date: day.dateString, time: "" }])
                            // }
                            // else {
                            //     setDatesArr([...datesArr, { index: selectedIndex, date: day.dateString, time: "" }])
                            // }
                            setShowCalendar(false);
                            setAddAnotherDate(false);
                        }} />
                </View>
            </>
        )

    }

    const listPreOrderCooks = ({ item, index }) => {
        console.log("item.id", item)
        return (
            <TouchableOpacity
                onPress={() => { getFoodList({ id: item.id }); setShowFoodList(true); setShowCookList(false) }
                    // navigation.navigate('FoodDetail', item)
                }
                style={{
                    // flexDirection: 'row',
                    paddingLeft: 5,
                    marginBottom: 10,
                }}>
                <View style={{ flexDirection: 'row', marginBottom: 15, width: '100%', height: 120, marginTop: 5, backgroundColor: '#fff' }}>
                    {/* <View style={{ width: '100%', borderRadius: 5 }}> */}
                    <Image
                        source={{ uri: item?.image }}
                        style={{ width: '45%', height: 120, borderRadius: 15, marginRight: 5 }}
                    />
                    {item?.current_status == 0 && <View style={{ position: 'absolute', width: '45%', height: 120, backgroundColor: 'grey', opacity: 0.7, borderRadius: 15 }} />}
                    {/* </View> */}
                    <View style={{ justifyContent: 'space-between', width: '50%' }}>
                        <Text style={{ fontSize: 16, fontFamily: 'Poppins-Regular' }} numberOfLines={2}>
                            {item.first_name}
                        </Text>
                        {/* <View style={{}}> */}
                        <Text
                            style={{
                                alignSelf: 'flex-start',
                                // width: 110,
                                fontSize: 13,
                                fontFamily: 'Poppins-Regular',
                                fontWeight: 'normal',
                                alignItems: 'flex-start',
                                // lineHeight: 23,
                                justifyContent: 'center',
                                color: '#989898',
                                backgroundColor: '#f4fbf8',
                                paddingRight: 10,
                            }}>
                            {item.viewmenuitem.cuisine.userlanguage.name}
                        </Text>
                        {/* <Text
                            style={{
                                width: 120,
                                fontSize: 13,
                                fontFamily: 'Poppins-Regular',
                                fontWeight: 'normal',
                                alignItems: 'flex-start',
                                // lineHeight: 23,
                                justifyContent: 'center',
                                color: '#989898',
                            }}>
                            ₹{item?.cost_for_two} for two
                        </Text> */}
                        <Text
                            style={{
                                width: "100%",
                                fontSize: 13,
                                fontFamily: 'Poppins-Regular',
                                fontWeight: 'normal',
                                alignItems: 'flex-start',
                                // lineHeight: 23,
                                justifyContent: 'center',
                                color: '#989898',
                            }}>
                            {item?.area}
                        </Text>
                        <Text style={{ height: 30, fontFamily: 'Poppins-Medium', fontSize: 13, color: item?.current_status == 0 ? 'tomato' : PrimaryGreen, alignSelf: 'flex-start' }}> {item?.current_status == 0 ? 'Unserviceable' : item?.delivery_notes}</Text>
                        {/* <LinearGradient colors={[item?.current_status == 0 ? 'grey' : '#7bffb0', '#fff']} style={{ height: 30, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} >

                            <Text
                                style={{
                                    fontSize: 12,
                                    fontFamily: 'Poppins-Medium',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginLeft: 6,
                                    paddingLeft: 20,
                                    color: item?.current_status == 0 ? '#000' : PrimaryGreen,
                                }}>
                                {item.dtime} mins
                            </Text>
                        </LinearGradient> */}
                        {item.cook_offer == 1 ? (
                            <View style={styles.delLoc}>
                                <Image style={{ width: 18, height: 18 }} source={offerIcon} />
                                <Text
                                    style={{
                                        fontSize: 14.5,
                                        fontFamily: 'Poppins-Regular',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginLeft: 6,
                                    }}>
                                    Try Homee Foodz
                                </Text>
                            </View>
                        ) : null}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const AddButton = ({ item }) => {
        // console.log("itemmmmmmmmmmmmm", item);
        const cartDetail = JSON.parse(item?.cart_details);
        const [itemQuantity, setItemQuantity] = useState(cartDetail?.quantity);

        // console.log("wueufinicscds",);
        return (<>
            {cartDetail?.quantity ?
                <>
                    <View style={{ minWidth: 65, maxWidth: 85, flexDirection: 'row', marginTop: 5, justifyContent: 'center', backgroundColor: '#29C270', borderRadius: 10, alignItems: 'center', height: 30, paddingHorizontal: 5 }}>
                        {/* <TouchableOpacity > */}
                        <Text style={{ width: '25%', color: '#fff', fontWeight: 'bold', fontSize: 24, paddingHorizontal: 3 }} onPress={() => { minusFromCart({ id: cartDetail?.cart_id }); getFoodList({ id: item?.id }) }}>-</Text>
                        {/* </TouchableOpacity> */}
                        <TextInput keyboardType='numeric' style={{ width: '50%', color: '#fff', height: 35, paddingHorizontal: 3, alignItems: 'center', fontWeight: 'bold', fontSize: 14, marginTop: 5 }} textAlign={"center"} placeholder={cartDetail?.quantity.toString()} onSubmitEditing={() => addMoreToCart({ cart_id: cartDetail?.cart_id, quantity: itemQuantity })} onBlur={() => addMoreToCart({ cart_id: cartDetail?.cart_id, quantity: itemQuantity })} value={itemQuantity?.toString()} onChangeText={setItemQuantity} />
                        {/* <Text>{cartDetail?.quantity}</Text> */}
                        {/* <TouchableOpacity onPress={() => { addToCart({ menu_item_id: item?.menu_id, cook_id: item?.id, pre_order_date: datesArr.find(item => item.index == selectedIndex).date, pre_order_time: datesArr.find(item => item.index == selectedIndex).time }); getFoodList({ id: item?.id }); }}> */}
                        <Text style={{ width: '25%', color: '#fff', fontWeight: 'bold', fontSize: 20, paddingHorizontal: 3 }} onPress={() => { addToCart({ cart_id: selectedItem?.cartId, menu_item_id: item?.menu_id, cook_id: item?.id, pre_order_date: selectedItem?.pre_order_date, pre_order_time: selectedItem?.pre_order_time }); getFoodList({ id: item?.id }); getCartDateTime(); }}>+</Text>
                        {/* </TouchableOpacity> */}
                    </View>
                </> :
                <>
                    <TouchableOpacity
                        style={{ flexDirection: 'row', width: 65, marginTop: 5, justifyContent: 'center', backgroundColor: '#29C270', borderRadius: 10, alignItems: 'center', height: 30, paddingHorizontal: 5, }}
                        onPress={() => { addToCart({ cart_id: selectedItem?.cartId, menu_item_id: item?.menu_id, cook_id: item?.id, pre_order_date: selectedItem?.pre_order_date, pre_order_time: selectedItem?.pre_order_time }); getFoodList({ id: item?.id }); getCartDateTime(); }}
                    >
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14, }}>Add</Text>
                    </TouchableOpacity>
                </>
            }
        </>);
    }

    const renderFoodList = ({ item }) => {
        const cartDetail = JSON.parse(item?.cart_details);
        // item && item?.map(items => {
        console.log("ccooklllkdskeevesvs", item);
        // })
        return (
            <View key={item?.index} style={{
                width: width / 2.3,
                backgroundColor: '#fff',
                borderBottomLeftRadius: 15,
                borderBottomRightRadius: 15,
                marginHorizontal: 5,
                marginTop: 15,
                marginBottom: 10,
                paddingHorizontal: 5,
                paddingBottom: 5,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 15,
                elevation: 3,
                // paddingTop: 5
            }} >
                <View style={{ width: width / 2.3, borderRadius: 15 }}>
                    <Image
                        source={{ uri: item?.food_image }}
                        style={{ width: "100%", height: 130, borderTopLeftRadius: 15, borderTopRightRadius: 15 }}
                    />
                </View>
                <View style={{ flex: 5, paddingLeft: '5%' }}>
                    <Text style={{ flex: 3, width: 150, fontSize: 14, fontFamily: 'Poppins-Medium', paddingTop: 10 }}>
                        {item?.name}
                    </Text>

                </View>
                <View style={{ flexDirection: 'row', width: 140, justifyContent: 'space-between', alignItems: 'center', marginTop: -10, marginBottom: 3 }}>

                    <Text
                        style={{
                            // flex: 1,
                            fontSize: 16,
                            fontFamily: 'Poppins-Bold',
                            marginTop: 10,
                        }}>
                        ₹ {item?.final_price}
                    </Text>
                    <AddButton item={item} />
                </View>
            </View >)
    }

    // const ShowSelectTimer = () => {
    //     return (
    // <></>

    //     )
    // }

    // const PreOrder = () => {
    //     return (
    //         <>
    //             <ScrollView key="preOrder" nestedScrollEnabled={true} style={{ width, height }} >
    //                 <View style={{ width, height: height - 60, alignItems: 'center', paddingTop: 20, borderRadius: 15, backgroundColor: '#fff', paddingBottom: 5 }}>
    //                     {datesArr?.length == 0 ? <TouchableOpacity
    //                         style={{ flexDirection: 'row', width: '85%', borderWidth: 1, borderColor: '#29C270', backgroundColor: '#fff', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderRadius: 10, paddingVertical: 5, paddingHorizontal: 10 }}
    //                         onPress={() => chooseDate({ index: selectedIndex, update: false })}>
    //                         <Text style={{ fontSize: 16, fontFamily: 'Poppins-Regular', color: '#29C270', letterSpacing: 1 }}>Choose Your Date</Text>
    //                         <Text style={{ fontSize: 24, color: '#29C270', letterSpacing: 1 }}>+</Text>
    //                     </TouchableOpacity> : (<>
    //                         {datesArr?.map((item) => {
    //                             console.log("datesArr length > 0 =====", item.index);
    //                             return (<>
    //                                 <View key={item.index.toString()} style={{ flexDirection: 'row', width: '75%', alignItems: 'center' }}>
    //                                     <View style={{ flexDirection: 'row', width: '100%', padding: 5, borderWidth: 1, borderColor: item?.index == selectedIndex ? 'red' : '#29C270', borderRadius: 10, justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, marginBottom: 10 }}>
    //                                         <TouchableOpacity style={{}} onPress={() => { chooseDate({ index: item.index, update: true }) }}>
    //                                             <Text>
    //                                                 {moment(item.date).format("DD MMM, YYYY")}
    //                                             </Text>
    //                                         </TouchableOpacity>
    //                                         <TouchableOpacity onPress={() => chooseTime({ index: item.index, selectedDate: item.date })}>
    //                                             <Text>
    //                                                 {item.time ? item.time : "Time Slot"}
    //                                             </Text>
    //                                         </TouchableOpacity>
    //                                     </View>
    //                                     {/* <Text>Delete</Text> */}
    //                                     <Image style={{ width: 25, height: 25, tintColor: 'red', marginLeft: 7 }} source={deleteIcon} />
    //                                 </View>
    //                             </>)
    //                         })}
    //                         {showCookList && (
    //                             <View style={{ marginTop: 10, backgroundColor: 'ghostwhite', borderRadius: 10, elevation: 10, paddingTop: 10 }}>
    //                                 <Text style={{ fontWeight: 'bold', marginLeft: 10, fontSize: 16 }}>List of cook available on {moment(selectedDate).format("DD MMM, YYYY")}</Text>
    //                                 <FlatList
    //                                     // horizontal
    //                                     nestedScrollEnabled={true}
    //                                     style={{ marginVertical: 10, marginLeft: 0, }}
    //                                     data={cookList}
    //                                     listKey={(item, index) => `_key${index.toString()}`}
    //                                     keyExtractor={(item, index) => `_key${index.toString()}`}
    //                                     renderItem={listPreOrderCooks}
    //                                     onEndReachedThreshold={0}
    //                                     showsVerticalScrollIndicator={false}
    //                                 // numColumns={2}
    //                                 />
    //                             </View>
    //                         )}
    //                         {showFoodList && (
    //                             <>
    //                                 <ScrollView style={{ backgroundColor: 'pink', borderRadius: 10, elevation: 10, paddingTop: 10, }}>
    //                                     <View style={{ flexDirection: 'row' }}>
    //                                         <TouchableOpacity onPress={() => { setShowFoodList(false); setShowCookList(true); }}>
    //                                             <Image style={{ width: 25, height: 25, tintColor: '#29C270' }} source={leftArrow} />
    //                                         </TouchableOpacity>
    //                                         <Text style={{ fontWeight: 'bold', marginLeft: 10, fontSize: 16 }}>Food List on {moment(selectedDate).format("DD MMM ")} and {time.slice(0, -3)}</Text>
    //                                     </View>
    //                                     {/* <Text style={{ fontWeight: 'bold', marginLeft: 10, fontSize: 16 }}>List of cook available on {moment(selectedDate).format("DD MMM, YYYY")}</Text> */}
    //                                     <FlatList
    //                                         // horizontal
    //                                         nestedScrollEnabled={true}
    //                                         style={{ marginLeft: 0 }}
    //                                         data={foodList}
    //                                         listKey={(item, index) => `_key${index.toString()}`}
    //                                         keyExtractor={(item, index) => `_key${index.toString()}`}
    //                                         renderItem={renderFoodList}
    //                                         onEndReachedThreshold={0}
    //                                         showsVerticalScrollIndicator={false}
    //                                         numColumns={2}
    //                                     />
    //                                     <TouchableOpacity
    //                                         style={{ width: 100, justifyContent: 'center', alignItems: 'center', backgroundColor: '#09b44d', marginTop: 20, alignSelf: 'center', borderRadius: 7 }}
    //                                         onPress={() => { setShowFoodList(false); setShowCookList(false); setAddAnotherDate(true) }}>
    //                                         <Text style={{ color: '#fff', fontWeight: 'bold', paddingVertical: 5, paddingHorizontal: 3, }}>Done</Text>
    //                                     </TouchableOpacity>
    //                                 </ScrollView>
    //                             </>
    //                         )}
    //                         {addAnotherDate && !showCookList && <TouchableOpacity
    //                             style={{ flexDirection: 'row', width: '75%', padding: 5, borderWidth: 1, borderColor: '#29C270', borderRadius: 10, alignItems: 'center', paddingHorizontal: 15, marginTop: 20 }}
    //                             onPress={() => chooseDate({ index: selectedIndex, update: false })}>
    //                             <Text>Add Another Date</Text>
    //                         </TouchableOpacity>}
    //                     </>)
    //                     }
    //                 </View>
    //             </ScrollView>
    //             {showCalendar && <ShowCalendar />}
    //             <DatePicker
    //                 modal
    //                 open={showTimeList}
    //                 date={new Date(selectedDate)}
    //                 mode={'time'}

    //                 onConfirm={(date) => {
    //                     console.log("date", date);
    //                     setShowTimeList(false);
    //                     setGetCookList(false);
    //                     setTime(moment(date).format('hh:mm:ss'));
    //                     // updateTime();
    //                     const updateVal = datesArr.filter(item => item.index == selectedIndex);
    //                     console.log("updateVal", updateVal);
    //                     // if (updateVal.length > 0) {
    //                     const datesArrUpdate = datesArr.filter(item => item.index !== selectedIndex);
    //                     console.log("datesAaaaaaaaa", datesArrUpdate);
    //                     setDatesArr([...datesArrUpdate, { index: updateVal?.[0]?.index, date: selectedDate, time: moment(date).format('hh:mm A') }])
    //                     // }
    //                     // else {
    //                     //     setDatesArr([...datesArr, { index: selectedIndex, date: selectedDate, time: moment(date).format('hh:mm A') }])
    //                     // }
    //                     // setDate(date)
    //                     // setAddAnotherDate(true);
    //                 }}
    //                 onCancel={() => {
    //                     setShowTimeList(false)
    //                     // setAddAnotherDate(true);
    //                     setGetCookList(false);
    //                 }}
    //             />
    //         </>
    //     )
    // };

    const PreOrderList = () => {
        // const [open, setOpen] = useState(false);
        return (
            <>
                <View style={{ width: '100%', marginTop: 20, alignItems: 'center' }}>
                    {preOrderCart?.cart_date_time?.length ? preOrderCart?.cart_date_time?.map(item => {
                        const menuList = JSON.parse(item?.menu_list);
                        const cookDetails = JSON.parse(item?.cook_details);
                        const [open, setOpen] = useState(false);
                        // console.log("itemmmmmmmmmmmmmmmmmmmm", menuList);
                        return (<>
                            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'center', marginBottom: 7, marginTop: 7 }}>
                                <TouchableOpacity onPress={() => preOrderRemoveCart(item?.cartId)}>
                                    <Image source={deleteIcon} style={{ width: 25, height: 25, marginRight: 5, tintColor: 'red' }} />
                                </TouchableOpacity>
                                <View style={{ flexDirection: 'row', width: '75%', padding: 5, borderWidth: 1, borderColor: item?.index == selectedIndex ? 'red' : '#29C270', borderRadius: 10, justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15 }}>
                                    <TouchableOpacity onPress={() => { setShowCalendar(true); setSelectedItem(item) }} >
                                        <Text style={{ fontFamily: 'Poppins-Regular' }}>
                                            {item?.pre_order_date ? item?.pre_order_date : "Select date"}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { setShowTimeList(true); setSelectedItem(item) }} >
                                        <Text style={{ fontFamily: 'Poppins-Regular' }}>
                                            {item?.pre_order_time ? item?.pre_order_time : "Pick Time"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ width: 30, height: 30, marginLeft: 5, justifyContent: 'center', alignItems: 'center', }}>
                                    {menuList && <TouchableOpacity style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', }} onPress={() => setOpen(!open)}>
                                        <Image source={arrow} style={{ width: 15, height: 15, resizeMode: 'center', transform: [{ rotate: open ? '270deg' : '90deg' }], tintColor: '#000' }} />
                                    </TouchableOpacity>}
                                </View>
                            </View>
                            {open && menuList && <>
                                <View style={{ width: '80%', backgroundColor: '#e6f7ef', paddingBottom: 10, marginBottom: 12, borderRadius: 7, elevation: 1, justifyContent: 'center', }}>
                                    {cookDetails &&
                                        <View style={{ paddingBottom: 4, alignItems: 'center' }}>
                                            <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 13 }}>Items in Cart from {cookDetails?.first_name}</Text>
                                        </View>
                                    }
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 10, }}>
                                        <Text style={{ fontFamily: 'Poppins-Medium', width: '70%', fontSize: 12 }}>Item Name</Text>
                                        <Text style={{ fontFamily: 'Poppins-Medium', width: '15%', fontSize: 12 }}>Qty</Text>
                                        <Text style={{ fontFamily: 'Poppins-Medium', width: '15%', fontSize: 12 }}>Price</Text>
                                    </View>
                                    {!!menuList && menuList?.map(menuitem => {
                                        console.log("itemmmmm1111", menuitem);
                                        return (
                                            <>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 10, }}>
                                                    <Text style={{ fontFamily: 'Poppins-Regular', width: '70%', fontSize: 12 }}>{`➤  ${menuitem?.name}`}</Text>
                                                    <Text style={{ fontFamily: 'Poppins-Regular', width: '15%', fontSize: 12 }}>{menuitem?.quantity}</Text>
                                                    <Text style={{ fontFamily: 'Poppins-Regular', width: '15%', fontSize: 12 }}>₹ {menuitem?.final_price}</Text>
                                                </View>
                                            </>
                                        )
                                    })}
                                </View>

                            </>}
                        </>)
                    })
                        :
                        <TouchableOpacity
                            style={{ flexDirection: 'row', width: '85%', borderWidth: 1, borderColor: '#29C270', backgroundColor: '#fff', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderRadius: 10, paddingVertical: 5, paddingHorizontal: 10 }}
                            onPress={() => { setShowCalendar(true); setSelectedItem(null); }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Poppins-Regular', color: '#29C270', letterSpacing: 1 }}>Choose Your Date</Text>
                            <Text style={{ fontSize: 24, color: '#29C270', letterSpacing: 1 }}>+</Text>
                        </TouchableOpacity>
                    }
                    {showCookList && (cookList.length > 0 ? (
                        <View style={{ marginTop: 10, backgroundColor: 'ghostwhite', borderRadius: 10, elevation: 10, paddingTop: 10 }}>
                            <Text style={{ fontWeight: 'bold', marginLeft: 10, fontSize: 16 }}>{`${cookList.length > 1 ? 'List of cooks' : 'cook'} available on `}{moment(selectedItem?.pre_order_date).format("DD MMM, YYYY")}</Text>
                            <FlatList
                                // horizontal
                                nestedScrollEnabled={true}
                                style={{ marginVertical: 10, marginLeft: 0, }}
                                data={cookList}
                                listKey={(item, index) => `_key${index.toString()}`}
                                keyExtractor={(item, index) => `_key${index.toString()}`}
                                renderItem={listPreOrderCooks}
                                onEndReachedThreshold={0}
                                showsVerticalScrollIndicator={false}
                            // numColumns={2}
                            />
                        </View>
                    ) : <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontFamily: 'Poppins-Bold', fontWeight: 'bold', fontSize: 18 }}>Sorry!</Text>
                        <Text style={{ fontFamily: 'Poppins-Regular', fontWeight: 'bold', fontSize: 16 }}>No Cooks accepts Advance Order on selected Date</Text>
                    </View>)}
                    {showFoodList && (foodList.length > 0 ?
                        <>
                            <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: '#e6f7ef', borderRadius: 10, elevation: 10, paddingTop: 10, marginBottom: 100, paddingBottom: 30, paddingHorizontal: 7 }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <TouchableOpacity onPress={() => { setShowFoodList(false); setShowCookList(true); }}>
                                        <Image style={{ width: 25, height: 25, tintColor: '#29C270' }} source={leftArrow} />
                                    </TouchableOpacity>
                                    <Text style={{ fontWeight: 'bold', marginLeft: 10, fontSize: 16 }}>Food Available on {moment(selectedItem?.pre_order_date).format("DD MMM ")} and {selectedItem?.pre_order_time}</Text>
                                </View>
                                {/* <Text style={{ fontWeight: 'bold', marginLeft: 10, fontSize: 16 }}>List of cook available on {moment(selectedDate).format("DD MMM, YYYY")}</Text> */}
                                <FlatList
                                    // horizontal
                                    nestedScrollEnabled={true}
                                    style={{ marginLeft: 0 }}
                                    data={foodList}
                                    listKey={(item, index) => `_key${index.toString()}`}
                                    keyExtractor={(item, index) => `_key${index.toString()}`}
                                    renderItem={renderFoodList}
                                    onEndReachedThreshold={0}
                                    showsVerticalScrollIndicator={false}
                                    numColumns={2}
                                />
                                {foodList.find(item => item.cart_details) && <TouchableOpacity
                                    style={{ width: 100, justifyContent: 'center', alignItems: 'center', backgroundColor: '#09b44d', marginTop: 20, alignSelf: 'center', borderRadius: 7, marginBottom: 20 }}
                                    onPress={() => {
                                        // const cartAdded = JSON.parse(selectedItem?.menu_list);
                                        // console.log("foooooods2222222List", selectedItem);
                                        getCartDateTime();
                                        setShowCookList(false);
                                        setShowFoodList(false);
                                        setAddAnotherDate(true);
                                        // if (selectedItem?.menu_list && JSON.parse(selectedItem?.menu_list)?.length)
                                        //  { console.log("selectedItem?.menu_list", JSON.parse(selectedItem?.menu_list)?.length); setShowFoodList(false); setShowCookList(false); setAddAnotherDate(true); getCartDateTime(); } 
                                    }}>
                                    <Text style={{ color: '#fff', fontWeight: 'bold', paddingVertical: 5, paddingHorizontal: 3, }}>Done</Text>
                                </TouchableOpacity>}
                            </ScrollView>
                        </>
                        : <View style={{ flex: 1, justifyContent: 'center', }}>
                            {/* <View > */}
                            <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => { setShowFoodList(false); setShowCookList(true); }}>
                                <Image style={{ width: 25, height: 25, tintColor: '#29C270' }} source={leftArrow} />
                                <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 16, marginLeft: 10 }}>Show Cook List</Text>
                            </TouchableOpacity>
                            {/* </View> */}
                            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 18, alignSelf: 'center', marginTop: 25 }}>{`oh ho, Sorry!🥺`}</Text>
                            <Text style={{ fontFamily: 'Poppins-Regular', fontWeight: '800', fontSize: 16, }}>{`No Food Item Available on the selected time, please try with other time slot 🙂`}</Text>
                        </View>
                    )}
                    {preOrderCart?.cart_date_time?.length > 0 && !showCookList && !showFoodList && addAnotherDate && <TouchableOpacity
                        style={{ flexDirection: 'row', width: '75%', padding: 5, borderWidth: 1, borderColor: '#29C270', borderRadius: 10, alignItems: 'center', paddingHorizontal: 15, marginTop: 10 }}
                        onPress={() => { setShowCalendar(true); setSelectedItem(null); }}>
                        <Text style={{ fontFamily: 'Poppins-Regular' }}>Add Another Date</Text>
                    </TouchableOpacity>}

                    {/* {showTimeList && <ShowSelectTimer />} */}
                    <DatePicker
                        modal
                        open={showTimeList}
                        date={new Date()}
                        mode={'time'}

                        onConfirm={(date) => {
                            console.log("dateeeeeeeeeeeeeeeeeeeeeeeeeee", selectedItem);
                            // setSelectedItem({ ...selectedItem, pre_order_time: moment(date).format('hh:mm A') });
                            preOrderAddTiming(moment(date).format('hh:mm A'));
                            setShowTimeList(false);
                            setShowCookList(true);
                            setShowFoodList(false);
                            // setGetCookList(false);
                            // setTime(moment(date).format('hh:mm:ss'));
                            // updateTime();
                            // const updateVal = datesArr.filter(item => item.index == selectedIndex);
                            // console.log("updateVal", updateVal);
                            // // if (updateVal.length > 0) {
                            // const datesArrUpdate = datesArr.filter(item => item.index !== selectedIndex);
                            // console.log("datesAaaaaaaaa", datesArrUpdate);
                            // setDatesArr([...datesArrUpdate, { index: updateVal?.[0]?.index, date: selectedDate, time: moment(date).format('hh:mm A') }])
                            // }
                            // else {
                            //     setDatesArr([...datesArr, { index: selectedIndex, date: selectedDate, time: moment(date).format('hh:mm A') }])
                            // }
                            // setDate(date)
                            // setAddAnotherDate(true);
                        }}
                        onCancel={() => {
                            console.log("selected itemmm", selectedItem);
                            setShowTimeList(false);
                            setShowCookList(false);
                            // setAddAnotherDate(true);
                            setGetCookList(false);
                        }}
                    />
                </View>
                {/* </ScrollView> */}
                {/* <View style={{ width: '100%', height: 50, justifyContent: 'center', alignItems: 'center' }}>
                    {cart.map(item => {
                        return (<>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <View style={{ width: '75%', flexDirection: 'row', padding: 5, borderWidth: 1, borderColor: '#29C270', elevation: 5, backgroundColor: '#fff', marginTop: 12, borderRadius: 10, justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text>{item.pre_order_date}</Text>
                                    <Text>{item.pre_order_time}</Text>
                                </View>
                                <Image source={deleteIcon} style={{ width: 25, height: 25, marginTop: 12, marginLeft: 5, tintColor: 'red' }} />
                            </View>
                        </>)
                    })}
                </View> */}
            </>
        )
    }

    const getPreOrderBanner = async () => {
        const response = await api.getPreOrderBanner();
        setBanner(response?.image)
    }
    useEffect(() => {
        getPreOrderBanner();
    }, [])

    return (
        <>
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar backgroundColor='#09B44D' barStyle={'light-content'} />
                {showAlert && <CustomAlert
                    title={{ text: "Want to delete and Go Back?" }}
                    description={{ text: `No Item added to the cart on ${emptyCart?.pre_order_date} ${emptyCart?.pre_order_time ? "and " + emptyCart?.pre_order_time : ""}` }}
                    buttons={[
                        { text: "OK", onPress: () => { console.log("delete panna vendiya id", emptyCart?.cartId); preOrderRemoveCartId(emptyCart?.cartId); navigation.goBack() } },
                        { text: "CANCEL", onPress: () => setShowAlert(false) },
                    ]}
                />}

                {showCalendar && <ShowCalendar />}
                <View
                    style={{
                        backgroundColor: '#09b44d',
                        // marginBottom: 20,
                        height: 50,
                        borderBottomLeftRadius: 25,
                        borderBottomRightRadius: 25,
                    }}>
                    <TouchableOpacity
                        onPress={() => {
                            const data = preOrderCart?.cart_date_time?.find(item => !item?.menu_list);
                            if (data) { setShowAlert(true); setEmptyCart(data) }
                            else navigation.goBack();
                        }}
                        style={{
                            height: '100%',
                            flexDirection: 'row',
                            paddingHorizontal: 15,
                            // paddingVertical: 15,
                            alignItems: 'center',
                        }}>
                        <Image style={{ width: 25, height: 25, tintColor: '#fff' }} source={leftArrow} />
                        <Text style={{
                            color: '#fff',
                            fontSize: 18,
                            fontFamily: 'Poppins-Bold',
                            marginLeft: 10,
                            marginTop: 5,
                        }}>Advance Order</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView style={{ width: '100%', maxHeight: height - 90 }}>

                    <View style={{ width: '98%', height: 200, alignSelf: 'center', }}>
                        <Image source={{ uri: banner }} style={{ width: '100%', height: '100%', marginTop: 7 }} />
                    </View>

                    {/* <ScrollView style={{ height: '100%', width: '100%', backgroundColor: 'red'}}> */}
                    {/* <PreOrder /> */}
                    <PreOrderList />
                    {/* </ScrollView> */}
                    {/* {!showFoodList && !showCookList && <View style={{ width: '100%', alignItems: 'center', paddingVertical: 10, marginVertical: 10 }}>
                        <View style={{ width: '90%', backgroundColor: 'snow', borderRadius: 10, elevation: 2, paddingLeft: 7 }}>
                            <Text style={{ fontSize: 18, fontFamily: 'Poppins-Bold', textAlign: 'center' }}>Order Summary</Text>
                            {preOrderCart?.length ? preOrderCart?.map((item, index) => {
                                const cookDetails = JSON.parse(item?.cook_details);
                                const menuItems = JSON.parse(item?.menu_list);
                                index == 0 && console.log("item", menuItems);
                                return (<>
                                    {menuItems?.length && <>
                                        <Text style={{ fontSize: 14, fontFamily: 'Poppins-Medium', marginBottom: 7, marginTop: 15 }}>{`${moment(item?.pre_order_date).format('DD MMM, YYYY')} and ${item?.pre_order_time}`}</Text>
                                        {menuItems?.map(item => (
                                            <>
                                                <View style={{ flexDirection: 'row', paddingVertical: 3, backgroundColor: 'linen', marginVertical: 3, borderRadius: 7, elevation: 2, marginRight: 10 }}>
                                                    <Image source={{ uri: item.food_image }} style={{ width: 50, height: 50 }} />
                                                    <View>
                                                        <Text style={{ paddingLeft: 10, fontFamily: 'Poppins-Medium', fontSize: 12 }}>{item?.name}</Text>
                                                        <Text style={{ paddingLeft: 10, fontFamily: 'Poppins-Medium', fontSize: 12 }}>{`${item?.final_price} X ${item?.quantity}`}</Text>
                                                    </View>
                                                </View>
                                            </>))}

                                    </>}
                                </>)
                            }) : (<></>)}
                        </View>

                    </View>} */}

                </ScrollView>
                {preOrderCart?.cart_date_time?.length > 0 && parseFloat(preOrderCart?.totalAmount) > 0 && <View style={{
                    height: 50,
                    flexDirection: 'row',
                    backgroundColor: '#09b44d',
                    borderTopLeftRadius: 15,
                    borderTopRightRadius: 15,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: 25
                }}>
                    <Text style={{ fontSize: 18, fontFamily: 'Poppins-Bold', color: '#fff' }}>{`Total ₹ ${preOrderCart?.item_amount}`}</Text>
                    <TouchableOpacity onPress={() => {
                        getCartDateTime();
                        const data = preOrderCart?.cart_date_time?.find(item => !item?.menu_list);
                        if (data) {
                            Alert.alert("No Item added", `Please add atleast one item to cart on ${data?.pre_order_date} ${data?.pre_order_time ? "and " + data?.pre_order_time : ""} or press delete to delete and proceed`,
                                [{ text: "Delete & proceed", onPress: () => { preOrderRemoveCartId(data?.cartId); navigation.navigate('CartPage', { preOrder: true }) } }, { text: "Cancel" }])
                        }
                        else navigation.navigate('CartPage', { preOrder: true })
                    }}>
                        <Text style={{ fontSize: 18, fontFamily: 'Poppins-Bold', color: '#fff' }}>View Cart</Text>
                    </TouchableOpacity>
                </View>}
            </SafeAreaView>
        </>
    )
}

export default PreOrder