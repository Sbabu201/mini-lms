import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  icon?: keyof typeof Ionicons.glyphMap;
  className?: string;
  editable?: boolean;
}

export function Input({
  label,
  value,
  onChangeText,
  onBlur: onBlurProp,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  icon,
  className = '',
  editable = true,
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`mb-4 ${className}`}>
      <Text className="text-dark-200 text-sm font-inter-medium mb-2 ml-1">
        {label}
      </Text>
      <View
        className={`flex-row items-center bg-dark-800 rounded-2xl px-4 border ${
          error
            ? 'border-error'
            : isFocused
            ? 'border-primary-500'
            : 'border-dark-600'
        }`}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={error ? '#EF4444' : isFocused ? '#17B07E' : '#6B7D96'}
            style={{ marginRight: 12 }}
          />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#4B5E78"
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlurProp?.();
          }}
          className="flex-1 text-white text-base font-inter-regular py-3.5"
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#6B7D96"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-error text-xs font-inter-regular mt-1 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
}
