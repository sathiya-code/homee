/**
 * @format
 */

// Shim ViewPropTypes for libraries still referencing it (removed in RN 0.73)
if (!require('react-native').ViewPropTypes) {
  Object.defineProperty(require('react-native'), 'ViewPropTypes', {
    get: () => {
      console.warn(
        'ViewPropTypes will be removed from React Native. Migrate to deprecated-react-native-prop-types.',
      );
      return require('deprecated-react-native-prop-types').ViewPropTypes;
    },
  });
}

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import 'react-native-gesture-handler';

import './src/translations/i18n';

AppRegistry.registerComponent(appName, () => App);
