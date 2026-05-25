import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/stores/auth.store';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';

export default function LoginScreen() {
  const { login, state, clearError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      await login({ username: username.trim(), password });
      router.replace('/(tabs)/home');
    } catch {
      // Error is handled by auth store
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-950">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 justify-center">
          {/* Logo / Header */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 rounded-3xl bg-primary-500 items-center justify-center mb-4">
              <Ionicons name="school" size={40} color="#FFFFFF" />
            </View>
            <Text className="text-white text-3xl font-inter-bold">
              LearnHub
            </Text>
            <Text className="text-dark-300 text-base font-inter-regular mt-2">
              Welcome back! Sign in to continue learning.
            </Text>
          </View>

          {/* Error Message */}
          {state.error ? (
            <View className="bg-error/10 border border-error/30 rounded-2xl px-4 py-3 mb-4 flex-row items-center">
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text className="text-error text-sm font-inter-medium ml-2 flex-1">
                {state.error}
              </Text>
              <TouchableOpacity onPress={clearError}>
                <Ionicons name="close" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Form */}
          <Input
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            icon="person-outline"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            icon="lock-closed-outline"
            secureTextEntry
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={state.isLoading}
            className="mt-4"
            size="lg"
          />

          {/* Register Link */}
          <View className="flex-row items-center justify-center mt-8">
            <Text className="text-dark-300 text-sm font-inter-regular">
              Don't have an account?{' '}
            </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text className="text-primary-400 text-sm font-inter-semibold">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
