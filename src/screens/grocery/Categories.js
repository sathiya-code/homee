import React, {useEffect, useState} from 'react';
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

const {width, height} = Dimensions.get('screen');

const Categories = ({navigation}) => {
  const [categories, setCategories] = useState([]);
  const getCategories = async () => {
    const response = await api.grocGetCategories();
    if (response?.status == 'success') {
      setCategories(response?.categories);
      console.log('test', response.categories);
    }
  };

  const _renderItem = ({item, index}) => {
    console.log('item', item);
    const payload = {
      searchText: item.englanguage.name,
      vendorType: 'grocery',
    };
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('FoodListFilter', item)}>
        {/* <TouchableOpacity onPress={() => navigation.navigate('search', payload)}> */}
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: index == categories.length-1 ? 30 : 10,
          }}>
          <View
            style={{
              elevation: 2,
              backgroundColor: 'white',
              borderRadius: 50,
              marginBottom: 5,
            }}>
            <Image
              source={{uri: item?.image}}
              style={{width: 70, height: 70, resizeMode: 'cover'}}
              borderRadius={500}
            />
          </View>
          <Text
            style={{
              fontFamily: 'Poppins-Bold',
              fontSize: 11,
              color: '#4E5054',
            }}>
            {item?.englanguage?.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const Seperator = () => {
    return <View style={styles.seperator} />;
  };

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.categoriesText}>Categories</Text>
      <Seperator />
      <FlatList
        data={categories}
        renderItem={_renderItem}
        horizontal
        style={styles.flatList}
      />
      <Seperator />
    </View>
  );
};

export default Categories;

const styles = StyleSheet.create({
  categoriesText: {
    fontFamily: 'Poppins-Bold',
    color: '#00164F',
    fontSize: 16,
    marginHorizontal: '5%',
  },
  flatList: {
    width: '100%',
    paddingLeft: '5%',
    paddingVertical: 7,
  },
  mainContainer: {},
  seperator: {
    width,
    height: 3,
    backgroundColor: '#00164F',
    opacity: 0.12,
  },
});
