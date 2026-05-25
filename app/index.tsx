import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/stores/auth.store';
import { LoadingSpinner } from '../src/components/ui/LoadingSpinner';

/**
 * Root index screen — redirects based on auth state.
 */
export default function Index() {
  const { state } = useAuth();

  if (state.isLoading) {
    return <LoadingSpinner fullScreen message="Loading LearnHub..." />;
  }

  if (state.isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}
