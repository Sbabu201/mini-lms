import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // In production, pipe to Sentry or equivalent error tracking service
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 items-center justify-center bg-dark-950 px-8">
          <View className="items-center">
            <View className="w-20 h-20 rounded-full bg-error/20 items-center justify-center mb-6">
              <Ionicons name="warning-outline" size={40} color="#EF4444" />
            </View>
            <Text className="text-white text-xl font-inter-bold text-center mb-2">
              Something went wrong
            </Text>
            <Text className="text-dark-300 text-sm font-inter-regular text-center mb-6">
              An unexpected error occurred. Please try again.
            </Text>
            <TouchableOpacity
              onPress={this.handleRetry}
              className="bg-primary-500 px-8 py-3 rounded-2xl"
              activeOpacity={0.7}
            >
              <Text className="text-white font-inter-semibold text-base">
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}
