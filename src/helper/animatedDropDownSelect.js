import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Animated,
    TextInput,
} from 'react-native';

// import { SelectListProps } from '..';

// type L1Keys = { key?: any; value?: any; disabled?: boolean | undefined }

const SelectList = ({
    setSelected,
    placeholder,
    placeholderLeftIcon,
    boxStyles,
    inputStyles,
    dropdownStyles,
    dropdownItemStyles,
    dropdownTextStyles,
    maxHeight,
    data,
    defaultOption,
    searchicon = false,
    arrowicon = false,
    closeicon = false,
    search = true,
    searchPlaceholder = "search",
    notFoundText = "No data found",
    disabledItemStyles,
    disabledTextStyles,
    onSelect = () => { },
    save = 'key',
    dropdownShown = false,
    fontFamily
}) => {

    const oldOption = React.useRef(null)
    const [_firstRender, _setFirstRender] = React.useState(true);
    const [dropdown, setDropdown] = React.useState(dropdownShown);
    const [selectedval, setSelectedVal] = React.useState("");
    const [selectedvalImg, setSelectedValImg] = React.useState("");
    const [height, setHeight] = React.useState(200)
    const animatedvalue = React.useRef(new Animated.Value(0)).current;
    const [filtereddata, setFilteredData] = React.useState(data)


    const slidedown = () => {
        setDropdown(true)
        Animated.timing(animatedvalue, {
            toValue: height,
            duration: 300,
            useNativeDriver: false,

        }).start()
    }
    const slideup = () => {

        Animated.timing(animatedvalue, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,

        }).start(() => setDropdown(false))
    }

    React.useEffect(() => {
        if (maxHeight)
            setHeight(maxHeight)
    }, [maxHeight])


    React.useEffect(() => {
        setFilteredData(data);
    }, [data])


    React.useEffect(() => {
        if (_firstRender) {
            _setFirstRender(false);
            return;
        }
        onSelect()
    }, [selectedval])


    React.useEffect(() => {
        if (!_firstRender && defaultOption && oldOption.current != defaultOption.key) {
            // oldOption.current != null
            oldOption.current = defaultOption.id
            setSelected(defaultOption.id);
            setSelectedVal(defaultOption.name);
            setSelectedValImg(defaultOption.icon);
        }
        if (defaultOption && _firstRender && defaultOption.id != undefined) {

            oldOption.current = defaultOption.id
            setSelected(defaultOption.id);
            setSelectedVal(defaultOption.name);
            setSelectedValImg(defaultOption.icon);
        }

    }, [defaultOption])

    React.useEffect(() => {
        if (!_firstRender) {
            if (dropdownShown)
                slidedown();
            else
                slideup();

        }

    }, [dropdownShown])



    return (
        <View>
            {
                (dropdown && search)
                    ?
                    <View style={[styles.wrapper, boxStyles]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            {
                                (!searchicon)
                                    ?
                                    <Image
                                        source={require('../assets/img/animatedDropDown/search.png')}
                                        resizeMode='contain'
                                        style={{ width: 20, height: 20, marginRight: 7 }}
                                    />
                                    :
                                    searchicon
                            }

                            <TextInput
                                placeholder={searchPlaceholder}
                                onChangeText={(val) => {
                                    let result = data.filter((item) => {
                                        val.toLowerCase();
                                        let row = item.name.toLowerCase()
                                        return row.search(val.toLowerCase()) > -1;
                                    });
                                    setFilteredData(result)
                                }}
                                style={[{ padding: 0, height: 20, flex: 1, fontFamily }, inputStyles]}
                            />
                            <TouchableOpacity onPress={() => slideup()} >

                                {
                                    (!closeicon)
                                        ?
                                        <Image
                                            source={require('../assets/img/animatedDropDown/close.png')}
                                            resizeMode='contain'
                                            style={{ width: 17, height: 17 }}
                                        />
                                        :
                                        closeicon
                                }

                            </TouchableOpacity>


                        </View>

                    </View>
                    :
                    <TouchableOpacity style={[styles.wrapper, boxStyles]} onPress={() => { if (!dropdown) { slidedown() } else { slideup() } }}>
                        {/* {selectedval == "" && <Image source={placeholderLeftIcon} style={styles.placeHolderIcon} />} */}
                        <View style={styles.placeHolderDiv}>
                            {selectedval == "" && <Image source={placeholderLeftIcon} style={styles.placeHolderIcon} />}
                            {!!selectedvalImg && <Image source={{ uri: selectedvalImg }} style={styles.placeHolderIcon} />}
                            <Text style={[styles.placeHolderText, { fontFamily: selectedval ? 'Poppins-Regular' : fontFamily }, inputStyles]}>
                                {(selectedval == "") ? (placeholder) ? placeholder : 'Select option' : selectedval}
                            </Text>
                        </View>
                        {
                            (!arrowicon)
                                ?
                                <Image
                                    source={require('../assets/img/animatedDropDown/chevron.png')}
                                    resizeMode='contain'
                                    style={{ width: 20, height: 20 }}
                                />
                                :
                                arrowicon
                        }

                    </TouchableOpacity>
            }

            {
                (dropdown)
                    ?
                    <Animated.View style={[{ maxHeight: animatedvalue }, styles.dropdown, dropdownStyles]}>
                        <ScrollView contentContainerStyle={{ paddingVertical: 10, overflow: 'hidden' }} nestedScrollEnabled={true}>
                            <View style={styles.itemsContainer}>
                                {
                                    (filtereddata.length >= 1)
                                        ?
                                        filtereddata.map((item, index) => {
                                            let key = item.id ?? item.name ?? item;
                                            let value = item.name ?? item;
                                            let disabled = item.disabled ?? false;
                                            if (disabled) {
                                                return (
                                                    <TouchableOpacity style={[styles.disabledoption, disabledItemStyles]} key={index} onPress={() => { }}>
                                                        {!!item?.icon && <Image source={{ uri: item?.icon }} style={styles.icon} />}
                                                        <Text style={styles.optionsText} >{value}</Text>
                                                    </TouchableOpacity>
                                                )
                                            } else {
                                                return (
                                                    <TouchableOpacity style={[styles.option, dropdownItemStyles]} key={index} onPress={() => {
                                                        if (save === 'value') {
                                                            setSelected(value);
                                                        } else {
                                                            setSelected(key)
                                                        }

                                                        setSelectedVal(value)
                                                        setSelectedValImg(item?.icon)
                                                        slideup()
                                                        setTimeout(() => { setFilteredData(data) }, 800)

                                                    }}>{!!item?.icon && <Image source={{ uri: item?.icon }} style={styles.icon} />}
                                                        <Text style={styles.optionsText} >{value}</Text>
                                                    </TouchableOpacity>
                                                )
                                            }

                                        })
                                        :
                                        <TouchableOpacity style={[styles.option, dropdownItemStyles]} onPress={() => {
                                            setSelected(undefined)
                                            setSelectedVal("")
                                            setSelectedValImg("")
                                            slideup()
                                            setTimeout(() => setFilteredData(data), 800)

                                        }}>
                                            <Text style={[{ fontFamily }, dropdownTextStyles]}>{notFoundText}</Text>
                                        </TouchableOpacity>
                                }
                            </View>


                        </ScrollView>
                    </Animated.View>
                    :
                    null
            }


        </View>
    )
}


