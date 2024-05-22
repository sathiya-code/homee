/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Modal,
  FlatList,
  StatusBar,
  Alert,
  Dimensions,
  Animated,
  BackHandler,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import {
  arrow,
  photo1,
  roundticIcon,
  locatIcon,
  offerIcon,
  cartIcon,
  backgroundImg,
  rating,
  walletIcon,
  cook_dp,
  emptyCartIcon,
  deleteIcon,
  calendar,
  card,
  Qrcode,
  cash,
} from '../assets/img/Images';
import { api, storage } from '../services/index';
import Loader from './Loader';
import RazorpayCheckout from 'react-native-razorpay';
import { useFocusEffect } from '@react-navigation/core';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';
import {
  HomeBgColor,
  PrimaryGreen,
  SecondaryGreen,
  TextColor2,
} from '../helper/styles.helper';
import backButton from '../assets/img/back_button.png';
import avoidCalling from '../assets/img/cart/avoidcall.png';
import directionToReach from '../assets/img/cart/directionToReach.png';
import handoverToSecurity from '../assets/img/cart/handoverToSecurity.png';
import leaveAtDoor from '../assets/img/cart/leaveAtDoor.png';
import { checkForUpdate } from '../helper/app.helper';
import moment from 'moment';
import { Portal, Modal as PaperModal } from 'react-native-paper';

const { width, height } = Dimensions.get('window');

