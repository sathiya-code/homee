/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ImageBackground,
  Dimensions,
  Modal,
  SafeAreaView,
  BackHandler,
  FlatList,
  Linking,
  StatusBar,
  Alert,
  TouchableHighlight,
  ToastAndroid,
} from 'react-native';
import Carousel from 'react-native-snap-carousel';
import {
  locatIcon,
  notification,
  timingIcon,
  offerIcon,
  photo1,
  distanceIcon,
  tagIcon,
  bannerStatic,
  footerImage1,
  coming_soon,
  deliverySoon,
} from '../assets/img/Images';
import { api, storage } from '../services/index';
import { useSelector } from 'react-redux';
import Loader from './Loader';
// import { FlatList } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/core';
import {
  AppBackground,
  HomeBgColor,
  PrimaryGreen,
  SecondaryGreen,
} from '../helper/styles.helper';
import starSelect from '../assets/img/star_select.png';
import starUnSelect from '../assets/img/star_unselect.png';
import LinearGradient from 'react-native-linear-gradient';
import offerHorn from '../assets/img/offer_icon.png';
import location_bar_icon from '../assets/img/location_bar_icon.png';
import offerIcon2 from '../assets/img/offer_icon2.png';
import { LinearTextGradient } from 'react-native-text-gradient';
import Shimmer from 'react-native-shimmer';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import FastImage from 'react-native-fast-image';
import { checkForUpdate, toCamelCase } from '../helper/app.helper';
import checkVersion from 'react-native-store-version';
import deviceInfoModule from 'react-native-device-info';
import NoServiceArea from './NoServiceArea';
import Geolocation from '@react-native-community/geolocation';
import distance from '../helper/distanceCalc';
import Geocoder from 'react-native-geocoding';
// import { Snackbar } from 'react-native-paper';

const BannerCarouselImg = Dimensions.get('window').width;

const { width, height } = Dimensions.get('window');

