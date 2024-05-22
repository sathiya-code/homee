import axios from 'axios';
import React, {useRef} from 'react';
import {URL} from './constants';
import {Alert, BackHandler, Platform} from 'react-native';
import {clearAsyncStorage, removeUnAuth} from './storage';

export const minus_quantity = async (id, config = {}) =>
  await get(URL.MINUS_QUANTITY + id, config);
export const cart_item = async (config = {}) =>
  await get(URL.CART_ITEM, config);
export const remove_cart_item = async (id, config = {}) =>
  await get(URL.REMOVE_CART_ITEM + id, config);
export const empty_cart = async (config = {}) =>
  await get(URL.EMPTY_CART, config);
export const favourite_list = async (page, config = {}) =>
  await get(URL.FAVOURITE_LIST + '?page=' + page, config);
export const languages = async (config = {}) =>
  await get(URL.LANGUAGES, config);
export const user_language = async (id, config = {}) =>
  await get(URL.USER_LANGUAGE + id, config);
export const order_details = async (id, config = {}) =>
  await get(URL.ORDER_DETAILS + id, config);
export const order_status = async (id, config = {}) =>
  await get(URL.ORDER_STATUS + id, config);
export const orders = async (page, config = {}) =>
  await get(URL.ORDERS + '?page=' + page, config);
export const reorder = async (config = {}) => await get(URL.REORDER, config);
export const wallet = async (config = {}) => await get(URL.WALLET, config);
export const wallet_user_transactions = async (config = {}) =>
  await get(URL.WALLET_USER_TRANSACTIONS, config);
export const logout = async (config = {}) => await get(URL.USER_LOGOUT, config);
export const quickFilterMenuItem = async (id, page, config = {}) =>
  await get(URL.QUICK_FILTER_MENU_LIST + id + '?page=' + page, config);
export const couponList = async (config = {}) =>
  await get(URL.COUPON_LIST, config);
export const addressList = async (config = {}) =>
  await get(URL.ADDRESS_LIST, config);
export const changeDefaultAddress = async (id, config = {}) =>
  await get(URL.CHANGE_DEFAULT_ADDRESS + id, config);
export const changeDefaultAddressAuto = async (data = {}, config = {}) =>
  await post(URL.CHANGE_DEFAULT_ADDRESS_AUTO, data, config);
export const userDetail = async (config = {}) =>
  await get(URL.USER_DETAIL, config);
export const deleteAddress = async (id, config = {}) =>
  await get(URL.ADDRESS_DELETE + id, config);
export const currentOrders = async (config = {}) =>
  await get(URL.CURRENT_ORDERS, config);
export const homeBanners = async (config = {}) =>
  await get(URL.HOME_BANNERS, config);
export const homePopularFoods = async (config = {}) =>
  await get(URL.HOME_POPULAR_FOODS, config);
export const homeCookNearBy = async (config = {}) =>
  await get(URL.HOME_COOK_NEAR_BY, config);
export const homeCookTopRated = async (page, config = {}) =>
  await get(URL.HOME_COOK_TOP_RATED + '?page=' + page, config);
export const homeBestFour = async (page, config = {}) =>
  await get(URL.BEST_FOUR + '?page=' + page, config);
export const homeCookNew = async (page, config = {}) =>
  await get(URL.HOME_COOK_NEW + '?page=' + page, config);
export const homeCookOffer = async (config = {}) =>
  await get(URL.HOME_COOK_OFFER, config);
export const getVendorByType = async (type, page, config = {}) =>
  await get(URL.GET_VENDOR_BY_TYPE + '?page=' + page + '&type=' + type, config);
export const getServicesTitle = async (config = {}) =>
  await get(URL.GET_SERVICE_TITLE, config);
export const getUserAddress = async (config = {}) =>
  await get(URL.HOME_DEFAULT_ADDRESS, config);
export const getFoodTypes = async (config = {}) =>
  await get(URL.GET_FOOD_TYPES, config);
export const offlineRefund = async (id, config = {}) =>
  await get(URL.OFFLINE_REFUND + id, config);
