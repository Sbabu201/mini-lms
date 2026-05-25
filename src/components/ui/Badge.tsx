import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'default';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  label,
  variant = 'default',
  size = 'sm',
  className = '',
}: BadgeProps) {
  const variantClasses = {
    primary: 'bg-primary-500/20',
    success: 'bg-green-500/20',
    warning: 'bg-yellow-500/20',
    info: 'bg-accent-500/20',
    default: 'bg-dark-600',
  };

  const textVariantClasses = {
    primary: 'text-primary-300',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    info: 'text-accent-400',
    default: 'text-dark-200',
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1',
    md: 'px-3 py-1.5',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
  };

  return (
    <View className={`rounded-full ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      <Text
        className={`font-inter-medium ${textVariantClasses[variant]} ${textSizeClasses[size]}`}
      >
        {label}
      </Text>
    </View>
  );
}
