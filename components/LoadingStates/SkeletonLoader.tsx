import tw from '@/lib/design/tw';
import React from 'react';
import { Animated, View } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const animatedValue = new Animated.Value(0);

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]),
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E5E7EB',
          opacity,
        },
        style,
      ]}
    />
  );
};

export const TaskSkeleton: React.FC = () => {
  return (
    <View
      style={tw`bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-4`}
    >
      <View style={tw`flex-row items-start mb-3`}>
        <SkeletonLoader width={32} height={32} borderRadius={16} />
        <View style={tw`flex-1 ml-3`}>
          <SkeletonLoader width="80%" height={20} style={tw`mb-2`} />
          <SkeletonLoader width="60%" height={16} style={tw`mb-2`} />
          <SkeletonLoader width="100%" height={16} style={tw`mb-1`} />
          <SkeletonLoader width="70%" height={16} />
        </View>
      </View>
      <View style={tw`flex-row justify-between items-center`}>
        <View style={tw`flex-row items-center`}>
          <SkeletonLoader
            width={60}
            height={24}
            borderRadius={12}
            style={tw`mr-2`}
          />
          <SkeletonLoader width={80} height={16} />
        </View>
        <SkeletonLoader width={100} height={32} borderRadius={8} />
      </View>
    </View>
  );
};

export const ProgressSkeleton: React.FC = () => {
  return (
    <View
      style={tw`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4`}
    >
      <SkeletonLoader width="60%" height={24} style={tw`mb-4`} />
      <View style={tw`items-center mb-6`}>
        <SkeletonLoader
          width={96}
          height={96}
          borderRadius={48}
          style={tw`mb-3`}
        />
        <SkeletonLoader width="40%" height={16} />
      </View>
      <View style={tw`mb-4`}>
        <SkeletonLoader width="100%" height={12} borderRadius={6} />
      </View>
      <View style={tw`flex-row justify-between`}>
        <SkeletonLoader width={60} height={40} />
        <SkeletonLoader width={60} height={40} />
        <SkeletonLoader width={60} height={40} />
      </View>
    </View>
  );
};

export const HomeSkeleton: React.FC = () => {
  return (
    <View style={tw`flex-1 bg-gray-50 p-4`}>
      <View style={tw`mb-6`}>
        <SkeletonLoader width="50%" height={28} style={tw`mb-2`} />
        <SkeletonLoader width="70%" height={16} />
      </View>

      <ProgressSkeleton />

      <View style={tw`mb-4`}>
        <SkeletonLoader width="40%" height={20} style={tw`mb-4`} />
        <TaskSkeleton />
        <TaskSkeleton />
        <TaskSkeleton />
      </View>
    </View>
  );
};
