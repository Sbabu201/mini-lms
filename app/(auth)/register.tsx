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

export default function RegisterScreen() {
  const { register, state, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      await register({
        email: email.trim(),
        username: username.trim(),
        password,
        role: 'ADMIN',
      });
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
        <View className="flex-1 px-6 justify-center py-8">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 rounded-3xl bg-primary-500 items-center justify-center mb-4">
              <Ionicons name="person-add" size={36} color="#FFFFFF" />
            </View>
            <Text className="text-white text-3xl font-inter-bold">
              Create Account
            </Text>
            <Text className="text-dark-300 text-base font-inter-regular mt-2 text-center">
              Join LearnHub and start your learning journey.
            </Text>
          </View>

          {/* API Error */}
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
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
            }}
            placeholder="you@example.com"
            icon="mail-outline"
            keyboardType="email-address"
            error={errors.email}
          />

          <Input
            label="Username"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              if (errors.username) setErrors((e) => ({ ...e, username: undefined }));
            }}
            placeholder="Choose a username"
            icon="person-outline"
            error={errors.username}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
            }}
            placeholder="Min. 6 characters"
            icon="lock-closed-outline"
            secureTextEntry
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) setErrors((e) => ({ ...e, confirmPassword: undefined }));
            }}
            placeholder="Re-enter your password"
            icon="shield-checkmark-outline"
            secureTextEntry
            error={errors.confirmPassword}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={state.isLoading}
            className="mt-4"
            size="lg"
          />

          {/* Login Link */}
          <View className="flex-row items-center justify-center mt-8">
            <Text className="text-dark-300 text-sm font-inter-regular">
              Already have an account?{' '}
            </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-primary-400 text-sm font-inter-semibold">
                  Sign In
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
