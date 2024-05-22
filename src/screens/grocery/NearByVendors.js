import React, {Children, useEffect, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as api from '../../services/api';
import * as Images from '../../assets/img/Images';
import axios from 'axios';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {toCamelCase} from '../../helper/app.helper';
import {Modal} from 'react-native';
import Loader from '../Loader';

const {width, height} = Dimensions.get('screen');

const NearByVendors = ({navigation, children}) => {
  const [title, setTitle] = useState('Near-by Vendors');
  const [vendors, setVendors] = useState([]);
  const [nextPage, setNextPage] = useState(1);
  // const [lastPage, setLastPage] = useState(null);
  const [isLoaderVisible, setIsLoaderVisible] = useState(true);

  const getVendors = async () => {
    setIsLoaderVisible(true);
    const response = await api.grocGetNearbyVendors(nextPage, 20);
    console.log('lastPage', response?.lastPage);
    console.log('lastPage next', nextPage);
    console.log('next', response?.nextPageUrl);
    if (response?.status == 'success' && nextPage <= response?.lastPage) {
      setTitle(response?.title);
      setVendors([...vendors, ...response?.vendors]);
      console.log('counttttttt');
      setNextPage(nextPage + 1);
    }
    if (!response?.nextPageUrl) setIsLoaderVisible(false);
  };

  const _renderItem = ({item, index}) => {
    return (
      <TouchableOpacity
        key={item?.id?.toString() + index.toString()}
        onPress={
          () => navigation.navigate('FoodDetail', {id:item.id})
          // navigation.navigate('GroceryVendorDetails', item.id)
        }>
        <View
          style={{
            width: '90%',
            marginLeft: '5%',
            backgroundColor: 'white',
            borderRadius: 10,
            marginBottom: 15,
            flexDirection: 'row',
          }}>
          <Image
            source={{uri: item?.image}}
            style={{
              height: 75,
              width: '27%',
              resizeMode: 'cover',
              borderWidth: 0.2,
              borderColor: '#00164F',
            }}
            borderRadius={10}
          />
          <View style={{justifyContent: 'space-evenly', width: '60%'}}>
            <View style={{flexDirection: 'row'}}>
              <Fontisto
                name="shopping-store"
                size={14}
                style={{width: '10%', marginLeft: '3%'}}
              />
              <Text
                style={{
                  fontFamily: 'Poppins-Bold',
                  fontSize: 12,
                  color: '#4E5054',
                  marginLeft: 7,
                  width: '85%',
                }}
                numberOfLines={1}>
                {toCamelCase(item?.first_name)}
              </Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Entypo
                name="location-pin"
                size={22}
                style={{width: '10%', marginLeft: '3%'}}
              />
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  fontSize: 11,
                  color: '#4E5054',
                  marginLeft: 7,
                  width: '80%',
                }}
                numberOfLines={1}>
                {toCamelCase(item?.area)}
              </Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <MaterialCommunityIcons
                name="star-box"
                size={18}
                style={{width: '10%', marginLeft: '3%'}}
              />
              <Text
                style={{
                  fontFamily: 'Poppins-Regular',
                  fontSize: 11,
                  color: '#4E5054',
                  marginLeft: 7,
                }}>
                {toCamelCase(item?.cook_type)}
              </Text>
            </View>
          </View>
          {!!item?.discount && (
            <View
              style={{
                backgroundColor: '#00164F',
                width: 75,
                height: '30%',
                top: 26,
                borderTopRightRadius: 15,
                borderTopLeftRadius: 15,
                transform: [{rotate: '90deg'}],
              }}>
              <Text
                style={{
                  width: 75,
                  color: 'white',
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  fontFamily: 'Poppins-Bold',
                  fontSize: 12,
                }}
                numberOfLines={1}>
                {`${item.discount}% Off`}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // const getNextPage = async () => {
  //   console.log('nextPage');
  //   setNextPage(prev => prev + 1);
  // };

  const Seperator = () => {
    return <View style={styles.seperator} />;
  };

  // useEffect(() => {
  //   console.log('rr');
  //   getVendors();
  // }, [nextPage, setNextPage]);
  useEffect(() => {
    getVendors();
  }, []);

  return (
    <View style={styles.mainContainer}>
      <Seperator />
      <FlatList
        ListHeaderComponent={
          <>
            {children}
            <Text style={styles.vendorsText}>{title}</Text>
          </>
        }
        ListFooterComponent={
          <View style={{bottom: 0, height: '15%', width}}>
            {isLoaderVisible && (
              // <Modal transparent={true} visible={isLoaderVisible}>
              <Loader />
              // </Modal>
            )}
          </View>
        }
        data={vendors}
        renderItem={_renderItem}
        style={styles.flatList}
        keyExtractor={(item, index) => `_key_${index.toString()}`}
        onEndReached={getVendors}
      />
      <Seperator />
    </View>
  );
};

export default NearByVendors;

const styles = StyleSheet.create({
  vendorsText: {
    fontFamily: 'Poppins-Bold',
    color: '#00164F',
    fontSize: 16,
    marginHorizontal: '5%',
    marginBottom: 10,
    marginTop: 15,
  },
  flatList: {
    marginBottom: 50,
  },
  mainContainer: {
    backgroundColor: '#E5EDFF',
  },
  seperator: {
    width,
    height: 3,
    backgroundColor: '#00164F',
    opacity: 0.12,
  },
});