export default SelectList;


const styles = StyleSheet.create({
    wrapper: {
        borderWidth: 1,
        borderRadius: 10,
        borderColor: 'gray',
        paddingHorizontal: 10,
        marginHorizontal: '5%',
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    dropdown: {
        borderWidth: 1,
        borderRadius: 10,
        borderColor: 'gray',
        marginTop: 5,
        overflow: 'hidden'
    },
    option: {
        flexDirection: 'row',
        paddingHorizontal: 7,
        margin: 5,
        paddingVertical: 2,
        overflow: 'hidden',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: '#D1D1D1',
        borderRadius: 7,
        alignSelf: 'center'
    },
    disabledoption: {
        paddingHorizontal: 7,
        margin: 5,
        paddingVertical: 2,
        flexDirection: 'row',
        backgroundColor: 'whitesmoke',
        opacity: 0.9,
        borderWidth: 1,
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: '#D1D1D1',
        borderRadius: 7
    },
    icon: {
        width: 20,
        height: 20,
        tintColor: '#03894E',
        resizeMode: 'contain',
        marginRight: 5
    },
    placeHolderDiv: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    placeHolderText: {
        // marginTop: 5,
        fontSize: 16,
        marginLeft: 3
    },
    placeHolderIcon: {
        width: 20,
        height: 20,
        tintColor: '#03894E',
        resizeMode: 'contain',
        marginRight: 5
    },
    optionsText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        // width: '80%',
        color: '#4D4D4D',
        marginTop: 5
    },
    itemsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 10,
        marginTop: 10,
    },

})
