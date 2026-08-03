import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native/Libraries/Utilities/Appearance', () => ({
  getColorScheme: jest.fn(() => 'light'),
  addChangeListener: jest.fn(() => ({ remove: jest.fn() })),
  removeChangeListener: jest.fn(),
}));

jest.mock('react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo', () => ({
  isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
  isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
  setAccessibilityFocus: jest.fn(),
  announceForAccessibility: jest.fn(),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  removeEventListener: jest.fn(),
}));

jest.mock('@react-navigation/native/lib/commonjs/useBackButton.native', () => ({
  __esModule: true,
  default: () => {},
}));

jest.mock('@react-navigation/native/lib/commonjs/useLinking.native', () => ({
  __esModule: true,
  default: () => ({ getInitialState: () => Promise.resolve(undefined) }),
}));

jest.mock('react-native-paper/lib/commonjs/utils/addEventListener', () => ({
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  addListener: jest.fn(() => ({ remove: jest.fn() })),
}));

const patchRN = () => {
  try {
    const RN = require('react-native');
    if (RN.StyleSheet && !RN.StyleSheet.flatten) {
      RN.StyleSheet.flatten = (style) => (Array.isArray(style) ? Object.assign({}, ...style) : style || {});
    }
    if (RN.BackHandler) {
      try {
        Object.defineProperty(RN.BackHandler, 'addEventListener', {
          value: jest.fn(() => ({ remove: jest.fn() })),
          writable: true,
          configurable: true,
        });
      } catch (e) {
        RN.BackHandler.addEventListener = jest.fn(() => ({ remove: jest.fn() }));
      }
    }
    if (RN.Appearance) {
      try {
        Object.defineProperty(RN.Appearance, 'addChangeListener', {
          value: jest.fn(() => ({ remove: jest.fn() })),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(RN.Appearance, 'removeChangeListener', {
          value: jest.fn(),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(RN.Appearance, 'getColorScheme', {
          value: jest.fn(() => 'light'),
          writable: true,
          configurable: true,
        });
      } catch (e) {
        RN.Appearance.addChangeListener = jest.fn(() => ({ remove: jest.fn() }));
      }
    }
    if (RN.Linking) {
      try {
        Object.defineProperty(RN.Linking, 'addEventListener', {
          value: jest.fn(() => ({ remove: jest.fn() })),
          writable: true,
          configurable: true,
        });
      } catch (e) {
        RN.Linking.addEventListener = jest.fn(() => ({ remove: jest.fn() }));
      }
    }
    if (RN.AccessibilityInfo) {
      try {
        Object.defineProperty(RN.AccessibilityInfo, 'addEventListener', {
          value: jest.fn(() => ({ remove: jest.fn() })),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(RN.AccessibilityInfo, 'isReduceMotionEnabled', {
          value: jest.fn(() => Promise.resolve(false)),
          writable: true,
          configurable: true,
        });
      } catch (e) {
        RN.AccessibilityInfo.addEventListener = jest.fn(() => ({ remove: jest.fn() }));
      }
    }
  } catch (e) {}
};

patchRN();
beforeEach(() => {
  patchRN();
});


jest.mock('react-native-paper', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Actual = jest.requireActual('react-native-paper');
  const ProviderMock = (props) => React.createElement(View, props, props.children);
  return {
    ...Actual,
    Provider: ProviderMock,
    PaperProvider: ProviderMock,
    Modal: (props) => (props.visible ? React.createElement(View, props, props.children) : null),
  };
});
jest.mock('@react-navigation/stack', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    createStackNavigator: () => ({
      Navigator: ({ children }) => React.createElement(View, null, children),
      Screen: ({ component, children }) => {
        if (component) return React.createElement(component);
        return React.createElement(View, null, children);
      },
    }),
  };
});

jest.mock('@react-navigation/bottom-tabs', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    createBottomTabNavigator: () => ({
      Navigator: ({ children }) => React.createElement(View, null, children),
      Screen: ({ component, children }) => {
        if (component) return React.createElement(component);
        return React.createElement(View, null, children);
      },
    }),
  };
});

import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('@react-native-firebase/messaging', () => () => ({
  onMessage: jest.fn(() => jest.fn()),
  getToken: jest.fn(() => Promise.resolve('mock-fcm-token')),
  requestPermission: jest.fn(() => Promise.resolve(1)),
}));

jest.mock('react-native-push-notification', () => ({
  configure: jest.fn(),
  createChannel: jest.fn(),
  localNotification: jest.fn(),
}));

jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  wrap: (component) => component,
  captureException: jest.fn(),
}));

jest.mock('react-native-version-check', () => ({
  needUpdate: jest.fn(() => Promise.resolve({ isNeeded: false })),
}));

jest.mock('react-native-store-version', () => jest.fn(() => Promise.resolve({ result: 'equal' })));

jest.mock('@react-native-community/geolocation', () => ({
  addListener: jest.fn(),
  getCurrentPosition: jest.fn(),
  removeListeners: jest.fn(),
  requestAuthorization: jest.fn(),
  setConfiguration: jest.fn(),
  startObserving: jest.fn(),
  stopObserving: jest.fn(),
}));