const Cart = ({ navigation, route }) => {
  const isPreOrdeRoute = route?.params?.preOrder;
  // //console.log("isPreOrdeRoute", isPreOrdeRoute);
  const { t, i18 } = useTranslation();
  const [checkDeliver, setCheckDeliver] = useState(false);
  const [cardDetails, setCardDetails] = useState(null);
  const [modal, setModal] = useState(true);
  const [useWallet, setUseWallet] = useState(false);
  const [cuponApplied, setCuponApplied] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [showCheckout, setShowCheckout] = useState(true);
  const [instructions, setInstructions] = useState({
    ac: false,
    ld: false,
    hs: false,
    dr: false,
  });
  const [paymentMode, setPaymentMode] = useState('razorpay');
  const [preOrderCartDetails, setPreOrderCartDetails] = useState(null);
  const [preOrderCart, setPreOrderCart] = useState(null);
  const [user, setUser] = useState(null);
  const [oneToOne, setOneToOne] = useState(null);
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const [paymentMethods, setPaymentMethods] = useState([{
    description: "(UPI, Credit / Debit Cards)",
    display_name: "Online",
    icon: "user_payment_method/CreditCard.png",
    payment_type: "normal",
  }])

  const scrollViewRef = useRef(null);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 7,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -7,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 7,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -7,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 7,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -7,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 7,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -7,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 75,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const setOneToOneCooks = async () => {
    const response = await api.setOneToOneCooks();
    //console.log("response from setOneToOneCooks11", response);
    if ((response.status = 'success')) {
      // const idArray = response?.cookIds?.split(',');
      setOneToOne(response);
      // setoneToOnePreOrder(response.isPreOrder);
    }
  };

  useEffect(() => {
    const focusHandler = navigation.addListener('focus', () => {
      checkForUpdate();
      get_UserData();
      setOneToOneCooks();
    });
    return focusHandler;
  }, [navigation]);

  const checkDeliverHandler = () => {
    setCheckDeliver(!checkDeliver);
  };

  useEffect(() => {
    const handleBackButton = () => {
      navigation.navigate('HomeScreen');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButton,
    );

    return () => backHandler.remove();
  }, [navigation]);


  useEffect(() => {
    setShowCheckout(true);
  }, [modal, alert]);

  useFocusEffect(
    React.useCallback(() => {
      getCartItems();
      userData();
    }, []),
  );

  const get_UserData = async () => {
    // setModal(true);
    changeModalState(setModal);
    var user = await storage.getUserData();
    setUser(user);
    // //console.log("userrrrrrrrrrrrrrrrrrrrrrrrrr", user);
    setModal(false);
  };

  useEffect(() => {
    get_UserData();
  }, []);

  const userData = async () => {
    var user = await storage.getUserData();
    setUserDetails(user);
  };

  const singleAdvanceOrderCheckout = async () => {
    if (!selectedDeliveryDate) {
      scrollViewRef.current.scrollToEnd({ animated: true });
      shake();
    } else await checkOut();
  };
  const changeModalState = (setValue) => {
    setValue(true);
    setTimeout(() => {
      setValue(false);
    }, 5000);
  }

  const checkOut = async () => {
    changeModalState(setModal);
    if (paymentMode == 'wallet') await onlineCheckOut();
    else if (paymentMode == 'podQr') payOnDelivery('podQr');
    else if (paymentMode == 'podCash') payOnDelivery('podCash');
    else onlineCheckOut();
    setModal(false);
  };

  const onlineCheckOut = async () => {
    if (!!user?.first_name) {
      //   setShowCheckout(false);
      var data = {};
      console.log('====================================');
      console.log('onlineCheckOut', useWallet);
      console.log('====================================');
      if (useWallet) {
        data = {
          total_amount: cardDetails.amount,
          net_amount: cardDetails.total,
          items: cardDetails.items,
          type: 'wallet',
          tax: cardDetails.gst_amount,
          wallet_amount: cardDetails.wallet_deduct_amount,
          transaction_amount: cardDetails.transaction_amount,
          shipping_charge: cardDetails.shipping_charge,
          selectedDeliveryDate,
        };
      } else {
        data = {
          total_amount: cardDetails.amount,
          net_amount: cardDetails.total,
          items: cardDetails.items,
          type: 'normal',
          tax: cardDetails.gst_amount,
          transaction_amount: cardDetails.transaction_amount,
          shipping_charge: cardDetails.shipping_charge,
          selectedDeliveryDate,
        };
      }
      console.log('place order API', data);
      let response = await api.placeOrder(data);
      console.log('tst2');
      console.log('transaction response', response);
      if (response.status == 'success') {
        // //console.log('orderWallet', response);
        if (response.wallet_status == 0) {
          var options = {
            description: 'Order payment',
            // image: 'https://i.imgur.com/3g7nmJC.png',
            currency: 'INR',
            key: 'rzp_live_OIO5EHULxS65B4',
            // key: 'rzp_test_4QVOnZNpzWBFBM',
            amount: cardDetails.transaction_amount,
            name: 'Homee Foodz',
            order_id: response.transaction_id, //Replace this with an order_id created using Orders API.
            prefill: {
              email: userDetails.email,
              contact: userDetails.mobile,
              name: userDetails.first_name,
            },
            theme: { color: '#09b44d' },
          };
          console.log("razorpay data options", options);
          RazorpayCheckout.open(options)
            .then(data => {
              console.log("razorpay data", data);
              var payload = {
                status: 1,
                razor_pay_order_id: data.razorpay_order_id,
                razor_pay_payment_id: data.razorpay_payment_id,
                razor_pay_signature: data.razorpay_signature,
                cook_id: response.cookId,
                order_id: response.orderId,
              };
              transactionStatus(payload);
            })
            .catch(error => {
              console.log("eror from rp", error);
              var payload = {
                status: 0,
                payment_response: response,
                // razor_pay_order_id: response.transaction_id,
                cook_id: response.cookId,
                order_id: response.orderId,
                // payment_response: response
              };
              statusCheck(payload);
              // Alert.alert(error.reason, error.description);
            });
        } else {
          let res = await api.wallet_full_amount2({
            transaction_no: response.transaction_id,
          });
          // //console.log("wallet res", res);
          if (res.status == 'success') {
            emptyCart();
            // alert('Ordered successfully ');
            navigation.navigate('SuccessScreen', res.order);
          }
        }
      } else {
        alert('Unable to complete your process');
      }
    } else
      Alert.alert('', 'complete Your Profile Detail to Checkout', [
        {
          text: 'Proceed',
          onPress: () => navigation.navigate('profileEdit', user),
        },
        { text: 'Cancel', onPress: () => null },
      ]);
  };

  const payOnDelivery = async type => {
    if (!!user?.first_name) {
      const payload = {
        total_amount: cardDetails.amount,
        net_amount: cardDetails.total,
        items: cardDetails.items,
        type,
        tax: cardDetails.gst_amount,
        wallet_amount: cardDetails.wallet_deduct_amount,
        transaction_amount: cardDetails.transaction_amount,
        shipping_charge: cardDetails.shipping_charge,
        selectedDeliveryDate,
      };
      const capitalizedWord = type.charAt(0).toUpperCase() + type.slice(1);
      Alert.alert('Confirm Payment Method!', 'Are You Sure Want To Proceed with ' + capitalizedWord, [{
        text: 'Proceed', onPress: async () => {
          // setModal(true);
          changeModalState(setModal);
          console.log('data from pod order place start');
          let data = await api.placePodOrder(payload);
          console.log('data from pod order place', data);
          if (data.status == 'success') {
            navigation.navigate('SuccessScreen', data);
            await emptyCart();
          }
        }
      }, { text: 'Cancel', onPress: () => null }])
      setModal(false);
    } else
      Alert.alert('', 'complete Your Profile Detail to Checkout', [
        {
          text: 'Proceed',
          onPress: () => navigation.navigate('profileEdit', user),
        },
        { text: 'Cancel', onPress: () => null },
      ]);
  };

  const emptyCart = async () => {
    let response = await api.empty_cart();
    if (response.status == 'success') {
      setCardDetails(null);
    }
  };
  const transactionStatus = async data => {
    console.log("transactionStatus", data);
    let response = await api.paymentStatus(data);
    console.log("transactionStatus response", response);
    if (data.status == 1 && response.status == 'success') {
      emptyCart();
      // alert('Ordered successfully');
      navigation.navigate('SuccessScreen', data);
    }
  };
  const statusCheck = async data => {
    let response = await api.orderStatusCheck(data);
    // console.log("response from status checkk", data);
    if (data.status == 0 && response.status == 'success') {
      Alert.alert('Transaction Failed', 'Your transaction is failed', [
        {
          text: 'Ok',
          onPress: () => setShowCheckout(true),
        },
      ]);
    }
  };
  const getCartItems = async () => {
    console.log('get cart1');
    // setModal(true);
    changeModalState(setModal);
    let code = await storage.getCouponCode();
    console.log('get cart2');
    if (useWallet) {
      if (code) {
        let res = await api.apply_coupon({ coupon_code: code });
        if (res.status == 'success') {
          let response = await api.show_wallet({ applied_coupon: code });
          if (response.status == 'success') {
            // //console.log("card details1111111", response);
            setCardDetails(response);
            storage.setCartStatus(1);
          } else if (response.status == 'empty') {
            storage.setCartStatus(0);
            setCardDetails(null);
          }
        } else {
          let response = await api.show_wallet();
          // //console.log("card details222222", response);
          if (response.status == 'success') {
            setCardDetails(response);
            storage.setCartStatus(1);
          } else if (response.status == 'empty') {
            storage.setCartStatus(0);
            setCardDetails(null);
          }
        }
      } else {
        let response = await api.show_wallet();
        //console.log("card details33333333", response);
        if (response.status == 'success') {
          setCardDetails(response);
          storage.setCartStatus(1);
        } else if (response.status == 'empty') {
          storage.setCartStatus(0);
          setCardDetails(null);
        }
      }
    } else {
      if (code) {
        let res = await api.apply_coupon({ coupon_code: code });
        if (res.status == 'success') {
          let response = await api.show_cart({ applied_coupon: code });
          if (response.status == 'success') {
            storage.setCartStatus(1);
            setCardDetails(response);
            // //console.log("card details11111", response);
          } else if (response.status == 'empty') {
            storage.setCartStatus(0);
            setCardDetails(null);
          }
        } else {
          let response = await api.show_cart();
          if (response.status == 'success') {
            storage.setCartStatus(1);
            setCardDetails(response);
          } else if (response.status == 'empty') {
            storage.setCartStatus(0);
            setCardDetails(null);
          }
        }
      } else {
        let response = await api.show_cart();
        console.log('get cart4', response?.cartcook);
        console.log('ranjith rrr', response?.next7days);
        if (response.status == 'success') {
          storage.setCartStatus(1);
          setCardDetails(response);
        } else if (response.status == 'empty') {
          storage.setCartStatus(0);
          setCardDetails(null);
        }
      }
    }
    setModal(false);
  };
  const getCartItem = async value => {
    setModal(true);
    let code = await storage.getCouponCode();
    if (value) {
      if (code) {
        let res = await api.apply_coupon({ coupon_code: code });
        if (res.status == 'success') {
          let response = await api.show_wallet({ applied_coupon: code });
          if (response.status == 'success') {
            setCardDetails(response);
            storage.setCartStatus(1);
          } else if (response.status == 'empty') {
            storage.setCartStatus(0);
            setCardDetails(null);
          }
        } else {
          let response = await api.show_wallet();
          if (response.status == 'success') {
            setCardDetails(response);
            storage.setCartStatus(1);
          } else if (response.status == 'empty') {
            storage.setCartStatus(0);
            setCardDetails(null);
          }
        }
      } else {
        let response = await api.show_wallet();
        if (response.status == 'success') {
          setCardDetails(response);
          storage.setCartStatus(1);
        } else if (response.status == 'empty') {
          storage.setCartStatus(0);
          setCardDetails(null);
        }
      }
    } else {
      if (code) {
        let res = await api.apply_coupon({ coupon_code: code });
        if (res.status == 'success') {
          let response = await api.show_cart({ applied_coupon: code });
          if (response.status == 'success') {
            storage.setCartStatus(1);
            setCardDetails(response);
          } else if (response.status == 'empty') {
            storage.setCartStatus(0);
            setCardDetails(null);
          }
        } else {
          let response = await api.show_cart();
          if (response.status == 'success') {
            storage.setCartStatus(1);
            setCardDetails(response);
          } else if (response.status == 'empty') {
            storage.setCartStatus(0);
            setCardDetails(null);
          }
        }
      } else {
        let response = await api.show_cart();
        if (response.status == 'success') {
          storage.setCartStatus(1);
          setCardDetails(response);
        } else if (response.status == 'empty') {
          storage.setCartStatus(0);
          setCardDetails(null);
        }
      }
    }
    setModal(false);
  };
  // //console.log(cardDetails);
  useEffect(() => {
    userData();
  }, []);
  useEffect(() => {
    getCartItems();
  }, [useWallet]);
  // useEffect(() => {
  //   getCartItems();
  // }, [cuponApplied]);
  const changeWallet = (wallet = null) => {
    if (wallet != 'wallet') {
      setUseWallet(false);
      getCartItem(false);
    } else {
      setUseWallet(true);
      getCartItem(true);
    }
  };
  const removeCartMenuIetm = async id => {
    let response = await api.remove_cart_item(id);
    if (response.status == 'success') {
      getCartItems();
    }
  };
  const add_to_cart = async id => {
    let response = await api.add_cart({
      menu_item_id: id,
      cook_id: cardDetails.cook.id,
    });
    if (response.status == 'success') {
      getCartItems();
    }
  };
  const remove_cart_item = async id => {
    let response = await api.minus_quantity(id);
    if (response.status == 'success') {
      getCartItems();
    }
  };

  //===========Pre order data=================//

  const [useWalletPO, setUseWalletPO] = useState(false);

  const getPOCDetails = async () => {
    const response = await api.getPreOrderDateTimeDetails({
      isWallet: useWalletPO ? 1 : 0,
    });
    //console.log("response from date anfd time details", response);
    setPreOrderCartDetails(response);
  };
  useEffect(() => {
    const focusHandler = navigation.addListener('focus', () => {
      getPOCDetails();
      setUseWalletPO(false);
      setUseWallet(false);
    });
    return focusHandler;
  }, [navigation]);

  useEffect(() => {
    if (isPreOrdeRoute) setPreOrderCart(true);
  }, []);

  useEffect(() => {
    getPOCDetails();
  }, [preOrderCart, setPreOrderCart, useWalletPO, setUseWalletPO]);

  // const AddButton = ({ item }) => {
  //     //console.log("itemmmmmmmmmmmmm", item);
  //     const cartDetail = JSON.parse(item?.cart_details);
  //     const [itemQuantity, setItemQuantity] = useState(cartDetail?.quantity);

  //     // //console.log("wueufinicscds",);
  //     return (<>
  //         {cartDetail?.quantity ?
  //             <>
  //                 <View style={{ minWidth: 65, maxWidth: 85, flexDirection: 'row', marginTop: 5, justifyContent: 'center', backgroundColor: '#29C270', borderRadius: 10, alignItems: 'center', height: 30, paddingHorizontal: 5 }}>
  //                     {/* <TouchableOpacity > */}
  //                     <Text style={{ width: '25%', color: '#fff', fontWeight: 'bold', fontSize: 24, paddingHorizontal: 3 }} onPress={() => { minusFromCart({ id: cartDetail?.cart_id }); getFoodList({ id: item?.id }) }}>-</Text>
  //                     {/* </TouchableOpacity> */}
  //                     <TextInput keyboardType='numeric' style={{ width: '50%', color: '#fff', height: 35, paddingHorizontal: 3, alignItems: 'center', fontWeight: 'bold', fontSize: 14, marginTop: 5 }} textAlign={"center"} placeholder={cartDetail?.quantity.toString()} onSubmitEditing={() => addMoreToCart({ cart_id: cartDetail?.cart_id, quantity: itemQuantity })} onBlur={() => addMoreToCart({ cart_id: cartDetail?.cart_id, quantity: itemQuantity })} value={itemQuantity?.toString()} onChangeText={setItemQuantity} />
  //                     {/* <Text>{cartDetail?.quantity}</Text> */}
  //                     {/* <TouchableOpacity onPress={() => { addToCart({ menu_item_id: item?.menu_id, cook_id: item?.id, pre_order_date: datesArr.find(item => item.index == selectedIndex).date, pre_order_time: datesArr.find(item => item.index == selectedIndex).time }); getFoodList({ id: item?.id }); }}> */}
  //                     <Text style={{ width: '25%', color: '#fff', fontWeight: 'bold', fontSize: 20, paddingHorizontal: 3 }} onPress={() => { addToCart({ cart_id: selectedItem?.cartId, menu_item_id: item?.menu_id, cook_id: item?.id, pre_order_date: selectedItem?.pre_order_date, pre_order_time: selectedItem?.pre_order_time }); getFoodList({ id: item?.id }); getCartDateTime(); }}>+</Text>
  //                     {/* </TouchableOpacity> */}
  //                 </View>
  //             </> :
  //             <>
  //                 <TouchableOpacity
  //                     style={{ flexDirection: 'row', width: 65, marginTop: 5, justifyContent: 'center', backgroundColor: '#29C270', borderRadius: 10, alignItems: 'center', height: 30, paddingHorizontal: 5, }}
  //                     onPress={() => { addToCart({ cart_id: selectedItem?.cartId, menu_item_id: item?.menu_id, cook_id: item?.id, pre_order_date: selectedItem?.pre_order_date, pre_order_time: selectedItem?.pre_order_time }); getFoodList({ id: item?.id }); getCartDateTime(); }}
  //                 >
  //                     <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14, }}>Add</Text>
  //                 </TouchableOpacity>
  //             </>
  //         }
  //     </>);
  // }

  const updatePOCheckout = async payload => {
    // /required params  =>  {order_id, transcation_id, isWallet, transcation_amount, status, razor_pay_payment_id, razor_pay_signature}
    const response = await api.preOrderUpdateCheckout(payload);
    //console.log("reponse fromupdate checkout", response);
    if (response.status == 'success') {
      Alert.alert(
        'Advance Order Placed Successfully',
        'Go to Advance Order History in Account page to View Your Order',
      );
    }
    getPOCDetails();
  };

  const preOrderCheckout = async () => {
    if (!!user?.first_name) {
      const data = {
        total_amount: preOrderCartDetails?.totalAmount,
        net_amount: preOrderCartDetails?.transaction_amount,
        shipping_charge: preOrderCartDetails?.shipping_amount,
        // items: cardDetails.items,
        type: useWalletPO ? 'wallet' : 'normal',
        tax: preOrderCartDetails?.gstTotal,
        wallet_amount: useWalletPO
          ? preOrderCartDetails?.wallet_deduct_amount
          : 0,
      };
      const response = await api.preOrderAddCheckout(data);
      if (response?.status == 'success') {
        // //console.log('orderWallet', response);
        if (response.wallet_status == 0) {
          var options = {
            description: 'Order payment',
            currency: 'INR',
            key: 'rzp_live_OIO5EHULxS65B4',
            amount: parseInt(preOrderCartDetails?.transaction_amount),
            name: 'Homee',
            order_id: response.transaction_id, //Replace this with an order_id created using Orders API.
            prefill: {
              email: userDetails.email,
              contact: userDetails.mobile,
              name: userDetails.first_name,
            },
            theme: { color: '#29C270' },
          };
          RazorpayCheckout.open(options)
            .then(data => {
              updatePOCheckout({
                order_id: response?.order_id,
                transcation_id: response?.transaction_id,
                isWallet: response?.wallet_status,
                transcation_amount: parseInt(
                  preOrderCartDetails?.transaction_amount,
                ),
                status: 1,
                razor_pay_payment_id: data.razorpay_payment,
                razor_pay_signature: data.razorpay_signature,
              });
            })
            .catch(error => {
              updatePOCheckout({
                order_id: response?.order_id,
                transcation_id: response?.transaction_id,
                isWallet: response?.wallet_status,
                transcation_amount: parseInt(
                  preOrderCartDetails?.transaction_amount,
                ),
                status: 0,
              });
            });
        } else {
          updatePOCheckout({
            order_id: response?.order_id,
            transcation_id: response?.transaction_id,
            isWallet: response?.wallet_status,
            transcation_amount: parseInt(
              preOrderCartDetails?.transaction_amount,
            ),
            status: 1,
          });
          // Alert.alert("Pre Order Placed Successfully", "Go to Pre Order History in Profile page to View Your Order")
        }
      } else {
        alert('Unable to complete your process');
      }
    } else
      Alert.alert('', 'complete Your Profile Detail to Checkout', [
        {
          text: 'Proceed',
          onPress: () => navigation.navigate('profileEdit', user),
        },
        { text: 'Cancel', onPress: () => null },
      ]);
  };

  const addToCart = async data => {
    //required params {menu_item_id, cook_id, pre_order_date, pre_order_time}
    const response = await api.preOrderCartAdd(data);
    //console.log("response from add to cart", response);
    getPOCDetails();
  };

  const minusFromCart = async ({ id, cartId, menu_list_length }) => {
    //required params {menu_item_id, cook_id, pre_order_date, pre_order_time}
    //console.log(":iddddddddddddddddddddddddddddddddddddddd", id, menu_list_length);
    const response = await api.preOrderCartMinus(id);
    if (menu_list_length == 1 && response.quantity == 0) {
      const res = await api.preOrderCartRemove({ cart_id: cartId });
      //console.log("res from remove cart", res);
    }
    //console.log("response from minus from cart", response);
    getPOCDetails();
  };
  const addMoreToCart = async data => {
    //required params {cart_id, quantity}
    const response = await api.preOrderCartAddMore(data);
    // //console.log("response from add to cart", response);
  };

  const AddButton = ({
    cartId,
    pre_order_date,
    pre_order_time,
    menu,
    menu_list_length,
  }) => {
    return (
      <>
        <View
          style={{
            minWidth: 60,
            maxWidth: 85,
            flexDirection: 'row',
            marginTop: 5,
            justifyContent: 'center',
            backgroundColor: '#29C270',
            borderRadius: 10,
            alignItems: 'center',
            height: 25,
            paddingHorizontal: 5,
            marginBottom: 5,
          }}>
          <Text
            style={{
              width: '25%',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 20,
              paddingHorizontal: 3,
            }}
            onPress={() => {
              minusFromCart({
                id: menu?.preorder_cart_id,
                cartId,
                menu_list_length,
              });
            }}>
            -
          </Text>
          {/* <TextInput keyboardType='numeric' style={{ width: '50%', color: '#fff', height: 35, paddingHorizontal: 3, alignItems: 'center', fontWeight: 'bold', fontSize: 14, marginTop: 5 }} textAlign={"center"} placeholder={cartDetail?.quantity.toString()} onSubmitEditing={() => addMoreToCart({ cart_id: cartDetail?.cart_id, quantity: itemQuantity })} onBlur={() => addMoreToCart({ cart_id: cartDetail?.cart_id, quantity: itemQuantity })} value={itemQuantity?.toString()} onChangeText={setItemQuantity} /> */}
          <Text
            style={{
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 16,
              paddingHorizontal: 3,
            }}>
            {menu?.quantity}
          </Text>
          <Text
            style={{
              width: '25%',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 16,
              paddingHorizontal: 3,
            }}
            onPress={() => {
              addToCart({
                cart_id: cartId,
                menu_item_id: menu?.menu_item_id,
                cook_id: menu?.cook_id,
                pre_order_date,
                pre_order_time,
              });
            }}>
            +
          </Text>
        </View>
      </>
    );
  };
  /////////////////////////////////////////////

  const dateSelect = date => {
    setShowDatePicker(false);
    setSelectedDeliveryDate(date);
  };

  const InstantOrderCart = () => {
    return (
      <>
        {cardDetails ? (
          <SafeAreaView style={{ flex: 1, position: 'relative' }}>
            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              style={{ marginTop: 10 }}>
              {cardDetails.cart &&
                cardDetails.cart.map((list, index) => {
                  return (
                    <View
                      key={index}
                      style={{
                        flex: 4,
                        marginHorizontal: 10,
                        borderRadius: 15,
                        elevation: 3,
                        backgroundColor: 'white',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingHorizontal: 15,
                        paddingVertical: 7,
                        marginTop: 10,
                      }}>
                      <View style={{ flex: 3 }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <Image
                            style={{
                              width: 15,
                              height: 15,
                              backgroundColor: 'red',
                              marginRight: 5,
                            }}
                            source={{ uri: list?.menuitem?.foodtype?.icon }}
                          />
                          <Text
                            style={{ fontFamily: 'Poppins-Bold', width: '80%' }}>
                            {list?.menuitem?.userlanguage?.name}
                          </Text>
                          <View style={{ style: 1 }}>
                            <Text
                              style={{
                                fontSize: 16,
                                fontFamily: 'Poppins-Bold',
                                color: '#000',
                              }}>
                              ₹ {list?.quantity_amount}
                            </Text>
                          </View>
                        </View>
                        {list.reorder_menu_status == 1 ? (
                          <View
                            style={{
                              flexDirection: 'row',
                              marginTop: 5,
                              backgroundColor: '#09b44d',
                              width: 75,
                              justifyContent: 'center',
                              alignItems: 'center',
                              borderRadius: 50,
                            }}>
                            <TouchableOpacity
                              style={{
                                width: 25,
                              }}
                              onPress={() => remove_cart_item(list.id)}>
                              <Text
                                style={{
                                  color: '#fff',
                                  fontFamily: 'Poppins-Bold',
                                  textAlign: 'center',
                                  fontSize: 14,
                                }}>
                                -
                              </Text>
                            </TouchableOpacity>
                            <Text
                              style={{
                                color: '#fff',
                                paddingVertical: 1,
                                paddingLeft: 7,
                                paddingRight: 7,
                                fontFamily: 'Poppins-Bold',
                                textAlign: 'center',
                                fontSize: 14,
                              }}>
                              {list?.quantity}
                            </Text>
                            <TouchableOpacity
                              style={{
                                width: 25,
                              }}
                              onPress={() => add_to_cart(list.menu_item_id)}>
                              <Text
                                style={{
                                  color: '#fff',
                                  fontFamily: 'Poppins-Bold',
                                  textAlign: 'center',
                                  fontSize: 14,
                                }}>
                                +
                              </Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity
                            onPress={() => removeCartMenuIetm(list.id)}
                            style={{
                              paddingTop: -10,
                              flexDirection: 'row',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                            <Image
                              source={deleteIcon}
                              style={{ height: 25, width: 25 }}
                            />
                            <Text
                              style={{
                                fontFamily: 'Poppins-Bold',
                                textAlign: 'center',
                                fontSize: 14,
                              }}>
                              Remove
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })}
              {cardDetails?.cook?.id && (
                <Text
                  style={{
                    marginLeft: 10,
                    marginTop: 10,
                    color: PrimaryGreen,
                    fontFamily: 'Poppins-Medium',
                    fontSize: 14,
                  }}
                  onPress={() =>
                    navigation.navigate('FoodDetail', {id: cardDetails?.cook?.id})
                  }>
                  {`+Add more from ${cardDetails?.cook?.first_name
                    ? cardDetails?.cook?.first_name
                    : 'this Vendor'
                    }`}
                </Text>
              )}
              {/* <Text
                style={{
                  fontFamily: 'Poppins-Bold',
                  fontSize: 18,
                  marginTop: 10,
                  marginLeft: 10,
                }}>
                {t('cartPage.offers&Benefits')}
              </Text>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  marginHorizontal: 10,
                  backgroundColor: '#fff',
                  borderRadius: 15,
                  elevation: 3,
                  // borderColor: '#d5e7dd',
                  // borderBottomWidth: 3,
                  // borderTopWidth: 3,
                  marginBottom: 10,
                }}>
                <TouchableOpacity
                  // onPress={() => navigation.navigate('CouponDetails')}
                  style={{
                    padding: 8,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={offerIcon} style={{ width: 28, height: 28 }} />
                    <View>
                      <Text
                        style={{
                          fontFamily: 'Poppins-Bold',
                          fontSize: 13,
                          marginLeft: 8,
                        }}>
                        {t('cartPage.applyCoupon')}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Poppins-Regular',
                          fontWeight: '400',
                          marginTop: -5,
                          marginLeft: 8,
                          fontSize: 11,
                          color: TextColor2,
                        }}>
                        Tap to check the exciting offers
                      </Text>
                    </View>
                  </View>
                  <Image
                    source={arrow}
                    style={{
                      width: 8,
                      height: 13,
                      tintColor: '#000',
                      transform: [{ rotate: '180deg' }],
                    }}
                  />
                </TouchableOpacity>
              </View> */}

              <View
                style={{
                  paddingHorizontal: 20,
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'Poppins-Bold',
                    color: '#000',
                    paddingTop: 18,
                  }}>
                  Payment Type
                </Text>
              </View>
              <PaymentMethods />
              <View
                style={{
                  paddingHorizontal: 20,
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'Poppins-Bold',
                    color: '#000',
                    paddingTop: 18,
                  }}>
                  {t('cartPage.billDetails')}
                </Text>
              </View>
              <View
                style={{
                  marginHorizontal: 10,
                  borderRadius: 7,
                  backgroundColor: '#fff',
                  elevation: 3,
                  paddingTop: 20,
                }}>
                <View
                  style={{
                    paddingHorizontal: 20,
                    borderBottomColor: '#d5e7dd',
                    borderBottomWidth: 1,
                  }}>
                  <View
                    style={{
                      justifyContent: 'space-between',
                      flexDirection: 'row',
                      marginBottom: 15,
                    }}>
                    <View>
                      <Text
                        style={{
                          fontSize: 14,
                          // marginBottom: 5,
                          fontFamily: 'Poppins-Medium',
                          color: '#000',
                        }}>
                        Item Total
                      </Text>
                      {!!cardDetails?.discountAmount && (
                        <View
                          style={{
                            justifyContent: 'space-between',
                            flexDirection: 'row',
                            // marginBottom: 15,
                          }}>
                          <Text
                            style={{
                              fontSize: 12,
                              // marginBottom: 5,
                              fontFamily: 'Poppins-Regular',
                              color: '#2b2b2b',
                            }}>
                            {`Discount  ${cardDetails?.flatDiscountValueText
                              ? '(' + cardDetails?.flatDiscountValueText + ')'
                              : ''
                              }`}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                      {/* {cardDetails?.amount &&
                                                    <Text
                                                        style={{
                                                            fontSize: 14,
                                                            marginBottom: 5,
                                                            fontFamily: 'Poppins-Medium',
                                                            color: '#ff4b4b',
                                                            textDecorationLine: 'line-through',
                                                            textDecorationStyle: 'solid'
                                                        }}>
                                                        ₹ {cardDetails?.amount}
                                                    </Text>
                                                } */}
                      <View style={{ alignItems: 'center', padding: 1 }}>
                        {!!cardDetails?.discountAmount &&
                          !!cardDetails?.totalAfterDiscount && (
                            <>
                              {/* <View style={{ borderBottomWidth: 0.6, width: '100%', borderBottomColor: '#ff1000', transform: [{ rotate: '160deg' }], position: 'absolute', marginTop: '35%' }} /> */}
                              <Text
                                style={{
                                  fontSize: 14,
                                  marginBottom: 5,
                                  fontFamily: 'Poppins-Medium',
                                  color: '#ff4b4b',
                                  textDecorationLine: 'line-through',
                                }}>
                                ₹ {cardDetails.amount}
                              </Text>
                            </>
                          )}
                      </View>
                      <Text
                        style={{
                          fontSize: 14,
                          marginBottom: 5,
                          fontFamily: 'Poppins-Medium',
                          color: '#000',
                          marginLeft: 5,
                        }}>
                        {`  ₹ ${cardDetails?.totalAfterDiscount
                          ? cardDetails?.totalAfterDiscount
                          : cardDetails.amount
                          }`}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      justifyContent: 'space-between',
                      flexDirection: 'row',
                      marginBottom: 15,
                    }}>
                    <Text
                      style={{
                        fontSize: 14,
                        marginBottom: 5,
                        fontFamily: 'Poppins-Medium',
                        color: '#000',
                      }}>
                      {t('cartPage.deliveryCharge')}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        marginBottom: 5,
                        fontFamily: 'Poppins-Medium',
                        color: '#000',
                      }}>
                      + ₹ {cardDetails?.shipping_charge}
                    </Text>
                  </View>
                  {/* {useWallet && (
                                        <View
                                            style={{
                                                justifyContent: 'space-between',
                                                flexDirection: 'row',
                                                marginBottom: 15,
                                            }}>
                                            <Text
                                                style={{
                                                    fontSize: 14,
                                                    marginBottom: 5,
                                                    fontFamily: 'Poppins-Medium',
                                                    color: '#000',
                                                }}>
                                                {t('cartPage.walletBalance')}
                                            </Text>
                                            <Text
                                                style={{
                                                    fontSize: 14,
                                                    marginBottom: 5,
                                                    fontFamily: 'Poppins-Medium',
                                                    color: '#09b44d',
                                                }}>
                                                ₹ {cardDetails?.wallet_bal ? cardDetails.wallet_bal : 0}
                                            </Text>
                                        </View>
                                    )} */}
                  <View
                    style={{
                      justifyContent: 'space-between',
                      flexDirection: 'row',
                      marginBottom: 15,
                    }}>
                    <Text
                      style={{
                        fontSize: 14,
                        marginBottom: 5,
                        fontFamily: 'Poppins-Medium',
                        color: '#000',
                      }}>
                      Taxes & Charges
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        marginBottom: 5,
                        fontFamily: 'Poppins-Medium',
                        color: '#000',
                      }}>
                      + ₹ {cardDetails?.gst_amount}
                    </Text>
                  </View>
                  {useWallet && (
                    <View
                      style={{
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        marginBottom: 15,
                      }}>
                      <Text
                        style={{
                          fontSize: 14,
                          marginBottom: 5,
                          fontFamily: 'Poppins-Medium',
                          color: '#000',
                        }}>
                        {t('cartPage.walletAmount')}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          marginBottom: 5,
                          fontFamily: 'Poppins-Medium',
                          color: '#09b44d',
                        }}>
                        - ₹{' '}
                        {cardDetails?.wallet_deduct_amount
                          ? cardDetails.wallet_deduct_amount
                          : 0}
                      </Text>
                    </View>
                  )}
                </View>
                <View
                  style={{
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    marginBottom: 15,
                    borderColor: '#d5e7dd',
                    padding: 15,
                    paddingBottom: 0,
                  }}>
                  <Text
                    style={{
                      fontSize: 14,
                      marginBottom: 5,
                      fontFamily: 'Poppins-Bold',
                      color: '#000',
                    }}>
                    {t('cartPage.totalAmount')}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      marginBottom: 5,
                      fontFamily: 'Poppins-Bold',
                      color: '#000',
                    }}>
                    ₹ {cardDetails.transaction_amount}
                  </Text>
                </View>
              </View>

              <Text
                style={{
                  fontFamily: 'Poppins-Bold',
                  fontSize: 18,
                  marginTop: 10,
                  marginLeft: 10,
                }}>
                {t('cartPage.deliveryInstructions')}
              </Text>
              <ScrollView
                style={{
                  paddingHorizontal: 10,
                  marginTop: 10,
                  marginRight: 20,
                }}
                horizontal
                showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  onPress={() =>
                    setInstructions({ ac: true, ld: false, hs: false, dr: false })
                  }
                  style={{
                    backgroundColor: instructions.ac ? PrimaryGreen : '#fff',
                    flexDirection: 'row',
                    elevation: 3,
                    borderWidth: 1,
                    borderColor: '#989898',
                    borderRadius: 20,
                    marginRight: 15,
                    paddingHorizontal: 15,
                    paddingVertical: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={avoidCalling}
                    style={{
                      width: 20,
                      height: 20,
                      resizeMode: 'contain',
                      marginRight: 5,
                      tintColor: instructions.ac ? '#fff' : PrimaryGreen,
                    }}
                  />
                  <Text style={{ color: instructions.ac ? '#fff' : '#000' }}>
                    Avoid Calling
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    setInstructions({ ac: false, ld: true, hs: false, dr: false })
                  }
                  style={{
                    backgroundColor: instructions.ld ? PrimaryGreen : '#fff',
                    flexDirection: 'row',
                    elevation: 3,
                    borderWidth: 1,
                    borderColor: '#989898',
                    borderRadius: 20,
                    marginRight: 15,
                    paddingHorizontal: 15,
                    paddingVertical: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={leaveAtDoor}
                    style={{
                      width: 20,
                      height: 20,
                      resizeMode: 'contain',
                      marginRight: 5,
                      tintColor: instructions.ld ? '#fff' : PrimaryGreen,
                    }}
                  />
                  <Text style={{ color: instructions.ld ? '#fff' : '#000' }}>
                    leave at the Door
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    setInstructions({ ac: false, ld: false, hs: true, dr: false })
                  }
                  style={{
                    backgroundColor: instructions.hs ? PrimaryGreen : '#fff',
                    flexDirection: 'row',
                    elevation: 3,
                    borderWidth: 1,
                    borderColor: '#989898',
                    borderRadius: 20,
                    marginRight: 15,
                    paddingHorizontal: 15,
                    paddingVertical: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={handoverToSecurity}
                    style={{
                      width: 20,
                      height: 20,
                      resizeMode: 'contain',
                      marginRight: 5,
                      tintColor: instructions.hs ? '#fff' : PrimaryGreen,
                    }}
                  />
                  <Text style={{ color: instructions.hs ? '#fff' : '#000' }}>
                    Handover to Security
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    setInstructions({ ac: false, ld: false, hs: false, dr: true })
                  }
                  style={{
                    backgroundColor: instructions.dr ? PrimaryGreen : '#fff',
                    flexDirection: 'row',
                    elevation: 3,
                    borderWidth: 1,
                    borderColor: '#989898',
                    borderRadius: 20,
                    marginRight: 15,
                    paddingHorizontal: 15,
                    paddingVertical: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={directionToReach}
                    style={{
                      width: 20,
                      height: 20,
                      resizeMode: 'contain',
                      marginRight: 5,
                      tintColor: instructions.dr ? '#fff' : PrimaryGreen,
                    }}
                  />
                  <Text style={{ color: instructions.dr ? '#fff' : '#000' }}>
                    Directions to Reach
                  </Text>
                </TouchableOpacity>
              </ScrollView>
              <View
                style={{
                  paddingHorizontal: 20,
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  marginTop: 10,
                }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: 'Poppins-Bold',
                    color: '#000',
                    paddingTop: 18,
                  }}>
                  {t('cartPage.deliveryAddress')}
                </Text>
              </View>
              <View
                style={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexDirection: 'row',
                  padding: 15,
                  marginHorizontal: 10,
                  backgroundColor: '#fff',
                  elevation: 3,
                  borderRadius: 15,
                  marginBottom: 15,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    width: '60%',
                  }}>
                  {/* <View
                                        style={{
                                            borderWidth: 1,
                                            justifyContent: 'center',
                                            position: 'relative',
                                            alignItems: 'center',
                                            borderColor: '#a6a6a6',
                                            width: 35,
                                            height: 35,
                                            marginTop: 15
                                        }}>
                                        <Image source={locatIcon} style={{ width: 15, height: 22.5 }} />
                                        <View
                                            style={{
                                                position: 'absolute',
                                                top: -10,
                                                right: -10,
                                            }}>
                                            <Image
                                                source={roundticIcon}
                                                style={{ width: 20, height: 20 }}
                                            />
                                        </View>
                                    </View> */}

                  <View style={{ marginLeft: 10 }}>
                    <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 14 }}>
                      {t('cartPage.deliverTo')}{' '}
                      {userDetails?.defaultaddress?.type}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Poppins-Medium',
                        fontSize: 14,
                        paddingVertical: 4,
                        // width: "100%",
                      }}
                      numberOfLines={3}>
                      {userDetails?.defaultaddress?.street},
                      {userDetails?.defaultaddress?.area}
                    </Text>
                    {cardDetails?.delivery_time && (
                      <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 14 }}>
                        {cardDetails?.delivery_time} {t('cartPage.mins')}
                      </Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('AddressChoose', {
                      getCartItem: getCartItems,
                      profile: userData,
                      useWallet: setUseWallet,
                      type: 'Cart',
                    });
                  }}
                  style={{
                    borderWidth: 2,
                    borderColor: PrimaryGreen,
                    borderRadius: 30,
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Bold',
                      fontSize: 12,
                      color: '#09b44d',
                      padding: 7,
                    }}>
                    {t('cartPage.changeAddress')}
                  </Text>
                </TouchableOpacity>
              </View>
              {!!cardDetails?.isSingleAdvanceOrderCook && (
                <>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Regular',
                      fontSize: 11,
                      color: 'tomato',
                      paddingHorizontal: 5,
                      marginLeft: 5,
                    }}>
                    {cardDetails.advanceOrderNote}
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: 20,
                      justifyContent: 'space-between',
                      flexDirection: 'row',
                      marginTop: 5,
                    }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: 'Poppins-Bold',
                        color: '#000',
                      }}>
                      Select desired delivery date
                    </Text>
                  </View>
                  <View
                    style={{
                      maxWidth: '60%',
                      justifyContent: 'center',
                      padding: 5,
                      paddingVertical: 10,
                      //   alignItems: 'center',
                      flexDirection: 'row',
                      marginHorizontal: 10,
                      backgroundColor: '#fff',
                      elevation: 3,
                      borderRadius: 15,
                      marginBottom: 15,
                    }}>
                    <Animated.View
                      style={{
                        transform: [{ translateX: shakeAnimation }],
                      }}>
                      <TouchableOpacity
                        style={{
                          // width: '50%',
                          flexDirection: 'row',
                          borderRadius: 10,
                          borderWidth: 0.5,
                          borderColor: !!selectedDeliveryDate
                            ? PrimaryGreen
                            : 'tomato',
                          backfaceVisibility: SecondaryGreen,
                          paddingVertical: 3,
                          paddingHorizontal: 10,
                          justifyContent: 'center',
                          alignItems: 'center',
                          // marginBottom: 15,
                        }}
                        onPress={() => setShowDatePicker(true)}>
                        <Text
                          style={{
                            color: !!selectedDeliveryDate
                              ? PrimaryGreen
                              : 'tomato',
                            fontFamily: 'Poppins-Bold',
                            fontSize: 15,
                          }}>
                          {!!selectedDeliveryDate
                            ? moment(selectedDeliveryDate).format(
                              'DD-MMMM-YYYY',
                            )
                            : moment().format('DD-MMMM-YYYY')}
                        </Text>
                        <Image
                          source={calendar}
                          style={{
                            width: 20,
                            height: 20,
                            marginLeft: 10,
                            tintColor: !!selectedDeliveryDate
                              ? PrimaryGreen
                              : 'tomato',
                          }}
                        />
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                  {showDatePicker && (
                    <Portal>
                      <PaperModal
                        visible={showDatePicker}
                        onDismiss={() => setShowDatePicker(false)}
                        contentContainerStyle={{
                          width: '100%',
                          justifyContent: 'center',
                          alignItems: 'center',
                          zIndex: 5,
                        }}>
                        <View
                          style={{
                            width: '60%',
                            alignItems: 'flex-start',
                            backgroundColor: '#fff',
                            paddingHorizontal: 25,
                            paddingVertical: 25,
                            borderRadius: 10,
                          }}>
                          {cardDetails.next7days.map((item, index) => {
                            return (
                              <>
                                <TouchableOpacity
                                  style={{
                                    width: '100%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    paddingVertical: 3,
                                    marginVertical: 5,
                                    borderRadius: 10,
                                    backgroundColor: SecondaryGreen,
                                  }}
                                  onPress={() => dateSelect(item)}>
                                  <Text
                                    style={{
                                      fontFamily: 'Poppins-Medium',
                                    }}>
                                    {moment(item).format('DD-MMMM-YYYY')}
                                  </Text>
                                </TouchableOpacity>
                              </>
                            );
                          })}
                          {/* <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginBottom: 10,
                            }}>
                            <Text style={{fontFamily: 'Poppins-Bold'}}>
                              Tiffen
                            </Text>
                            <Text></Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginBottom: 10,
                            }}>
                            <Text style={{fontFamily: 'Poppins-Bold'}}>
                              Lunch
                            </Text>
                            <Text></Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginBottom: 10,
                            }}>
                            <Text style={{fontFamily: 'Poppins-Bold'}}>
                              Dinner
                            </Text>
                            <Text></Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginBottom: 10,
                            }}>
                            <Text style={{fontFamily: 'Poppins-Bold'}}>
                              Beverages
                            </Text>
                            <Text></Text>
                          </View> */}
                        </View>
                      </PaperModal>
                    </Portal>
                  )}
                </>
              )}
            </ScrollView>
            {
              cardDetails?.cook?.status == 1 &&
                cardDetails?.cook?.current_status == 1 &&
                cardDetails.remove_status == 1 &&
                cardDetails.delivery_boy_status != 0 &&
                !!cardDetails.isServicable ? (
                <View>
                  {showCheckout && (
                    <TouchableOpacity
                      style={{
                        width: '100%',
                        backgroundColor: PrimaryGreen,
                        borderTopLeftRadius: 25,
                        borderTopRightRadius: 25,
                        height: 60,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingHorizontal: 25,
                      }}
                      onPress={
                        !!cardDetails?.isSingleAdvanceOrderCook
                          ? singleAdvanceOrderCheckout
                          : checkOut
                      }>
                      <Text
                        style={{
                          color: '#fff',
                          fontFamily: 'Poppins-Bold',
                          fontSize: 16,
                        }}>
                        ₹{cardDetails.transaction_amount}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          padding: 3,
                          height: 45,
                          borderRadius: 7,
                          width: 140,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <Text
                          style={{
                            color: '#fff',
                            fontFamily: 'Poppins-Bold',
                            fontSize: 16,
                            marginRight: 10,
                          }}>
                          {t('cartPage.checkOut')}
                        </Text>
                        <Image
                          source={cartIcon}
                          style={{ width: 23, height: 20, tintColor: '#fff' }}
                        />
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                // <View>
                <View
                  style={{
                    width: '100%',
                    backgroundColor: '#09b44d',
                    // marginBottom: 50,
                    borderTopLeftRadius: 25,
                    borderTopRightRadius: 25,
                    height: 60,
                    alignItems: 'center',
                    paddingHorizontal: 25,
                    justifyContent: 'center',
                  }}>
                  {/* {//console.log("isServicableisServicableisServicableisServicable", cardDetails?.isServicable)} */}
                  <Text
                    style={{
                      color: '#fff',
                      fontFamily: 'Poppins-Bold',
                      fontSize: 16,
                    }}>
                    {cardDetails.remove_status == 0
                      ? `Remove unavailable items \n`
                      : null}
                    {cardDetails?.cook?.status != 1 ||
                      cardDetails?.cook?.current_status != 1
                      ? `Cook isn't available ! \n`
                      : null}
                    {cardDetails.delivery_boy_status == 0 ||
                      cardDetails?.isServicable == false
                      ? `Delivery service unavailable`
                      : null}
                  </Text>
                </View>
              )

              // </View>
            }
          </SafeAreaView>
        ) : (
          modal != true && (
            <>
              <View
                style={{
                  flex: 1,
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Image
                  style={{ height: 100, width: 100, alignItems: 'center' }}
                  source={emptyCartIcon}
                />
                <Text
                  style={{
                    textAlign: 'center',
                    fontFamily: 'Poppins-Bold',
                    fontSize: 14,
                    opacity: 0.25,
                  }}>
                  Your Instant Order Cart is Empty!
                </Text>
              </View>
            </>
          )
        )}
      </>
    );
  };

  const PreOrderCart = () => {
    // //console.log("preordercartdetails,", preOrderCartDetails);
    return (
      <>
        {!!preOrderCartDetails?.cart_date_time.length ? (
          // <SafeAreaView style={{ flex: 1, position: 'relative', }}>
          //     <StatusBar backgroundColor={HomeBgColor} barStyle="dark-content" />
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ marginTop: 10 }}>
              <View style={{ width: '100%' }}>
                <Text
                  style={{
                    fontSize: 18,
                    marginTop: 5,
                    fontFamily: 'Poppins-Bold',
                    color: '#000',
                  }}>
                  Order Summary
                </Text>
                <>
                  {preOrderCartDetails?.cart_date_time &&
                    preOrderCartDetails?.cart_date_time?.map((item, index) => {
                      //console.log("menuuuuuu", item);
                      const menu_list = JSON.parse(item?.menu_list);
                      return (
                        <>
                          <View style={{ width: '95%', alignSelf: 'center' }}>
                            {/* <View> */}
                            {menu_list && (
                              <>
                                <Text
                                  style={{
                                    fontSize: 14,
                                    fontFamily: 'Poppins-Regular',
                                    color: '#000',
                                    marginTop: 10,
                                  }}>{`Cart Item on ${item?.pre_order_date} and ${item?.pre_order_time}`}</Text>
                                {/* </View> */}
                                {menu_list?.map(menu => {
                                  //console.log("menuuuuuu each", menu);
                                  return (
                                    <>
                                      <View
                                        style={{
                                          flexDirection: 'row',
                                          width: '100%',
                                          backgroundColor: 'linen',
                                          marginVertical: 3,
                                          borderRadius: 7,
                                          elevation: 2,
                                          marginRight: 10,
                                        }}>
                                        <Image
                                          source={{ uri: menu?.food_image }}
                                          style={{
                                            width: '15%',
                                            height: 60,
                                            backgroundColor: 'ghostwhite',
                                            borderTopLeftRadius: 7,
                                            borderBottomLeftRadius: 7,
                                          }}
                                        />
                                        <View
                                          style={{
                                            width: '85%',
                                            justifyContent: 'space-between',
                                            paddingRight: 5,
                                          }}>
                                          <Text
                                            style={{
                                              paddingLeft: 10,
                                              fontFamily: 'Poppins-Medium',
                                              fontSize: 14,
                                            }}>
                                            {menu?.name}
                                          </Text>
                                          <View
                                            style={{
                                              flexDirection: 'row',
                                              width: '95%',
                                              justifyContent: 'space-between',
                                              alignSelf: 'center',
                                              alignItems: 'center',
                                            }}>
                                            <AddButton
                                              cartId={item?.cartId}
                                              pre_order_date={
                                                item?.pre_order_date
                                              }
                                              pre_order_time={
                                                item?.pre_order_time
                                              }
                                              menu={menu}
                                              menu_list_length={
                                                menu_list.length
                                              }
                                            />
                                            <Text
                                              style={{
                                                paddingLeft: 10,
                                                fontFamily: 'Poppins-Medium',
                                                fontSize: 14,
                                              }}>{`₹  ${menu?.final_price * menu?.quantity
                                                }`}</Text>
                                          </View>
                                        </View>
                                      </View>
                                    </>
                                  );
                                })}
                              </>
                            )}
                          </View>
                        </>
                      );
                    })}
                </>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginHorizontal: 15,
                  marginTop: 20,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Image
                    source={walletIcon}
                    style={{
                      width: 18,
                      height: 13,
                      resizeMode: 'stretch',
                      tintColor: '#000',
                      marginRight: 5,
                    }}
                  />
                  <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 14 }}>
                    {`Use Wallet  `}
                  </Text>
                  <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 14 }}>
                    {`( ₹ ${!!preOrderCartDetails?.wallet_bal
                      ? preOrderCartDetails?.wallet_bal
                      : !!preOrderCartDetails?.wallet?.balence
                        ? preOrderCartDetails?.wallet?.balence
                        : 0
                      })`}
                  </Text>
                </View>
                <CheckBox
                  value={useWalletPO}
                  onValueChange={e => {
                    // //console.log("ranjith", e);
                    setUseWalletPO(e);
                  }}
                  tintColors={{ false: 'black' }}
                />
              </View>

              <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
                <Text
                  style={{
                    fontFamily: 'Poppins-Regular',
                    fontSize: 12,
                    marginLeft: 15,
                    color: PrimaryGreen,
                  }}>
                  + add amount
                </Text>
              </TouchableOpacity>
              <View
                style={{
                  paddingHorizontal: 20,
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'Poppins-Bold',
                    color: '#000',
                    paddingTop: 10,
                  }}>
                  Bill Details
                </Text>
              </View>
              <View
                style={{
                  marginHorizontal: 10,
                  borderRadius: 7,
                  backgroundColor: '#fff',
                  elevation: 3,
                  paddingTop: 20,
                }}>
                <View
                  style={{
                    paddingHorizontal: 20,
                    borderBottomColor: '#d5e7dd',
                    borderBottomWidth: 1,
                  }}>
                  <View
                    style={{
                      justifyContent: 'space-between',
                      flexDirection: 'row',
                      marginBottom: 10,
                    }}>
                    <View>
                      <Text
                        style={{
                          fontSize: 14,
                          // marginBottom: 5,
                          fontFamily: 'Poppins-Medium',
                          color: '#000',
                        }}>
                        Item Total
                      </Text>
                      {!!preOrderCartDetails?.discountAmount && (
                        <View
                          style={{
                            justifyContent: 'space-between',
                            flexDirection: 'row',
                            // marginBottom: 15,
                          }}>
                          <Text
                            style={{
                              fontSize: 12,
                              // marginBottom: 5,
                              fontFamily: 'Poppins-Regular',
                              color: '#2b2b2b',
                            }}>
                            {`Discount  ${preOrderCartDetails?.flatDiscountValueText
                              ? '(' +
                              preOrderCartDetails?.flatDiscountValueText +
                              ')'
                              : ''
                              }`}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                      {!!preOrderCartDetails?.discountAmount &&
                        !!preOrderCartDetails?.totalAfterDiscount && (
                          <Text
                            style={{
                              fontSize: 12,
                              marginBottom: 5,
                              fontFamily: 'Poppins-Medium',
                              color: '#ff4b4b',
                              textDecorationLine: 'line-through',
                              textDecorationColor: '#000',
                            }}>
                            ₹ {preOrderCartDetails?.item_amount}
                          </Text>
                        )}
                      <Text
                        style={{
                          fontSize: 14,
                          marginBottom: 5,
                          fontFamily: 'Poppins-Medium',
                          color: '#000',
                          marginLeft: 10,
                        }}>
                        ₹{' '}
                        {preOrderCartDetails?.totalAfterDiscount
                          ? preOrderCartDetails?.totalAfterDiscount
                          : preOrderCartDetails?.item_amount}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      justifyContent: 'space-between',
                      flexDirection: 'row',
                      marginBottom: 10,
                    }}>
                    <Text
                      style={{
                        fontSize: 14,
                        marginBottom: 5,
                        fontFamily: 'Poppins-Medium',
                        color: '#000',
                      }}>
                      Delivery Charge
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        marginBottom: 5,
                        fontFamily: 'Poppins-Medium',
                        color: '#000',
                      }}>
                      + ₹ {preOrderCartDetails?.shipping_amount}
                    </Text>
                  </View>
                  <View
                    style={{
                      justifyContent: 'space-between',
                      flexDirection: 'row',
                      marginBottom: 10,
                    }}>
                    <Text
                      style={{
                        fontSize: 14,
                        marginBottom: 5,
                        fontFamily: 'Poppins-Medium',
                        color: '#000',
                      }}>
                      Taxes & Charges
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        marginBottom: 5,
                        fontFamily: 'Poppins-Medium',
                        color: '#000',
                      }}>
                      + ₹ {preOrderCartDetails?.gstTotal}
                    </Text>
                  </View>
                  {!!preOrderCartDetails?.wallet_deduct_amount && (
                    <>
                      <View
                        style={{
                          justifyContent: 'space-between',
                          flexDirection: 'row',
                          marginBottom: 10,
                        }}>
                        <Text
                          style={{
                            fontSize: 14,
                            marginBottom: 5,
                            fontFamily: 'Poppins-Medium',
                            color: '#29C270',
                          }}>
                          Deduction From Wallet
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            marginBottom: 5,
                            fontFamily: 'Poppins-Medium',
                            color: '#29C270',
                          }}>
                          - ₹ {preOrderCartDetails?.wallet_deduct_amount}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
                <View
                  style={{
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    marginBottom: 15,
                    borderColor: '#d5e7dd',
                    padding: 15,
                    paddingBottom: 0,
                  }}>
                  <Text
                    style={{
                      fontSize: 14,
                      marginBottom: 5,
                      fontFamily: 'Poppins-Bold',
                      color: '#000',
                    }}>
                    TOTAL AMOUNT
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      marginBottom: 5,
                      fontFamily: 'Poppins-Bold',
                      color: '#000',
                    }}>
                    ₹ {preOrderCartDetails?.transaction_amount}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  paddingHorizontal: 20,
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  marginTop: 10,
                }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: 'Poppins-Bold',
                    color: '#000',
                    paddingTop: 18,
                  }}>
                  {t('cartPage.deliveryAddress')}
                </Text>
              </View>
              <View
                style={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexDirection: 'row',
                  padding: 15,
                  marginHorizontal: 10,
                  backgroundColor: '#fff',
                  elevation: 3,
                  borderRadius: 15,
                  marginBottom: 15,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    width: '60%',
                  }}>
                  <View style={{ marginLeft: 10 }}>
                    <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 14 }}>
                      {t('cartPage.deliverTo')}{' '}
                      {userDetails?.defaultaddress?.type}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Poppins-Medium',
                        fontSize: 14,
                        paddingVertical: 4,
                        // width: "100%",
                      }}
                      numberOfLines={3}>
                      {userDetails?.defaultaddress?.street}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('AddressChoose', {
                      getCartItem: getCartItems,
                      profile: userData,
                      useWallet: setUseWallet,
                      type: 'Cart',
                    });
                  }}
                  style={{
                    borderWidth: 2,
                    borderColor: PrimaryGreen,
                    borderRadius: 30,
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Bold',
                      fontSize: 12,
                      color: '#09b44d',
                      padding: 7,
                    }}>
                    {t('cartPage.changeAddress')}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            {
              showCheckout && (
                <TouchableOpacity
                  onPress={() =>
                    preOrderCartDetails?.orderTaken == 1
                      ? preOrderCheckout()
                      : null
                  }
                  style={{
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
                  {preOrderCartDetails?.orderTaken == 1 ? (
                    <>
                      <Text
                        style={{
                          color: '#fff',
                          fontFamily: 'Poppins-Bold',
                          fontSize: 16,
                        }}>
                        ₹{preOrderCartDetails?.transaction_amount}
                      </Text>
                      <View style={{ flexDirection: 'row' }}>
                        <Text
                          style={{
                            color: '#fff',
                            fontFamily: 'Poppins-Bold',
                            fontSize: 16,
                            marginRight: 10,
                          }}>
                          {' '}
                          Check Out
                        </Text>
                        <Image
                          source={cartIcon}
                          style={{ width: 23, height: 20, tintColor: '#fff' }}
                        />
                      </View>
                    </>
                  ) : (
                    <View>
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: 'Poppins-Bold',
                          color: '#fff',
                        }}>
                        Delivery Distance too high, can't Checkout.
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: 'Poppins-Bold',
                          color: '#fff',
                        }}>
                        Please Change the Address
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )
              // </View>
            }
          </>
        ) : (
          // </SafeAreaView>
          <>
            <View
              style={{
                flex: 1,
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Image
                style={{ height: 100, width: 100, alignItems: 'center' }}
                source={emptyCartIcon}
              />
              <Text
                style={{
                  textAlign: 'center',
                  fontFamily: 'Poppins-Bold',
                  fontSize: 14,
                  opacity: 0.25,
                }}>
                Your Advance Order Cart is Empty!
              </Text>
            </View>
          </>
        )}
      </>
    );
  };

  // //console.log("params from cart page", route.params);

  const getPaymentmethods = async () => {
    const response = await api.paymentMethods();
    console.log("paymentMethods", response);
    if (response.status == 'success') {
      setPaymentMethods(response.paymentMethods);
    }
  };
  useEffect(() => {
    getPaymentmethods();
  }, []);

  const PaymentMethods = () => {
    const setMode = async (type) => {
      if (type == 'razorpay') {
        changeWallet();
        setPaymentMode('razorpay');
      } else if (type == 'wallet') {
        setPaymentMode('wallet');
        changeWallet('wallet');
      } else if (type == 'podQr') {
        changeWallet();
        setPaymentMode('podQr');
      } else if (type == 'podCash') {
        changeWallet();
        setPaymentMode('podCash');
      } else;

    }
    return (<>
      <View>
        {paymentMethods.flatMap(item => {
          return (<>
            <TouchableOpacity
              key={item.payment_type}
              onPress={() => { setMode(item.payment_type) }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginHorizontal: 15,
                marginVertical: 5,
                backgroundColor:
                  paymentMode == item.payment_type ? SecondaryGreen : '#fff',
                padding: 10,
                borderRadius: 7,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Image
                  source={card}
                  style={{
                    width: 18,
                    height: 18,
                    resizeMode: 'stretch',
                    tintColor: '#000',
                    marginRight: 10,
                  }}
                />
                <Text
                  style={{
                    fontFamily: 'Poppins-Bold',
                    fontSize: 14,
                  }}>
                  {item.display_name}
                  <Text
                    style={{
                      fontFamily: 'Poppins-Regular',
                      fontSize: 12,
                      color: PrimaryGreen,
                      marginLeft: 10,
                    }}>{`   ${item.description}`}</Text>
                </Text>
              </View>
              {/* <CheckBox
                      value={useWallet}
                      onValueChange={changeWallet}
                      tintColors={{false: 'black'}}
                    /> */}
            </TouchableOpacity>
            {useWallet && item.payment_type == 'wallet' && (
              <View style={{ flexDirection: 'row' }}>
                <Text
                  style={{
                    fontFamily: 'Poppins-Regular',
                    fontSize: 12,
                    marginLeft: 5,
                  }}>
                  {`  (Balance:   ₹ ${!!cardDetails?.wallet_bal
                    ? cardDetails.wallet_bal.toString()
                    : 0
                    })   `}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Wallet')}>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Regular',
                      fontSize: 12,
                      marginLeft: 5,
                      color: PrimaryGreen,
                    }}>
                    + add amount
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>)
        })}
      </View>
    </>);
  }
  return (
    <SafeAreaView style={{ height: '100%', backgroundColor: HomeBgColor }}>
      <StatusBar backgroundColor="#09B44D" barStyle={'light-content'} />
      {preOrderCart ? (
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            width: '100%',
            height: 30,
            paddingTop: 5,
          }}
          onPress={() => navigation.goBack()}>
          <Image
            source={backButton}
            style={{
              width: 24,
              aspectRatio: 1,
              marginLeft: 15,
              tintColor: PrimaryGreen,
            }}
          />
          <Text
            style={{ fontFamily: 'Poppins-Bold', fontSize: 16, marginLeft: 10 }}>
            Advance Order cart
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            width: '100%',
            height: 30,
            paddingTop: 5,
          }}
          onPress={() => navigation.goBack()}>
          <Image
            source={backButton}
            style={{
              width: 24,
              aspectRatio: 1,
              marginLeft: 15,
              tintColor: PrimaryGreen,
            }}
          />
          <Text
            style={{ fontFamily: 'Poppins-Bold', fontSize: 16, marginLeft: 10 }}>
            {cardDetails?.cook?.first_name
              ? cardDetails?.cook?.first_name
              : 'Cart Page'}
          </Text>
        </TouchableOpacity>
      )}
      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          height: 50,
          marginTop: 10,
          justifyContent: 'space-evenly',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: !preOrderCart ? '#29C270' : '#000',
            borderRadius: 10,
            height: 40,
            width: '40%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setPreOrderCart(false)}>
          <Text
            style={{
              color: !preOrderCart ? '#29C270' : '#000',
              fontFamily: 'Poppins-Bold',
              fontSize: 18,
            }}>
            Instant
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: preOrderCart ? '#29C270' : '#000',
            borderRadius: 10,
            height: 40,
            width: '40%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setPreOrderCart(true)}>
          <Text
            style={{
              color: preOrderCart ? '#29C270' : '#000',
              fontFamily: 'Poppins-Bold',
              fontSize: 16,
            }}>
            Advance Order
          </Text>
        </TouchableOpacity>
      </View>
      {preOrderCart ? <PreOrderCart /> : <InstantOrderCart />}
      {/* {route?.params?.type ?
                <View
                    style={{
                        // flexDirection: 'row',
                        // alignItems: 'center',
                        // backgroundColor: '#09b44d',
                        // height: 60,
                        // borderBottomLeftRadius: 25,
                        // borderBottomRightRadius: 25,
                        // alignItems: 'center',
                    }}>

                    <TouchableOpacity
                        onPress={() => {
                            if (route.params) {
                                route?.params?.callBackFun();
                                route?.params?.profile();
                                navigation.goBack();
                            } else {
                                navigation.goBack();
                            }
                        }}
                        style={{
                            paddingHorizontal: 15,
                            paddingVertical: 15,
                        }}>
                        <Image style={{ width: 9, height: 16 }} source={arrow} />
                    </TouchableOpacity>

                    <TouchableOpacity>
                        <Text style={[styles.pageTitle, { alignItems: 'center' }]}>Cart</Text>
                    </TouchableOpacity>
                </View>
                :
                <View
                    style={{
                        // backgroundColor: '#09b44d',
                        // borderBottomLeftRadius: 25,
                        // borderBottomRightRadius: 25,
                        // justifyContent: 'center',
                        // height: 60
                    }}>
                    <View
                        onPress={() => navigation.goBack()}
                        style={{
                            flexDirection: 'row',
                            paddingHorizontal: 15,
                        }}>
                        <Text style={{
                            color: '#fff',
                            fontSize: 18,
                            fontFamily: 'Poppins-Bold',
                            paddingLeft: 10

                        }}>Cart</Text>
                    </View>
                </View>
            } */}

      <View >
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

export default Cart;
