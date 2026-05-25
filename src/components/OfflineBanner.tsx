import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../stores/app.store';

export function OfflineBanner() {
  const { isConnected } = useApp();

  if (isConnected) return null;

  return (
    <View className="bg-warning/90 flex-row items-center justify-center py-2 px-4">
      <Ionicons name="cloud-offline-outline" size={16} color="#0F0D23" />
      <Text className="text-dark-950 text-sm font-inter-medium ml-2">
        You're offline. Some features may be unavailable.
      </Text>
    </View>
  );
}
