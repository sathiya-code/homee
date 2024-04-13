import React, {useContext, useEffect, useState} from 'react';
import * as api from '../services/api';

export const PndContext = React.createContext(null);

export const GetPndProvider = props => {
  const [pickupAddressId, setPickupAddressId] = useState(null);
  const [dropAddressId, setDropAddressId] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropLocation, setDropLocation] = useState(null);

  useEffect(() => {
    (async () => {
      console.log('context pickupid', pickupAddressId);
      if (!!pickupAddressId) {
        const response = await api.getPndAddressById(pickupAddressId);
        console.log('context pickupid resposne', response);
        if (response.status == 'success')
          setPickupLocation(response.user_address);
      }
    })();
  }, [pickupAddressId, setPickupAddressId]);

  useEffect(() => {
    (async () => {
      console.log('context dropid', dropAddressId);
      if (!!dropAddressId) {
        const response = await api.getPndAddressById(dropAddressId);
        console.log('context dropid resposne', response);
        if (response.status == 'success')
          setDropLocation(response.user_address);
      }
    })();
  }, [dropAddressId, setDropAddressId]);

  return (
    <PndContext.Provider
      value={{
        pickupLocation,
        setPickupLocation,
        setPickupAddressId,
        dropLocation,
        setDropLocation,
        setDropAddressId,
      }}>
      {props.children}
    </PndContext.Provider>
  );
};
