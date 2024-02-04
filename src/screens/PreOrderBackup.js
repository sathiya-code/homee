import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, Image, Alert, BackHandler, FlatList, ScrollView, Dimensions, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Calendar } from 'react-native-calendars';
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
    const [addAnotherDate, setAddAnotherDate] = useState(false);
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
    const [showAlert, setShowAlert] = useState(false);
    const [cookList, setCookList] = useState([]);
    const [showCookList, setShowCookList] = useState(false);
    const [getCooksList, setGetCookList] = useState(false);
    const [time, setTime] = useState(moment().format('HH:mm'));
    const [showFoodList, setShowFoodList] = useState(false);
    const [foodList, setFoodList] = useState([]);
    const [cart, setCart] = useState([]);
    const [preOrderCart, setPreOrderCart] = useState([]);

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
        console.log(":id", id);
        const response = await api.preOrderCartMinus(id)
        // console.log("response from minus from cart", response);
    };
    const addMoreToCart = async (data) => {
        //required params {cart_id, quantity}
        const response = await api.preOrderCartAddMore(data)
        // console.log("response from add to cart", response);
    }

    const getCart = async () => {
        const getCart = await api.getPreOrderCart();
        // console.log("getCart", getCart.cartData);
        setCart(getCart.cartData);
    };

    const cartListAndUpdate = async (date) => {
        //{pre_order_date} required params
        const response = await api.preOrderAddTiming(date)
        console.log("response", response);
        setPreOrderCart(response?.cart_details)
    }

    useEffect(() => {
        getCart();
        cartListAndUpdate({ pre_order_date: "2022-09-20" });
    }, []);

    useEffect(() => {
        // getTimingsList();
        const backAction = () => { setShowAlert(true); return true };
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, []);



    // useEffect(() => {
    //     customAlert({ title: "ranjith", description: "Ranjith desc", buttons: [{ text: "okkkk", onPress: () => console.log("ok Pressed") }, { text: "Cancellllllkkk", onPress: () => console.log("Cancellllll  Pressed") }] })
    // }, [])

    // const { dateIndex, setDateIndex, datesArr, setDatesArr, selectedDate, setSelectedDate } = usePreOrderHook();

    const getPreOrderCooks = async () => {
        let response = await api.getPreOrderCooks({ pre_order_date: selectedDate });
        // console.log("response from pre order cooks", response);
        setCookList(response.cook_list);
        setShowCookList(true);
    }
    const getFoodList = async ({ id }) => {
        let response = await api.getFoodListPreOrder({ cook_id: id, pre_order_time: time });
        // console.log("reposnfincrnc of food list", response?.menu_items);
        setFoodList(response?.menu_items);
    }

    useEffect(() => {
        if (datesArr.length != 0) {
            getPreOrderCooks();
        }
    }, [setTime, time]);

    useEffect(() => {
        if (datesArr.length == 0) {
            chooseDate({ index: 0, update: false })
        }
    }, [])

    const chooseDate = ({ index, update }) => {
        // console.log("update index", index);
        setShowCalendar(true);
        if (!update) setSelectedIndex(datesArr.length + 1)
        else setSelectedIndex(index);

    }
    const chooseTime = ({ index, selectedDate }) => {
        setSelectedDate(selectedDate);
        setShowCalendar(false);
        setShowTimeList(true);
        setSelectedIndex(index);
    }

    const ShowCalendar = () => {
        return (
            <>
                <View style={{ width: '100%', height: '100%', position: 'absolute', justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity style={{ width: '100%', height: '100%', position: 'absolute', backgroundColor: '#000', opacity: 0.9 }} onPress={() => setShowCalendar(false)} />
                    <Calendar
                        // Initially visible month. Default = now
                        // initialDate={new Date().toDateString()}
                        style={{ borderRadius: 15, backgroundColor: '#09b44d', paddingVertical: 7 }}
                        headerStyle={{ backgroundColor: '#fff' }}
                        disableArrowLeft={true}
                        disableArrowRight={true}
                        disableMonthChange={true}
                        markingType={'dot'}
                        markedDates={{ "2022-09-17": { selected: true } }}
                        onDayPress={day => {
                            setSelectedDate(day.dateString);
                            const updateVal = datesArr.filter(item => item.index == selectedIndex);
                            console.log("updateVal", updateVal);
                            if (updateVal.length > 0) {
                                const datesArrUpdate = datesArr.filter(item => item.index !== selectedIndex);
                                console.log("datesAaaaaaaaa", datesArrUpdate);
                                setDatesArr([...datesArrUpdate, { index: updateVal?.[0]?.index, date: day.dateString, time: "" }])
                            }
                            else {
                                setDatesArr([...datesArr, { index: selectedIndex, date: day.dateString, time: "" }])
                            }
                            setShowCalendar(false);
                            setAddAnotherDate(false);
                        }} />
                </View>
            </>
        )

    }

    const listPreOrderCooks = ({ item, index }) => {
        console.log("item.id", item.id)
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
                        source={{ uri: item?.viewmenuitem?.image }}
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
                        <LinearGradient colors={[item?.current_status == 0 ? 'grey' : '#7bffb0', '#fff']} style={{ height: 30, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} >
                            <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 16, color: item?.current_status == 0 ? '#000' : PrimaryGreen, paddingLeft: 2, alignSelf: 'flex-start' }}> {item?.current_status == 0 ? 'Unserviceable' : 'Fast Delivery'}</Text>
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
                        </LinearGradient>
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

        console.log("wueufinicscds", cartDetail?.pre_order_date == datesArr.find(item => item.index == selectedIndex).date, cartDetail?.pre_order_time == datesArr.find(item => item.index == selectedIndex).time);
        return (<>
            {cartDetail?.pre_order_date == datesArr.find(item => item.index == selectedIndex).date && cartDetail?.pre_order_time == datesArr.find(item => item.index == selectedIndex).time && parseInt(cartDetail?.quantity) > 0 ?
                <>
                    <View style={{ minWidth: 65, maxWidth: 85, flexDirection: 'row', marginTop: 5, justifyContent: 'center', backgroundColor: '#29C270', borderRadius: 10, alignItems: 'center', height: 30, paddingHorizontal: 5 }}>
                        {/* <TouchableOpacity > */}
                        <Text style={{ width: '25%', color: '#fff', fontWeight: 'bold', fontSize: 24, paddingHorizontal: 3 }} onPress={() => { minusFromCart({ id: cartDetail?.cart_id }); getFoodList({ id: item?.id }) }}>-</Text>
                        {/* </TouchableOpacity> */}
                        <TextInput style={{ width: '50%', color: '#fff', height: 35, paddingHorizontal: 3, alignItems: 'center', fontWeight: 'bold', fontSize: 14, marginTop: 5 }} textAlign={"center"} placeholder={cartDetail?.quantity.toString()} onSubmitEditing={() => addMoreToCart({ cart_id: cartDetail?.cart_id, quantity: itemQuantity })} onBlur={() => addMoreToCart({ cart_id: cartDetail?.cart_id, quantity: itemQuantity })} value={itemQuantity.toString()} onChangeText={setItemQuantity} />
                        {/* <Text>{cartDetail?.quantity}</Text> */}
                        {/* <TouchableOpacity onPress={() => { addToCart({ menu_item_id: item?.menu_id, cook_id: item?.id, pre_order_date: datesArr.find(item => item.index == selectedIndex).date, pre_order_time: datesArr.find(item => item.index == selectedIndex).time }); getFoodList({ id: item?.id }); }}> */}
                        <Text style={{ width: '25%', color: '#fff', fontWeight: 'bold', fontSize: 20, paddingHorizontal: 3 }} onPress={() => { addToCart({ menu_item_id: item?.menu_id, cook_id: item?.id, pre_order_date: datesArr.find(item => item.index == selectedIndex).date, pre_order_time: datesArr.find(item => item.index == selectedIndex).time }); getFoodList({ id: item?.id }); }}>+</Text>
                        {/* </TouchableOpacity> */}
                    </View>
                </> : <>
                    <TouchableOpacity
                        style={{ flexDirection: 'row', width: 65, marginTop: 5, justifyContent: 'center', backgroundColor: '#29C270', borderRadius: 10, alignItems: 'center', height: 30, paddingHorizontal: 5, }}
                        onPress={() => { addToCart({ menu_item_id: item?.menu_id, cook_id: item?.id, pre_order_date: datesArr.find(item => item.index == selectedIndex).date, pre_order_time: datesArr.find(item => item.index == selectedIndex).time }); getFoodList({ id: item?.id }); }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14, }}>Add</Text>
                    </TouchableOpacity>
                </>}
        </>);
    }

    const renderFoodList = ({ item }) => {
        console.log("ccooklllkdskeevesvs", JSON.parse(item?.cart_details));
        const cartDetail = JSON.parse(item?.cart_details);
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

    const PreOrder = () => {
        return (
            <>
                <ScrollView key="preOrder" nestedScrollEnabled={true} style={{ width, height }} >
                    <View style={{ width, height: height - 60, alignItems: 'center', paddingTop: 20, borderRadius: 15, backgroundColor: '#fff', paddingBottom: 5 }}>
                        {datesArr?.length == 0 ? <TouchableOpacity
                            style={{ flexDirection: 'row', width: '85%', borderWidth: 1, borderColor: '#29C270', backgroundColor: '#fff', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderRadius: 10, paddingVertical: 5, paddingHorizontal: 10 }}
                            onPress={() => chooseDate({ index: selectedIndex, update: false })}>
                            <Text style={{ fontSize: 16, fontFamily: 'Poppins-Regular', color: '#29C270', letterSpacing: 1 }}>Choose Your Date</Text>
                            <Text style={{ fontSize: 24, color: '#29C270', letterSpacing: 1 }}>+</Text>
                        </TouchableOpacity> : (<>
                            {datesArr?.map((item) => {
                                console.log("datesArr length > 0 =====", item.index);
                                return (<>
                                    <View key={item.index.toString()} style={{ flexDirection: 'row', width: '75%', alignItems: 'center' }}>
                                        <View style={{ flexDirection: 'row', width: '100%', padding: 5, borderWidth: 1, borderColor: item?.index == selectedIndex ? 'red' : '#29C270', borderRadius: 10, justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, marginBottom: 10 }}>
                                            <TouchableOpacity style={{}} onPress={() => { chooseDate({ index: item.index, update: true }) }}>
                                                <Text>
                                                    {moment(item.date).format("DD MMM, YYYY")}
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => chooseTime({ index: item.index, selectedDate: item.date })}>
                                                <Text>
                                                    {item.time ? item.time : "Time Slot"}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                        {/* <Text>Delete</Text> */}
                                        <Image style={{ width: 25, height: 25, tintColor: 'red', marginLeft: 7 }} source={deleteIcon} />
                                    </View>
                                </>)
                            })}
                            {showCookList && (
                                <View style={{ marginTop: 10, backgroundColor: 'ghostwhite', borderRadius: 10, elevation: 10, paddingTop: 10 }}>
                                    <Text style={{ fontWeight: 'bold', marginLeft: 10, fontSize: 16 }}>List of cook available on {moment(selectedDate).format("DD MMM, YYYY")}</Text>
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
                            )}
                            {showFoodList && (
                                <>
                                    <ScrollView style={{ backgroundColor: 'pink', borderRadius: 10, elevation: 10, paddingTop: 10, }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <TouchableOpacity onPress={() => { setShowFoodList(false); setShowCookList(true); }}>
                                                <Image style={{ width: 25, height: 25, tintColor: '#29C270' }} source={leftArrow} />
                                            </TouchableOpacity>
                                            <Text style={{ fontWeight: 'bold', marginLeft: 10, fontSize: 16 }}>Food List on {moment(selectedDate).format("DD MMM ")} and {time.slice(0, -3)}</Text>
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
                                        <TouchableOpacity
                                            style={{ width: 100, justifyContent: 'center', alignItems: 'center', backgroundColor: '#09b44d', marginTop: 20, alignSelf: 'center', borderRadius: 7 }}
                                            onPress={() => { setShowFoodList(false); setShowCookList(false); setAddAnotherDate(true) }}>
                                            <Text style={{ color: '#fff', fontWeight: 'bold', paddingVertical: 5, paddingHorizontal: 3, }}>Done</Text>
                                        </TouchableOpacity>
                                    </ScrollView>
                                </>
                            )}
                            {addAnotherDate && !showCookList && <TouchableOpacity
                                style={{ flexDirection: 'row', width: '75%', padding: 5, borderWidth: 1, borderColor: '#29C270', borderRadius: 10, alignItems: 'center', paddingHorizontal: 15, marginTop: 20 }}
                                onPress={() => chooseDate({ index: selectedIndex, update: false })}>
                                <Text>Add Another Date</Text>
                            </TouchableOpacity>}
                        </>)
                        }
                    </View>
                </ScrollView>
                {showCalendar && <ShowCalendar />}
                <DatePicker
                    modal
                    open={showTimeList}
                    date={new Date(selectedDate)}
                    mode={'time'}

                    onConfirm={(date) => {
                        console.log("date", date);
                        setShowTimeList(false);
                        setGetCookList(false);
                        setTime(moment(date).format('HH:mm:ss'));
                        // updateTime();
                        const updateVal = datesArr.filter(item => item.index == selectedIndex);
                        console.log("updateVal", updateVal);
                        // if (updateVal.length > 0) {
                        const datesArrUpdate = datesArr.filter(item => item.index !== selectedIndex);
                        console.log("datesAaaaaaaaa", datesArrUpdate);
                        setDatesArr([...datesArrUpdate, { index: updateVal?.[0]?.index, date: selectedDate, time: moment(date).format('hh:mm A') }])
                        // }
                        // else {
                        //     setDatesArr([...datesArr, { index: selectedIndex, date: selectedDate, time: moment(date).format('hh:mm A') }])
                        // }
                        // setDate(date)
                        // setAddAnotherDate(true);
                    }}
                    onCancel={() => {
                        setShowTimeList(false)
                        // setAddAnotherDate(true);
                        setGetCookList(false);
                    }}
                />
            </>
        )
    };

    const PreOrderList = () => {
        return (
            <>
                <View>
                    {preOrderCart.length ? preOrderCart.map(item => {
                        return (<>
                            <TouchableOpacity >
                                <Text>
                                    chooseDate
                                </Text>
                            </TouchableOpacity>
                        </>)
                    })
                        :
                        <TouchableOpacity >
                            <Text>
                                chooseDate
                            </Text>
                        </TouchableOpacity>
                    }

                </View>
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

    return (
        <>
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar backgroundColor="#fff" barStyle="dark-content" />
                {showAlert && <CustomAlert
                    title={{ text: "Are You Sure? Want to Go Back?" }}
                    description={{ text: "All the items you have add will be deleted", }}
                    buttons={[
                        { text: "OK", onPress: () => navigation.goBack() },
                        { text: "CANCEL", onPress: () => setShowAlert(false) },
                    ]}
                />}
                <View
                    style={{
                        backgroundColor: '#09b44d',
                        // marginBottom: 20,
                        height: 50,
                        borderBottomLeftRadius: 25,
                        borderBottomRightRadius: 25,
                    }}>
                    <TouchableOpacity
                        onPress={() => setShowAlert(true)}
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
                        }}>Pre Order</Text>
                    </TouchableOpacity>
                </View>
                {/* <ScrollView style={{ height: '100%', width: '100%', backgroundColor: 'red'}}> */}
                {/* <PreOrder /> */}
                <PreOrderList />
                {/* </ScrollView> */}
            </SafeAreaView>
        </>
    )
}

export default PreOrder