import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  Button,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Contacts from 'react-native-contacts';

const ContactsModal = ({visible, onRequestClose, selectedContact}) => {
  const [contacts, setContacts] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    setSearchText('');
  }, []);

  const contactsPermissionHandler = async () => {
    const contactPermission = await Contacts.checkPermission();
    // Contacts.PERMISSION_AUTHORIZED || Contacts.PERMISSION_UNDEFINED || Contacts.PERMISSION_DENIED
    if (contactPermission === 'undefined') {
      const request = await Contacts.requestPermission();
      console.log('request', request);
    }
    if (contactPermission === 'authorized') {
      console.log('authorizedauthorized');
      const data = await Contacts.getAllWithoutPhotos();
      // console.log("dataaaaaa", await data[0].phoneNumbers?.[0].number);
      const contactsArray = [];
      data?.forEach((contact, index) => {
        const name = contact?.displayName;
        const mobile = contact?.phoneNumbers?.[0]?.number
          .replace(/[\s-]+/g, '')
          .replace(' ', '');
        contact?.displayName == 'Saranya (c. f)' &&
          console.log('contacccccc', contact);
        const props = {name, mobile};
        if (!!mobile && mobile.length >= 10) {
          contactsArray.push(props);
        }
      });
      contactsArray.sort((a, b) => a.name.localeCompare(b.name));
      setContacts(contactsArray);
    }
    if (contactPermission === 'denied') {
      const request = await Contacts.requestPermission();
      console.log('request', request);
    }
  };

  useEffect(() => {
    contactsPermissionHandler();
  }, [searchText, setSearchText]);

  useEffect(() => {
    if (visible) {
      contactsPermissionHandler();
    }
  }, [visible]);

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onRequestClose}>
      <View>
        <Button
          title="Close Contacts"
          onPress={onRequestClose}
          color={'#09B44D'}
        />
        <View
          style={{
            flexDirection: 'row',
            borderWidth: 0.5,
            margin: 10,
            marginHorizontal: 20,
            borderRadius: 100,
            height: 40,
            paddingLeft: 15,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <TextInput
            placeholder="Search For Contact"
            style={{color: '#000', width: '80%'}}
            placeholderTextColor="#000"
            value={searchText}
            onChangeText={text => setSearchText(text)}
          />
          <Text
            style={{
              width: 25,
              height: 25,
              textAlign: 'center',
              padding: 3,
              borderRadius: 100,
              backgroundColor: 'tomato',
              color: '#fff',
              marginRight: 10,
            }}
            adjustsFontSizeToFit
            onPress={() => setSearchText('')}>
            X
          </Text>
        </View>
        <Text
          style={{
            fontFamily: 'Poppins-Bold',
            marginTop: 10,
            marginLeft: 5,
          }}>{`All Contacts - (${contacts.length})`}</Text>
        <FlatList
          data={contacts}
          keyExtractor={item => item.name.toString() + item.mobile.toString()}
          keyboardShouldPersistTaps={'always'}
          renderItem={({item}) => (
            <TouchableOpacity onPress={() => selectedContact(item?.mobile)}>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  borderRadius: 10,
                  borderWidth: 0.5,
                  borderColor: '#989898',
                  paddingVertical: 7,
                  paddingHorizontal: 10,
                  paddingRight: 25,
                  marginVertical: 3,
                  marginHorizontal: 10,
                  justifyContent: 'space-between',
                  alignSelf: 'center',
                }}>
                <Text
                  style={{
                    width: '60%',
                    fontFamily: 'Poppins-Bold',
                    fontSize: 14,
                  }}
                  numberOfLines={1}>
                  {item?.name}
                </Text>
                <Text style={{fontFamily: 'Poppins-Medium', fontSize: 14}}>
                  {item?.mobile}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
};

export default ContactsModal;
