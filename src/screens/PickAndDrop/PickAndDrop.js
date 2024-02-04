import { Dimensions, Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, FlatList, Button, BackHandler, ToastAndroid, Alert, Modal } from 'react-native'
import React, { useCallback, useMemo, useRef } from 'react';
import * as Images from '../../assets/img/Images'
import Geolocation from '@react-native-community/geolocation';
import { useState } from 'react';
import { useEffect } from 'react';
import { requestLocationPermission } from '../../helper/location-permission';
import LottieView from 'lottie-react-native';
import SelectList from '../../helper/animatedDropDownSelect';
import * as api from '../../services/api';
import CheckBox from '@react-native-community/checkbox';
// import {
//     BottomSheetModal,
//     BottomSheetModalProvider,
// } from '@gorhom/bottom-sheet';
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import CustomBackdrop from '../../components/CustomBackdrop';
import { openCamara, openGallery } from '../../helper/imagePicker';
import RazorpayCheckout from 'react-native-razorpay';
import { storage } from '../../services';
import Loader from '../Loader';
import FastImage from 'react-native-fast-image';

const { width, height } = Dimensions.get('window');

const PickAndDrop = ({ navigation, route }) => {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [selectedItemType, setSelectedItemType] = React.useState("");
    const [itemTypes, setItemTypes] = useState([{
        icon: "https://homeefoodz-test.fra1.digitaloceanspaces.com/PickAndDropAssets/othersItemType.png",
        id: 1,
        name: "Others"
    }]);
    const [vehicles, setVehicles] = useState([{
        icon: "https://homeefoodz-test.fra1.digitaloceanspaces.com/PickAndDropAssets/vehicleType/bike.png",
        id: 1,
        vehicle_type: "Bike",
        availability: 0
    }]);
    const [selectedVehicle, setSelectedVehicle] = useState(vehicles?.[0]?.id);
    const [addressSelectType, setAddressSelectType] = useState(null);
    const [allAddresses, setAllAddresses] = useState(null);
    const [pickupLocation, setPickupLocation] = useState(null);
    const [dropLocation, setDropLocation] = useState(null);
    const [isGoodsImgModalOpen, setIsGoodsImgModalOpen] = useState(false);
    const [itemImages, setItemImages] = useState([]);
    const [billingDetails, setBillingDetails] = useState(null);
    const [termsAccept, setTermsAccept] = useState(false);
    const [userDetails, setUserDetails] = useState(null);
    const [showPlaceOrderBtn, setShowPlaceOrderBtn] = useState(true);
    const [modal, setModal] = useState(false);

    const sheetRef = useRef(null);
    const imageModalSheetRef = useRef(null);

    const snapPoints = useMemo(() => ["50%", "60%", "70%", "80%", "90%"], []);
    const goodsImgModalsnapPoints = useMemo(() => ["20%"], []);


    const handleAddressModal = (type) => {
        console.log("typeeee", type);
        // sheetRef.current?.present();
        setAddressSelectType(type);
        sheetRef.current?.snapToIndex(2);
    }

    const handleSheetChanges = useCallback(index => {
        console.log('handleSheetChanges', index);
    }, []);
    const handleModalClose = useCallback(() => {
        sheetRef.current?.close();
        imageModalSheetRef.current?.close();
        setAddressSelectType(null);
        setIsGoodsImgModalOpen(false);
    });

    useEffect(() => {
        const focusHandler = navigation.addListener('focus', () => {
            getAddresses();
        });
        return focusHandler;
    }, [navigation]);

    useEffect(() => {
        const handleBackButton = () => { return true; };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
        return () => backHandler.remove();
    }, [navigation]);

    const getAddresses = async () => {
        console.log('90');
        const response = await api.getPndAddresses();
        // console.log('response from adddddd', response);
        if (response.status == 'success') setAllAddresses(response?.address)
    }

    const getCurrentLocation = () => {
        requestLocationPermission();
        Geolocation.getCurrentPosition(
            (position) => {
                console.log("position", position);
                setCurrentLocation(position?.coords);
            },
            (err) => console.log("error getting current location", err),
            {
            });
    }

    const getItemsList = async () => {
        const response = await api.getPndItemsAndConfigs();
        console.log("response from get items in pnd", response);
        if (response.itemtype.length) setItemTypes(response.itemtype);
        if (response.vehicles.length) setVehicles(response.vehicles);
    }

    const changeAddressByRoute = async () => {
        console.log("===========================");
        console.log(route?.params);
        console.log("===========================");
        const type = route?.params?.addressSelectType;
        const addressIdFromRoute = route?.params?.addressId;
        const addressById = await api.getPndAddressById(addressIdFromRoute);
        if (addressById?.status == "success" && !!addressById?.user_address?.mobile && addressById?.user_address?.name) {
            if (type == 'pickup') {
                setPickupLocation(addressById?.user_address)
            } else if (type == 'drop') {
                setDropLocation(addressById?.user_address);
            }
        }
        console.log("testttttttt", type, "<<<===================>>>", addressFromRoute);
    };

    useEffect(() => {
        getCurrentLocation();
        getItemsList();
        getAddresses();
    }, []);

    const _vehiclesRender = ({ item, index }) => {
        console.log("vehicle", item.icon);
        return (
            <TouchableOpacity
                style={[styles.vehicle,
                {
                    backgroundColor: item.id == selectedVehicle ? '#FFE3E3' : '#FFF2F2',
                    marginRight: vehicles.length == 3 ? 15 : 5,
                    opacity: item.disabled ? 0.5 : 1
                }]}
                onPress={() => {
                    if (item.id == selectedVehicle) ToastAndroid.show('Vehicle Already Selected', 1000);
                    else setSelectedVehicle(item.id)
                }}
                activeOpacity={0.3}
                disabled={item.disabled}>
                <Image source={{ uri: item.icon }} style={styles.vehicleIcon} />
                {/* <Text style={styles.vehicleName}>{item.vehicle_type}</Text> */}
            </TouchableOpacity>)
    };

    const changeSelectedAddress = (address) => {
        console.log("addressssssssssssss", address);
        if (!!address?.mobile && address?.name) {
            if (addressSelectType == 'pickup') {
                setPickupLocation(address)
            } else if (addressSelectType == 'drop') {
                setDropLocation(address);
            }
        } else {
            navigation.navigate('Address', { type: "PND", address, addressSelectType })
        }
        handleModalClose()
    };

    const pndCalculatePrice = async () => {
        const payload = {
            pickup_location: pickupLocation?.id,
            drop_location: dropLocation?.id
        }
        const response = await api.pndCalculatePrice(pickupLocation?.id, dropLocation?.id);
        if (response?.status == 'success') setBillingDetails(response.info);
        else setBillingDetails(null)
        console.log("response from cal price", payload, response);
    }

    useEffect(() => {
        if (pickupLocation && dropLocation) { pndCalculatePrice(); userData(); }
    }, [pickupLocation, setPickupLocation, dropLocation, setDropLocation]);

    useEffect(() => {
        const focusHandler = navigation.addListener('focus', () => {
            getAddresses();
            changeAddressByRoute();
        });
        return focusHandler;
    }, []);

    const AddressComponent = () => {
        return (
            <ScrollView >
                <TouchableOpacity style={styles.headerTouchable} onPress={handleModalClose}>
                    <Image source={Images.leftArrow} style={styles.addressLeftArrow} />
                    <Text style={styles.selectAppdressText} >{addressSelectType == 'pickup' ? 'Select Pickup Location' : addressSelectType == 'drop' ? 'Select Drop Location' : 'Select Address'}</Text>
                </TouchableOpacity>
                <ScrollView style={styles.addressMainContainer}>
                    <TouchableOpacity>
                        <Text style={styles.addAddressText} onPress={() => {
                            navigation.navigate('Address', { type: "PND" })
                        }}> +Add New Address</Text>
                    </TouchableOpacity>
                    {!!allAddresses?.length ?
                        <><Text style={styles.savedLocationText}>Saved Locations</Text>
                            {allAddresses?.map((address, index) => {
                                // index == 0 && console.log("address1", address);
                                return (
                                    <TouchableOpacity key={index} style={[styles.addressSubContainer, {
                                        backgroundColor: address?.name && address?.mobile ? '#edfaed' : '#faeeed'
                                    }]} onPress={() => changeSelectedAddress(address)}>
                                        <Text style={styles.addressHeadText}>{address.type}</Text>
                                        {address?.name && address?.mobile && <Text style={styles.addressSubHeadText}>{address?.name}{`  (`} {address?.mobile} {`)`}</Text>}
                                        <Text style={styles.addressBodyText}>
                                            {address.door_no}  {address.street}  {address.area}, {address.city} {'-'} {address.pin_code}, {address.state}</Text>
                                    </TouchableOpacity>)
                            })}
                        </> :
                        <>
                            <Text style={[styles.addressBodyText, { fontSize: 14, marginTop: 10 }]}>
                                No Address Found! Please Add Address
                            </Text>
                        </>
                    }
                </ScrollView>
            </ScrollView>
        )
    };

    const openCameraHandler = async () => {
        setIsGoodsImgModalOpen(false);
        const photo = await openCamara();
        if (photo) setItemImages(images => [...images, photo])
        // console.log("photo", itemImages);
    };

    const openGalleryHandler = () => {
        setIsGoodsImgModalOpen(false);

    };

    const deleteImage = (index) => {
        Alert.alert("Are you Sure?", "Do you want to delete the Captured Image", [
            {
                text: "Yes",
                isPreferred: true,
                onPress: () => {
                    // const newArray = itemImagesPickup.splice(index , 1);
                    const newArray = itemImages.slice(0, index).concat(itemImages.slice(index + 1));;
                    setItemImages(newArray);
                }
            },
            {
                text: 'Cancel',
                onPress: null
            }
        ])
    }

    const userData = async () => {
        var user = await storage.getUserData();
        console.log("user", user);
        setUserDetails(user);
    };

    const placeOrderHandler = async () => {
        if (!termsAccept)
            ToastAndroid.show('Please Accept Terms & Conditions', ToastAndroid.BOTTOM)
        else if (!pickupLocation || !dropLocation || !selectedItemType || !selectedVehicle)
            ToastAndroid.show('Complete All the Required Fields', ToastAndroid.BOTTOM)
        else {
            setModal(true);
            setShowPlaceOrderBtn(false);
            var form_data = new FormData();
            form_data.append('pickup_location', pickupLocation?.id);
            form_data.append('drop_location', dropLocation?.id);
            form_data.append('item_type', selectedItemType);
            form_data.append('vehicle_type', selectedVehicle);
            itemImages.forEach((image, index) => {
                console.log("image", index, image.uri);
                if (!!image.uri) form_data.append('image' + (index + 1), {
                    uri:
                        Platform.OS === 'ios'
                            ? image.uri.replace('file://', '')
                            : image.uri,
                    name: image.fileName,
                    type: image.type,
                });
            });
            console.log("form", form_data);
            const response = await api.pndPlaceOrder(form_data);
            console.log("response", response);
            if (response.status == 'success') {
                var options = {
                    description: 'Order payment',
                    // image: 'https://i.imgur.com/3g7nmJC.png',
                    currency: 'INR',
                    // key: 'rzp_test_4QVOnZNpzWBFBM',
                    key: 'rzp_test_4QVOnZNpzWBFBM',
                    amount: billingDetails.razor_pay_amount,
                    name: 'Homee Foodz',
                    order_id: response.transaction_id, //Replace this with an order_id created using Orders API.
                    prefill: {
                        email: userDetails.email,
                        contact: userDetails.mobile,
                        name: userDetails.first_name,
                    },
                    theme: { color: '#09b44d' },
                };
                console.log("250", options);
                await RazorpayCheckout.open(options)
                    .then(async data => {
                        setModal(false);
                        console.log("testtttttttttttttttttttttttttttttt", data);
                        const payload = {
                            status: 1,
                            order_no: response.order_id,
                            razor_pay_payment_id: data.razorpay_payment_id
                        }
                        const orderStatus = await api.pndOrderStatus(payload);
                        navigation.navigate('PndOrderTrack', { id: response.order_id });
                        setShowPlaceOrderBtn(true);
                    })
                    .catch(async error => {
                        setModal(false);
                        const payload = {
                            status: 0,
                            order_no: response.order_id,

                        }
                        const orderStatus = await api.pndOrderStatus(payload);
                        if (orderStatus.status == 'success')
                            ToastAndroid.show(orderStatus.message, ToastAndroid.BOTTOM);
                        setShowPlaceOrderBtn(true);
                        Alert.alert(error.error.reason, error.error.description);
                    });
            }
            setModal(false);
        }
        setTimeout(() => {
            setModal(false);
            setShowPlaceOrderBtn(true);
        }, 1500);
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar backgroundColor="#000" barStyle={'light-content'} networkActivityIndicatorVisible={true} />
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerTouchable} onPress={() => navigation.goBack()}>
                    <Image source={Images.leftArrow} style={styles.leftArrow} />
                    <Text style={styles.headerText} >Pick And Drop</Text>
                </TouchableOpacity>
            </View>
            <ScrollView>
                <View style={styles.mainContainer}>
                    <TouchableOpacity onPress={handleModalClose} activeOpacity={1}>
                        <LottieView source={Images.PickAndDropHome} autoPlay useNativeLooping loop style={styles.jsonLoader} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addressSelect} onPress={() => handleAddressModal('pickup')}>
                        <Image source={Images.Location} style={styles.icon} />
                        <View style={{ marginLeft: 10, width: '85%', }}>
                            {pickupLocation?.name && pickupLocation?.mobile &&
                                <>
                                    <Text style={styles.locationHeadText}>{`Pickup Location`}</Text>
                                    <Text style={styles.locationSubHeadText}>{`${pickupLocation?.name} - (${pickupLocation.mobile})`}</Text>
                                </>}
                            <Text style={[styles.addressSelectText, pickupLocation && {
                                fontFamily: 'Poppins-Regular',
                                fontSize: 14,
                            }]}>
                                {pickupLocation ? (pickupLocation.door_no ? pickupLocation.door_no + ' , ' : '') +
                                    (pickupLocation.street ? pickupLocation.street + ', ' : '') +
                                    (pickupLocation.area ? pickupLocation.area + ', ' : '') +
                                    (pickupLocation.city ? pickupLocation.city : '') + ' - ' +
                                    (pickupLocation.pin_code ? pickupLocation.pin_code + ', ' : '') +
                                    (pickupLocation.state ? pickupLocation.state : '')
                                    :
                                    'Pickup Location'}
                            </Text>

                        </View>
                        <Image source={Images.ArrowRight} style={styles.arrowRight} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addressSelect} onPress={() => handleAddressModal('drop')}>
                        <Image source={Images.Box} style={styles.icon} />
                        <View style={{ marginLeft: 10, width: '85%' }}>
                            {dropLocation?.name && dropLocation?.mobile &&
                                <>
                                    <Text style={styles.locationHeadText}>{`Pickup Location`}</Text>
                                    <Text style={styles.locationSubHeadText}>{`${dropLocation?.name} - (${dropLocation?.mobile})`}</Text>
                                </>}
                            <Text style={[styles.addressSelectText, dropLocation && {
                                fontFamily: 'Poppins-Regular',
                                fontSize: 14,
                            }]}>

                                {dropLocation ?
                                    (dropLocation.door_no ? dropLocation.door_no + ' , ' : '') +
                                    (dropLocation.street ? dropLocation.street + ', ' : '') +
                                    (dropLocation.area ? dropLocation.area + ', ' : '') +
                                    (dropLocation.city ? dropLocation.city : '') + ' - ' +
                                    (dropLocation.pin_code ? dropLocation.pin_code + ', ' : '') +
                                    (dropLocation.state ? dropLocation.state : '') : 'Drop Location'}
                            </Text>
                        </View>
                        <Image source={Images.ArrowRight} style={styles.arrowRight} />
                    </TouchableOpacity>
                    <SelectList
                        setSelected={(val) => setSelectedItemType(val)}
                        data={itemTypes}
                        search={false}
                        boxStyles={styles.dropdown}
                        dropdownStyles={[styles.dropdown, { height: 'auto' }]}
                        fontFamily='Poppins-Medium'
                        dropdownTextStyles={styles.selectText}
                        placeholder={"Item Type"}
                        placeholderLeftIcon={Images.itemsImage}
                    />
                    <TouchableOpacity style={[styles.addressSelect, { marginTop: 20 }]} onPress={() => setIsGoodsImgModalOpen(true)}>
                        <View style={{ flexDirection: 'row' }}>
                            <Image source={Images.Box1} style={styles.icon} />
                            <Text style={[styles.addressSelectText, { marginLeft: 7 }]}>
                                Goods Image
                                <Text style={[styles.addressSelectText, { fontSize: 10 }]}>
                                    {`  (Optional)`}
                                </Text>
                            </Text>
                        </View>
                        <Image source={Images.Camera} style={styles.camerIcon} />
                    </TouchableOpacity>
                    {!!itemImages.length &&
                        <ScrollView horizontal style={{ marginHorizontal: '5%', padding: 5, backgroundColor: '#fff', borderRadius: 7, elevation: 5, marginBottom: 15, }} >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {itemImages?.map((item, index) => {
                                    console.log("itemmmmmmmmmm", index, item);
                                    return (
                                        <View key={index} style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-start', marginRight: 5, paddingVertical: 5 }}>
                                            <FastImage source={{ uri: item?.uri }} style={{ width: 75, height: 100, alignSelf: 'flex-start', borderRadius: 15 }} resizeMode={FastImage.resizeMode.center} />
                                            {/* <Image source={{ uri: item?.uri }} style={{ width: 75, aspectRatio: 1, marginHorizontal: 7 }} /> */}
                                            <TouchableOpacity style={{ alignSelf: 'flex-start', borderRadius: 15, position: 'absolute', backgroundColor: 'white', right: -5 }} onPress={() => deleteImage(index)}>
                                                <FastImage source={Images.DeleteIcon} style={{ width: 20, height: 20, }} resizeMode={FastImage.resizeMode.center} />
                                            </TouchableOpacity>
                                        </View>
                                    )
                                })}
                                {itemImages?.length > 0 && itemImages?.length < 4 &&
                                    <TouchableOpacity onPress={() => setIsGoodsImgModalOpen(true)} style={{ width: 90, height: 90, marginHorizontal: 7, justifyContent: 'center' }}>
                                        <Image source={Images.AddImage} style={{ width: '85%', height: '85%', marginHorizontal: 7, resizeMode: 'center' }} />
                                    </TouchableOpacity>
                                }
                            </View>
                        </ScrollView>}
                    <Text style={styles.vehicleTypeText}>Vehicle Type</Text>
                    <FlatList
                        data={vehicles}
                        renderItem={_vehiclesRender}
                        horizontal
                        style={{ width: width - 35, marginHorizontal: "5%" }}
                    />
                    {billingDetails && <View>
                        <Text style={styles.billsHeadText}>Billing Details</Text>
                        <View style={styles.billDetailsContainer}>
                            <View style={styles.billInfo}>
                                <Text style={styles.billDetailsText}>Ride Fare</Text>
                                <Text style={styles.billDetailsTextBold}>{billingDetails.total_amount}</Text>
                            </View>
                            <View style={{ ...styles.divider, backgroundColor: '#E2E2E2' }} />
                            {billingDetails?.discount && <>
                                <View style={styles.billInfo}>
                                    <Text style={styles.billDetailsText}>Discount</Text>
                                    <Text style={styles.billDetailsTextBold}>{billingDetails?.discount}</Text>
                                </View>
                                <View style={{ ...styles.divider, backgroundColor: '#E2E2E2' }} />
                            </>
                            }
                            <View style={styles.billInfo}>
                                <Text style={styles.billDetailsText}>Billing Details</Text>
                                <Text style={styles.billDetailsTextBold}>{billingDetails.tax}</Text>
                            </View>
                            <View style={{ ...styles.divider, backgroundColor: '#AA8B56' }} />
                            <View style={styles.billInfo}>
                                <Text style={styles.billDetailsTextBold}>Grand Total</Text>
                                <Text style={styles.billDetailsTextBold}>{billingDetails.total_amount_with_tax}</Text>
                            </View>
                        </View>
                    </View>}
                    <View style={styles.checkBoxContainer}>
                        <CheckBox
                            value={termsAccept}
                            onValueChange={e => {
                                // //console.log("ranjith", e);
                                setTermsAccept(e);
                            }}
                            tintColors={{ false: '#B78C8C' }}

                        />
                        <Text style={styles.TermsText} onPress={() => console.log("ranjith")}>
                            Accept Terms and Condition
                            <Text style={[styles.TermsText, { color: '#63B7A6' }]}>
                                {`  view`}
                            </Text>
                        </Text>
                    </View>
                    {showPlaceOrderBtn && <TouchableOpacity style={styles.checkOutButton} onPress={placeOrderHandler}>
                        <Text style={styles.checkOutText}>Proceed To Checkout</Text>
                    </TouchableOpacity>}
                </View>
            </ScrollView>
            {(addressSelectType || isGoodsImgModalOpen) && <TouchableOpacity style={{ position: 'absolute', width, height, backgroundColor: '#000', opacity: 0.4 }} onPress={handleModalClose} />}

            {addressSelectType &&
                <BottomSheet
                    ref={sheetRef}
                    index={2}
                    snapPoints={snapPoints}
                    onChange={handleSheetChanges}
                    enablePanDownToClose
                    onClose={() => setAddressSelectType(null)}
                    handleStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
                // backdropComponent={addressSelectType && CustomBackdrop}
                >
                    <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
                        <AddressComponent />
                    </BottomSheetScrollView>
                </BottomSheet>}

            {isGoodsImgModalOpen &&
                <BottomSheet
                    ref={imageModalSheetRef}
                    index={0}
                    snapPoints={goodsImgModalsnapPoints}
                    onChange={handleSheetChanges}
                    enablePanDownToClose
                    onClose={() => setIsGoodsImgModalOpen(false)}
                    handleStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
                // backdropComponent={addressSelectType && CustomBackdrop}
                >
                    <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
                        {/* <AddressComponent /> */}
                        <View style={styles.imagePickContainer}>
                            <TouchableOpacity style={styles.imagePick} onPress={openCameraHandler}>
                                <Image source={Images.CameraPick} style={styles.imagePickIcon} />
                                <Text style={styles.imagePickText}>Open Camera</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.imagePick} onPress={openGalleryHandler}>
                                <Image source={Images.GalleryPick} style={styles.imagePickIcon} />
                                <Text style={styles.imagePickText}>Choose Image</Text>
                            </TouchableOpacity>
                        </View>
                    </BottomSheetScrollView>
                </BottomSheet>}
            <View >
                {modal && (
                    <Modal transparent={true} visible={modal}>
                        <Loader />
                    </Modal>
                )}
            </View>

        </SafeAreaView>
    )
}

