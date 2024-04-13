import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'

export const CustomAlert = ({ title, description, buttons }) => {
    return (
        <>
            <View style={{ width: '100%', height: '100%', position: 'absolute', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
                <View style={{ width: '100%', height: '100%', backgroundColor: "#000", opacity: 0.5 }} />
                <View style={{ width: '75%', position: 'absolute', zIndex: 99999, backgroundColor: '#fff', borderRadius: 10, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={[{ fontWeight: 'bold', fontSize: 18, color: '#000', paddingBottom: 10, paddingTop: 20 }, title?.style]}>{title?.text}</Text>
                    <Text numberOfLines={2} style={[{ width: '90%', textAlign: 'center', fontSize: 16, color: '#000', paddingVertical: 7 }, description?.style]}>{description?.text}</Text>
                    {buttons?.length > 0 && (
                        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-evenly', alignItems: 'center', paddingVertical: 10 }}>
                            {buttons?.map((item, index) => {
                                return (
                                    <>
                                        <TouchableOpacity onPress={item?.onPress} style={{ width: '49%', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={[{ color: '#000', fontSize: 16 }, item?.style]}>{item?.text}</Text>
                                        </TouchableOpacity>
                                        {index != buttons.length - 1 && <View style={{ height: 20, width: 1, backgroundColor: '#989898' }} />}
                                    </>
                                )
                            })}
                        </View>)}
                </View>
            </View>
        </>
    )
}
