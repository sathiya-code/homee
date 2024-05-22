/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
  StatusBar,
  FlatList,
  Dimensions,
  TextInput,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import {
  arrow,
  searchIcon,
  wishListIcon,
  cartIcon,
  leftArrow,
  plant,
  wishListFillRed,
} from '../../assets/img/Images';
import {api, storage} from '../../services/index';
import Loader from '../Loader';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';
import {PrimaryGreen, SecondaryGreen} from '../../helper/styles.helper';
import StarSelectIcon from '../../assets/img/star_select.png';
import Fssai from '../../assets/img/fssai.png';
import vegNonveg from '../../assets/img/veg-nonveg.png';
// import wishListFill from "../../assets/img/favr_icon.png";
import {Portal, Modal as PaperModal} from 'react-native-paper';
import TasteIcon from '../../assets/img/taste.png';
import QualityIcon from '../../assets/img/quality.png';
import DeliveryIcon from '../../assets/img/delivery.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {COUPON_CODE} from '../../redux/actions/actionTypes';
import {toCamelCase} from '../../helper/app.helper';
import FastImage from 'react-native-fast-image';

const {width, height} = Dimensions.get('screen');

const VendorDetailPage = ({navigation, route}) => {
  // console.log("navigation in food details page", route.params);
  const {t, i18n} = useTranslation();
  const dispatch = useDispatch();
  const [modal, setModal] = useState(true);
  const [cook_details, setCook_details] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [special_menus, setSpecial_menus] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [wishList, setWishList] = useState(false);
  const [arrowrot, setArrowrot] = useState(true);
  const [sarrowrot, setSarrowrot] = useState(true);
  const [specFood, setSpecFood] = useState(true);
  // const [condiArrowrot, setCondiArrowrot] = useState([]);
  const [recomFood, setRecomFood] = useState(true);
  // const [condiFood, setCondiRecomFood] = useState(true);
  const [cartShow, setCartShow] = useState(false);
  const [cartDetails, setCartDetails] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(null);
  const [paginate, setPaginate] = useState(0);
  const [cookCuisines, setCookCuisines] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedAllMenus, setLoadedAllMenus] = useState(false);
  const [expandedCuisines, setExpandedCuisines] = useState([]);
  // let paginate = 1;

  useEffect(() => {
    get_menu_by_cuisines();
    const handleBackButton = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButton,
    );

    return () => backHandler.remove();
  }, [navigation]);

  // console.log('cook_details', recommended[0]?.timingstatus);

  const get_Cook_Profile = async () => {
    console.log('response from params', route.params);
    setModal(true);
    let response = await api.cook_profile(route.params);
    console.log('response from cookProfile', response.cuisines_list);
    setCook_details(response);
    setCookCuisines([...response.cuisines_list]);
    console.log(
      'response.cuisines_list.filter(item => { return item.id })',
      response.cuisines_list.map(item => {
        return item.id;
      }),
    );
    setExpandedCuisines(
      response.cuisines_list.map(item => {
        return item.id;
      }),
    );
    setModal(false);
    // response.cuisines.map((item, index) => {
    //   setPaginate([paginate[index] = 0]);
    // })
    // console.log("response from params", response.cuisines_list);
  };

  // const get_Cook_Profile = async () => {
  //   if (paginate > 1) {
  //     let payload = { cook_id: route.params.id };
  //     let response = await api.cook_profile(payload);
  //     console.log("response from food details screen paginate > 1", response?.cuisines);
  //     // setCook_details(cook_details?.concat(response));
  //     // setRecommended(recommended?.concat(response?.recommended));
  //     setSpecial_menus(special_menus?.concat(response?.special_menus));
  //     setCuisines(cuisines?.concat(response?.cuisines));
  //     setWishList(wishList?.concat(response?.favourite_status));
  //   }
  //   else {
  //     let payload = { cook_id: route.params.id, page: paginate };
  //     let response = await api.cook_profile(payload);
  //     console.log("response from food details screen paginate", response?.cuisines);
  //     setCook_details(response);
  //     setRecommended(response?.recommended);
  //     setSpecial_menus(response?.special_menus);
  //     setCuisines(response?.cuisines);
  //     setWishList(response?.favourite_status);
  //     const openArray = [];
  //     response.cuisines.map(item => openArray.push(true));
  //     setCondiArrowrot(openArray);

  //   }
  //   setModal(false);
  // }

  const get_menu_list = async () => {
    const payload = {
      cook_id: route.params,
    };
    // console.log("response fro menu list Payload", payload);
    const response = await api.getMenuList(payload);
    // console.log("response fro menu list", response.menu_items);
    if (response.status == 'success') {
      setRecommended(response?.recommended);
      setSpecial_menus(response?.special_menus);
      setWishList(response?.favourite_status);
      const openArray = [];
      // response?.cuisines?.map(item => openArray.push(true));
      // setCondiArrowrot(openArray);
    }
    setModal(false);
  };

  const get_menu_by_cuisines = async (pageNumber = null, queryText = '') => {
    // console.log("response fro page", page);
    setIsLoading(true);
    const response = await api.getMenuByCook(
      route.params,
      pageNumber == 0 ? pageNumber : paginate + 1,
      queryText,
    );
    console.log('page number', pageNumber, paginate, queryText);
    setPaginate(paginate => paginate + 1);
    // console.log("response fro menu list", response?.menu_items);
    if (response?.status == 'success') {
      const menu_items = response.menu_items?.reduce((groups, item) => {
        if (!groups[item.cuisine_id]) {
          groups[item.cuisine_id] = [];
        }
        groups[item.cuisine_id].push(item);
        return groups;
      }, {});
      setMenuItems(menu_items);
    }
    setIsLoading(false);
    setModal(false);
  };

  const lazyGetMenuItems = async () => {
    // if (distanceFromEnd < 1) {
    console.log('isloading', isLoading);
    if (!isLoading) {
      console.log('1');
      setIsLoading(true);
      console.log('2');
      const response = await api.getMenuByCook(
        route.params,
        paginate + 1,
        query,
      );
      console.log('3');

      setPaginate(paginate => paginate + 1);
      console.log('4');
      if (response.status == 'success') {
        console.log('5');
        if (!response.menu_items.length) {
          console.log('6', new Date());
          setLoadedAllMenus(true);
          setIsLoading(false);
          return null;
        }
        console.log('7');
        console.log('response fro menu list in lazyload', response.menu_items);
        console.log('old menu list in lazyload', menuItems);
        const updatedMenuData = {...menuItems};
        response.menu_items.forEach(item => {
          const cuisineId = item.cuisine_id.toString();
          if (!updatedMenuData[cuisineId]) {
            updatedMenuData[cuisineId] = [];
          }
          const existingItemIndex = updatedMenuData[cuisineId].findIndex(
            existingItem => existingItem.id === item.id,
          );
          if (existingItemIndex !== -1) {
            updatedMenuData[cuisineId][existingItemIndex] = {
              ...item,
              quantity: updatedMenuData[cuisineId][existingItemIndex].quantity,
            };
          } else {
            updatedMenuData[cuisineId].push({...item, quantity: 0});
          }
        });
        setIsLoading(false);
        setMenuItems(updatedMenuData);
      }
    }
  };

  const get_Cart = async () => {
    let response = await api.cart_item();
    console.log('response fromcart items', response.cart_items);
    if (response.status == 'success') {
      if (response.items != null && response.items > 0) {
        setCartQuantity(response?.cart_items);
        await storage.setCartStatus(1);
        setCartShow(true);
        setCartDetails(response);
      } else if (response.items == 0 || response.items == 'null') {
        setCartQuantity(null);
        setCartShow(false);
        setCartDetails(null);
        await storage.setCartStatus(0);
      }
      getCartItems();
    }
  };
  const getCartItems = async () => {
    let response = await api.show_wallet();
    if (response.status == 'success') {
      storage.setCartStatus(1);
    } else if (response.status == 'empty') {
      storage.setCartStatus(0);
    }
  };
  useEffect(() => {
    // get_Cart();
    get_Cook_Profile();
    get_menu_list();
  }, []);

  const wishListHandle = async () => {
    let response = await api.add_favourite({cook_id: cook_details?.cook.id});
    if (response.status == 'success') {
      setWishList(!wishList);
    }
  };
  const emptyCart = async (id, index, type, key) => {
    let response = await api.empty_cart();
    if (response.status == 'success') {
      setCartShow(false);
      setCartDetails(null);
      add_to_cart(id, index, type, key);
    }
  };
  const remove_cart_item = async (id, index, type, key) => {
    let response = await api.minus_quantity(id);
    console.log('removeeeeee', id, response);
    if (response.status == 'success') {
      get_Cart();
      if (type == 'recommended') {
        let newArr = [...recommended];
        newArr[index] = response.menu_item;
        setRecommended(newArr);
      } else if (type == 'cuisines') {
        let data = [...cuisines];
        data[index]['menuitems'][key] = response.menu_item;
        setCuisines(data);
      } else if (type == 'special_menus') {
        let data = [...special_menus];
        data[index]['specialmenus'][key]['menuitem'] = response.menu_item;
        setSpecial_menus(data);
      }
    }
  };
  const add_to_cart = async (id, index, type, key = 0) => {
    console.log('data', id, index, type, key);
    let response = await api.add_cart({
      menu_item_id: id,
      cook_id: cook_details?.cook.id,
    });
    console.log('data response', response);
    if (response.status == 'success') {
      if (type == 'recommended') {
        let newArr = [...recommended];
        newArr[index] = response.menu_item;
        setRecommended(newArr);
      } else if (type == 'cuisines') {
        let data = [...cuisines];
        data[index]['menuitems'][key] = response.menu_item;
        setCuisines(data);
      } else if (type == 'special_menus') {
        let data = [...special_menus];
        data[index]['specialmenus'][key]['menuitem'] = response.menu_item;
        setSpecial_menus(data);
      }
      get_Cart();
    } else if (response.status == 'failure') {
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
          {text: 'No'},
        ],
      );
      get_Cart();
    }
  };
  const arwhandle = () => {
    setArrowrot(!arrowrot);
    setRecomFood(!recomFood);
  };
  const spearwhandle = () => {
    setSarrowrot(!sarrowrot);
    setSpecFood(!specFood);
  };
  // const condihandle = (index) => {
  //   condiArrowrot[index] = !condiArrowrot[index];
  //   setCondiArrowrot(condiArrowrot);
  //   setCondiRecomFood(!condiFood);
  // };
  // console.log("ranranran", cook_details);

  const renderItem = (item, index) => {
    return (
      <View
        key={item?.index}
        style={{
          width: width / 2.3,
          backgroundColor: '#fff',
          borderBottomLeftRadius: 15,
          borderBottomRightRadius: 15,
          marginHorizontal: 5,
          marginTop: 15,
          marginBottom: 10,
          padding: 5,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 7,
          elevation: 3,
          opacity: item?.item?.timingstatus == 0 ? 0.6 : null,
        }}>
        <View style={{width: width / 2.3, borderRadius: 15, marginTop: -15}}>
          {/* {console.log("img", item?.item.image)} */}
          <FastImage
            source={{uri: item?.item?.image, cache: 'web'}}
            style={{
              width: '100%',
              height: 130,
              borderTopLeftRadius: 15,
              borderTopRightRadius: 15,
            }}
          />
        </View>
        <View style={{flex: 5, paddingLeft: '5%'}}>
          <Text
            style={{
              flex: 3,
              width: 150,
              fontSize: 14,
              fontFamily: 'Poppins-Medium',
              paddingTop: 10,
            }}>
            {toCamelCase(item?.item?.userlanguage?.name)}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            width: 140,
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: -10,
            marginBottom: 3,
          }}>
          <Text
            style={{
              // flex: 1,
              fontSize: 16,
              fontFamily: 'Poppins-Bold',
              marginTop: 10,
            }}>
            ₹ {item?.item?.final_price}
          </Text>
          {cook_details?.cook?.deliverytime == 'unserviceable' ||
          cook_details?.cook?.current_status == 0 ||
          item?.item?.timingstatus == 0 ||
          item?.item?.status == 0 ? null : item?.item?.cartquantity
              ?.quantity ? (
            <View
              style={{
                backgroundColor: '#09b44d',
                height: 30,
                borderRadius: 30,
                flexDirection: 'row',
                marginTop: 10,
              }}>
              <TouchableOpacity
                onPress={() =>
                  remove_cart_item(item?.item?.cartquantity.id, item?.index)
                }
                style={{paddingTop: 5, paddingLeft: 7, paddingRight: 7}}>
                <Text
                  style={{
                    fontFamily: 'Poppins-Bold',
                    fontSize: 16,
                    color: '#fff',
                  }}>
                  -
                </Text>
              </TouchableOpacity>
              <Text
                style={{
                  paddingTop: 5,
                  paddingLeft: 7,
                  paddingRight: 8,
                  fontFamily: 'Poppins-Bold',
                  fontSize: 16,
                  color: '#fff',
                }}>
                {item?.item?.cartquantity?.quantity}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  add_to_cart(item?.item.id, item?.index, 'recommended');
                  handleQtyChangeInRecomm(item?.item, +1);
                }}
                style={{paddingTop: 5, paddingLeft: 7, paddingRight: 7}}>
                <Text
                  style={{
                    fontFamily: 'Poppins-Bold',
                    fontSize: 16,
                    color: '#fff',
                  }}>
                  +
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => {
                add_to_cart(item?.item.id, item?.index, 'recommended');
                handleQtyChangeInRecomm(item?.item, +1);
              }}
              style={{
                marginTop: 15,
                backgroundColor: '#09b44d',
                width: 70,
                borderRadius: 28,
                padding: 5,
              }}>
              <Text
                style={{
                  color: '#fff',
                  fontFamily: 'Poppins-Bold',
                  textAlign: 'center',
                  fontSize: 14,
                }}>
                {t('foodDetailPage.add')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderCuinesMenu = item => {
    // item.index == 0 && console.log("item in index 0 ", item?.item);
    return (
      <View
        key={item?.index}
        style={{
          width: width / 2.3,
          backgroundColor: '#fff',
          borderBottomLeftRadius: 15,
          borderBottomRightRadius: 15,
          marginHorizontal: 5,
          marginTop: 15,
          marginBottom: 10,
          padding: 5,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 7,
          elevation: 3,
          opacity: item?.item?.timingstatus == 0 ? 0.6 : null,
        }}>
        <View style={{width: width / 2.3, borderRadius: 15, marginTop: -15}}>
          <FastImage
            source={{uri: item?.item?.image}}
            style={{
              width: '100%',
              height: 130,
              borderTopLeftRadius: 15,
              borderTopRightRadius: 15,
            }}
          />
        </View>
        <View style={{flex: 5, paddingLeft: '5%'}}>
          <Text
            style={{
              flex: 3,
              width: 150,
              fontSize: 14,
              fontFamily: 'Poppins-Medium',
              paddingTop: 10,
            }}>
            {toCamelCase(item?.item?.userlanguage?.name)}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            width: 140,
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: -10,
            marginBottom: 3,
          }}>
          <Text
            style={{
              // flex: 1,
              fontSize: 16,
              fontFamily: 'Poppins-Bold',
              marginTop: 10,
            }}>
            ₹ {item?.item?.final_price}
          </Text>
          {cook_details?.cook?.deliverytime == 'unserviceable' ||
          cook_details?.cook?.current_status == 0 ||
          item?.item?.timingstatus == 0 ||
          item?.item?.status == 0 ? null : item?.item?.quantity ? (
            <View
              style={{
                backgroundColor: '#09b44d',
                height: 30,
                borderRadius: 30,
                flexDirection: 'row',
                marginTop: 10,
              }}>
              <TouchableOpacity
                onPress={() => {
                  remove_cart_item(item?.item.cart_id, item?.index);
                  handleQuantityChange(item?.item, -1);
                }}
                style={{paddingTop: 5, paddingLeft: 7, paddingRight: 7}}>
                <Text
                  style={{
                    fontFamily: 'Poppins-Bold',
                    fontSize: 16,
                    color: '#fff',
                  }}>
                  -
                </Text>
              </TouchableOpacity>
              <Text
                style={{
                  paddingTop: 5,
                  paddingLeft: 7,
                  paddingRight: 8,
                  fontFamily: 'Poppins-Bold',
                  fontSize: 16,
                  color: '#fff',
                }}>
                {item?.item?.quantity}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  add_to_cart(item?.item.id, item?.index);
                  handleQuantityChange(item?.item, +1);
                }}
                style={{paddingTop: 5, paddingLeft: 7, paddingRight: 7}}>
                <Text
                  style={{
                    fontFamily: 'Poppins-Bold',
                    fontSize: 16,
                    color: '#fff',
                  }}>
                  +
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => {
                add_to_cart(item?.item.id, item?.index);
                handleQuantityChange(item?.item, +1);
              }}
              style={{
                marginTop: 15,
                backgroundColor: '#09b44d',
                width: 70,
                borderRadius: 28,
                padding: 5,
              }}>
              <Text
                style={{
                  color: '#fff',
                  fontFamily: 'Poppins-Bold',
                  textAlign: 'center',
                  fontSize: 14,
                }}>
                {t('foodDetailPage.add')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const handleQuantityChange = (item, change) => {
    console.log('noremal itemmm', item);
    const updatedMenuItems = {...menuItems};
    const section = updatedMenuItems[item.cuisine_id];
    const menuItem = section.find(menuItem => menuItem.id === item.id);

    if (menuItem) {
      menuItem.quantity = Math.max(0, menuItem.quantity + change);
      setMenuItems(updatedMenuItems);
    }
  };
  const handleQtyChangeInRecomm = (item, change) => {
    console.log('itemmmmmm', item);
    const updatedMenuItems = [...filteredData];
    const menuItem = updatedMenuItems.find(menuItem => menuItem.id === item.id);

    if (menuItem) {
      menuItem.quantity = Math.max(0, menuItem.quantity + change);
      setRecommended(updatedMenuItems);
    }
  };

  const handleCuisineDropdown = () => {};

  const toggleCuisine = cuisineId => {
    if (expandedCuisines.includes(cuisineId)) {
      setExpandedCuisines(expandedCuisines.filter(id => id !== cuisineId));
    } else {
      setExpandedCuisines([...expandedCuisines, cuisineId]);
    }
  };

  const cuisineRender = ({item, index}) => {
    return (
      <>
        <View style={{paddingHorizontal: 10}}>
          <View
            style={{
              flexDirection: 'row',
              padding: 10,
              // paddingBottom: 10,
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity
              onPress={() => toggleCuisine(item?.title)}
              style={{
                flexDirection: 'row',
                width: '100%',
                justifyContent: 'space-between',
                paddingRight: 20,
              }}>
              <Text style={{fontFamily: 'Poppins-Bold', fontSize: 18}}>
                {/* {cookCuisines?.[(item?.title).toString()]?.eng_name} */}
                {
                  cookCuisines?.find(cuisine => cuisine.id == item?.title)
                    ?.eng_name
                }
              </Text>
              <Image
                source={arrow}
                style={{
                  width: 10,
                  height: 17,
                  tintColor: '#000',
                  transform: [{rotate: arrowrot ? '90deg' : '-90deg'}],
                }}
              />
            </TouchableOpacity>
          </View>
          {!expandedCuisines.includes(item.title) && (
            <FlatList
              numColumns={2}
              data={item.data} // Accessing the menu items within the "data" key
              renderItem={renderCuinesMenu}
              keyExtractor={item => item.id.toString()}
            />
          )}
        </View>
      </>
    );
  };

  const renderLoader = () => (
    <View
      style={{
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: cartShow ? 60 : 10,
      }}>
      <ActivityIndicator size="large" color={'#09b44d'} />
    </View>
  );

  const renderItem2 = item => {
    return (
      <View
        key={item?.index}
        style={{
          backgroundColor: '#fff',
          marginHorizontal: 7,
          marginTop: 10,
          marginBottom: 10,
          padding: 5,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 7,
          opacity: item?.item?.menuitem?.timingstatus == 0 ? 0.6 : null,
        }}>
        <View style={{width: '100%', borderRadius: 5}}>
          <Image
            source={{uri: item?.item?.menuitem?.image}}
            style={{width: 150, height: 130, borderRadius: 5}}
          />
        </View>
        <View style={{flex: 5, paddingLeft: 14}}>
          <Text
            style={{
              flex: 3,
              width: 150,
              fontSize: 16,
              fontFamily: 'Poppins-Bold',
              paddingTop: 10,
            }}>
            {toCamelCase(item?.item?.menuitem?.userlanguage?.name)}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            width: 140,
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: -10,
          }}>
          <Text
            style={{
              // flex: 1,
              fontSize: 16,
              fontFamily: 'Poppins-Bold',
              marginTop: 10,
            }}>
            ₹ {item?.item?.menuitem?.final_price}
          </Text>
          {cook_details?.cook?.deliverytime == 'unserviceable' ||
          cook_details?.cook?.current_status == 0 ||
          item?.item?.menuitem?.timingstatus == 0 ||
          item?.item?.menuitem?.status == 0 ? null : item?.item?.menuitem
              ?.cartquantity?.quantity ? (
            <View
              style={{
                backgroundColor: '#09b44d',
                height: 30,
                width: 80,
                borderRadius: 30,
                flexDirection: 'row',
              }}>
              <TouchableOpacity
                onPress={() =>
                  remove_cart_item(
                    item?.item?.menuitem.cartquantity.id,
                    item?.index,
                    'special_menus',
                  )
                }
                style={{paddingTop: 7, paddingLeft: 13, paddingRight: 10}}>
                <Text
                  style={{
                    fontFamily: 'Poppins-Bold',
                    fontSize: 16,
                    color: '#fff',
                  }}>
                  -
                </Text>
              </TouchableOpacity>
              <Text
                style={{
                  paddingLeft: 7,
                  paddingRight: 8,
                  fontFamily: 'Poppins-Bold',
                  fontSize: 16,
                  color: '#fff',
                }}>
                {item?.item?.menuitem.cartquantity?.quantity}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  add_to_cart(
                    item?.item?.menuitem.id,
                    item?.index,
                    'special_menus',
                  )
                }
                style={{paddingTop: 7, paddingLeft: 7}}>
                <Text
                  style={{
                    fontFamily: 'Poppins-Bold',
                    fontSize: 16,
                    color: '#fff',
                  }}>
                  +
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() =>
                add_to_cart(
                  item?.item?.menuitem.id,
                  item?.index,
                  'special_menus',
                )
              }
              style={{
                marginTop: 15,
                backgroundColor: '#09b44d',
                width: 80,
                borderRadius: 28,
                padding: 10,
              }}>
              <Text
                style={{
                  color: '#fff',
                  fontFamily: 'Poppins-Bold',
                  textAlign: 'center',
                  fontSize: 16,
                }}>
                {t('foodDetailPage.add')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };
  useEffect(() => {
    const focusHandler = navigation.addListener('focus', () => {
      get_Cart();
      // get_Cook_Profile();
    });
    return focusHandler;
  }, [navigation]);

  const [query, setQuery] = useState('');
  const handleSearch = text => {
    setQuery(text);
    setPaginate(1);
    get_menu_by_cuisines(0, text.toString());
  };

  const filteredData = recommended?.filter(item => {
    return item?.userlanguage?.name.toLowerCase().includes(query.toLowerCase());
  });

  // const cuisineFlatList = ({ item, index }) => {
  //   // index == 0 && console.log("itemmmmmmmm", item);
  //   // const filteredData = item?.menuitems.filter((item) => {
  //   //   return item?.userlanguage?.name.toLowerCase().includes(query.toLowerCase());
  //   // });
  //   // if (filteredData.length)
  //   return (
  //     <View key={index} style={{ borderColor: '#d5e7dd', borderBottomWidth: 4, paddingTop: 7 }}>
  //       <View
  //         style={{
  //           flexDirection: 'row',
  //           padding: 15,
  //           justifyContent: 'space-between',
  //         }}>
  //         <TouchableOpacity onPress={() => condihandle(index)} style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', paddingRight: 25 }}>
  //           <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 18 }}>
  //             {item?.eng_name}
  //           </Text>
  //           <Image
  //             source={arrow}
  //             style={{
  //               width: 10,
  //               height: 17,
  //               tintColor: '#000',
  //               transform: [{ rotate: condiArrowrot[index] ? '90deg' : '-90deg' }],
  //             }}
  //           />
  //           {/* <>
  //               {condiArrowrot[index] ? (
  //                 <Image
  //                   source={arrow}
  //                   style={{
  //                     width: 10,
  //                     height: 17,
  //                     tintColor: '#000',
  //                     transform: [{ rotate: '90deg' }],
  //                   }}
  //                 />
  //               ) : (
  //                 <Image
  //                   source={arrow}
  //                   style={{
  //                     width: 10,
  //                     height: 17,
  //                     tintColor: '#000',
  //                     transform: [{ rotate: '-90deg' }],
  //                   }}
  //                 />
  //               )}
  //             </> */}
  //         </TouchableOpacity>
  //       </View>
  //       <View style={{ marginLeft: 15 }}>
  //         {condiArrowrot[index] && (
  //           <View style={{ marginLeft: -3 }} key={"condiCOntainer" + index}>
  //             {item?.menuitems && item?.menuitems.length > 0 &&
  //               <FlatList
  //                 data={filteredData}
  //                 numColumns={2}
  //                 keyExtractor={(item, index) => item.id.toString() + index.toString()}
  //                 contentContainerStyle={{ width: "100%", alignItems: 'flex-start', justifyContent: 'space-between' }}
  //                 renderItem={(item) => renderItem(item)}
  //                 // initialNumToRender={6}
  //                 onEndReached={(distanceFromEnd) => lazyGetMenuItems(distanceFromEnd, item.id)} />
  //               // item.menuitems.map((list, key) => {
  //               //   return (
  //               //     <View key={key} style={{
  //               //       flexDirection: 'row',
  //               //       // paddingHorizontal: 10,
  //               //       marginBottom: 25,
  //               //       opacity: list.timingstatus == 0 ? 0.5 : null,
  //               //     }} >
  //               //       <View style={{ flex: 3 }}>
  //               //         <View style={{ width: '100%', borderRadius: 5 }}>
  //               //           <Image
  //               //             source={{ uri: list?.image }}
  //               //             style={{ width: 120, height: 120, borderRadius: 5 }}
  //               //           />
  //               //         </View>
  //               //       </View>
  //               //       <View style={{ flex: 5, paddingLeft: 14 }}>
  //               //         <Image source={{ uri: list?.foodtype?.icon }}
  //               //           style={{ width: 15, height: 15, }} />
  //               //         <View style={{ flexDirection: 'row', flex: 4 }}>
  //               //           <Text style={{ flex: 3, fontSize: 16, fontFamily: 'Poppins-Bold', paddingTop: 10 }}>
  //               //             {list?.userlanguage?.name}
  //               //           </Text>
  //               //           <Text
  //               //             style={{
  //               //               flex: 1,
  //               //               fontSize: 16,
  //               //               fontFamily: 'Poppins-Bold',
  //               //               marginTop: 10,
  //               //             }}>
  //               //             ₹ {list?.final_price}
  //               //           </Text>
  //               //         </View>
  //               //         {cook_details?.cook?.deliverytime == "unserviceable" || cook_details?.cook?.current_status == 0 || list.timingstatus == 0 || list.status == 0 ?
  //               //           null
  //               //           :
  //               //           list.cartquantity?.quantity ?
  //               //             <View style={{ flexDirection: 'row', backgroundColor: '#09b44d', height: 30, width: 80, borderRadius: 30 }}>
  //               //               <TouchableOpacity style={{ paddingTop: 7, paddingLeft: 13, paddingRight: 10 }} onPress={() => remove_cart_item(list.cartquantity.id, index, 'cuisines', key)}>
  //               //                 <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 16, color: '#fff' }}>
  //               //                   -
  //               //                 </Text>
  //               //               </TouchableOpacity>
  //               //               <Text style={{ paddingTop: 7, paddingLeft: 7, paddingRight: 8, fontFamily: 'Poppins-Bold', fontSize: 16, color: '#fff' }}>{list.cartquantity?.quantity}</Text>
  //               //               <TouchableOpacity style={{ paddingTop: 7, paddingLeft: 7, }} onPress={() => add_to_cart(list.id, index, 'cuisines', key)}>
  //               //                 <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 16, color: '#fff' }}>
  //               //                   +
  //               //                 </Text>
  //               //               </TouchableOpacity>
  //               //             </View>
  //               //             :
  //               //             <TouchableOpacity onPress={() => add_to_cart(list.id, index, 'cuisines', key)} style={{
  //               //               marginTop: 15, backgroundColor: '#09b44d',
  //               //               width: 100,
  //               //               borderRadius: 28,
  //               //               padding: 10,
  //               //             }}>
  //               //               <Text
  //               //                 style={{
  //               //                   color: '#fff',
  //               //                   fontFamily: 'Poppins-Bold',
  //               //                   textAlign: 'center',
  //               //                   fontSize: 16,
  //               //                 }}>
  //               //                 {t("foodDetailPage.add")}
  //               //               </Text>
  //               //             </TouchableOpacity>
  //               //         }
  //               //       </View>
  //               //     </View>
  //               //   )
  //               // })
  //             }
  //           </View>
  //         )}
  //       </View>
  //     </View>
  //   )
  // }

  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = 50;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  const renderGroupHeader = ({section}) => (
    <View style={{backgroundColor: '#f2f2f2', padding: 10}}>
      <Text>{`Cuisine ID: ${section.title}`}</Text>
    </View>
  );

  const isDataNotEmpty = data => {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (Array.isArray(data[key]) && data[key].length > 0) {
          return true;
        }
      }
    }
    return false;
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar backgroundColor="#09B44D" barStyle={'light-content'} />
      {modal == false && cook_details ? (
        <>
          {/* <TouchableOpacity style={{ width: '100%', top: "90%", alignItems: 'center', position: 'absolute', zIndex: 3 }} onPress={() => {
            null
          }}>
            <View style={{ width: "50%", backgroundColor: PrimaryGreen, alignItems: 'center', borderRadius: 15, height: 40, justifyContent: 'center' }}>
              <Text style={{ fontFamily: "Poppins-Bold", fontSize: 16, color: "white" }}>Browse Menu</Text>
            </View>
          </TouchableOpacity> */}
          {/* <View style={{ position: 'absolute', zIndex: 5, width: '100%', backgroundColor: '#09B44D' }} >
            <TouchableOpacity
              style={{ width: 50, height: 30 }}
              onPress={() => navigation.goBack()}>
              <Image
                style={{ width: 14, height: 22, tintColor: '#fff', marginLeft: 20 }}
                source={arrow}
              />

            </TouchableOpacity>
          </View> */}
          <View
            style={{
              backgroundColor: '#09b44d',
              // marginBottom: 20,
              height: 50,
              // borderBottomLeftRadius: 25,
              // borderBottomRightRadius: 25,
            }}>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
              style={{
                height: '100%',
                flexDirection: 'row',
                paddingHorizontal: 15,
                // paddingVertical: 15,
                alignItems: 'center',
              }}>
              <Image
                style={{width: 25, height: 25, tintColor: '#fff'}}
                source={leftArrow}
              />
              <Text
                style={{
                  color: '#fff',
                  fontSize: 18,
                  fontFamily: 'Poppins-Bold',
                  marginLeft: 10,
                  marginTop: 5,
                }}>
                Back
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{backgroundColor: '#f4fbf8', paddingBottom: 60}}
            onScroll={({nativeEvent}) => {
              if (isCloseToBottom(nativeEvent)) {
                lazyGetMenuItems();
              }
            }}
            scrollEventThrottle={1000}>
            <View>
              <Image
                source={{uri: cook_details?.cook?.image}}
                style={{
                  width: '100%',
                  height: 250,
                  borderBottomLeftRadius: 70,
                  borderBottomRightRadius: 70,
                }}
              />
              <View
                style={{
                  width: '100%',
                  height: 250,
                  marginTop: -250,
                  backgroundColor: '#000',
                  opacity: 0.3,
                  borderBottomLeftRadius: 70,
                  borderBottomRightRadius: 70,
                }}
              />
            </View>
            <View
              style={{
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  width: '90%',
                  backgroundColor: '#fff',
                  marginTop: -75,
                  borderRadius: 15,
                  elevation: 3,
                }}>
                <View>
                  <View style={{flexDirection: 'row', maxWidth: width - 40}}>
                    <View>
                      <View
                        style={{
                          justifyContent: 'space-between',
                          flexDirection: 'row',
                          marginTop: 10,
                          paddingHorizontal: 10,
                        }}>
                        <Text
                          style={{
                            fontSize: 20,
                            fontFamily: 'Poppins-Bold',
                            color: '#000',
                            marginTop: 10,
                            marginLeft: 3,
                            width: '80%',
                          }}>
                          {toCamelCase(cook_details?.cook?.first_name)}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}>
                        <Text
                          style={{
                            // width: 100,
                            fontSize: 13,
                            fontFamily: 'Poppins-Regular',
                            fontWeight: 'normal',
                            alignItems: 'flex-start',
                            // lineHeight: 23,
                            justifyContent: 'center',
                            color: '#989898',
                            backgroundColor: '#f4fbf8',
                            // paddingRight: 10,
                            paddingLeft: 3,
                            paddingRight: 5,
                            marginLeft: 13,
                            marginRight: 3,
                          }}>
                          {cook_details?.cuisine_name ??
                            cook_details?.cuisines_list?.[0]?.eng_name}
                        </Text>
                        {/* <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', marginLeft: 10, marginVertical: 5, right: -40 }}>
                          <Image source={StarSelectIcon} style={{ width: 15, height: 15, marginRight: 2 }} />
                          <Image source={StarSelectIcon} style={{ width: 15, height: 15, marginRight: 2 }} />
                          <Image source={StarSelectIcon} style={{ width: 15, height: 15, marginRight: 2 }} />
                          <Image source={StarSelectIcon} style={{ width: 15, height: 15, marginRight: 2 }} />
                          <Image source={StarSelectIcon} style={{ width: 15, height: 15, marginRight: 2, tintColor: '#989898' }} />
                        </View> */}
                      </View>
                    </View>
                    <View>
                      <Image
                        source={
                          cook_details?.cook?.cook_type == 'garden'
                            ? plant
                            : vegNonveg
                        }
                        style={{
                          width: 60,
                          height: 25,
                          resizeMode: 'contain',
                          marginTop: 10,
                          marginLeft: -5,
                        }}
                      />
                      <TouchableOpacity
                        onPress={wishListHandle}
                        style={{
                          marginTop: 15,
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                        }}>
                        {wishList ? (
                          <Image
                            source={wishListFillRed}
                            style={{width: 23.5, height: 20}}
                          />
                        ) : (
                          <Image
                            source={wishListIcon}
                            style={{width: 23.5, height: 20}}
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginVertical: 5,
                    }}>
                    {/* <Image source={StarSelectIcon} style={{ width: 20, height: 20 }} />
                    <TouchableOpacity onPress={() => setShowFeedback(true)}>
                      <Text style={{ fontFamily: 'Poppins-Medium', color: '#b3b3b3', fontWeight: '500', fontSize: 16, marginTop: 5, paddingRight: 10 }}> 4 Rating</Text>
                    </TouchableOpacity>
                    <View style={{ width: 1, height: 15, backgroundColor: '#b3b3b3' }} /> */}
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: 'Poppins-Regular',
                        fontWeight: '300',
                        color: '#000',
                        // marginTop: 5,
                        marginLeft: 13,
                        width: '50%',
                      }}>
                      {cook_details?.cook?.address?.area}
                    </Text>
                    {/* {cook_details?.cook?.dtime && <Text
                      style={{
                        fontSize: 13,
                        fontFamily: 'poppins-Medium',
                        color: '#b3b3b3',
                        fontWeight: '500',
                        // marginTop: 5,
                        // marginLeft: 10,
                        marginBottom: 5
                      }}>
                      {` -  Delivery in ${cook_details?.cook?.dtime} mins`}
                    </Text>} */}
                    {/* <Text
                      style={{
                        fontSize: 16,
                        fontFamily: 'poppins-Medium',
                        color: '#b3b3b3',
                        fontWeight: '500',
                        // marginTop: 5,
                        marginLeft: 7,
                      }}>
                      ({t("foodDetailPage.deliveryTime")})
                    </Text> */}
                  </View>
                </View>
              </View>
            </View>

            {cook_details?.cook?.current_status == 0 && (
              <View style={{alignItems: 'center', padding: 10}}>
                <Text
                  style={{
                    color: 'tomato',
                    fontFamily: 'Poppins-Bold',
                    fontSize: 20,
                  }}>
                  {t('foodDetailPage.unserviceable')}
                </Text>
              </View>
            )}
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: SecondaryGreen,
                paddingHorizontal: 10,
                marginHorizontal: 20,
                marginTop: 15,
                height: 45,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 30,
                borderWidth: 0.5,
              }}>
              <Image
                source={searchIcon}
                style={{width: 20, height: 20, marginLeft: 15}}
              />
              <TextInput
                style={{
                  width: '100%',
                  // height: ,
                  paddingHorizontal: 10,
                  fontFamily: 'Poppins-Medium',
                  justifyContent: 'center',
                  color: PrimaryGreen,
                }}
                onChangeText={handleSearch}
                placeholder="Discover your cravings"
                placeholderTextColor={PrimaryGreen}
              />
            </View>
            {filteredData && filteredData.length > 0 && (
              <View
                style={{
                  flexDirection: 'row',
                  padding: 15,
                  paddingBottom: 10,
                  justifyContent: 'space-between',
                }}>
                <TouchableOpacity
                  onPress={arwhandle}
                  style={{
                    flexDirection: 'row',
                    width: '100%',
                    justifyContent: 'space-between',
                    paddingRight: 25,
                  }}>
                  <Text style={{fontFamily: 'Poppins-Bold', fontSize: 18}}>
                    {t('foodDetailPage.recommended')}
                  </Text>
                  <Image
                    source={arrow}
                    style={{
                      width: 10,
                      height: 17,
                      tintColor: '#000',
                      transform: [{rotate: arrowrot ? '90deg' : '-90deg'}],
                    }}
                  />
                  {/* {arrowrot ? (
                  <Image
                    source={arrow}
                    style={{
                      width: 10,
                      height: 17,
                      tintColor: '#000',
                      transform: [{ rotate: '90deg' }],
                    }}
                  />
                ) : (
                  <Image
                    source={arrow}
                    style={{
                      width: 10,
                      height: 17,
                      tintColor: '#000',
                      transform: [{ rotate: '-90deg' }],
                    }}
                  />
                )} */}
                </TouchableOpacity>
              </View>
            )}
            <View>
              {!recomFood ? null : (
                <View style={{paddingTop: 7}}>
                  {recommended && recommended.length > 0 && (
                    <View
                      style={{
                        width: width * 0.98,
                        alignItems:
                          recommended.length == 1 ? 'flex-start' : 'center',
                        marginLeft: recommended.length == 1 ? 10 : 5,
                        borderColor: '#d5e7dd',
                        borderBottomWidth: 4,
                      }}>
                      <FlatList
                        data={filteredData}
                        numColumns={2}
                        style={{}}
                        contentContainerStyle={{
                          justifyContent: 'space-between',
                        }}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderItem}
                        initialNumToRender={6}
                      />
                    </View>
                  )}
                </View>
              )}
            </View>

            <View>
              {isDataNotEmpty(menuItems) && (
                <>
                  {/* {console.log("menuItems", menuItems)} */}
                  {/* <View
                    style={{
                      flexDirection: 'row',
                      padding: 15,
                      justifyContent: 'space-between',
                    }}>
                    <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 18 }}>
                      Menu Items
                    </Text>
                  </View> */}
                  {/* {menuItems ? */}
                  <View
                    style={{
                      borderColor: '#d5e7dd',
                      borderBottomWidth: 4,
                      paddingTop: 7,
                    }}>
                    {/* <View style={{ borderColor: 'red', borderBottomWidth: 4, paddingTop: 7 }}> */}
                    {/* // menuItems.map((item, index) => {
                      //   console.log("index", index);
                      //   return ( */}
                    <View key={'menuItems'}>
                      <FlatList
                        data={Object.keys(menuItems).map(key => ({
                          title: key,
                          data: menuItems[key],
                        }))}
                        renderItem={cuisineRender}
                        renderSectionHeader={renderGroupHeader}
                        keyExtractor={(item, index) => index.toString()}
                        ListFooterComponent={
                          isLoading && !loadedAllMenus ? renderLoader : null
                        }
                        // onEndReached={lazyGetMenuItems}
                      />
                      {/* <FlatList
                          data={menuItems}
                          numColumns={2}
                          contentContainerStyle={{ width: "100%", alignItems: 'flex-start', justifyContent: 'space-around' }}
                          renderItem={(item) => renderItem(item)}
                          removeClippedSubviews={true}
                          // onEndReached={() => lazyGetMenuItems()}
                          nestedScrollEnabled /> */}
                    </View>
                    {/* // )
                      // }) */}
                  </View>
                  {/* : null} */}
                </>
              )}
            </View>

            {special_menus && special_menus.length > 0 ? (
              <View
                style={{
                  flexDirection: 'row',
                  padding: 15,
                  justifyContent: 'space-between',
                }}>
                <Text style={{fontFamily: 'Poppins-Bold', fontSize: 18}}>
                  {t('foodDetailPage.specializedFood')}
                </Text>
                <TouchableOpacity
                  onPress={spearwhandle}
                  style={{padding: 8, marginRight: 15}}>
                  {sarrowrot ? (
                    <Image
                      source={arrow}
                      style={{
                        width: 10,
                        height: 17,
                        tintColor: '#000',
                        transform: [{rotate: '90deg'}],
                      }}
                    />
                  ) : (
                    <Image
                      source={arrow}
                      style={{
                        width: 10,
                        height: 17,
                        tintColor: '#000',
                        transform: [{rotate: '-90deg'}],
                      }}
                    />
                  )}
                </TouchableOpacity>
              </View>
            ) : null}
            <View>
              {!specFood ? null : (
                <View style={{paddingTop: 7}}>
                  {special_menus && special_menus.length > 0
                    ? special_menus.map((item, index) => {
                        return (
                          <View
                            key={index}
                            style={{
                              borderColor: '#d5e7dd',
                              borderBottomWidth: 4,
                            }}>
                            <Text
                              style={{
                                paddingLeft: 15,
                                paddingBottom: 15,
                                fontFamily: 'Poppins-Bold',
                                fontSize: 14,
                              }}>
                              {item?.userlanguage?.name +
                                ' (' +
                                item?.specialmenus.length +
                                ')'}
                            </Text>
                            <FlatList
                              data={item.specialmenus}
                              numColumns={2}
                              contentContainerStyle={{
                                width: '100%',
                                alignItems: 'flex-start',
                                justifyContent: 'space-around',
                              }}
                              renderItem={item => renderItem2(item)}
                              removeClippedSubviews={true}
                              initialNumToRender={6}
                            />
                            {/* {item.specialmenus.map((list, key) => {
                              return (
                                <View key={key} style={{
                                  flexDirection: 'row',
                                  paddingHorizontal: 10,
                                  marginBottom: 25,
                                  opacity: list.menuitem.timingstatus == 0 ? 0.5 : null,
                                }} >
                                  <View style={{ flex: 3 }}>
                                    <View style={{ width: '100%', borderRadius: 5 }}>
                                      <Image
                                        source={{ uri: list.menuitem?.image }}
                                        style={{ width: 120, height: 120, borderRadius: 5 }}
                                      />
                                    </View>
                                  </View>
                                  <View style={{ flex: 5, paddingLeft: 14 }}>
                                    <Image source={{ uri: list?.menuitem?.foodtype?.icon }}
                                      style={{ width: 15, height: 15, }} />
                                    <View style={{ flexDirection: 'row', flex: 4 }}>
                                      <Text style={{ flex: 3, fontSize: 16, fontFamily: 'Poppins-Bold', paddingTop: 10 }}>
                                        {list.menuitem?.userlanguage?.name}
                                      </Text>
                                      <Text
                                        style={{
                                          flex: 1,
                                          fontSize: 16,
                                          fontFamily: 'Poppins-Bold',
                                          marginTop: 10,
                                        }}>
                                        ₹ {list.menuitem?.final_price}
                                      </Text>
                                    </View>
                                    {cook_details?.cook?.deliverytime == "unserviceable" || cook_details?.cook?.current_status == 0 || list.menuitem.timingstatus == 0 || list.menuitem.status == 0 ?
                                      null
                                      :
                                      list?.menuitem?.cartquantity?.quantity ?
                                        <View style={{ flexDirection: 'row', backgroundColor: '#09b44d', height: 30, width: 80, borderRadius: 30 }}>
                                          <TouchableOpacity style={{ paddingTop: 7, paddingLeft: 13, paddingRight: 10 }} onPress={() => remove_cart_item(list.menuitem.cartquantity.id, index, 'special_menus', key)}>
                                            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 16, color: '#fff' }}>
                                              -
                                            </Text>
                                          </TouchableOpacity>
                                          <Text style={{ paddingTop: 7, paddingLeft: 7, paddingRight: 8, fontFamily: 'Poppins-Bold', fontSize: 16, color: '#fff' }}>{list?.menuitem?.cartquantity?.quantity}</Text>
                                          <TouchableOpacity style={{ paddingTop: 7, paddingLeft: 7, }} onPress={() => add_to_cart(list.menu_item_id, index, 'special_menus', key)}>
                                            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 16, color: '#fff' }}>
                                              +
                                            </Text>
                                          </TouchableOpacity>
                                        </View>
                                        :
                                        <TouchableOpacity onPress={() => add_to_cart(list.menu_item_id, index, 'special_menus', key)} style={{
                                          marginTop: 15, backgroundColor: '#09b44d', padding: 10,
                                          width: 100,
                                          borderRadius: 28,
                                        }}>
                                          <Text
                                            style={{
                                              color: '#fff',
                                              fontFamily: 'Poppins-Bold',
                                              textAlign: 'center',
                                              fontSize: 16,
                                            }}>
                                            {t("foodDetailPage.add")}
                                          </Text>
                                        </TouchableOpacity>
                                    }
                                  </View>
                                </View>
                              )
                            })} */}
                          </View>
                        );
                      })
                    : null}
                </View>
              )}
            </View>
            {/* {console.log("filteredData && !isDataNotEmpty(menuItems) && !special_menus", !filteredData.length, !isDataNotEmpty(menuItems), !special_menus.length)} */}
            {!filteredData.length &&
              !isDataNotEmpty(menuItems) &&
              !special_menus.length &&
              !modal &&
              query.length > 0 && (
                <View>
                  <Text
                    style={{
                      padding: 20,
                      fontFamily: 'Poppins-Medium',
                      fontSize: 14,
                      color: '#000',
                      textAlign: 'center',
                    }}>
                    {
                      "Oops, we couldn't find that item today. \n Why not spice things up and check out other amazing vendor for a delightful surprise?"
                    }
                  </Text>
                </View>
              )}
          </ScrollView>
        </>
      ) : null}
      <View>
        {modal && (
          <Modal transparent={true} visible={modal}>
            <Loader />
          </Modal>
        )}
      </View>
      {modal == false && cook_details && cartShow && (
        <View style={{justifyContent: 'flex-end', marginBottom: '15%'}}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('CartPage', {
                type: 'food_detail_page',
                callBackFun: get_Cart,
                profile: get_Cook_Profile,
              })
            }
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              top: '93%',
              width: '100%',
              backgroundColor: '#09b44d',
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
              height: 60,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 25,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  color: '#fff',
                  fontFamily: 'Poppins-Regular',
                  fontWeight: '400',
                  fontSize: 16,
                }}>
                {cartDetails?.items} {t('foodDetailPage.items')}
              </Text>
              <View
                style={{
                  width: 2,
                  height: 22,
                  backgroundColor: '#d5e7dd',
                  marginHorizontal: 10,
                }}></View>
              <Text
                style={{
                  color: '#fff',
                  fontFamily: 'Poppins-Bold',
                  fontSize: 16,
                }}>
                ₹ {cartDetails?.amount}
              </Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text
                style={{
                  color: '#fff',
                  fontFamily: 'Poppins-Bold',
                  fontSize: 16,
                  marginRight: 10,
                }}>
                {t('foodDetailPage.viewCart')}
              </Text>
              <Image
                source={cartIcon}
                style={{width: 23, height: 20, tintColor: '#fff'}}
              />
            </View>
          </TouchableOpacity>
        </View>
      )}
      {showMenu && (
        <Portal>
          <PaperModal
            visible={showMenu}
            onDismiss={() => setShowMenu(false)}
            contentContainerStyle={{
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 5,
            }}>
            <View
              style={{
                width: '70%',
                alignItems: 'flex-start',
                backgroundColor: '#fff',
                paddingHorizontal: 20,
                paddingVertical: 25,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}>
                <Text style={{fontFamily: 'Poppins-Bold'}}>Tiffen</Text>
                <Text></Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}>
                <Text style={{fontFamily: 'Poppins-Bold'}}>Lunch</Text>
                <Text></Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}>
                <Text style={{fontFamily: 'Poppins-Bold'}}>Dinner</Text>
                <Text></Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}>
                <Text style={{fontFamily: 'Poppins-Bold'}}>Beverages</Text>
                <Text></Text>
              </View>
            </View>
          </PaperModal>
        </Portal>
      )}
      {showFeedback && (
        <Portal>
          <PaperModal
            visible={showFeedback}
            onDismiss={() => setShowFeedback(false)}
            contentContainerStyle={{
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 5,
            }}>
            <View
              style={{
                width: '85%',
                height: 40,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#fff',
                paddingTop: 15,
                paddingLeft: 25,
              }}>
              <Text style={{fontFamily: 'Poppins-Bold', fontSize: 20}}>
                4.5
              </Text>
              <Text style={{paddingHorizontal: 5}}>|</Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={StarSelectIcon}
                  style={{width: 20, height: 20, marginLeft: 3}}
                />
                <Image
                  source={StarSelectIcon}
                  style={{width: 20, height: 20, marginLeft: 3}}
                />
                <Image
                  source={StarSelectIcon}
                  style={{width: 20, height: 20, marginLeft: 3}}
                />
                <Image
                  source={StarSelectIcon}
                  style={{width: 20, height: 20, marginLeft: 3}}
                />
                <Image
                  source={StarSelectIcon}
                  style={{width: 20, height: 20, marginLeft: 3}}
                />
              </View>
            </View>
            <View
              style={{
                width: '85%',
                flexDirection: 'row',
                alignItems: 'flex-start',
                backgroundColor: '#fff',
                paddingHorizontal: 20,
                paddingVertical: 20,
                justifyContent: 'space-evenly',
              }}>
              <View
                style={{
                  width: 75,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{fontFamily: 'Poppins-Bold'}}>Quality</Text>
                <Image
                  source={QualityIcon}
                  style={{width: 75, height: 75, marginLeft: 10}}
                />
              </View>
              <View
                style={{
                  width: 75,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{fontFamily: 'Poppins-Bold'}}>Taste</Text>
                <Image source={TasteIcon} style={{width: 75, height: 75}} />
              </View>
              <View
                style={{
                  width: 75,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{fontFamily: 'Poppins-Bold'}}>Delivery</Text>
                <Image source={DeliveryIcon} style={{width: 75, height: 75}} />
              </View>
            </View>
          </PaperModal>
        </Portal>
      )}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  pageTitle: {
    color: '#fff',
    fontSize: 21,
    fontFamily: 'Poppins-Bold',
    marginTop: 12,
  },
});

export default VendorDetailPage;