export default PickAndDrop

const styles = StyleSheet.create({
    addAddressText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 17,
        color: '#03894E',
        marginTop: 15
    },
    addressBodyText: {
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        color: '#4D4D4D'
    },
    addressMainContainer: {
        paddingHorizontal: 20
    },
    addressSubContainer: {
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#E1E1E1',
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    addressLeftArrow: {
        width: 25,
        height: 25,
        tintColor: '#B78C8C'
    },
    addressSelect: {
        width: '90%',
        // height: 50,
        paddingVertical: 10,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginHorizontal: '5%',
        marginBottom: 20,
        borderRadius: 7
    },
    addressSelectText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 16,
        // width: '80%',
        color: '#4D4D4D',
        // marginTop: 5
    },
    addressHeadText: {
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
        color: '#4D4D4D'
    },
    addressSubHeadText: {
        fontSize: 14,
        fontFamily: 'Poppins-Bold',
        color: '#416e41'
    },
    arrowRight: {
        width: 12,
        height: 12,
        resizeMode: 'contain',
        marginRight: 10
    },
    billDetailsContainer: {
        marginHorizontal: "5%",
        backgroundColor: '#FBFBFB',
        borderBottomWidth: 0.5,
        borderBottomColor: '#E0E0E075',
        borderRadius: 7,
        padding: 10
    },
    billDetailsText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
    },
    billDetailsTextBold: {
        fontFamily: 'Poppins-Bold',

    },
    billsHeadText: {
        fontFamily: 'Poppins-Bold',
        // fontSize: 14,
        paddingTop: 20,
        marginBottom: 10,
        marginLeft: '5%',
        color: '#000'

    },
    billInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 7,
        // borderBottomWidth: 1,
        // borderBottomColor: '#E2E2E2'
    },
    camerIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        marginRight: 10
    },
    checkBoxContainer: {
        width,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: '5%',
        marginTop: 15
    },
    checkOutButton: {
        backgroundColor: '#B78C8C',
        marginHorizontal: '5%',
        marginTop: 20,
        paddingVertical: 10,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkOutText: {
        fontFamily: 'Poppins-Bold',
        fontSize: 18,
        color: '#FFFFFF'
    },
    divider: {
        width: "90%",
        height: 1,
        alignSelf: 'center'
    },
    dropdown: {
        width: '90%',
        borderRadius: 7,
        backgroundColor: '#fff',
        borderWidth: 0,
        height: 50,
        // marginBottom: 20,
        marginHorizontal: '5%',
    },
    icon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    imagePick: {
        alignItems: 'center'

    },
    imagePickContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        marginTop: 7
        // width: 50,
        // height: 50,
        // backgroundColor: 'red',
        // shadowColor: 'red',
        // shadowRadius: 500,
        // elevation: 10,
        // borderRadius: 500,
    },
    imagePickIcon: {
        width: 75,
        height: 75,
        resizeMode: 'center',
    },
    imagePickText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 12,
        color: '#B78C8C',
        marginTop: 5
    },
    mainContainer: {
        flex: 1,
        width,
        backgroundColor: '#FFF2F2',
        paddingBottom: 100
        // alignItems: 'center',
    },
    header: {
        width: '100%',
        height: 55,
        flexDirection: 'row',
        backgroundColor: '#FFE3E3',
    },
    headerText: {
        marginLeft: 10,
        fontFamily: 'Poppins-Medium',
        fontSize: 17,
        color: '#03894E',
        marginTop: 5,
    },
    headerTouchable: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    jsonLoader: {
        width: '85%',
        height: 'auto',
        alignSelf: 'center'
    },
    leftArrow: {
        width: 25,
        height: 25,
        tintColor: '#03894E'
    },
    locationHeadText: {
        color: '#B78C8C',
        fontFamily: 'Poppins-Medium',
    },
    locationSubHeadText: {
        fontFamily: 'Poppins-Bold',
        // fontSize: 12,
    },
    savedLocationText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 16,
        color: '#4D4D4D',
        marginTop: 15,
        marginBottom: 10
    },
    selectAppdressText: {
        marginLeft: 10,
        fontFamily: 'Poppins-Medium',
        fontSize: 17,
        color: '#4D4D4D',
        marginTop: 5,
    },
    selectText: {
        fontSize: 14,
        color: '#4D4D4D'
    },
    TermsText: {
        fontFamily: 'Poppins-Medium',
        color: '#4D4D4D'
    },
    vehicle: {
        width: 90,
        height: 75,
        justifyContent: 'center',
        // marginHorizontal: 5,
        borderRadius: 10,
        paddingVertical: 7,
    },
    vehicleIcon: {
        width: "60%",
        aspectRatio: 1,
        resizeMode: 'contain',
        alignSelf: 'center',
    },
    vehicleTypeText: {
        alignSelf: 'center',
        fontFamily: 'Poppins-Bold',
        color: '#4D4D4D',
        fontSize: 15,
    }
})