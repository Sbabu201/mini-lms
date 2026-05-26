import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../src/stores/auth.store';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';

// ── Zod Schema ──────────────────────────────────────────────────────
const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ── Screen ──────────────────────────────────────────────────────────
export default function LoginScreen() {
  const { login, state, clearError } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login({ username: data.username.trim(), password: data.password });
      router.replace('/(tabs)/home');
    } catch {
      // Error is handled by auth store
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
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

          {/* Form — React Hook Form + Zod */}
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Username"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Enter your username"
                icon="person-outline"
                autoCapitalize="none"
                error={errors.username?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Enter your password"
                icon="lock-closed-outline"
                secureTextEntry
                error={errors.password?.message}
              />
            )}
          />

          <Button
            title="Sign In"
            onPress={handleSubmit(onSubmit)}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