export const walletRefund = async (id, config = {}) =>
  await get(URL.WALLET_REFUND + id, config);
export const timeBasedMenu = async (config = {}) =>
  await get(URL.TIME_BASED_MENU, config);
export const getDeliveryTime = async (config = {}) =>
  await get(URL.DELIVERY_AVAILABLE_TIME, config);
export const setOneToOneCooks = async (config = {}) =>
  await get(URL.SET_ONE_TO_ONE_COOKS, config);
export const paymentMethods = async (config = {}) =>
  await get(URL.GET_PAYMENT_METHODS, config);
export const getSupportDetails = async (config = {}) =>
  await get(URL.GET_SUPPORT_DETAILS, config);

//////PnD Service APIs//////////
export const getPndItemsAndConfigs = async (config = {}) =>
  await get(URL.GET_PND_CONFIG, config);
export const getPndAddresses = async (config = {}) =>
  await get(URL.GET_PND_ADDRESS, config);
export const getPndAddressById = async (id, config = {}) =>
  await get(URL.GET_PND_ADDRESS_BY_ID + id, config);
export const pndAddAddresses = async (data, config = {}) =>
  await post(URL.ADD_PND_ADDRESS, data);
export const pndCalculatePrice = async (pickupAddress, dropAddress) =>
  await get(URL.CALCULATE_PND_PRICE + pickupAddress + '/' + dropAddress);
export const pndPlaceOrder = async (data = {}, config = {}) =>
  await post(URL.PND_PLACE_ORDER, data, config);
export const pndOrderStatus = async (data = {}, config = {}) =>
  await post(URL.PND_ORDER_STATUS, data, config);
export const getpndOrderInfo = async (data = {}, config = {}) =>
  await post(URL.GET_PND_ORDER_INFO, data, config);
export const getPndSearchMessages = async (data = {}, config = {}) =>
  await get(URL.GET_PND_SEARCH_MESSAGES, data, config);
export const getpndDeliveryInfo = async (data = {}, config = {}) =>
  await post(URL.GET_PND_DELIVERY_INFO, data, config);

////////////////////////////////

//////Groceries -- defined as groc////////////////////
export const grocGetBanners = async (data = {}, config = {}) =>
  await get(URL.GET_GROCERY_BANNERS, data, config);
export const grocGetCategories = async (data = {}, config = {}) =>
  await get(URL.GET_GROCERY_CATEGORIES, data, config);
export const grocGetNearbyVendors = async (
  page,
  getCount = 10,
  data = {},
  config = {},
) =>
  await get(
    URL.GET_GROCERY_NEARBY_VENDORS + getCount + '?page=' + page,
    data,
    config,
  );
export const getOurServices = async (data = {}, config = {}) =>
  await get(URL.GET_OUR_SERVICES, data, config);

// export const getPndSearchMessages = async (data = {}, config = {}) => await get(URL.GET_PND_SEARCH_MESSAGES, data, config);
// export const getpndDeliveryInfo = async (data = {}, config = {}) => await post(URL.GET_PND_DELIVERY_INFO, data, config);

///////////////////////////////////

export const login = async (data = {}, config = {}) =>
  await post(URL.LOGIN, data, config);
export const sendWAotp = async (data = {}, config = {}) =>
  await post(URL.SEND_WA_OTP, data, config);
export const verify = async (data = {}, config = {}) =>
  await post(URL.VERIFY_OTP, data, config);
export const register = async (data = {}, config = {}) =>
  await post(URL.REGISTER, data, config);
export const address = async (data = {}, config = {}) =>
  await post(URL.ADDRESS, data, config);
export const user_support = async (data = {}, config = {}) =>
  await post(URL.USER_SUPPORT, data, config);
export const home = async (data = {}, config = {}) =>
  await post(URL.HOME, data, config);
export const cook_profile = async (id, config = {}) =>
  await get(URL.COOK_PROFILE + id, config);
export const getMenuList = async (data = {}, config = {}) =>
  await post(URL.GET_MENU_LIST, data, config);