const HomeNew = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [modal, setModal] = useState(false);
  const [banner, setBanner] = useState([]);
  const [top_new_cooks, setTop_new_cooks] = useState([]);
  const [time_based_menu, setTime_based_menu] = useState([]);
  const [popular_foods, setPopular_foods] = useState([]);
  const [cook_offers, setCook_offers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [food_types, setFood_types] = useState([]);
  const [ourServices, setOurServices] = useState([]);
  const [nearby_cooks, setNearby_cooks] = useState([]);
  const [restaurantCooks, setRestaurantCooks] = useState([]);
  const [cookTypeHome, setCookTypeHome] = useState(true);
  const [foodType, setFoodType] = useState(true);
  const [cookDetail, setCookDetail] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState();
  const [top_rated_cooks, setTop_rated_cooks] = useState([]);
  const [happyIndex, setHappyIndex] = useState(0);
  const [serviceable, setServiceable] = useState(true);
  const [oneToOne, setOneToOne] = useState(null);
  const [currentLocation, setCurrentLocation] = useState('');
  const [listItems, setListItems] = useState();
  const [pndListItems, setpndListItems] = useState();
  const [showTrackOrder, setShowTrackOrder] = useState(false);
  const [comingSoonModal, setComingSoonModal] = useState(false);
  const [serviceTitle, setServiceTitle] = useState({
    ourServices: "Our Services",
    byCategory: "Homee Delivers Doorstep",
    topPicks: "Top Homee Picks For You",
    nearBy: "All Cooks Nearby"

  })

  const getServiceTitles = async () => {
    setModal(true);
    let response = await api.getServicesTitle();
    if (response.status == 'success') {
      setServiceTitle(response);
      console.log("title reesponse", response);
    }
  }

  const getCurrentOrders = async () => {
    setModal(true);
    console.log("listItemslistItems",);
    let response = await api.currentOrders();
    if (response?.status == 'success') {
      setListItems(response?.orders?.[0]);
      setpndListItems(response?.pndOrders?.[0]);
      (!!response?.orders?.[0] || !!response?.pndOrders?.[0]) && setShowTrackOrder(true);
      console.log("listItemslistItems", response?.orders[0]);
    }
    setModal(false);
  }

  const scrollViewRef = useRef(null);
  const targetViewRef = useRef(null);

  useEffect(() => {
    if (!ourServices.length && !foodType.length) setModal(true);
    else setModal(false);
  }, [ourServices, setOurServices, food_types, setFood_types]);

  Geocoder.init('AIzaSyBHkDZcJWMhylGafddN7JyQCpZfZRz9pO4');

  const eatHappyRef = useRef();
  const setOneToOneCooks = async () => {
    const response = await api.setOneToOneCooks();
    if ((response.status = 'success')) {
      setOneToOne(response);
    }
  };

  useEffect(() => {
    const focusHandler = navigation.addListener('focus', () => {
      checkForUpdate();
      // getDeliveryTime();
      getUserAddress();
      servicableAreaCheck();
      setOneToOneCooks();
      getCurrentOrders();
      getServiceTitles();
    });
    return focusHandler;
  }, []);


  const get_Token = async () => {
    // setModal(true);
    var user = await storage.getUserData();
    setUser(user);
    setModal(false);
  };
  // console.log("addddddddddddddddddddddddddddddd", defaultAddress);
  const getUserAddress = async () => {
    const address = await api.getUserAddress();
    console.log('adddddddd222222', address);
    if (
      defaultAddress == undefined ||
      (defaultAddress.latitude != address.useraddress.latitude &&
        defaultAddress.longitude != address.useraddress.longitude)
    ) {
      // console.log(
      //   'tessssssssssssssssssssssssssssssssssssstttttttttttt',
      //   defaultAddress == undefined ||
      //   (defaultAddress.latitude != address.useraddress.latitude &&
      //     defaultAddress.longitude != address.useraddress.longitude),
      // );
      setDefaultAddress(address.useraddress);
      home_page();
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      get_Token();
    }, []),
  );
  useEffect(() => {
    home_page();
  }, [route]);

  const getBanners = async () => {
    let response = await api.homeBanners();
    // console.log("rsponse from banners", response);
    if (response.status == 'success') {
      setBanner(response?.banners);
      setCoupons(response?.coupons);
      setFood_types(response?.food_types);
      setOurServices(response?.our_services);
      storage.setCartStatus(response?.cart_status);
    }
  };
  const getCookTopRated = async () => {
    let response = await api.homeCookTopRated(1);
    // if (response.status == 'success') {
    //   setTop_rated_cooks(response?.cook_top_rated);
    // }
  };
  const getCookNearBy = async () => {
    let response = await api.homeCookNearBy();
    // console.log("cooks nearby from home page", response?.cookIds);
    if (response.status == 'success') {
      setNearby_cooks(response?.homemade_cooks);
      setRestaurantCooks(response?.restaurant_cooks);
    }
  };

  const timeBasedMenu = async () => {
    const response = await api.timeBasedMenu();
    // console.log("response from menu times based on timings", response?.timeBasedMenus);
    setTime_based_menu(response?.timeBasedMenus);
  };

  const getActivityAnalytics = async cook_id => {
    console.log('cook_id', cook_id);
    await api.getActivityStatus({ history_type: 2, cook_id });
  };

  const getBestFour = async () => {
    const response = await api.homeBestFour();
    // console.log("response Best four", response);
    if (response.status == 'success') {
      setTop_rated_cooks(response?.cook_top_rated);
    }
  };

  const home_page = async () => {
    setModal(true);
    getServiceTitles();
    get_Token();
    getBanners();
    getCurrentOrders();
    // getPopularFoods();
    getCookTopRated();
    getCookNearBy();
    // getCookNew();
    timeBasedMenu();
    getBestFour();
    setModal(false);
  };

  const render_Banner_Item = ({ item, index }) => {
    // console.log('itemmm banner', item?.target, typeof item?.target);
    return (
      <TouchableOpacity
        onPress={() => {
          if (item?.target == 'preorder' || oneToOne?.isPreOrder) {
            navigation.navigate('PreOrder');
          } else if (
            item?.target?.length > 0 &&
            item?.target?.toString()?.startsWith('https')
            // typeof item?.target
          ) {
            Linking.openURL(item?.target);
          } else if (
            item?.target?.length > 0 &&
            item?.target != 'preorder' &&
            item?.target != null
          )
            navigation.navigate('FoodDetail', item?.target);
        }}>
        <Image
          source={{ uri: item?.image }}
          style={{
            width: width * 0.96,
            height: 200,
            borderRadius: 15,
            // overflow: 'hidden',
            resizeMode: 'contain',
            alignSelf: 'center',
          }}
        />
      </TouchableOpacity>
    );
  };
  const _renderItem = ({ item, index }) => {
    // index == 0 && console.log("itemmmmm ind 00", item);
    let backgroundImg = null;
    // if (index % 2) {
    //   backgroundImg = require('../assets/img/coupon/1.png');
    // } else {
    // backgroundImg = require('../assets/img/coupon/3.png');
    // }
    return (
      <>
        <View style={{ height: 170, width: 120, marginRight: 15 }}>
          <FastImage
            style={styles.couponBack}
            source={{ uri: item?.bg_img, cache: 'cacheOnly' }}
          />
          <View style={{ marginHorizontal: 10 }}>
            <Text style={[styles.package, { color: item?.font_color }]}>
              upto
            </Text>
            <Text style={styles.percentage}>{item?.value}%</Text>
            <Text style={[styles.offer, { color: item?.font_color }]}>
              offers on
            </Text>
            <Text style={styles.offerName}>{item?.coupon_name}</Text>
          </View>
          <View
            style={{
              height: 170,
              width: 120,
              justifyContent: 'flex-end',
              alignItems: 'center',
              position: 'absolute',
            }}>
            <FastImage
              source={{ uri: item?.image }}
              style={{
                width: 60,
                aspectRatio: 1,
                overflow: 'hidden',
                bottom: 0,
                borderRadius: 10,
                // justifyContent: "center",
                // alignItems: "center",
              }}
            />
          </View>
          {/* </Image> */}
        </View>
      </>
    );
  };

  const _renderItem1 = ({ item, index }) => {
    // index == 0 && console.log("featured cook item", item)
    return (
      <TouchableOpacity
        style={{ marginRight: 20 }}
        onPress={() => navigation.navigate('FoodDetail', item.cook_id)}>
        <View
          style={{ width: 110, justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              flexDirection: 'row',
              width: 90,
              height: 25,
              fontFamily: 'Poppins-Bold',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: PrimaryGreen,
              borderRadius: 10,
              marginBottom: -10,
              zIndex: 3,
            }}>
            <Image
              source={offerHorn}
              style={{ height: 14, width: 14, marginRight: 5 }}
            />
            <Text style={{ textAlign: 'center', color: '#fff' }}>Special</Text>
          </View>
        </View>
        <FastImage
          source={{ uri: item.image, cache: 'cacheOnly', priority: 'high' }}
          style={{
            width: 110,
            aspectRatio: 1,
            // height: 110,
            borderRadius: 15,
            overflow: 'hidden',
            resizeMode: 'cover',
          }}
        />
        <View
          style={{
            flexDirection: 'row',
            paddingVertical: 4,
            width: 100,
            marginLeft: 5,
            justifyContent: 'space-between',
          }}>
          <Image source={starSelect} style={{ width: 17, height: 17 }} />
          <Image source={starSelect} style={{ width: 17, height: 17 }} />
          <Image source={starSelect} style={{ width: 17, height: 17 }} />
          <Image source={starSelect} style={{ width: 17, height: 17 }} />
          <Image source={starUnSelect} style={{ width: 17, height: 17 }} />
        </View>
        <View
          style={{
            flexDirection: 'row',
            width: 105,
            marginLeft: 5,
            height: 50,
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}>
          <Text
            style={{
              width: '70%',
              fontFamily: 'Poppins-Bold',
              fontWeight: '800',
              fontSize: 11,
              color: '#000',
            }}
            numberOfLines={2}>
            {item.menuName}
            {/* {item?.cook_name.length > 15 ? `${item.cook_name.slice(0, 12)}...` : item.cook_name} */}
          </Text>
          <View style={{ width: '45%' }}>
            {/* <Text style={{
                            fontFamily: 'Poppins-Regular',
                            fontSize: 9,
                            textDecorationLine: 'line-through',
                            textAlign: 'center',
                            color: '#989898',
                        }}>
                            ₹{item?.actual_price}
                        </Text> */}
            <Text
              style={{
                fontFamily: 'Poppins-Bold',
                fontSize: 13,
                textAlign: 'center',
                color: '#000',
              }}>
              ₹{item?.final_price}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const poprenderItem = ({ item, index }) => {
    // console.log("indx", index, happyIndex);
    return (
      <View style={{ marginLeft: 10 }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('FoodListFilter', item)}
          style={{
            width: 160,
            height: 50,
            borderRadius: 128.5,
            backgroundColor: PrimaryGreen, // index === happyIndex ? PrimaryGreen : '#dfffec',
            flexDirection: 'row',
            borderWidth: 2,
            borderColor: '#ffffff',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View
            style={{
              width: 60,
              height: 50,
              borderRadius: 128.5,
              backgroundColor: PrimaryGreen, //happyIndex === index ? PrimaryGreen : '#b5ffd2',
              borderWidth: 2,
              borderColor: '#fff',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <FastImage
              source={{ uri: item.icon }}
              style={{ width: 50, height: 45, borderRadius: 50 }}
            />
          </View>
          <View
            style={{
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              width: '45%',
              marginRight: 12,
            }}>
            <Text
              numberOfLines={2}
              style={{
                fontFamily: 'Poppins-Bold',
                color: '#fff', // happyIndex === index ? '#fff' : PrimaryGreen,
                fontSize: 13,
                fontWeight: '600',
              }}>
              {item?.userlanguage?.name}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const newrenderItem = ({ item, index }) => {
    // console.log("featured cook item fom new cooksssssss", item)
    return (
      <>
        <TouchableOpacity
          onPress={() => {
            getActivityAnalytics(item?.id);
            navigation.navigate('FoodDetail', item.id);
          }}
          style={{
            // flexDirection: 'row',
            paddingHorizontal: 10,
            marginBottom: 10,
          }}>
          <View style={{ width: 80 }}>
            <View
              style={{
                width: '100%',
                borderRadius: 5,
                justifyContent: 'center',
              }}>
              {/* <FastImage
                            source={{ uri: item?.viewmenuitem?.image, }}
                            style={{ width: 75, height: 90, borderRadius: 15 }}
                        /> */}
              <Image
                source={{ uri: item?.food_image }}
                style={{
                  width: 75,
                  height: 90,
                  borderRadius: 15,
                  // overflow: 'hidden',
                  resizeMode: 'cover',
                }}
              />
              {/* <LinearGradient colors={['#000000', '#9e0000']} style={{ width: 75, height: 90, marginTop: '-100%' }} /> */}
            </View>
          </View>
          <View
            style={{
              width: '100%',
              justifyContent: 'center',
              alignItems: 'flex-start',
              marginLeft: 3,
            }}>
            <Text
              style={{
                marginVertical: 5,
                fontSize: 10.5,
                fontFamily: 'Poppins-Bold',
                fontWeight: '900',
                textAlign: 'left',
              }}
              numberOfLines={2}>
              {toCamelCase(item?.name)}
            </Text>
          </View>
        </TouchableOpacity>
      </>
    );
  };

  const cooksNearbyrenderItem = ({ item, index }) => {
    // index == 0 && console.log("itemmmm nearby", item)
    return (
      <TouchableOpacity
        onPress={() => {
          getActivityAnalytics(item?.id);
          navigation.navigate('FoodDetail', item.id);
        }}
        key={index.toString()}
        style={{
          // flexDirection: 'row',
          paddingLeft: 5,
          // marginBottom: 10,
        }}>
        <View
          style={{
            flexDirection: 'row',
            marginBottom: 15,
            width: '100%',
            height: 121,
            marginTop: 5,
            backgroundColor: '#fff',
          }}>
          {/* <View style={{ width: '100%', borderRadius: 5 }}> */}
          {item?.image ? (
            <FastImage
              source={{ uri: item?.image }}
              style={{
                width: '45%',
                height: 120,
                borderRadius: 15,
                marginRight: 5,
              }}
            />
          ) : (
            <Shimmer
              style={{
                width: '45%',
                height: 120,
                borderRadius: 15,
                marginRight: 5,
              }}
              tilt={30}>
              {/* <View style={{ width, height: 200, justifyContent: 'center', alignItems: 'center', marginVertical: 5 }}> */}
              <View
                style={{
                  width: '100%',
                  height: 120,
                  borderRadius: 15,
                  marginRight: 5,
                  backgroundColor: '#989898',
                }}
              />
              {/* </View> */}
            </Shimmer>
          )}
          {item?.current_status == 0 && (
            <View
              style={{
                position: 'absolute',
                width: '45%',
                height: 120,
                backgroundColor: 'grey',
                opacity: 0.7,
                borderRadius: 15,
              }}
            />
          )}
          {/* </View> */}
          <View style={{ justifyContent: 'space-between', width: '50%' }}>
            <Text
              style={{
                fontSize: 15,
                fontFamily: 'Poppins-Medium',
                fontWeight: '600',
                lineHeight: 20,
                marginVertical: 3
              }}
              numberOfLines={2}>
              {toCamelCase(item.first_name)}
            </Text>
            {/* <View style={{}}> */}
            <Text
              style={{
                alignSelf: 'flex-start',
                // width: 110,
                fontSize: 12,
                fontFamily: 'Poppins-Regular',
                fontWeight: 'normal',
                alignItems: 'flex-start',
                // lineHeight: 23,
                justifyContent: 'center',
                color: '#989898',
                backgroundColor: '#f4fbf8',
                // paddingRight: 10,
                borderRadius: 7,
                paddingHorizontal: 5
              }}>
              {item.viewmenuitem.cuisine.userlanguage.name}
            </Text>
            <Text
              style={{
                width: '100%',
                fontSize: 11,
                fontFamily: 'Poppins-Regular',
                fontWeight: 'normal',
                alignItems: 'flex-start',
                // lineHeight: 23,
                justifyContent: 'center',
                color: '#989898',
                marginTop: 3
              }}
              numberOfLines={2}>
              {item?.area}
            </Text>
            <Text
              style={{
                // height: 30,
                fontFamily: 'Poppins-Medium',
                fontSize: 13,
                color: item?.current_status == 0 ? 'tomato' : PrimaryGreen,
                // alignSelf: 'flex-start',
              }}>
              {' '}
              {item?.current_status == 0
                ? 'Unserviceable'
                : item?.delivery_notes}
            </Text>

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

  const topHomeePicksRender2 = ({ item, index }) => {
    return (
      <>
        <TouchableOpacity
          onPress={() => {
            getActivityAnalytics(item?.id);
            !!item?.cookdistancecal ?
              navigation.navigate('FoodDetail', item.id) : setComingSoonModal(true);
            // console.log("camelllcase", toCamelCase(item?.first_name))
          }}
          style={{
            // flexDirection: 'row',
            paddingHorizontal: 10,
            marginVertical: 15,
          }}
          key={index.toString()}>
          <View
            style={{
              width: width / 2.3,
              height: 160,
              backgroundColor: '#fff',
              borderRadius: 20,
              justifyContent: 'space-evenly',
              borderWidth: 0.5,
              borderColor: '#dedede',
            }}>
            <Image
              source={{ uri: item?.cook_image }}
              style={{
                width: '100%',
                height: 120,
                top: 0,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingBottom: 2,
                marginTop: -10,
              }}
            />
            <View style={{ padding: '4%' }}>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: 'Poppins-Medium',
                  textAlign: 'left',
                }}
                numberOfLines={1}>
                {toCamelCase(item.first_name)}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingBottom: 5,
                }}>
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                  <Image
                    source={starSelect}
                    style={{ width: 14, height: 14, marginRight: 3 }}
                  />
                  <Text
                    style={{
                      fontFamily: 'Poppins-Regular',
                      fontSize: 12,
                      color: '#989898',
                    }}>
                    4.{index + 3}
                  </Text>
                </View>
                {item.distance > 0 && (
                  <View style={styles.delLoc}>
                    <Image
                      style={{
                        width: 16,
                        height: 16,
                      }}
                      source={distanceIcon}
                    />
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: 'Poppins-Regular',
                        alignItems: 'center',
                        justifyContent: 'center',
                        // marginLeft: 6,
                      }}>
                      {item.distance} km
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </>
    );
  };

  const ourServicesRender = ({ item, index }) => {
    return (
      <>
        <TouchableOpacity
          onPress={() => {
            console.log("item?.navigation_path", item?.navigation_path);
            try {
              console.log("navigation pathh", item?.navigation_path);
              item.navigation_path == "Home" ? scrollToSection("home") :
                item.navigation_path == "Restaurant" ? scrollToSection("restaurant") :
                  item.navigation_path == "PreOrder" ? navigation.navigate(item.navigation_path) :
                    item.navigation_path == "Plant" ? navigation.navigate("PlantVendor", { type: "garden" }) :
                      item.navigation_path == "PickAndDrop" ? navigation.navigate("PickAndDrop") :
                        // item.navigation_path == "PickAndDrop" ? navigation.navigate("PndOrderTrack") :
                        // item.navigation_path == "PickAndDrop" ? navigation.navigate("ComingSoon", { type: 'Pick & Drop' }) :
                        navigation.navigate("ComingSoon", { type: item.service_name });
            } catch (err) { console.log("error from ourServices", err); ToastAndroid.show("Scroll Below to explore Available Service", ToastAndroid.BOTTOM) }
          }}
          style={{
            // flexDirection: 'row',
            width: width / 3,
            marginVertical: 5,
            backgroundColor: 'transparent'
            // backgroundColor: '#fff'
          }}
          key={index.toString()}>
          <View
            style={{
              backgroundColor: 'transparent',
              width: 80,
              alignSelf: 'center',
              aspectRatio: 1,
              justifyContent: 'space-evenly',
              // borderWidth: 0.5,
              // borderColor: '#dedede',
              // justifyContent: 'center',
              // alignItems: 'center',
              borderRadius: 200,
              overflow: 'hidden',
            }}>
            <Image
              source={{ uri: item?.image }}
              style={{
                width: 80,
                // height: 80,
                aspectRatio: 1,
                // height: 120,
                top: 0,
                resizeMode: 'stretch',
                backgroundColor: 'transparent',
                paddingBottom: 2,
                shadowColor: SecondaryGreen,
              }}
              resizeMode='center'
              borderRadius={200}
            />
          </View>
          <View style={{ padding: '4%', zIndex: 999 }}>
            <Text
              style={{
                fontSize: 13,
                fontFamily: 'Poppins-Medium',
                textAlign: 'left',
                alignSelf: 'center',
              }}
              numberOfLines={1}>
              {toCamelCase(item.service_name)}
            </Text>
          </View>
        </TouchableOpacity>
      </>
    );
  };

  const FilterSlider = ({ index }) => {
    return (
      <View
        style={{
          width: index == 1 ? 160 : 130,
          height: index == 1 ? 55 : 50,
          borderRadius: 128.5,
          backgroundColor: 'silver',
          flexDirection: 'row',
          borderWidth: 2,
          borderColor: '#ffffff',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginLeft: 20,
          marginRight: index == 1 ? 0 : 20,
        }}>
        <View
          style={{
            width: index == 1 ? 70 : 55,
            height: index == 1 ? 55 : 50,
            borderRadius: 128.5,
            backgroundColor: 'silver',
            borderWidth: 2,
            borderColor: '#fff',
            justifyContent: 'center',
            alignItems: 'center',
          }}></View>
        <View
          style={{
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            width: '45%',
            marginRight: 5,
          }}>
          <Text
            style={{
              fontFamily: 'Poppins-Bold',
              color: '#fff', // happyIndex === index ? '#fff' : PrimaryGreen,
              fontSize: 14,
              fontWeight: '600',
            }}></Text>
        </View>
      </View>
    );
  };

  const servicableAreaCheck = async () => {
    const response = await api.getServicableArea();
    console.log('ranjith oru nalla paiyan', response);
    setServiceable(response.isServicable);
  };
  // console.log("defaultAddressdefaultAddressdefaultAddress", defaultAddress);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(location => {
      console.log('locaaaaaa', location);
      setCurrentLocation(location.coords);
    });
  };

  const checkDefaultAddressChange = async () => {
    await getCurrentLocation();
    if (!!defaultAddress) {
      const selectedLat = defaultAddress.latitude;
      const selectedLng = defaultAddress.longitude;

      const currentLat = currentLocation.latitude;
      const currentLng = currentLocation.longitude;

      const totalDistance = distance(
        selectedLat,
        selectedLng,
        currentLat,
        currentLng,
      );

      const show = await storage.getDiffLocationAlert();
      if (!!totalDistance && totalDistance > 1 && show == 'TRUE') {
        Alert.alert(
          'Oh no, We lost you!',
          `You are on a different location, \nAre you sure want to continue?`,
          [
            {
              text: 'Change/Add New Address',
              style: 'destructive',
              isPreferred: true,
              onPress: () => {
                setModal(true);
                navigation.navigate('AddressChoose', {
                  type: 'Home',
                  profile: home_page,
                });
              },
            },
            { text: 'Continue with Selected', style: 'cancel' },
          ],
        );
        await storage.setDiffLocationAlert('FALSE');
      }
      await Geocoder.from(defaultAddress.latitude, defaultAddress.longitude)
        .then(json => {
          var addressDetail = json.results[0].address_components;
          // console.log(
          //   'addressDetail: ',
          //   addressDetail,
          //   defaultAddress.latitude,
          //   defaultAddress.longitude,
          // );
          // const  = addressDetail.filter((item) => {
          const pincode = addressDetail.filter(address => {
            // console.log('addressDessssssss', address.long_name);
            if (
              address.types == 'postal_code' &&
              address.long_name.startsWith('5')
            )
              setCookTypeHome(false);
            else setCookTypeHome(true);
            // return address.address_components.some(component => {
            //     return component.types.includes("postal_code") && component.short_name.toString().startsWith("5");
            // });
          });
          //     return item.types.includes("postal_code");
          // });
          // if (!!pincode && pincode.long_name.toString().startsWith("5")) setCookTypeHome(false)
          console.log('ranjdgd', cookTypeHome);
        })
        .catch(error => console.warn(error));
    }
  };

  useEffect(() => {
    checkDefaultAddressChange();
  }, [defaultAddress, setDefaultAddress]);


  const scrollToSection = (sectionId) => {
    // console.log("sectionId", sectionId, "height", height);
    // scrollViewRef.current.scrollTo({ x: 0, y: Number(height) * 2.5, animated: true });
    // Get the y-position of the section
    // targetViewRef.current.measure((x, y, width, height, pageX, pageY) => {
    // });
    if (sectionId == "home") {
      setCookTypeHome(true);
      targetViewRef.current.measureLayout(
        scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current.scrollTo({ y, animated: true });
        });
    }
    if (sectionId == "restaurant") {
      setCookTypeHome(false);
      targetViewRef.current.measureLayout(
        scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current.scrollTo({ y, animated: true });
        });

    }
  };

  const ShowTrackInHomePage = () => {
    return (
      <>
        {showTrackOrder && listItems?.delivery_status >= 3 && listItems?.delivery_status <= 5 &&
          <View style={{ position: 'absolute', width, backgroundColor: '#8A5D3B', zIndex: 999, bottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 7 }}>
            <View
              tilt={30} duration={1500} pauseDuration={5000}
              style={{ justifyContent: 'center', width: '70%' }}>
              <Text style={{ color: '#fff', fontSize: 14, paddingTop: 7, paddingBottom: 2, fontFamily: 'Poppins-Medium', lineHeight: 15, textAlign: 'left', paddingLeft: 5 }}>
                {/* {listItems?.delivery_status == 3 ? "Your Order is Under Prearation" : listItems?.delivery_status == 4 ? listItems?.delivery?.deliveryboy?.name + " will pickup the order once it is ready" : listItems?.delivery_status == 5 ? listItems?.delivery?.deliveryboy?.name + " is on his way to deliver your order." : "Track Your Last Order"} */}
                {listItems?.delivery_message}
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('TrackMap', { id: listItems.id })} style={{ borderWidth: 0.5, borderColor: '#989898', borderRadius: 7, paddingHorizontal: 10, marginVertical: 5, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: 'white', fontSize: 14, fontFamily: 'Poppins-Medium' }}>Track</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowTrackOrder(false)} style={{ borderRadius: 100, borderWidth: 0.5, borderColor: '#989898', paddingHorizontal: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
              <Text style={{ color: '#000a', fontSize: 12, fontFamily: 'Poppins-Medium', lineHeight: 20, textAlign: 'center' }}>
                X
              </Text>
            </TouchableOpacity>
          </View>}
        {showTrackOrder && pndListItems?.delivery_status >= 1 && pndListItems?.delivery_status < 5 &&
          <View style={{ position: 'absolute', width, backgroundColor: '#8A5D3B', zIndex: 999, bottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 7 }}>
            <View
              tilt={30} duration={1500} pauseDuration={5000}
              style={{ justifyContent: 'center', width: '70%' }}>
              <Text style={{ color: '#fff', fontSize: 14, paddingTop: 7, paddingBottom: 2, fontFamily: 'Poppins-Medium', lineHeight: 15, textAlign: 'left', paddingLeft: 5 }}>
                {/* {listItems?.delivery_status == 3 ? "Your Order is Under Prearation" : listItems?.delivery_status == 4 ? listItems?.delivery?.deliveryboy?.name + " will pickup the order once it is ready" : listItems?.delivery_status == 5 ? listItems?.delivery?.deliveryboy?.name + " is on his way to deliver your order." : "Track Your Last Order"} */}
                {pndListItems?.delivery_message}
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('PndOrderTrack', { id: pndListItems.order_no })} style={{ borderWidth: 0.5, borderColor: '#989898', borderRadius: 7, paddingHorizontal: 10, marginVertical: 5, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: 'white', fontSize: 14, fontFamily: 'Poppins-Medium' }}>Track</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowTrackOrder(false)} style={{ borderRadius: 100, borderWidth: 0.5, borderColor: '#989898', paddingHorizontal: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
              <Text style={{ color: '#000a', fontSize: 12, fontFamily: 'Poppins-Medium', lineHeight: 20, textAlign: 'center' }}>
                X
              </Text>
            </TouchableOpacity>
          </View>}
      </>
    )
  }


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor="#09B44D" barStyle={'light-content'} />
      <ShowTrackInHomePage />
      {modal == false && (
        <>
          <ScrollView style={{ flex: 1 }}
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}>
            <View
              style={{
                backgroundColor: '#fff',
                width: width,
                flexDirection: 'row',
                paddingBottom: 10,
                paddingHorizontal: 10,
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('AddressChoose', {
                    type: 'Home',
                    profile: home_page,
                  })
                }
                style={{ backgroundColor: '#fff' }}>
                <View
                  style={{
                    flexDirection: 'row',
                    // marginBottom: 5,
                    marginTop: 5,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={location_bar_icon}
                    style={{ width: 22, aspectRatio: 1, resizeMode: 'stretch' }}
                  />
                  <View style={{ height: 40 }}>
                    {!!defaultAddress ? (
                      <>
                        <Text
                          style={{
                            fontFamily: 'Poppins-Bold',
                            fontSize: 18,
                            marginLeft: 8,
                            textTransform: 'uppercase',
                          }}>
                          {defaultAddress?.type}
                        </Text>
                        <Text
                          style={{
                            fontFamily: 'Poppins-Medium',
                            fontSize: 13,
                            marginTop: -10,
                            marginLeft: 8,
                            color: '#1f2220',
                            marginBottom: 10,
                          }}
                          numberOfLines={1}>
                          {defaultAddress?.door_no
                            ? defaultAddress.door_no + ' ,'
                            : null}
                          {defaultAddress?.block
                            ? defaultAddress.block + ' ,'
                            : null}
                          {defaultAddress?.apartment_name
                            ? defaultAddress.apartment_name + ' ,'
                            : null}
                          {defaultAddress?.street?.length
                            ? defaultAddress?.street.length > 20
                              ? `${defaultAddress?.street.slice(0, 20)}...`
                              : defaultAddress.street + ', '
                            : null}
                          {defaultAddress?.city
                            ? defaultAddress.city + ', '
                            : null}
                          {defaultAddress?.pin_code
                            ? defaultAddress.pin_code + '. '
                            : null}
                        </Text>
                      </>
                    ) : (
                      <Text> Add New Address</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            <LinearGradient
              colors={['#7bffb0', '#fede1d', '#09b44d']}
              style={{ width: '100%', height: 3 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            {serviceable ? (
              <View style={{ backgroundColor: HomeBgColor }}>
                <View>
                  {banner && banner.length > 0 ? (
                    // <>
                    <View
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Carousel
                        enableSnap
                        style={{ borderRadius: 25, overflow: 'hidden' }}
                        loop
                        data={banner}
                        renderItem={render_Banner_Item}
                        sliderWidth={BannerCarouselImg}
                        itemWidth={width}
                        autoplay
                        autoplayDelay={1000}
                        autoplayInterval={3000}
                        activeSlideAlignment={'center'}
                        contentContainerCustomStyle={{
                          height: 210,
                          borderRadius: 10,
                          overflow: 'hidden',
                        }}
                      />
                    </View>
                  ) : (
                    <View
                      style={{
                        width: '98%',
                        alignSelf: 'center',
                        justifyContent: 'center',
                        alignContent: 'center',
                        marginVertical: 10,
                      }}>
                      <Shimmer tilt={30}>
                        <View
                          style={{
                            height: 200,
                            backgroundColor: 'silver',
                            borderRadius: 25,
                            alignSelf: 'center',
                          }}
                        />
                      </Shimmer>
                    </View>
                  )}
                  <View
                    style={{
                      backgroundColor: '#deece5',
                      height: 15,
                    }}
                  />
                  {ourServices && ourServices.length > 0 && <>
                    <View
                      style={{
                        justifyContent: 'center',
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingTop: 15,
                      }}>
                      <Text
                        style={{
                          color: '#09b44d',
                          fontFamily: 'Poppins-Bold',
                          fontSize: 18,
                        }}>
                        {serviceTitle.ourServices}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: '#09b44d',
                        width: '35%',
                        height: 1.5,
                        alignSelf: 'center',
                        marginBottom: 5
                      }}
                    />
                    <View
                      style={{
                        marginLeft: 0,
                        paddingTop: 5,
                        alignItems: 'center',
                      }}>
                      <FlatList
                        data={ourServices}
                        renderItem={ourServicesRender}
                        listKey={(item, index) =>
                          `_key${index.toString()}`
                        }
                        keyExtractor={(item, index) =>
                          `_key${index.toString()}`
                        }
                        key={'our_services'}
                        numColumns={3}
                      />
                    </View>
                  </>}
                  <View
                    style={{
                      backgroundColor: '#deece5',
                      height: 15,
                    }} />
                  {food_types && food_types.length > 0 && (
                    <>
                      <Text
                        style={{
                          color: '#262626',
                          fontFamily: 'Poppins-Bold',
                          fontSize: 18,
                          marginVertical: 5,
                          marginLeft: 15,
                        }}>
                        {serviceTitle.byCategory}
                      </Text>
                      <View style={{ height: 60 }}>
                        <Carousel
                          enableSnap
                          data={food_types}
                          renderItem={poprenderItem}
                          // ref={eatHappyRef}
                          loop
                          sliderWidth={BannerCarouselImg}
                          itemWidth={170}
                          inactiveSlideScale={0.8}
                          inactiveSlideOpacity={0.7}
                          autoplay
                          autoplayDelay={750}
                          autoplayInterval={2000}
                          activeSlideAlignment={'start'}
                          style={{}}
                          contentContainerCustomStyle={{
                            maxHeight: 60,
                            marginLeft: 3,
                            borderRadius: 10,
                            overflow: 'hidden',
                          }}
                        />
                      </View>
                    </>
                  )}
                  {!food_types && !food_types.length && (
                    <View
                      style={{
                        width: '100%',
                        height: 70,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <Shimmer tilt={30}>
                        <FilterSlider index={1} />
                      </Shimmer>
                      <Shimmer tilt={30}>
                        <FilterSlider index={2} />
                      </Shimmer>
                      <Shimmer tilt={30}>
                        <FilterSlider index={3} />
                      </Shimmer>
                    </View>
                  )}
                  {((top_rated_cooks && top_rated_cooks.length > 0) ||
                    (nearby_cooks && nearby_cooks.length > 0)) &&
                    oneToOne?.cookIds?.length == 0 ? (
                    <View>
                      {top_rated_cooks && top_rated_cooks.length > 0 && (
                        <View
                          style={{
                            borderBottomColor: '#deece5',
                            backgroundColor: '#f0f0f0',
                          }}>
                          <View
                            style={{
                              justifyContent: 'center',
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingTop: 15,
                              paddingBottom: 5,
                            }}>
                            <Text
                              style={{
                                color: '#5bb4f4',
                                fontFamily: 'Poppins-Bold',
                                fontSize: 18,
                              }}>
                              {serviceTitle.topPicks}
                            </Text>
                            {/* <TouchableOpacity
                              onPress={() =>
                                navigation.navigate('CookSeeAll', {
                                  type: 'top_rated_cooks',
                                })
                              }
                              style={{
                                width: '20%',
                                justifyContent: 'center',
                                alignItems: 'flex-end',
                                marginRight: '3%',
                              }}>
                              <Text
                                style={{
                                  fontSize: 12,
                                  fontFamily: 'Poppins-Medium',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  textAlign: 'center',
                                }}>
                                {`More>>`}
                              </Text>
                            </TouchableOpacity> */}
                          </View>
                          <View
                            style={{
                              width: '100%',
                              height: 2,
                              justifyContent: 'center',
                              alignItems: 'center',
                              paddingBottom: 15,
                            }}>
                            <View
                              style={{
                                backgroundColor: '#5bb4f4',
                                width: '40%',
                                height: 1.5,
                              }}
                            />
                          </View>
                          <View>
                            <View
                              style={{
                                marginLeft: 0,
                                paddingTop: 5,
                                alignItems: 'center',
                              }}>
                              <FlatList
                                data={top_rated_cooks}
                                renderItem={topHomeePicksRender2}
                                listKey={(item, index) =>
                                  `_key${index.toString()}`
                                }
                                keyExtractor={(item, index) =>
                                  `_key${index.toString()}`
                                }
                                key={'top_rated_cooks'}
                                numColumns={2}
                              />
                            </View>
                          </View>
                        </View>
                      )}
                      {time_based_menu && time_based_menu.length > 0 && (
                        <View
                          style={{
                            borderBottomColor: '#deece5',
                            borderBottomWidth: 15,
                          }}>
                          <View
                            style={{
                              justifyContent: 'center',
                              flexDirection: 'row',
                              alignItems: 'center',
                              // paddingHorizontal: 20,
                              paddingTop: 15,
                              // paddingBottom: 10,
                            }}>
                            <Text
                              style={{
                                color: '#ffb84f',
                                fontFamily: 'Poppins-Bold',
                                fontSize: 18,
                              }}>
                              {t('homePage.mostlovedfoods')}
                            </Text>
                          </View>
                          <View
                            style={{
                              width: '100%',
                              height: 2,
                              justifyContent: 'center',
                              alignItems: 'center',
                              paddingBottom: 15,
                            }}>
                            <View
                              style={{
                                backgroundColor: '#09b44d',
                                width: '40%',
                                height: 1.5,
                              }}
                            />
                          </View>
                          <View>
                            <View style={{ marginLeft: 0 }}>
                              <Carousel
                                enableSnap
                                loop
                                data={time_based_menu}
                                renderItem={newrenderItem}
                                sliderWidth={BannerCarouselImg}
                                itemWidth={100}
                                autoplay
                                autoplayDelay={1800}
                                autoplayInterval={1500}
                                inactiveSlideScale={1}
                                inactiveSlideOpacity={0.8}
                                activeSlideAlignment={'start'}
                                contentContainerCustomStyle={{
                                  marginTop: 15,
                                }}
                              />
                            </View>
                          </View>
                        </View>
                      )}

                      {nearby_cooks && nearby_cooks.length > 0 && (

                        <View style={{ width: width * 1 }} ref={targetViewRef}>
                          <Text
                            style={{
                              color: '#262626',
                              fontFamily: 'Poppins-Bold',
                              fontSize: 18,
                              marginTop: 15,
                              marginLeft: 15,
                            }}>
                            {serviceTitle.nearBy}
                          </Text>
                          <Text
                            style={{
                              color: '#262626',
                              fontFamily: 'Poppins-Regular',
                              fontSize: 14,
                              marginTop: -7,
                              marginLeft: 15,
                              fontWeight: '300',
                              color: '#1f2220',
                            }}>
                            {t('homePage.discoverYourFavouriteRecipes')}
                          </Text>
                          {/* <View style={{ width: '50%', height: 20, backgroundColor: 'blue' }}></View> */}
                          <View
                            style={{
                              height: 50,
                              width: '100%',
                              flexDirection: 'row',
                              backgroundColor: '#fff',
                            }}>
                            <TouchableOpacity
                              style={{
                                width: '55%',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                              onPress={() => setCookTypeHome(true)}>
                              <View
                                style={{
                                  width: '100%',
                                  height: 50,
                                  borderStyle: 'solid',
                                  borderRightWidth: 30,
                                  borderBottomWidth: 50,
                                  borderRightColor: 'transparent',
                                  borderBottomColor: cookTypeHome
                                    ? '#29C270'
                                    : '#DADCDB',
                                  top: 0,
                                  // zIndex: 3
                                }}></View>
                              <Text
                                style={{
                                  zIndex: 99,
                                  color: cookTypeHome ? '#fff' : '#29C270',
                                  position: 'absolute',
                                  fontSize: 20,
                                  fontFamily: 'Poppins-Medium',
                                }}>
                                Home Made
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={{
                                width: '55%',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginLeft: -width * 0.075,
                              }}
                              onPress={() => setCookTypeHome(false)}>
                              <View
                                style={{
                                  width: '100%',
                                  height: 50,
                                  borderStyle: 'solid',
                                  borderLeftWidth: 30,
                                  borderTopWidth: 50,
                                  borderLeftColor: 'transparent',
                                  borderTopColor: cookTypeHome
                                    ? '#DADCDB'
                                    : '#29C270',
                                  top: 0,
                                  // zIndex: 3
                                }}></View>
                              <Text
                                style={{
                                  zIndex: 99,
                                  color: cookTypeHome ? '#29C270' : '#fff',
                                  position: 'absolute',
                                  fontSize: 20,
                                  fontFamily: 'Poppins-Medium',
                                }}>
                                Restaurants
                              </Text>
                            </TouchableOpacity>
                          </View>
                          {cookTypeHome && (
                            <View
                              style={{
                                flexDirection: 'row',
                                width: '100%',
                                marginTop: 15,
                                alignItems: 'center',
                                justifyContent: 'space-evenly',
                              }}>
                              <TouchableOpacity
                                onPress={() => setFoodType(true)}>
                                <Text
                                  style={{
                                    fontSize: 16,
                                    fontFamily: 'Poppins-Bold',
                                    textDecorationLine: foodType
                                      ? 'underline'
                                      : 'none',
                                    paddingBottom: 5,
                                    color: foodType ? '#29C270' : '#868686',
                                  }}>
                                  Instant Order
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => navigation.navigate('PreOrder')}>
                                <Text
                                  style={{
                                    fontSize: 16,
                                    fontFamily: 'Poppins-Bold',
                                    textDecorationLine: !foodType
                                      ? 'underline'
                                      : 'none',
                                    paddingBottom: 5,
                                    color: !foodType ? '#29C270' : '#868686',
                                  }}>
                                  Advance Order
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}

                          {cookTypeHome && foodType && (
                            <ScrollView
                              nestedScrollEnabled
                              style={{}}
                              overScrollMode="never"
                              key={'nearby_cooks_scroll'}>
                              <FlatList
                                key={'nearby_cooks'}
                                style={{ marginVertical: 10, marginLeft: 0 }}
                                data={nearby_cooks}
                                listKey={(item, index) =>
                                  `_key${index.toString()}`
                                }
                                keyExtractor={(item, index) =>
                                  `_key${index.toString()}`
                                }
                                renderItem={cooksNearbyrenderItem}
                                onEndReachedThreshold={0}
                              // numColumns={2}
                              />
                            </ScrollView>
                          )}
                          {cookTypeHome && !foodType && (
                            // <PreOrder />
                            <TouchableOpacity
                              style={{
                                flexDirection: 'row',
                                width: '85%',
                                borderWidth: 1,
                                borderColor: '#29C270',
                                backgroundColor: '#fff',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: 10,
                                borderRadius: 10,
                                paddingVertical: 5,
                                paddingHorizontal: 10,
                                alignSelf: 'center',
                              }}
                              onPress={() => navigation.navigate('PreOrder')}>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontFamily: 'Poppins-Regular',
                                  color: '#29C270',
                                  letterSpacing: 1,
                                }}>
                                Choose Your Date
                              </Text>
                              <Text
                                style={{
                                  fontSize: 24,
                                  color: '#29C270',
                                  letterSpacing: 1,
                                }}>
                                +
                              </Text>
                            </TouchableOpacity>
                          )}
                          {!cookTypeHome && (
                            <ScrollView
                              nestedScrollEnabled
                              style={{}}
                              overScrollMode="never"
                              key={'restaurantCooks_scroll'}>
                              <FlatList
                                key={'restaurantCooks'}
                                style={{ marginVertical: 10, marginLeft: 0 }}
                                data={restaurantCooks}
                                listKey={(item, index) =>
                                  `_key${index.toString()}`
                                }
                                keyExtractor={(item, index) =>
                                  `_key${index.toString()}`
                                }
                                renderItem={cooksNearbyrenderItem}
                                onEndReachedThreshold={0}
                              // numColumns={2}
                              />
                            </ScrollView>
                          )}
                        </View>
                      )}
                    </View>
                  ) : (
                    <>
                      {/* {console.log("nearby_cooks.lengthnearby_cooks.lengthnearby_cooks.lengthnearby_cooks.length", nearby_cooks?.length, oneToOne)} */}
                      {nearby_cooks?.length > 0 &&
                        (oneToOne?.isBoth || oneToOne?.isInstantOrder) && (
                          <>
                            <View
                              style={{
                                // paddingBottom: 15,
                                backgroundColor: '#deece5',
                                height: 15,
                              }}
                            />
                            <Text
                              style={{
                                color: '#29C270',
                                fontFamily: 'Poppins-Bold',
                                fontSize: 24,
                                marginTop: 10,
                                marginLeft: 15,
                                marginBottom: -10,
                              }}>
                              {`Home${oneToOne?.cookIds?.length > 1
                                ? ' Cooks '
                                : ' Cook '
                                }for you`}
                            </Text>
                            <Text
                              style={{
                                color: '#262626',
                                fontFamily: 'Poppins-Regular',
                                fontSize: 13,
                                marginLeft: 20,
                              }}>
                              {`Discover Your Favourite Recipes From ${oneToOne?.cookIds?.length > 1
                                ? 'These Cooks'
                                : 'This Cook'
                                }`}
                            </Text>
                            <ScrollView
                              nestedScrollEnabled
                              overScrollMode="never"
                              key={'allnearByHomeCooks_scroll'}>
                              {oneToOne?.isPreOrder && (
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    width,
                                    height: 35,
                                    marginTop: 10,
                                    alignItems: 'center',
                                    justifyContent: 'space-evenly',
                                    paddingHorizontal: 10,
                                  }}>
                                  <TouchableOpacity
                                    onPress={() => setFoodType(true)}
                                    style={{
                                      width: '50%',
                                      backgroundColor: foodType
                                        ? SecondaryGreen
                                        : '#fff',
                                      borderRadius: 50,
                                      paddingVertical: 5,
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                    }}>
                                    <Text
                                      style={{
                                        fontSize: 16,
                                        fontFamily: 'Poppins-Bold',
                                        textDecorationLine: foodType
                                          ? 'underline'
                                          : 'none',
                                        color: foodType ? '#29C270' : '#868686',
                                      }}>
                                      Instant Order
                                    </Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    onPress={() =>
                                      navigation.navigate('PreOrder')
                                    }
                                    style={{
                                      width: '50%',
                                      backgroundColor: !foodType
                                        ? SecondaryGreen
                                        : '#fff',
                                      borderRadius: 50,
                                      paddingVertical: 5,
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                    }}>
                                    <Text
                                      style={{
                                        fontSize: 16,
                                        fontFamily: 'Poppins-Bold',
                                        textDecorationLine: !foodType
                                          ? 'underline'
                                          : 'none',
                                        color: !foodType
                                          ? '#29C270'
                                          : '#868686',
                                      }}>
                                      Advance Order
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              )}
                              <FlatList
                                key={'allnearByHomeCooks'}
                                style={{
                                  marginVertical: 10,
                                  marginLeft: 0,
                                  paddingHorizontal: 10,
                                }}
                                data={nearby_cooks}
                                listKey={(item, index) =>
                                  `_key${index.toString()}`
                                }
                                keyExtractor={(item, index) =>
                                  `_key${index.toString()}`
                                }
                                renderItem={cooksNearbyrenderItem}
                                onEndReachedThreshold={0}
                              // numColumns={2}
                              />
                            </ScrollView>
                          </>
                        )}
                      {nearby_cooks &&
                        oneToOne?.isPreOrder &&
                        !oneToOne?.isInstantOrder && (
                          <View
                            style={{
                              justifyContent: 'center',
                              alignItems: 'center',
                              width: '100%',
                              paddingHorizontal: 30,
                              paddingVertical: 15,
                            }}>
                            <Text
                              style={{
                                fontFamily: 'Poppins-Bold',
                                fontSize: 18,
                                color: PrimaryGreen,
                                textAlign: 'center',
                              }}>
                              Information:
                            </Text>
                            <Text
                              style={{
                                fontFamily: 'Poppins-Regular',
                                fontSize: 14,
                                textAlign: 'center',
                              }}>{`Your Cook is Accepting Advance Orders only For Now\nPlease Click Below👇 Button to proceed with Advance Ordering`}</Text>
                            <TouchableOpacity
                              style={{
                                backgroundColor: PrimaryGreen,
                                paddingHorizontal: 20,
                                paddingVertical: 7,
                                marginTop: 10,
                                borderRadius: 10,
                              }}
                              onPress={() => navigation.navigate('PreOrder')}>
                              <Text
                                style={{
                                  color: '#fff',
                                  fontFamily: 'Poppins-Bold',
                                  fontSize: 18,
                                }}>
                                Advance Order Now!
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      {restaurantCooks.length > 0 && (
                        <>
                          <View
                            style={{
                              // paddingBottom: 15,
                              backgroundColor: '#deece5',
                              height: 15,
                            }}
                          />
                          <Text
                            style={{
                              color: '#29C270',
                              fontFamily: 'Poppins-Bold',
                              fontSize: 24,
                              marginTop: 10,
                              marginLeft: 15,
                              marginBottom: -10,
                            }}>
                            {`${(oneToOne?.cookIds?.length > 1 || restaurantCooks.length > 1)
                              ? ' Restaurants '
                              : ' Restaurant '
                              }for you`}
                          </Text>
                          <Text
                            style={{
                              color: '#262626',
                              fontFamily: 'Poppins-Regular',
                              fontSize: 13,
                              marginLeft: 20,
                            }}>
                            {`Discover Your Favourite Recipes From ${(oneToOne?.cookIds?.length > 1 || restaurantCooks.length > 1)
                              ? 'These Restaurants'
                              : 'This Restaurant'
                              }`}
                          </Text>
                          <ScrollView
                            nestedScrollEnabled
                            style={{ paddingHorizontal: 10 }}
                            overScrollMode="never"
                            key={'allnearByHomeCooks_scroll'}>
                            <FlatList
                              key={'allnearByHomeCooks'}
                              style={{ marginVertical: 10, marginLeft: 0 }}
                              data={restaurantCooks}
                              listKey={(item, index) =>
                                `_key${index.toString()}`
                              }
                              keyExtractor={(item, index) =>
                                `_key${index.toString()}`
                              }
                              renderItem={cooksNearbyrenderItem}
                              onEndReachedThreshold={0}
                            // numColumns={2}
                            />
                          </ScrollView>
                        </>
                      )}
                    </>
                  )}


                  <View
                    style={{
                      width,
                      maxHeight: 230,
                      justifyContent: 'center',
                      alignContent: 'center',
                    }}>
                    <Image
                      source={footerImage1}
                      style={{ width, maxHeight: 230 }}
                    />
                  </View>
                </View>
              </View>
            ) : (
              <NoServiceArea />
            )}
          </ScrollView>
          {comingSoonModal &&
            <View style={{ width, height, backgroundColor: 'rgba(0,0,0,0.8)', position: 'absolute' }} onPress={() => setComingSoonModal(false)}>
              <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setComingSoonModal(false)} activeOpacity={1}>
                  <Image source={deliverySoon} style={{ height: height / 2.5, aspectRatio: 1, resizeMode: 'contain', }} />
                </TouchableOpacity>
              </View>
            </View>}
        </>
      )}
      <View>
        {modal && (
          <Modal transparent={true} visible={modal}>
            <Loader />
          </Modal>
        )}
      </View>

      {/* <TouchableOpacity style={{ flex: 1, position: 'absolute' }} onPress={() => setComingSoonModal(false)}>
        {comingSoonModal && (
          // <Modal transparent={true} visible={comingSoonModal} >
          // </Modal>
        )}
      </TouchableOpacity> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  couponBack: {
    width: 100,
    height: 150,
    // resizeMode: "contain",
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    borderRadius: 20,
    // top: -80
  },
  iconBack: {
    width: 90,
    height: 90,
    // backgroundColor: '#09b44d',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselImg: {
    width: 70,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerImage: {
    width: '100%',
    height: Dimensions.get('window').width - 50,
    resizeMode: 'center',
    marginBottom: -75,
    marginTop: -50,
  },
  h2: {
    color: '#262626',
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    marginTop: 10,
    marginLeft: 15,
    // marginBottom: 10,
  },
  package: {
    fontFamily: 'Poppins-Medium',
    fontWeight: '400',
    fontSize: 14,
    marginTop: 20,
    marginLeft: 10,
    textAlign: 'left',
    // lineHeight: 25,
    // textTransform: 'uppercase',
  },
  percentage: {
    fontSize: 32,
    color: '#fff',
    fontFamily: 'Poppins-Black',
    marginTop: -15,
    marginLeft: 10,
  },
  offer: {
    color: '#262626',
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    marginTop: -23,
    // textAlign: 'center',
    marginLeft: 10,
    // lineHeight: 31,
    // textTransform: 'uppercase',
  },
  offerName: {
    fontFamily: 'Corinthia-Regular',
    fontWeight: '400',
    fontSize: 38,
    color: '#fff',
    marginLeft: 10,
    marginTop: -15,
    zIndex: 9,
  },
  delLoc: {
    flexDirection: 'row',
    // marginTop: 5,
    alignItems: 'center',
  },
});

export default React.memo(HomeNew);
