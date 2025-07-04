import { View } from 'react-native';
import LottieView from 'lottie-react-native';

type LoadingProps = {
  size?: number;
  style?: any;
};

export default function Loading({ size = 100, style }: LoadingProps) {
  return (
    <View className="items-center justify-center" style={style}>
      <LottieView
        source={require('@/assets/lottie/loading.json')}
        autoPlay
        loop
        style={{ width: size, height: size }}
      />
    </View>
  );
}
