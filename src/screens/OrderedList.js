import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Dimensions,
  SafeAreaView,
  Modal,
  FlatList,
  StatusBar,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { arrow, photo1, emptyCartIcon } from '../assets/img/Images';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/core';
import { api } from '../services';
import Loader from './Loader';

const OrderedList = ({ navigation }) => {
  const { width, height } = Dimensions.get('window');
  const { t, i18n } = useTranslation();
  const [modal, setModal] = useState(true);
  const [listItems, setListItems] = useState([]);
  const [pndListItems, setPndListItems] = useState([]);
  const getCurrentOrders = async () => {
    setModal(true);
    let response = await api.currentOrders();
    if (response.status == 'success') {
      setListItems(response.orders);
      setPndListItems(response.pndOrders);
    }
    setModal(false);
  }
  useFocusEffect(
    React.useCallback(() => {
      getCurrentOrders();
    }, []),
  );
  const _renderPnDItem = ({ item, index }) => {
    console.log("itemm from ordered list ", item);
    const pickupLocation = item?.pickup_location?.[0];
    const dropLocation = item?.drop_location?.[0];
    return (
      <View
        style={{
          marginHorizontal: 15,
          marginTop: 15,
          borderColor: '#e5e5e5',
          borderWidth: 1,
        }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('PndOrderTrack', { id: item.order_no })}
          style={{
            flexDirection: 'row',
            padding: 10,
            borderColor: '#e5e5e5',
            borderBottomWidth: 1,
          }}>
          {/* <View style={{ borderRadius: 5 }}>
            <Image
              source={photo1}
              style={{ width: 50, height: 50, borderRadius: 5 }}
            />
          </View> */}
          <View
            style={{
              flex: 4,
              paddingLeft: 8,
              justifyContent: 'center',
            }}>
            <Text
              style={{ fontSize: 14, fontFamily: 'Poppins-Bold', marginBottom: 4 }}>
              {item?.order_no ? t('orderedListPage.orderId') + "  " + item.order_no : null}
            </Text>
            <Text style={{ fontSize: 13, fontFamily: 'Poppins-Medium', color: '#8B8B8B', }}>
              <Text style={{ fontSize: 13, fontFamily: 'Poppins-Bold', color: 'tomato', }}>
                {`Pickup Location :  `}
              </Text>
              {!!pickupLocation?.door_no && pickupLocation?.door_no != null && pickupLocation?.door_no != 'null' && pickupLocation?.door_no != '' ? pickupLocation?.door_no + ", " : ''}{
                !!pickupLocation?.apartment_name && pickupLocation?.apartment_name != null && pickupLocation?.apartment_name != 'null' && pickupLocation?.apartment_name != '' ? pickupLocation?.apartment_name + ", " : ''}{
                !!pickupLocation?.street && pickupLocation?.street != null && pickupLocation?.street != 'null' && pickupLocation?.street != '' ? pickupLocation?.street + ", " : ''}{
                !!pickupLocation?.sublocality && pickupLocation?.sublocality != null && pickupLocation?.sublocality != 'null' && pickupLocation?.sublocality != '' ? pickupLocation?.sublocality + ", " : ''}{
                !!pickupLocation?.city && pickupLocation?.city != null && pickupLocation?.city != 'null' && pickupLocation?.city != '' ? pickupLocation?.city + ", " : ''}{
                !!pickupLocation?.state && pickupLocation?.state != null && pickupLocation?.state != 'null' && pickupLocation?.state != '' ? pickupLocation?.state + ", " : ''}{
                !!pickupLocation?.pin_code && pickupLocation?.pin_code != null && pickupLocation?.pin_code != 'null' && pickupLocation?.pin_code != '' ? pickupLocation?.pin_code + ", " : ''
              }</Text>
            <Text style={{ fontSize: 13, fontFamily: 'Poppins-Medium', color: '#8B8B8B', width: width - 100 }}>
              <Text style={{ fontSize: 13, fontFamily: 'Poppins-Bold', color: '#09b44d', }}>
                {`Drop Location:  `}
              </Text>
              {!!dropLocation?.door_no && dropLocation?.door_no != null && dropLocation?.door_no != 'null' && dropLocation?.door_no != '' ? dropLocation?.door_no + ", " : ''}{
                !!dropLocation?.apartment_name && dropLocation?.apartment_name != null && dropLocation?.apartment_name != 'null' && dropLocation?.apartment_name != '' ? dropLocation?.apartment_name + ", " : ''}{
                !!dropLocation?.street && dropLocation?.street != null && dropLocation?.street != 'null' && dropLocation?.street != '' ? dropLocation?.street + ", " : ''}{
                !!dropLocation?.sublocality && dropLocation?.sublocality != null && dropLocation?.sublocality != 'null' && dropLocation?.sublocality != '' ? dropLocation?.sublocality + ", " : ''}{
                !!dropLocation?.city && dropLocation?.city != null && dropLocation?.city != 'null' && dropLocation?.city != '' ? dropLocation?.city + ", " : ''}{
                !!dropLocation?.state && dropLocation?.state != null && dropLocation?.state != 'null' && dropLocation?.state != '' ? dropLocation?.state + ", " : ''}{
                !!dropLocation?.pin_code && dropLocation?.pin_code != null && dropLocation?.pin_code != 'null' && dropLocation?.pin_code != '' ? dropLocation?.pin_code + ", " : ''
              }</Text>
          </View>
        </TouchableOpacity>
        <View style={{ padding: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text
              style={{
                fontFamily: 'Poppins-Regular',
                fontSize: 14.5,
                color: item?.delivery_status == 1 ? '#e36505' :
                  item?.delivery_status == 3 ? '#d917eb' :
                    item?.delivery_status == 4 ? '#07e3df' :
                      item?.delivery_status == 5 ? '#7907e3' : '#09b44d',
              }}>
              {/* 0=>Payment Failed, 1=>Waiting, 2=>Rejected, 3=>Delivery Person Accepeted, 4=>Get Items, 5=>Delivery */}
              {item?.delivery_status == 0 ? 'Payment Failed' : null}
              {item?.delivery_status == 1 ? 'Waiting' : null}
              {item?.delivery_status == 3 ? 'Accepted' : null}
              {item?.delivery_status == 4 ? 'Item Collected' : null}
              {item?.delivery_status == 5 ? 'Delivered' : null}
              {/* {item?.delivery_status == 6 ? '' : null} */}
            </Text>
            <Text
              style={{
                fontFamily: 'Poppins-Regular',
                fontSize: 14,
                color: '#000',
              }}>
              {item?.total_amount_withtax ? "₹ " + item?.total_amount_withtax : null}
            </Text>
            <Text
              style={{
                fontFamily: 'Poppins-Regular',
                fontSize: 13,
                color: '#000',
              }}>
              {item?.delivery_date ? item?.delivery_date : null}
            </Text>
          </View>
        </View>
      </View>
    )
  }

  const _renderItem = ({ item, index }) => {
    console.log("itemm from ordered list ", item);
    return (
      <View
        style={{
          marginHorizontal: 15,
          marginTop: 15,
          borderColor: '#e5e5e5',
          borderWidth: 1,
        }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('TrackMap', { id: item.id })}
          style={{
            flexDirection: 'row',
            padding: 10,
            borderColor: '#e5e5e5',
            borderBottomWidth: 1,
          }}>
          {/* <View style={{ borderRadius: 5 }}>
        <Image
          source={photo1}
          style={{ width: 50, height: 50, borderRadius: 5 }}
        />
      </View> */}
          <View
            style={{
              flex: 4,
              paddingLeft: 8,
              justifyContent: 'center',
            }}>
            <Text
              style={{ fontSize: 13, fontFamily: 'Poppins-Bold', marginBottom: 4 }}>
              {item?.order_no ? t('orderedListPage.orderId') + item.order_no : null}
            </Text>
            <Text
              style={{ fontSize: 13, fontFamily: 'Poppins-Bold', marginBottom: 4 }}>
              {item?.cook?.first_name ? item.cook.first_name : null}
            </Text>
            <Text
              style={{ fontSize: 12, fontFamily: 'Poppins-Regular', marginBottom: 4 }}>
              {item?.address_info?.area ? item?.address_info?.area + ', ' : null}
              {item?.address_info?.city ? item?.address_info?.city + '. ' : null}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={{ padding: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text
              style={{
                fontFamily: 'Poppins-Regular',
                fontSize: 14.5,
                color: item?.delivery_status == 1 ? '#e36505' :
                  item?.delivery_status == 3 ? '#d917eb' :
                    item?.delivery_status == 4 ? '#07e3df' :
                      item?.delivery_status == 5 ? '#7907e3' : '#09b44d',
              }}>
              {item?.delivery_status == 1 ? t('orderedListPage.waiting') : null}
              {item?.delivery_status == 3 ? t('orderedListPage.underPreparation') : null}
              {item?.delivery_status == 4 ? t('orderedListPage.prepared') : null}
              {item?.delivery_status == 5 ? t('orderedListPage.pickedUp') : null}
              {item?.delivery_status == 6 ? t('orderedListPage.delivered') : null}
            </Text>
            <Text
              style={{
                fontFamily: 'Poppins-Regular',
                fontSize: 14,
                color: '#000',
              }}>
              {item?.net_amount ? "₹ " + item?.net_amount : null}
            </Text>
            <Text
              style={{
                fontFamily: 'Poppins-Regular',
                fontSize: 13,
                color: '#000',
              }}>
              {item?.date ? item?.date : null}
            </Text>
          </View>
        </View>
      </View>
    )
  }
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
            // justifyContent: 'center',
            alignItems: 'center'
          }}>
          <Image style={{ width: 9, height: 16 }} source={arrow} />
          <Text style={{
            color: '#fff',
            fontSize: 18,
            fontFamily: 'Poppins-Bold',
            paddingLeft: 10,
            paddingTop: 5

          }}>{t('orderedListPage.trackYourOrder')}</Text>
        </Pressable>
      </View>

      {modal != true && listItems.length > 0 &&
        < FlatList
          data={listItems}
          renderItem={_renderItem}
        />
      }
      {modal != true && pndListItems?.length > 0 &&
        < FlatList
          data={pndListItems}
          renderItem={_renderPnDItem}
        />
      }
      {modal != true && !listItems.length && !pndListItems &&
        <View style={{ flex: 1, paddingVertical: 300, alignItems: 'center' }}>
          <Image style={{ height: 100, width: 100, alignItems: 'center' }} source={emptyCartIcon} />
          <Text style={{
            textAlign: 'center', fontFamily: 'Poppins-Bold',
            fontSize: 14, opacity: 0.25
          }}>No data available...</Text>
        </View>
      }

      <View>
        {modal && (
          <Modal transparent={true} visible={modal}>
            <Loader />
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  pageTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
});

export default OrderedList;
