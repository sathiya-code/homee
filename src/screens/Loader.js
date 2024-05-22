import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';

const Loader = ({backgroundColour = null}) => (
  <View
    style={[
      styles.container,
      styles.horizontal,
      backgroundColour && backgroundColour,
    ]}>
    <ActivityIndicator size="large" color="#09b44d" />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
});

export default Loader;