jest.mock('react-native-geolocation-service', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  stopObserving: jest.fn(),
  requestAuthorization: jest.fn(),
}));

jest.mock('react-native-android-location-enabler', () => ({
  promptForEnableLocationIfNeeded: jest.fn(() => Promise.resolve('already-enabled')),
}));

jest.mock('react-native-location-enabler', () => ({
  isLocationEnabled: jest.fn(() => Promise.resolve(true)),
  promptForEnableLocationIfNeeded: jest.fn(() => Promise.resolve('already-enabled')),
}));

jest.mock('react-native-geocoding', () => ({
  init: jest.fn(),
  from: jest.fn(() => Promise.resolve({ results: [] })),
}));

jest.mock('react-native-google-places-autocomplete', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    GooglePlacesAutocomplete: (props) => React.createElement(View, props),
  };
});

jest.mock('react-native-radio-buttons-group', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Component = (props) => React.createElement(View, props, props.children);
  Component.default = Component;
  return Component;
});

jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockPicker = (props) => React.createElement(View, props, props.children);
  MockPicker.Item = (props) => React.createElement(View, props);
  return {
    Picker: MockPicker,
  };
}, { virtual: true });

jest.mock('react-native-element-dropdown', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Dropdown: (props) => React.createElement(View, props),
  };
}, { virtual: true });

jest.mock('react-native-text-gradient', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    LinearTextGradient: (props) => React.createElement(Text, props, props.children),
  };
}, { virtual: true });

jest.mock('react-native-date-picker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props) => React.createElement(View, props);
});

jest.mock('react-native-calendars', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Calendar: (props) => React.createElement(View, props),
  };
});

jest.mock('react-native-ratings', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Rating: (props) => React.createElement(View, props),
    AirbnbRating: (props) => React.createElement(View, props),
  };
});

jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    WebView: (props) => React.createElement(View, props),
  };
});

jest.mock('react-native-app-intro-slider', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props) => React.createElement(View, props);
});

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(() => Promise.resolve({})),
  launchImageLibrary: jest.fn(() => Promise.resolve({})),
}));

jest.mock('@rneui/base', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Tooltip: (props) => React.createElement(View, props, props.children),
    Icon: (props) => React.createElement(View, props),
  };
});

jest.mock('@rneui/themed', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Tooltip: (props) => React.createElement(View, props, props.children),
    Icon: (props) => React.createElement(View, props),
  };
});

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View: (props) => React.createElement(View, props),
      Text: (props) => React.createElement(View, props),
      Image: (props) => React.createElement(View, props),
      ScrollView: (props) => React.createElement(View, props),
      createAnimatedComponent: (component) => component,
      Value: jest.fn(),
      event: jest.fn(),
      add: jest.fn(),
      eq: jest.fn(),
      set: jest.fn(),
      cond: jest.fn(),
      interpolate: jest.fn(),
      Extrapolate: { CLAMP: 'clamp' },
    },
    useAnimatedStyle: jest.fn(() => ({})),
    useSharedValue: jest.fn((val) => ({ value: val })),
    withTiming: jest.fn((val) => val),
    withSpring: jest.fn((val) => val),
    interpolate: jest.fn(),
    Extrapolate: { CLAMP: 'clamp' },
  };
}, { virtual: true });

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockMapView = (props) => React.createElement(View, props, props.children);
  const MockMarker = (props) => React.createElement(View, props, props.children);
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
    PROVIDER_GOOGLE: 'google',
  };
});

jest.mock('react-native-maps-directions', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props) => React.createElement(View, props);
});

jest.mock('lottie-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props) => React.createElement(View, props);
});

jest.mock('react-native-fast-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Component = (props) => React.createElement(View, props);
  Component.resizeMode = {
    contain: 'contain',
    cover: 'cover',
    stretch: 'stretch',
    center: 'center',
  };
  Component.priority = {
    low: 'low',
    normal: 'normal',
    high: 'high',
  };
  return Component;
});

jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props) => React.createElement(View, props, props.children);
});

jest.mock('react-native-razorpay', () => ({
  open: jest.fn(() => Promise.resolve({})),
}));

jest.mock('react-native-otp-verify', () => ({
  getOtp: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
}));

jest.mock('react-native-device-info', () => ({
  getVersion: jest.fn(() => '1.0.0'),
  getBuildNumber: jest.fn(() => '1'),
}));

jest.mock('react-native-shimmer-placeholder', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props) => React.createElement(View, props, props.children);
});

jest.mock('react-native-snap-carousel', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props) => React.createElement(View, props, props.children);
});

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Component = (props) => React.createElement(View, props, props.children);
  return {
    __esModule: true,
    default: Component,
    BottomSheetView: Component,
    BottomSheetScrollView: Component,
    BottomSheetTextInput: Component,
    BottomSheetFlatList: Component,
    BottomSheetSectionList: Component,
    BottomSheetBackdrop: Component,
    useBottomSheet: () => ({ expand: jest.fn(), collapse: jest.fn(), close: jest.fn() }),
  };
});
