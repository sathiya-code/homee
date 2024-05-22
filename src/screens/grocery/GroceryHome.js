import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import * as Images from '../../assets/img/Images';
import Carousel from 'react-native-snap-carousel';
import * as api from '../../services/api';
import Categories from './Categories';
import NearByVendors from './NearByVendors';

const GroceryHome = ({navigation, route}) => {
  const serviceName = route.params.type;
  const [banners, setBanner] = useState([]);

  const {width, height} = Dimensions.get('window');

  const getBanners = async () => {
    const response = await api.grocGetBanners();
    console.log('get Banners from grocery ', response.banners);
    setBanner(response.banners);
  };

  useEffect(() => {
    getBanners();
  }, []);

  const render_Banner_Item = ({item, index}) => {
    return (
      <TouchableOpacity
        onPress={() => {
          if (
            item?.target?.length > 0 &&
            item?.target?.toString()?.startsWith('https')
          ) {
            Linking.openURL(item?.target);
          } else if (item?.target?.length > 0 && item?.target != null)
            navigation.navigate('FoodDetail', {id: item?.target});
        }}>
        <Image
          source={{uri: item?.image}}
          style={{
            width: width * 0.96,
            height: 200,
            borderRadius: 15,
            resizeMode: 'contain',
            alignSelf: 'center',
          }}
        />
      </TouchableOpacity>
    );
  };
  const Banner = () => {
    return (
      <>
        {banners.length > 0 && (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {console.log('banner.length', banners.length)}
            <Carousel
              enableSnap
              style={{borderRadius: 25, overflow: 'hidden'}}
              loop
              data={banners}
              renderItem={render_Banner_Item}
              sliderWidth={width}
              itemWidth={width}
              autoplay
              pagingEnabled
              autoplayDelay={1000}
              autoplayInterval={3000}
              activeSlideAlignment={'center'}
              contentContainerCustomStyle={{
                height: 210,
                overflow: 'hidden',
              }}
            />
          </View>
        )}
      </>
    );
  };
  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}>
      <StatusBar backgroundColor={'#E5EDFF'} barStyle={'dark-content'} />
      <View
        style={{
          flexDirection: 'column',
          backgroundColor: '#FAFAFA',
          height: 45,
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
          <Image
            style={{width: 25, height: 25, tintColor: '#00164F'}}
            source={Images.leftArrow}
          />
          <Text
            style={{
              color: '#00164F',
              fontSize: 18,
              fontFamily: 'Poppins-SemiBold',
              paddingLeft: 10,
              marginTop: 2,
            }}>
            {serviceName}
          </Text>
        </TouchableOpacity>
      </View>
      <NearByVendors navigation={navigation}>
        <View style={{width}}>
          <Banner />
          <Categories navigation={navigation}/>
        </View>
      </NearByVendors>
    </SafeAreaView>
  );
};

export default GroceryHome;

const styles = StyleSheet.create({});
