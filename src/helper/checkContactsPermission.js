import { PermissionsAndroid } from 'react-native';

export async function checkContactPermissionStatus() {
    try {
        const status = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_CONTACTS
        );

        if (status === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Contacts permission is already granted');
            // You can access contacts here
        } else {
            console.log('Contacts permission not granted', status);
            // You can request permission here
        }
    } catch (error) {
        console.error('Error checking contacts permission:', error);
    }
}


