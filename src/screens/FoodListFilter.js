import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Switch,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  arrow,
  timingIcon,
  qtyIcon,
  photo1,
  emptyCartIcon,
} from '../assets/img/Images';
import { COUPON_CODE } from '../redux/actions/actionTypes';
import { api } from '../services';
import Loader from './Loader';
import moment from 'moment';

const FoodListFilter = ({ navigation, route }) => {
  console.log("ro", route.params);
  const { t, i18 } = useTranslation();
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  const [listItems, setListItems] = useState([]);
  const [modal, setModal] = useState(true);
  const [paginate, setPaginate] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loader, setLoader] = useState(false);
  useEffect(() => {
    getList();
  }, [paginate]);
  const getList = async () => {
    console.log('id from filter', route?.params?.id);
    if (paginate > 1) {
      setLoader(true);
      let response = await api.quickFilterMenuItem(route?.params?.id, paginate);
      console.log('response from filter', response);
      setLoader(false);
      if (response.status == 'success') {
        setListItems(listItems.concat(response.menu_items));
        setPagination(response.pagination);
      }
    } else {
      setModal(true);
      let response = await api.quickFilterMenuItem(route?.params?.id, paginate);
      setModal(false);
      if (response.status == 'success') {
        console.log('response from filter', response);
        setListItems(response.menu_items);
        setPagination(response.pagination);
      }
    }
  };
  const add_to_cart = async (id, cookId) => {
    let response = await api.add_cart({ menu_item_id: id, cook_id: cookId });
    console.log('response for add cart in food filter', response);
    if (response.status == 'failure') {
      Alert.alert(
        'Replace cart item ?',
        'Your Cart contains dishes from other cook. Do you want to discard add dishes from this cook ?',
        [
          {
            text: 'Yes',
            onPress: () => {
              AsyncStorage.removeItem(COUPON_CODE);
              emptyCart(id, index, type, key);
            },
          },
          { text: 'No' },
        ],
      );
    }
  };
  var onReached = e => {
    if (pagination?.current_page < pagination?.last_page) {
      setPaginate(paginate + 1);
    }
  };

  const getActivityAnalytics = async cook_id => {
    console.log('cook_id', cook_id);
    await api.getActivityStatus({ history_type: 2, cook_id });
  };

  const newrenderItem = ({ item, index }) => {
    console.log('itemmmmmmmmssssss', item);
    return (
      <TouchableOpacity
        onPress={() => {
          getActivityAnalytics(item?.cook_id);
          navigation.navigate('FoodDetail', { id: item?.cook_id });
        }}>
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 10,
            marginBottom: 10,
          }}>
          <View style={{ flex: 2 }}>
            <View style={{ width: '100%', borderRadius: 5, height: 100 }}>
              <Image
                source={{ uri: item?.image }}
                style={{ width: '100%', borderRadius: 5, height: '100%' }}
              />
            </View>
          </View>
          <View
            style={{ flex: 5, paddingLeft: 8, justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 15, fontFamily: 'Poppins-Bold' }}>
              {' '}
              {item?.userlanguage?.name}
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontFamily: 'Poppins-Regular',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 4,
                // marginTop: 5,
              }}>
              {item?.cook?.first_name + ', ' + item?.cook?.address?.area}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row-reverse',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                {item?.preparation_time && (
                  <View style={styles.delLoc}>
                    <Image
                      style={{ width: 18, height: 18 }}
                      source={timingIcon}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: 'Poppins-Regular',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: 6,
                        marginRight: 20,
                      }}>
                      {item?.preparation_time} Mins
                    </Text>
                  </View>
                )}
                <Text
                  style={{
                    fontSize: 17,
                    fontFamily: 'Poppins-Bold',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 4,
                    marginTop: 7,
                  }}>
                  ₹ {item?.final_price}
                </Text>
              </View>
              {/* <TouchableOpacity style={{ backgroundColor: 'green', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 }}
                                onPress={() => add_to_cart(item?.id, item?.cook_id)}>
                                <Text>Add</Text>
                            </TouchableOpacity> */}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View
        style={{
          backgroundColor: '#09b44d',
          borderBottomLeftRadius: 25,
          borderBottomRightRadius: 25,
          justifyContent: 'center',
          height: 60,
        }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            flexDirection: 'row',
            paddingHorizontal: 15,
            alignItems: 'center',
          }}>
          <Image style={{ width: 9, height: 16 }} source={arrow} />
          <Text
            style={{
              color: '#fff',
              fontSize: 18,
              fontFamily: 'Poppins-Bold',
              paddingLeft: 10,
              textAlignVertical: 'center',
              marginTop: 3,
            }}>
            {route?.params?.englanguage?.name ?? route?.params?.userlanguage?.name}
          </Text>
        </TouchableOpacity>
      </View>

      {modal != true && listItems.length > 0 ? (
        <FlatList
          style={{ margin: 10 }}
          data={listItems}
          keyExtractor={(item, index) => index.toString()}
          renderItem={newrenderItem}
          onEndReachedThreshold={0}
          onEndReached={onReached}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        modal != true && (
          <View style={{ flex: 1, paddingVertical: 300, alignItems: 'center' }}>
            <Image
              style={{ height: 100, width: 100, alignItems: 'center' }}
              source={emptyCartIcon}
            />
            <Text
              style={{
                textAlign: 'center',
                fontFamily: 'Poppins-Bold',
                fontSize: 14,
                opacity: 0.8,
                paddingHorizontal: 10
              }}>
              {moment().format('HH:mm') > '23:00' || moment().format('HH:mm') < '08:00' ? 'Our Delivery Starts Everyday @ 8.A.M 😄' : `😥Oops! Hungry for this category?\nExciting items are coming soon!`}
            </Text>
          </View>
        )
      )}
      {loader && (
        <View style={{ padding: 10 }}>
          <Loader />
        </View>
      )}
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
  delLoc: {
    flexDirection: 'row',
    marginTop: 8,
  },
});
export default FoodListFilter;
