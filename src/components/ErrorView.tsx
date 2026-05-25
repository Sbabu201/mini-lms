import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorViewProps {
  message: string;
  onRetry: () => void;
}

export function ErrorView({ message, onRetry }: ErrorViewProps) {
  return (
    <View className="items-center justify-center py-12 px-8">
      <View className="w-16 h-16 rounded-full bg-error/20 items-center justify-center mb-4">
        <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
      </View>
      <Text className="text-white text-lg font-inter-semibold text-center mb-2">
        Oops! Something went wrong
      </Text>
      <Text className="text-dark-300 text-sm font-inter-regular text-center mb-6">
        {message}
      </Text>
      <TouchableOpacity
        onPress={onRetry}
        className="bg-primary-500 px-6 py-3 rounded-2xl flex-row items-center"
        activeOpacity={0.7}
      >
        <Ionicons name="refresh-outline" size={18} color="#FFFFFF" />
        <Text className="text-white font-inter-semibold text-base ml-2">
          Try Again
        </Text>
      </TouchableOpacity>
    </View>
  );
}
