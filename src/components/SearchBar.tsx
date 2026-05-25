import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_CONFIG } from '../utils/constants';

interface SearchBarProps {
  value: string;
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onSearch,
  placeholder = 'Search courses...',
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback(
    (text: string) => {
      setLocalValue(text);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        onSearch(text);
      }, APP_CONFIG.SEARCH_DEBOUNCE_MS);
    },
    [onSearch]
  );

  const handleClear = useCallback(() => {
    setLocalValue('');
    onSearch('');
  }, [onSearch]);

  return (
    <View className="flex-row items-center bg-dark-800 rounded-2xl mx-4 px-4 border border-dark-700">
      <Ionicons name="search-outline" size={20} color="#9F99BD" />
      <TextInput
        value={localValue}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor="#5D5490"
        className="flex-1 text-white text-base font-inter-regular py-3 ml-3"
        returnKeyType="search"
        autoCorrect={false}
      />
      {localValue.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={20} color="#9F99BD" />
        </TouchableOpacity>
      )}
    </View>
  );
}
