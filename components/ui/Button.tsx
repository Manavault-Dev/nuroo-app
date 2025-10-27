// External Imports
import React from 'react';
import {
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';

// Internal Imports
import tw from '@/lib/design/tw';

type ButtonProps = TouchableOpacityProps & {
  variant?: 'primary' | 'outline' | 'coral' | 'teal';
  title: string;
  textStyle?: StyleProp<TextStyle>;
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  title,
  style,
  textStyle,
  ...props
}) => {
  const baseStyles = 'rounded-md px-4 py-2 items-center justify-center';
  const variants = {
    primary: 'bg-primary',
    coral: 'bg-coral',
    teal: 'bg-teal',
    outline: 'border border-primary',
  };

  const textVariants = {
    primary: 'text-white',
    outline: 'text-primary',
    coral: 'text-white',
    teal: 'text-white',
  };

  return (
    <TouchableOpacity
      style={[tw`${baseStyles} ${variants[variant]}`, style]}
      {...props}
      activeOpacity={0.8}
    >
      <Text
        style={[
          tw`${textVariants[variant]} text-base font-semibold`,
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};
