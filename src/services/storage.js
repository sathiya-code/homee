import AsyncStorage from '@react-native-async-storage/async-storage'
import { CART_STATUS, COUPON_CODE, PROFILE, TOKEN, OLD_USER, LOCATION_DIFF } from '../redux/actions/actionTypes';
let user_data = {};
export const setToken = async (data = user_data) => {
    try {
        const res = await AsyncStorage.setItem(TOKEN, data);
        return res;
    } catch (err) {
    }
}
export const getToken = async state => {
    try {
        let res = await AsyncStorage.getItem(TOKEN);
        return res;
    } catch (err) {
        return state;
    }
}
export const setUserData = async (data = user_data) => {
    try {
        await AsyncStorage.setItem(PROFILE, JSON.stringify(data));
        return data;
    } catch (err) {
    }
}
export const getUserData = async () => {
    try {
        const res = await AsyncStorage.getItem(PROFILE);
        return res ? JSON.parse(res) : null;
    } catch (err) {
    }
}
export const setCartStatus = async (data = user_data) => {
    try {
        await AsyncStorage.setItem(CART_STATUS, JSON.stringify(data));
        return data;
    } catch (err) {
    }
}
export const getCartStatus = async () => {
    try {
        const res = await AsyncStorage.getItem(CART_STATUS);
        return res ? JSON.parse(res) : null;
    } catch (err) {
    }
}
export const setCouponCode = async (data = user_data) => {
    try {
        await AsyncStorage.setItem(COUPON_CODE, JSON.stringify(data));
        return data;
    } catch (err) {
    }
}
export const getCouponCode = async () => {
    try {
        const res = await AsyncStorage.getItem(COUPON_CODE);
        return res ? JSON.parse(res) : null;
    } catch (err) {
    }
}
export const clearAsyncStorage = async () => {
    await AsyncStorage.clear();
}
export const setIsOldUser = async (data) => {
    try {
        const strVal = typeof data === 'string' ? data : JSON.stringify(data);
        await AsyncStorage.setItem(OLD_USER, strVal);
        return data;
    } catch (err) {
    }
}

export const getIsOldUser = async () => {
    try {
        const res = await AsyncStorage.getItem(OLD_USER);
        return res;
    } catch (err) {
    }
};
export const setDiffLocationAlert = async (data) => {
    try {
        const strVal = typeof data === 'string' ? data : JSON.stringify(data);
        await AsyncStorage.setItem(LOCATION_DIFF, strVal);
        return data;
    } catch (err) {
    }
}

export const getDiffLocationAlert = async () => {
    try {
        const res = await AsyncStorage.getItem(LOCATION_DIFF);
        return res;
    } catch (err) {
    }
};


export const removeUnAuth = async () => {
    try {
        AsyncStorage.removeItem(COUPON_CODE);
        AsyncStorage.removeItem(TOKEN);
        AsyncStorage.removeItem(PROFILE);
    } catch (err) {

    }
}