export const getMenuByCook = async (id, page, search = null) =>
  await get(URL.GET_MENU_BY_COOK + id + '?page=' + page + '&search=' + search);
export const show_cart = async (data = {}, config = {}) =>
  await post(URL.SHOW_CART, data, config);
export const show_wallet = async (data = {}, config = {}) =>
  await post(URL.SHOW_WALLET, data, config);
export const add_cart = async (data = {}, config = {}) =>
  await post(URL.ADD_CARD, data, config);
export const apply_coupon = async (data = {}, config = {}) =>
  await post(URL.APPLY_COUPON, data, config);
export const add_favourite = async (data = {}, config = {}) =>
  await post(URL.ADD_FAVOURITE, data, config);
export const transaction = async (data = {}, config = {}) =>
  await post(URL.TRANSACTION, data, config);
export const transaction_check = async (data = {}, config = {}) =>
  await post(URL.TRANSACTION_CHECK, data, config);
export const wallet_full_amount = async (data = {}, config = {}) =>
  await post(URL.WALLET_FULL_AMOUNT, data, config);
export const wallet_full_amount2 = async (data = {}, config = {}) =>
  await post(URL.WALLET_FULL_AMOUNT2, data, config);
export const rating = async (data = {}, config = {}) =>
  await post(URL.RATING, data, config);
export const add_wallet_money = async (data = {}, config = {}) =>
  await post(URL.ADD_WALLET_MONEY, data, config);
export const wallet_transaction_check = async (data = {}, config = {}) =>
  await post(URL.WALLET_TRANSACTION_CHECK, data, config);
export const search = async (data = {}, config = {}) =>
  await post(URL.SEARCH, data, config);
export const quickFilter = async (data = {}, page, config = {}) =>
  await post(URL.QUICK_FILTER + '?page=' + page, data, config);
export const profileEdit = async (data = {}, config = {}) =>
  await post(URL.USER_PRFILE_EDIT, data, config);
export const addressEdit = async (data = {}, id, config = {}) =>
  await post(URL.ADDRESS_EDIT + id, data, config);
export const walletStatus = async (data = {}, config = {}) =>
  await post(URL.WALLET_STATUS, data, config);
export const transactionStatus = async (data = {}, config = {}) =>
  await post(URL.TRANSACTION_STATUS, data, config);
export const getActivityStatus = async (data = {}, config = {}) =>
  await post(URL.ADD_ACTIVITY_HISTORY, data, config);

/////instant-order Post///////
export const placeOrder = async (data = {}, config = {}) =>
  await post(URL.ORDER_CREATE, data, config);
export const placePodOrder = async (data = {}, config = {}) =>
  await post(URL.POD_ORDER_CREATE, data, config);
export const paymentStatus = async (data = {}, config = {}) =>
  await post(URL.PAYMENT_STATUS, data, config);
export const orderStatusCheck = async (data = {}, config = {}) =>
  await post(URL.STATUS_CHECK, data, config);

///Pre-Order////
export const getPreOrderBanner = async (config = {}) =>
  await get(URL.PRE_ORDER_BANNER, config);
export const getPreOrderCooks = async (config = {}) =>
  await post(URL.PRE_ORDER_COOKS, config);
export const getFoodListPreOrder = async (config = {}) =>
  await post(URL.FOOD_LIST_PRE_ORDER, config);
export const getTimingList = async (config = {}) =>
  await get(URL.GET_TIMING_LIST, config);
export const preOrderCartAdd = async (config = {}) =>
  await post(URL.PRE_ORDER_CART_ADD, config);
export const preOrderCartMinus = async (id, config = {}) =>
  await get(URL.PRE_ORDER_CART_MINUS + id, config);
export const preOrderCartAddMore = async (config = {}) =>
  await post(URL.PRE_ORDER_CART_ADD_MORE, config);
export const preOrderAddTiming = async (config = {}) =>
  await post(URL.PRE_ORDER_ADD_TIMING, config);
export const preOrderAddDate = async (config = {}) =>
  await post(URL.PRE_ORDER_ADD_DATE, config);
