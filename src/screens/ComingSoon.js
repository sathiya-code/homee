import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import * as Images from '../assets/img/Images';
import { PrimaryGreen } from '../helper/styles.helper';
// import Shimmer from 'react-native-shimmer-placeholder';

const ComingSoon = ({ navigation, route }) => {
  const { width, height } = Dimensions.get('window');

  // Expecting: route.params = { type, banners: [{ type, image, description }, ...] }
  const { type: pageType, banners: comingSoonBanners = [] } = route?.params || {};

  const [description, setDescription] = useState('Coming Soon');
  const [imageSource, setImageSource] = useState(Images.services_comming_soon); // fallback to local asset

  const normalize = (v) => (v ?? '').toString().trim().toLowerCase();

  const defaultDescriptions = useMemo(
    () => ({
      'restaurant': 'Delicious restaurant meals, coming soon to your doorstep!',
      'home food': 'Healthy Home Food, coming to your doorstep soon!',
      'groceries': 'Fresh groceries, delivered fast. Launching soon!',
      'advance order': 'Need food for later? Advance Ordering feature, coming soon!',
      'pick & drop': 'Pick & Drop is rolling out soon!',
      'pnd': 'Pick & Drop is rolling out soon!',
      'home': 'Coming soon to your home!',
      'grocery': 'Fresh groceries, delivered fast. Launching soon!',
    }),
    []
  );

  // Find banner by matching type (case/space-insensitive) with PND <-> Pick & Drop equivalence
  const selectedBanner = useMemo(() => {
    const pType = normalize(pageType);
    const arr = Array.isArray(comingSoonBanners) ? comingSoonBanners : [];

    let match = arr.find((b) => normalize(b?.type) === pType);

    if (!match && pType === 'pick & drop') {
      match = arr.find((b) => normalize(b?.type) === 'pnd');
    }
    if (!match && pType === 'pnd') {
      match = arr.find((b) => normalize(b?.type) === 'pick & drop');
    }

    return match || null;
  }, [comingSoonBanners, pageType]);

  useEffect(() => {
    const pType = normalize(pageType);
    const fallbackDesc = defaultDescriptions[pType] ?? 'Coming Soon';

    setDescription(selectedBanner?.description?.toString()?.trim() || fallbackDesc);

    const bannerImage = selectedBanner?.url?.toString()?.trim();
    if (bannerImage) {
      setImageSource({ uri: bannerImage });
    } else {
      // fallback local per type
      if (pType === 'restaurant') setImageSource(Images.food);
      else if (pType === 'home food' || pType === 'home') setImageSource(Images.food);
      else if (pType === 'groceries' || pType === 'grocery') setImageSource(Images.grocery);
      else if (pType === 'advance order') setImageSource(Images.advance);
      else if (pType === 'pick & drop' || pType === 'pnd') setImageSource(Images.pnd_comming);
      else setImageSource(Images.coming_soon);
    }
  }, [selectedBanner, pageType, defaultDescriptions]);

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#09b44d',
          height: 40,
          borderBottomLeftRadius: 25,
          borderBottomRightRadius: 25,
          paddingHorizontal: 15,
          paddingTop: 5,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image style={{ width: 9, height: 16 }} source={Images.arrow} />
          <Text
            style={{
              color: '#fff',
              fontSize: 18,
              fontFamily: 'Poppins-Bold',
              paddingLeft: 5,
              marginTop: 2,
            }}
          >
            Back
          </Text>
        </TouchableOpacity>
      </View>

      {/* Unified rendering for ALL types, including PND */}
      <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', backgroundColor: '#fff' }}>
        <Image
          source={imageSource}
          style={{ height: height / 2.2, aspectRatio: 1, resizeMode: 'center', marginVertical: 25 }}
        />
        {/* <Shimmer tilt={30} duration={100} pauseDuration={1500}> */}
        <>
          <Text
            style={{
              fontFamily: 'Poppins-Medium',
              fontSize: 24,
              color: PrimaryGreen,
              textAlign: 'center',
              height: 35,
            }}
          >
            {`${route?.params?.type ? route?.params?.type : ''}\n`}
          </Text>
          <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 16, color: '#656565', textAlign: 'center', marginHorizontal: 2 }}>
            {description}
          </Text>
        </>
        {/* </Shimmer> */}
      </View>
    </>
  );
};

export default ComingSoon;

const styles = StyleSheet.create({});
