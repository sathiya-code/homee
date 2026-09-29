import React from 'react';
import {Marker} from 'react-native-maps';

const MyMarker = props => {
  const initMarker = ref => {};
  return <Marker ref={initMarker} {...props} />;
};

export default MyMarker;
