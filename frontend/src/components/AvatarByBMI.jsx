import { Image } from 'react-native'

const CHAR = {
  thin: require('../../assets/characters/thin.png'),
  normal: require('../../assets/characters/normal.png'),
  chuby: require('../../assets/characters/chubby.png'),
  muscle: require('../../assets/characters/muscle.png'),
}

export default function AvatarByBMI({ category = 'normal', size = 260, style }) {
  const src = CHAR[category] ?? CHAR.normal
  return <Image source={src} style={[{ width: size, height: size, resizeMode: 'contain' }, style]} />
}
