export const BASE_URL =
  // 'http://192.168.1.203/backend_homely_food/public/api'
  'http://live.homeefoodz.com/public/api';
// 'http://source.homeefoodz.com/public/api';
// "https://www.homeeplatform.com/homee_food/public/api";
// 'http://192.168.0.107:8000/api';

export const localApiURL = 'http://localhost:7071/api/fetch?';

export const URL = {
  LOGIN: '/login',
  VERIFY_OTP: '/verify-otp',
  SEND_WA_OTP: '/send-whatsapp-otp',
  REGISTER: '/register-new',
  ADDRESS: '/address',
  USER_SUPPORT: '/user-support',
  HOME: '/home',
  COOK_PROFILE: '/cook/profile/',
  GET_MENU_LIST: '/cook/get_menu_list',
  GET_MENU_BY_COOK: '/cook/get_menu_by_cook/',
  SHOW_CART: '/show/cart',
  SHOW_WALLET: '/show/wallet-cart',
  ADD_CARD: '/add/cart',
  MINUS_QUANTITY: '/minus/quantity/', //ID to be passed
  CART_ITEM: '/cart_item/amount', //TO BE VERIFY AMOUNT
  REMOVE_CART_ITEM: '/remove/cart_item/', //cart id need to pass
  EMPTY_CART: '/empty/cart',
  COUPON_LIST: '/coupon/list',
  APPLY_COUPON: '/apply-coupon',
  ADD_FAVOURITE: '/add/favourite',
  FAVOURITE_LIST: '/favourite/list',
  LANGUAGES: '/languages',
  USER_LANGUAGE: '/user/language/', //language id has to add in url
  TRANSACTION: '/transaction',
  TRANSACTION_CHECK: '/payment-response',
  WALLET_FULL_AMOUNT: '/wallet/order-fullamount',
  WALLET_FULL_AMOUNT2: '/wallet/order-amount-deduct',
  ORDER_DETAILS: '/order/detail/', //order id has to add in url
  ORDER_STATUS: '/order/status/', //order id has to add in url
  ORDERS: '/orders',
  REORDER: '/reorder/', //Order id has to add in url
  RATING: '/rating',
  WALLET: '/wallet',
  ADD_WALLET_MONEY: '/wallet/add-money',
  WALLET_TRANSACTION_CHECK: '/wallet/transaction-check',
  SEARCH: '/search',
  WALLET_USER_TRANSACTIONS: '/wallet-user-transactions',
  USER_LOGOUT: '/user/logout',
  QUICK_FILTER: '/homefilter/list',
  QUICK_FILTER_MENU_LIST: '/menufilter/list/', // menu iten id has to add in url
  ADDRESS_LIST: '/user/many/addresses',
  CHANGE_DEFAULT_ADDRESS: '/user/default/', //address id has to add in url
  USER_DETAIL: '/user/detail',
  USER_PRFILE_EDIT: '/user/edit',
  ADDRESS_DELETE: '/user/address/delete/', // address id has to add in url
  ADDRESS_EDIT: '/user/address/edit/', // address id has to add in url
  CURRENT_ORDERS: '/current/orders',
  HOME_BANNERS: '/home/banners',
  HOME_POPULAR_FOODS: '/home/popular-foods',
  HOME_COOK_NEAR_BY: '/home/cook-near',
  HOME_COOK_NEW: '/home/cook-new',
  HOME_COOK_TOP_RATED: '/home/cook-top-rated',
  HOME_COOK_OFFER: '/home/cook-offer',
  HOME_DEFAULT_ADDRESS: '/home/get-default-address',
  WALLET_STATUS: '/wallet/status',
  TRANSACTION_STATUS: '/transaction/status',
  TRANSACTION_CHECK: '/transaction/check',
  GET_FOOD_TYPES: '/foodtypes',
  OFFLINE_REFUND: '/order/paymentoffline/', //order id has to be passed in url
  WALLET_REFUND: '/order/walletrefund/', //order id has to be passed in url
  PRE_ORDER_COOKS: '/pre-order/cook-list',
  PRE_ORDER_BANNER: '/pre-order/banner',
  FOOD_LIST_PRE_ORDER: '/pre-order/cook/menu-list',
  GET_TIMING_LIST: '/pre-order/menu/timing',
  PRE_ORDER_CART_ADD: '/pre-order/cart/add',
  PRE_ORDER_CART_MINUS: '/pre-order/cart/minus/quantity/', // menu iten id has to add in url
  PRE_ORDER_ADD_DATE: '/pre-order/add-date',
  PRE_ORDER_ADD_TIMING: '/pre-order/add/timing',
  PRE_ORDER_CART_ADD_MORE: '/pre-order/cart/add/more',
  PRE_ORDER_GET_CART: '/pre-order/cart/get-all',
  PRE_ORDER_DATE_TIME_DETAILS: '/pre-order/cart/date-time-details',
  PRE_ORDER_CART_REMOVE: '/pre-order/cart/remove',
  PRE_ORDER_ADD_CHECKOUT: '/pre-order/cart/checkout',
  PRE_ORDER_UPDATE_CHECKOUT: '/pre-order/cart/update-checkout',
  PRE_ORDER_HISTORY: '/pre-order/history',
  GET_SERVICABLE_AREA: '/home/is_servicable_area',
  PRE_ORDER_CANCEL_CONFIRM: '/pre-order/confirm-cancel',
  TIME_BASED_MENU: '/home/time-based-menus',
  DELIVERY_AVAILABLE_TIME: '/home/check-delivery-time',
  SET_ONE_TO_ONE_COOKS: '/one-to-one/user/set-cooks',
  GET_ACTIVITY_HISTORY: '/user/get/activity-history',
  ADD_ACTIVITY_HISTORY: '/user/add/activity-history',
  ORDER_CREATE: '/order/create',
  POD_ORDER_CREATE: '/order/podcreate',
  PAYMENT_STATUS: '/order/payment-status',
  STATUS_CHECK: '/order/status-check',
  GET_VENDOR_BY_TYPE: '/home/get-vendor-by-type',
  GET_SERVICE_TITLE: '/home/get-service-title',
  BEST_FOUR: '/home/cook-top-rated-bestfour',
  GET_PAYMENT_METHODS: '/payment-methods',
  GET_SUPPORT_DETAILS: '/get-suport-details',
  //PND APIS CONSTANTS
  GET_PND_CONFIG: '/pickndrop/items-and-configs',
  ADD_PND_ADDRESS: '/pickndrop/addAddress',
  GET_PND_ADDRESS: '/pickndrop/address',
  GET_PND_ADDRESS_BY_ID: '/pickndrop/getAddressById/',
  CALCULATE_PND_PRICE: '/pickndrop/calculateprice/',
  PND_PLACE_ORDER: '/pickndrop/placeorder',
  PND_ORDER_STATUS: '/pickndrop/orderStatus',
  GET_PND_ORDER_INFO: '/pickndrop/orderinfo',
  GET_PND_SEARCH_MESSAGES: '/pickndrop/getSearchMessages',
  GET_PND_DELIVERY_INFO: '/pickndrop/deliveryinfo',
};
