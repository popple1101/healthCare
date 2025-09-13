import React from 'react';
import { View, Image, ImageBackground, Pressable, useWindowDimensions} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const BG = require('../../assets/background/main.png');     
const LOGIN = require('../../assets/ui/loginbtn.png');        
const SIGNUP = require('../../assets/ui/signupbtn.png');     

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const nav = useNavigation();
  const loginMeta = Image.resolveAssetSource(LOGIN);
  const signupMeta = Image.resolveAssetSource(SIGNUP);
  const btnWidth = Math.min(420, Math.round(width * 0.48));
  const loginH = Math.round(btnWidth * (loginMeta.height / loginMeta.width));
  const signupH = Math.round(btnWidth * (signupMeta.height / signupMeta.width));

  return (
    <ImageBackground source={BG} style={{ flex: 1 }} resizeMode="cover">
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: insets.bottom + 16,
          alignItems: 'center',
          gap: 4,
        }}
      >
        <Pressable
          onPress={() => nav.navigate('Login')}
          hitSlop={8}
          style={{ alignItems: 'center' }}
        >
          <Image
            source={LOGIN}
            style={{ width: btnWidth, height: loginH, resizeMode: 'contain' }}
          />
        </Pressable>
        <Pressable
          onPress={() => nav.navigate('Signup')}
          hitSlop={8}
          style={{ alignItems: 'center' }}
        >
          <Image
            source={SIGNUP}
            style={{ width: btnWidth, height: signupH, resizeMode: 'contain' }}
          />
        </Pressable>
      </View>
    </ImageBackground>
  );
}6