export const getPreOrderCart = async (config = {}) =>
  await post(URL.PRE_ORDER_GET_CART, config);
export const preOrderCartRemove = async (config = {}) =>
  await post(URL.PRE_ORDER_CART_REMOVE, config);
export const getPreOrderDateTimeDetails = async (config = {}) =>
  await post(URL.PRE_ORDER_DATE_TIME_DETAILS, config);
export const preOrderAddCheckout = async (config = {}) =>
  await post(URL.PRE_ORDER_ADD_CHECKOUT, config);
export const preOrderUpdateCheckout = async (config = {}) =>
  await post(URL.PRE_ORDER_UPDATE_CHECKOUT, config);
export const preOrderHistory = async (id, config = {}) =>
  await get(URL.PRE_ORDER_HISTORY, config);
export const preOrderCancel = async (id, config = {}) =>
  await get(URL.PRE_ORDER_CANCEL + id, config);
export const preOrderCancelConfirm = async (config = {}) =>
  await post(URL.PRE_ORDER_CANCEL_CONFIRM, config);

export const getServicableArea = async (config = {}) =>
  await get(URL.GET_SERVICABLE_AREA, config);

const get = async (url, config) => {
  // console.log(url);
  try {
    let res = await axios.get(url, config);
    return prepareResponse(res);
  } catch (err) {
    return handleException(err, url);
  }
};
const post = async (url, data, config) => {
  console.log(url);
  console.log(data);
  try {
    let res = await axios.post(url, data, config);
    // console.warn("rannn", res)
    return prepareResponse(res);
  } catch (err) {
    console.log('errrrrrrrrrrrrrrrrrrrr', err, url);
    return handleException(err, url);
  }
};
let UnAuthenticated = false;
const handleException = (err, url) => {
  try {
    if (err?.response?.data) {
      let {data, status, statusText, headers, config, request} = err.response;
      if (status == 400) {
        Alert.alert(
          'Validation Faild',
          data?.message || 'Unhandle validation occured',
          // (data?.message || 'Unhandle validation occured') + " " + "url : " + url,
        );
      } else if (status == 401) {
        {
          !UnAuthenticated &&
            Alert.alert(
              'UnAuthenticated Access',
              'Session Closed Close your app and Reopen',
              [
                {
                  text: 'Close',
                  onPress: async () => {
                    await removeUnAuth();
                    if (Platform.OS == 'ios') {
                      //   navigationRef.navigate('Languages');
                    } else {
                      BackHandler.exitApp();
                    }
                  },
                },
              ],
              {cancelable: false},
            );
          UnAuthenticated = true;
        }
      } else if (status == 404) {
        Alert.alert('Page Not Found', 'This Api could not be find it ' + url);
      } else {
        Alert.alert(
          'Status Failed',
          `server returns ${status}`,
          ` msg: ${data?.message}`,
        );
        // Alert.alert('Status Failed', `server returns ${status}, URL: ${url}, msg: ${data?.message}`);
      }
    } else {
      Alert.alert('Information', 'Something went worng or Check your Internet');
    }
  } catch (error) {
    Alert.alert(
      'Information',
      'Something went worng or Check your Internet',
      `url: ${url}`,
      [
        {
          text: 'Ok',
          onPress: () => {
            if (Platform.OS == 'ios') {
              //   navigationRef.navigate('Languages');
            } else {
              BackHandler.exitApp();
            }
          },
        },
      ],
      {cancelable: false},
    );
  }
  return {};
};
const prepareResponse = res => {
  if (res?.status) {
    let {status, data = {}} = res;
    if (status >= 200 && status <= 299) {
      if (data.status == 'success') {
        return data;
      } else if (data.status == 'failure') {
        return data;
      } else if (data.status == 'empty') {
        return data;
      } else if (data.status == 'error') {
        return data, Alert.alert('Sorry for the inconvenience', data.message);
      }
    } else {
      Alert.alert(
        'Internal server error',
        `Status Code : ${status}\nMessage : ${data?.message}`,
      );
    }
  } else {
    Alert.alert('Someting went worng or Check your Internet');
  }
  return {};
};
