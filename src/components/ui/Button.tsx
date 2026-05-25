import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className = '',
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const baseClasses = 'flex-row items-center justify-center rounded-2xl';

  const variantClasses = {
    primary: 'bg-primary-500',
    secondary: 'bg-dark-700 border border-dark-500',
    ghost: 'bg-transparent',
    danger: 'bg-error',
  };

  const sizeClasses = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3.5',
    lg: 'px-8 py-4',
  };

  const textVariantClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    ghost: 'text-primary-400',
    danger: 'text-white',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        isDisabled ? 'opacity-50' : 'opacity-100'
      } ${className}`}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'ghost' ? '#8347FF' : '#FFFFFF'}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            className={`font-inter-semibold ${textVariantClasses[variant]} ${textSizeClasses[size]} ${
              icon ? 'ml-2' : ''
            }`}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
