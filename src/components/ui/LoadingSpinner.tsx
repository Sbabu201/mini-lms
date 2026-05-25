import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export function LoadingSpinner({
  message,
  size = 'large',
  fullScreen = false,
}: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-dark-950">
        <View className="items-center">
          <ActivityIndicator size={size} color="#17B07E" />
          {message && (
            <Text className="text-dark-200 text-sm font-inter-regular mt-4">
              {message}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View className="items-center justify-center py-8">
      <ActivityIndicator size={size} color="#17B07E" />
      {message && (
        <Text className="text-dark-200 text-sm font-inter-regular mt-3">
          {message}
        </Text>
      )}
    </View>
  );
}
