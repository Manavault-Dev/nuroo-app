import tw from '@/lib/design/tw';
import React from 'react';
import { TextInput, TextInputProps } from 'react-native';

type InputProps = TextInputProps & {
  variant?: 'default' | 'outlined';
  type?: 'text' | 'email' | 'number' | 'password';
};

export const Input: React.FC<InputProps> = ({
  variant = 'default',
  type = 'text',
  style,
  ...props
}) => {
  const baseStyles =
    'rounded-md px-3 py-2 text-base bg-white text-text border border-transparent';
  const variants = {
    default: 'border-transparent',
    outlined: 'border border-neutral-300',
  };

  const keyboardTypeMap = {
    text: 'default',
    email: 'email-address',
    number: 'numeric',
    password: 'default',
  } as const;

  const isPassword = type === 'password';

  return (
    <TextInput
      style={tw`${baseStyles} ${variants[variant]}`}
      placeholderTextColor="#9CA3AF"
      keyboardType={keyboardTypeMap[type]}
      secureTextEntry={isPassword}
      autoCapitalize="none"
      {...props}
    />
  );
};
