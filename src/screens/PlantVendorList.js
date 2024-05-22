import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, Switch, FlatList, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { arrow, timingIcon, qtyIcon, distanceIcon, tagIcon, offerIcon, plantBg } from '../assets/img/Images'
import { toCamelCase } from '../helper/app.helper';
import { api } from '../services';
import Loader from './Loader';


const PlantVendor = ({ navigation, route }) => {
    const { t, i18n } = useTranslation();
    const [modal, setModal] = useState(true);
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);
    const [listItems, setListItems] = useState([]);
    const [paginate, setPaginate] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [loader, setLoader] = useState(false);
    useEffect(() => {
        getList();
    }, [paginate]);

    const { width, height } = Dimensions.get('screen');

    const vendorType = route?.params?.type;

    const getList = async () => {
        if (paginate > 1) {
            setLoader(true);
            const response = await api.getVendorByType(vendorType, paginate);
            console.log("ressssssssssssssssssssss", response);
            if (response.status == 'success') {
                setListItems(listItems.concat(response.vendors));
                setPagination(response.pagination);
            }
            setLoader(false);
        } else {
            setModal(true);
            const response = await api.getVendorByType(vendorType, paginate);
            console.log("ressssssssssssssssssssss", response);
            if (response.status == 'success') {
                setListItems(response.vendors);
                setPagination(response.pagination);
            }
            setModal(false);
        }
    }
    var onReached = e => {
        if (pagination?.current_page < pagination?.last_page) {
            setPaginate(paginate + 1);
        }
    };

    const newrenderItem = ({ item, index }) => {
        return (
            <TouchableOpacity
                onPress={() => navigation.navigate('FoodDetail', {id:item?.id})}
                style={{
                    flexDirection: 'row',
                    height: 80,
                    elevation: 5,
                    marginBottom: 15,
                    backgroundColor: '#fff',
                    borderRadius: 15,
                    // borderWidth: 0.2,
                    // borderColor: '#989898'
                }}>
                <View style={{ flex: 3 }}>
                    <View style={{ width: '100%' }}>
                        <Image
                            source={{ uri: item?.image }}
                            style={{ width: 100, height: 80, borderBottomLeftRadius: 15, borderTopLeftRadius: 15, }}
                        />
                    </View>
                </View>
                <View
                    style={{
                        flex: 5, height: '100%', marginBottom: 20, paddingVertical: 5,
                        justifyContent: 'space-between'
                    }}>
                    <Text style={{ fontSize: 15, fontFamily: 'Poppins-Bold' }} numberOfLines={1}>
                        {toCamelCase(item?.first_name)}
                        {/* {item?.first_name.length > 17 ? `${item?.first_name.slice(0, 17)}...` : item?.first_name} */}
                    </Text>

                    <View style={styles.delLoc}>
                        <Text
                            style={{
                                fontSize: 12,
                                fontFamily: 'Poppins-Regular',
                                alignItems: 'center',
                                lineHeight: 23,
                                justifyContent: 'center',
                                marginLeft: 3,
                            }}>
                            Home Gardening Products
                        </Text>
                    </View>
                    <View style={styles.delLoc}>
                        <Text
                            style={{
                                fontSize: 13,
                                fontFamily: 'Poppins-Regular',
                                alignItems: 'center',
                                lineHeight: 23,
                                justifyContent: 'center',
                                marginLeft: 3,
                            }}>
                            {/* {item?.viewmenuitem?.cuisine
                                ? item.viewmenuitem.cuisine.eng_name + ' ,'
                                : null} */}
                            {item?.area ? item.area : null}
                        </Text>
                    </View>
                    {/* <View style={styles.delLoc}>
                        <Image
                            style={{
                                width: 18,
                                height: 18,
                            }}
                            source={distanceIcon}
                        />
                        <Text
                            style={{
                                fontSize: 13.5,
                                fontFamily: 'Poppins-Bold',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginLeft: 6,
                            }}>
                            {item?.distance} km
                        </Text>
                    </View>
                    {!!item?.delivery_time && <View style={styles.delLoc}>
                        <Image style={{ width: 16, height: 16 }} source={timingIcon} />
                        <Text
                            style={{
                                fontSize: 13.5,
                                fontFamily: 'Poppins-Bold',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginLeft: 6,
                            }}>
                            {item?.delivery_time} mins
                        </Text>
                    </View>} */}
                    {/* <View style={styles.delLoc}>
                        <Image style={{ width: 18, height: 18 }} source={tagIcon} />
                        <Text
                            style={{
                                fontSize: 13.5,
                                fontFamily: 'Poppins-Bold',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginLeft: 6,
                            }}>
                            ₹ {item?.cost_for_two}
                        </Text>
                    </View> */}
                    {/* {item?.cookoffer == 1 ? (
                        <View style={styles.delLoc}>
                            <Image style={{ width: 18, height: 18 }} source={offerIcon} />
                            <Text
                                style={{
                                    fontSize: 13.5,
                                    fontFamily: 'Poppins-Regular',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginLeft: 6,
                                }}>
                                {t('PlantVendorPage.tryHomelyFoodz')}
                            </Text>
                        </View>
                    ) : null} */}
                </View>
            </TouchableOpacity>
        );
    };
    return (

        <SafeAreaView style={{ flex: 1, backgroundColor: '#dff0e3', }}>
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
                    <Image style={{ width: 9, height: 16 }} source={arrow} />
                    <Text style={{
                        color: '#fff',
                        fontSize: 18,
                        fontFamily: 'Poppins-Bold',
                        paddingLeft: 5,
                        marginTop: 2

                    }}>Back</Text>
                </TouchableOpacity>
            </View>
            {modal != true && (!!listItems.length ?
                <FlatList
                    style={{ margin: 10 }}
                    data={listItems}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={newrenderItem}
                    onEndReachedThreshold={0}
                    onEndReached={onReached}
                    showsVerticalScrollIndicator={false}
                /> : <View style={{ flex: 1, width, height, justifyContent: 'flex-start', alignItems: 'center', paddingHorizontal: 25, marginTop: height / 8 }}>
                    <Image source={plantBg} style={{ width: 250, height: 250, marginBottom: 25, opacity: 0.9 }} />
                    <Text style={{ fontFamily: 'Poppins-Bold', textAlign: 'center', fontSize: 16, color: '#474747' }}>Watch Your Space Bloom! Our Plant Vendor is on the Way to Bring Nature's Beauty Right to You!</Text>
                </View>)
            }
            {loader &&
                <View style={{ padding: 10 }}>
                    <Loader />
                </View>
            }
            <View>
                {modal &&
                    <Modal transparent={true} visible={modal}>
                        <Loader />
                    </Modal>
                }
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    delLoc: {
        flexDirection: 'row',
        // marginTop: 1,
        alignItems: 'center'
    }
})
export default PlantVendor;
