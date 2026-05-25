import React, { useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../src/stores/auth.store';
import { useCourses } from '../../src/stores/course.store';
import { useApp } from '../../src/stores/app.store';
import { Button } from '../../src/components/ui/Button';
import { notificationService } from '../../src/services/notification.service';

export default function ProfileScreen() {
  const { state: authState, logout, updateAvatar } = useAuth();
  const { state: courseState } = useCourses();
  const { preferences, updatePreferences } = useApp();
  const user = authState.user;

  const memberSince = useMemo(() => {
    if (!user?.createdAt) return 'Recently';
    const date = new Date(user.createdAt);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [user?.createdAt]);

  const handleLogout = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }, [logout]);

  const handlePickAvatar = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll access to update your avatar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      try {
        await updateAvatar(result.assets[0].uri);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        Alert.alert('Error', 'Failed to update avatar. Please try again.');
      }
    }
  }, [updateAvatar]);

  const handleToggleNotifications = useCallback(async () => {
    const newValue = !preferences.notificationsEnabled;
    if (newValue) {
      const granted = await notificationService.requestPermissions();
      if (!granted) {
        Alert.alert('Permission Required', 'Please enable notifications in your device settings.');
        return;
      }
    }
    updatePreferences({ notificationsEnabled: newValue });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [preferences.notificationsEnabled, updatePreferences]);

  const handleShareApp = useCallback(async () => {
    try {
      await Share.share({
        message: 'Check out LearnHub — an amazing learning platform! 📚🎓',
        title: 'Share LearnHub',
      });
    } catch {
      // Share cancelled
    }
  }, []);

  const stats = [
    { label: 'Enrolled', value: courseState.enrolledIds.length, icon: 'school-outline' as const, color: '#17B07E' },
    { label: 'Bookmarked', value: courseState.bookmarkedIds.length, icon: 'bookmark-outline' as const, color: '#FFA520' },
    { label: 'Progress', value: `${courseState.enrolledIds.length > 0 ? Math.round((courseState.enrolledIds.length / Math.max(courseState.courses.length, 1)) * 100) : 0}%`, icon: 'trending-up-outline' as const, color: '#10B981' },
  ];

  const menuItems = [
    { icon: 'notifications-outline' as const, label: 'Notifications', subtitle: preferences.notificationsEnabled ? 'Enabled' : 'Disabled', onPress: handleToggleNotifications, showChevron: false, toggle: true },
    { icon: 'share-social-outline' as const, label: 'Share App', subtitle: 'Invite friends to learn', onPress: handleShareApp, showChevron: true },
    { icon: 'help-circle-outline' as const, label: 'Help & Support', subtitle: 'FAQ and contact', onPress: () => Alert.alert('Help', 'For support, reach out via the GitHub repository.'), showChevron: true },
    { icon: 'information-circle-outline' as const, label: 'About LearnHub', subtitle: 'Version 1.0.0', onPress: () => Alert.alert('LearnHub', 'Mini LMS App v1.0.0\nBuilt with React Native Expo\n\nAPI: freeapi.app'), showChevron: true },
  ];

  return (
    <SafeAreaView className="flex-1 bg-dark-950" edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-white text-2xl font-inter-bold">Profile</Text>
        </View>

        {/* Avatar + Info */}
        <View className="items-center px-5 py-6">
          <TouchableOpacity onPress={handlePickAvatar} className="relative mb-4">
            <Image
              source={{ uri: user?.avatar?.url || 'https://randomuser.me/api/portraits/lego/1.jpg' }}
              className="w-24 h-24 rounded-full"
              contentFit="cover"
            />
            <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-500 items-center justify-center border-2 border-dark-950">
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text className="text-white text-xl font-inter-bold">{user?.username ?? 'User'}</Text>
          <Text className="text-dark-300 text-sm font-inter-regular mt-1">{user?.email ?? ''}</Text>
          <Text className="text-dark-400 text-xs font-inter-regular mt-1">
            Member since {memberSince}
          </Text>
        </View>

        {/* Stats */}
        <View className="flex-row px-5 mb-6">
          {stats.map((stat) => (
            <View key={stat.label} className="flex-1 bg-dark-800 rounded-2xl p-4 mx-1 items-center border border-dark-700">
              <Ionicons name={stat.icon} size={22} color={stat.color} />
              <Text className="text-white text-xl font-inter-bold mt-2">{stat.value}</Text>
              <Text className="text-dark-400 text-xs font-inter-regular">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu Items */}
        <View className="px-5">
          <Text className="text-dark-400 text-xs font-inter-semibold uppercase tracking-wider mb-3 ml-1">Settings</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              className="flex-row items-center bg-dark-800 rounded-2xl px-4 py-4 mb-2 border border-dark-700"
              activeOpacity={0.7}
            >
              <Ionicons name={item.icon} size={22} color="#6B7D96" />
              <View className="ml-3 flex-1">
                <Text className="text-white text-base font-inter-medium">{item.label}</Text>
                {item.subtitle && (
                  <Text className="text-dark-400 text-xs font-inter-regular mt-0.5">{item.subtitle}</Text>
                )}
              </View>
              {item.toggle ? (
                <View className={`w-12 h-7 rounded-full ${preferences.notificationsEnabled ? 'bg-primary-500' : 'bg-dark-600'} justify-center px-0.5`}>
                  <View className={`w-5 h-5 rounded-full bg-white ${preferences.notificationsEnabled ? 'self-end' : 'self-start'}`} />
                </View>
              ) : item.showChevron ? (
                <Ionicons name="chevron-forward" size={18} color="#4B5E78" />
              ) : null}
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <View className="px-5 mt-6">
          <Button title="Sign Out" onPress={handleLogout} variant="danger" size="lg" icon={<Ionicons name="log-out-outline" size={20} color="#FFFFFF" />} />
        </View>

        <Text className="text-dark-600 text-xs font-inter-regular text-center mt-6">
          LearnHub v1.0.0 • Made with ❤️
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
