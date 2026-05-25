import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="w-20 h-20 rounded-full bg-dark-800 items-center justify-center mb-6">
        <Ionicons name={icon} size={36} color="#17B07E" />
      </View>
      <Text className="text-white text-xl font-inter-bold text-center mb-2">
        {title}
      </Text>
      <Text className="text-dark-300 text-sm font-inter-regular text-center mb-6 leading-5">
        {message}
      </Text>
      {action}
    </View>
  );
}
