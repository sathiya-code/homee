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
  SafeAreaView,
  FlatList,
  Modal,
  StatusBar,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { arrow, tagIcon, timingIcon, offerIcon, distanceIcon, emptyCartIcon } from '../assets/img/Images';
import { useTranslation } from 'react-i18next';
import { api } from '../services';
import { useFocusEffect } from '@react-navigation/core';
import Loader from './Loader';
import { AppBackground, HomeBgColor, SecondaryGreen } from '../helper/styles.helper';
// import Shimmer from 'react-native-shimmer';
import Shimmer from 'react-native-shimmer-placeholder';

const Favourites = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [modal, setModal] = useState(true);
  const [listItems, setListItems] = useState([]);
  const [paginate, setPaginate] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loader, setLoader] = useState(false);
  const getList = async () => {
    if (paginate > 1) {
      setLoader(true);
      let response = await api.favourite_list(paginate);
      setLoader(false);
      if (response.status == 'success') {
        setListItems(listItems.concat(response.cooks));
        setPagination(response.pagination);
      }
    } else {
      setModal(true);
      let response = await api.favourite_list(paginate);
      setModal(false)
      if (response.status == 'success') {
        setListItems(response.cooks);
        setPagination(response.pagination);
      }
    }
  }
  useFocusEffect(
    React.useCallback(() => {
      getList();
    }, []),
  );
  useEffect(() => {
    getList();
  }, [paginate])
  var onReached = e => {
    if (pagination?.current_page < pagination?.last_page) {
      setPaginate(paginate + 1);
    }
  };

  const getActivityAnalytics = async (cook_id) => {
    console.log("cook_id", cook_id);
    await api.getActivityStatus({ history_type: 2, cook_id })
  };

  const _renderItem = ({ item, index }) => {
    index == 0 && console.log("itemmmm,", item);
    return (
      <TouchableOpacity
        onPress={() => {
          getActivityAnalytics(item?.id);
          navigation.navigate('FoodDetail', {id: item?.id})
        }}
        style={{
          flexDirection: 'row',
          marginHorizontal: 10,
          paddingRight: 10,
          // paddingVertical: 10,
          marginVertical: 5,
          backgroundColor: '#fff',
          borderRadius: 25,
        }}>
        <View style={{ flex: 4, }}>
          <View style={{ width: '100%', borderRadius: 5, backgroundColor: '#fff', borderRadius: 25 }}>
            {item?.image ? <Image
              source={{ uri: item?.image }}
              style={{ width: '100%', height: 120, borderTopLeftRadius: 25, borderBottomLeftRadius: 25 }}
            /> : <Shimmer tilt={30}>
              <View style={{ height: 120, backgroundColor: 'silver', borderRadius: 25, alignSelf: 'center' }} />
            </Shimmer>}
          </View>
        </View>
        <View
          style={{
            flex: 5, paddingLeft: 8, marginTop: -5, paddingVertical: 5
          }}>
          <Text style={{ fontSize: 16, fontFamily: 'Poppins-Bold' }}>
            {item.first_name}
          </Text>

          <View style={styles.delLoc}>
            <Text
              style={{
                fontSize: 14.5,
                fontFamily: 'Poppins-Regular',
                fontWeight: '400',
                alignItems: 'center',
                lineHeight: 23,
                justifyContent: 'center',
                marginLeft: 3,
                marginTop: -5
              }}>
              {item?.viewmenuitem?.cuisine
                ? item.viewmenuitem.cuisine.userlanguage.name + ' ,'
                : null}
              {item?.area ? item.area + ' .' : null}
            </Text>
          </View>
          <View style={styles.delLoc}>
            <Image
              style={{
                width: 18,
                height: 18,
              }}
              source={distanceIcon}
            />
            <Text
              style={{
                fontSize: 13,
                fontFamily: 'Poppins-Bold',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 6,
              }}>
              {item.distance} km
            </Text>
          </View>
          {item.delivery_time && <View style={styles.delLoc}>
            <Image style={{ width: 17, height: 17 }} source={timingIcon} />
            <Text
              style={{
                fontSize: 13.5,
                fontFamily: 'Poppins-Bold',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 6,
              }}>
              {item.delivery_time} mins
            </Text>
          </View>}
          {/* <View style={styles.delLoc}>
            <Image style={{ width: 16, height: 16 }} source={tagIcon} />
            <Text
              style={{
                fontSize: 13.5,
                fontFamily: 'Poppins-Bold',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 6,
              }}>
              ₹ {item.cost_for_two}
            </Text>
          </View> */}
          {item.cookoffer == 1 ? (
            <View style={styles.delLoc}>
              <Image style={{ width: 18, height: 18 }} source={offerIcon} />
              <Text
                style={{
                  fontSize: 14.5,
                  fontFamily: 'Poppins-Regular',
                  fontWeight: '400',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: 6,
                }}>
                Try Homee Foodz
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    )
  }

  useEffect(() => {
    const focusHandler = navigation.addListener('focus', () => {
      getList();
    });
    return focusHandler;
  }, [navigation]);


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor='#09B44D' barStyle={'light-content'} />
      <View
        style={{
          backgroundColor: '#09b44d',
          borderBottomLeftRadius: 25,
          borderBottomRightRadius: 25,
          justifyContent: 'center',
          height: 60,
        }}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={{
            flexDirection: 'row',
            paddingHorizontal: 15,
          }}>
          <Image style={{ width: 9, height: 16 }} source={arrow} />
          <Text style={{
            color: '#fff',
            fontSize: 18,
            fontFamily: 'Poppins-Bold',
            paddingLeft: 10,
            marginTop: -5

          }}>{t("favouritesPage.favourites")}</Text>
        </Pressable>
      </View>
      {modal != true && listItems.length > 0 ?
        <FlatList
          data={listItems}
          style={{ backgroundColor: AppBackground, paddingTop: 15 }}
          renderItem={_renderItem}
          onEndReachedThreshold={0}
          onEndReached={onReached}
          showsVerticalScrollIndicator={false}
        />
        :
        modal != true &&
        (
          <View style={{ flex: 1, paddingVertical: 300, alignItems: 'center' }}>
            <Image style={{ height: 100, width: 100, alignItems: 'center' }} source={emptyCartIcon} />
            <Text style={{
              textAlign: 'center', fontFamily: 'Poppins-Bold',
              fontSize: 14, opacity: 0.25
            }}>No data available...</Text>
          </View>
        )
      }
      {loader &&
        <View style={{ padding: 10 }}>
          <Loader />
        </View>
      }
      {modal && (
        <Modal transparent={true} visible={modal}>
          <Loader />
        </Modal>
      )}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  pageTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  delLoc: {
    flexDirection: 'row',
    marginTop: 5,
  },
});

export default Favourites;
