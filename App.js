import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackNav from './src/Navigation/StackNav';
import axios from 'axios';
import { BASE_URL } from './src/services/constants';
import { Provider } from 'react-redux';
import configureStore from './src/redux/store';
axios.defaults.baseURL = BASE_URL;
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import ShowNotification from './src/utils/ShowNotification';
import {
  Alert,
  BackHandler,
  Linking,
  PermissionsAndroid,
  Platform,
  StatusBar,
} from 'react-native';
import { storage } from './src/services';
import VersionCheck from 'react-native-version-check';
import { FontConfig, PrimaryGreen } from './src/helper/styles.helper';
import {
  configureFonts,
  DefaultTheme,
  Provider as PaperProvider,
} from 'react-native-paper';
// import RNBootSplash from "react-native-bootsplash";
import * as Sentry from '@sentry/react-native';
import 'react-native-gesture-handler';
import './src/translations/i18n';
import { GetPndProvider } from './src/context/pnd.context';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
// RNBootSplash.getVisibilityStatus().then((status) => console.log("splashhhhhhhhhhhhhhhhhhhhhhhstatus", status));
// import deviceInfoModule from 'react-native-device-info';
// import checkVersion from 'react-native-store-version';

Sentry.init({
  dsn: 'https://8dce11f4bcf24d8bb3195f9f076f3363@o4504803234086912.ingest.sentry.io/4504803238674432',
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0,
  enableNative: false,
});
// const storeURL = 'https://play.google.com/store/apps/details?id=com.homeeuser';

// const inAppUpdates = new SpInAppUpdates(
//   true // isDebug
// );

// Sentry.nativeCrash();
const store = configureStore();
const createChannels = () => {
  PushNotification.createChannel({
    channelId: 'Homee_Foods',
    channelName: 'Homee_Foods',
  });
};

const isAndroid = Platform?.OS === 'android';
const checkApplicationPermission = () => {
  if (isAndroid) {
    try {
      PermissionsAndroid?.request?.(
        PermissionsAndroid?.PERMISSIONS?.POST_NOTIFICATIONS,
      )?.catch?.(() => {});
    } catch (error) { }
  }
};

const App = () => {
  const navigationRef = useRef(null);

  useEffect(() => {
    if (!__DEV__) {
      console.log = () => { };
    }
  }, []);

  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: PrimaryGreen,
      // accent: AccentColor,
    },
    fonts: configureFonts(FontConfig),
  };
  // const init = async () => {
  //   try {
  //     const check = await checkVersion({
  //       version: deviceInfoModule.getVersion(), // app local version
  //       iosStoreURL: 'ios app store url',
  //       androidStoreURL: storeURL,
  //       country: 'in', // default value is 'jp'
  //     });
  //     if (check.result === 'new') {
  //       Alert.alert(
  //         'Please Update',
  //         'You will have to update your app to the latest version to continue using.',
  //         [
  //           {
  //             text: 'Update',
  //             onPress: () => {
  //               // BackHandler.exitApp();
  //               Linking.openURL(storeURL);
  //             },
  //           },
  //         ],
  //         { cancelable: false },
  //       );
  //       // if app store version is new
  //     }
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  useEffect(() => {
    // checkVersion();
    // checkForLatestVer();
    // init();
  }, []);

  // const checkVersion = async () => {
  //   try {
  //     let updateNeeded = await VersionCheck.needUpdate();
  //     if (updateNeeded.isNeeded) {
  //       Alert.alert(
  //         'Please Update',
  //         'You will have to update your app to the latest version to continue using.',
  //         [
  //           {
  //             text: 'Update',
  //             onPress: () => {
  //               BackHandler.exitApp();
  //               Linking.openURL(updateNeeded.storeUrl);
  //             },
  //           },
  //         ],
  //         { cancelable: false },
  //       );
  //     }
  //   } catch (error) { }
  // };

  PushNotification.configure({
    onNotification: function (notification) {
      if (notification.userInteraction) {
        test(notification);
      }
    },
  });
  const test = async notification => {
    var id = await storage.getToken();
    if (id != null) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${id}` || '';
      if (notification?.path) {
        navigationRef.current.navigate(notification?.path);
      } else {
        navigationRef.current.navigate('Home');
      }
    } else {
      navigationRef.current.navigate('AppIntro');
    }
  };
  useEffect(() => {
    checkApplicationPermission();
    createChannels();
    const unsubscribe = messaging()?.onMessage?.(async remoteMessage => {
      await ShowNotification(remoteMessage);
    });
    return () => unsubscribe?.();
  }, []);

  return (
    <Provider store={store}>
      <PaperProvider>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: PrimaryGreen }} edges={['bottom', 'left', 'right', 'top']}>
            <GetPndProvider>
              <NavigationContainer ref={navigationRef}>
                <StatusBar backgroundColor="#09B44D" barStyle={'light-content'} />
                <StackNav />
              </NavigationContainer>
            </GetPndProvider>
          </SafeAreaView>
        </SafeAreaProvider>
      </PaperProvider>
    </Provider>
  );
};

// export default App;
export default Sentry.wrap(App);
