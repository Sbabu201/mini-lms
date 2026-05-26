import React, { useRef, useCallback, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { generateCourseContentHTML } from '../../src/templates/course-content';
import { useCourses } from '../../src/stores/course.store';

export default function WebViewScreen() {
  const params = useLocalSearchParams<{
    courseId?: string;
    courseTitle?: string;
    courseDescription?: string;
    courseCategory?: string;
    courseInstructor?: string;
    courseInstructorAvatar?: string;
    courseRating?: string;
    coursePrice?: string;
    courseStudents?: string;
    courseImages?: string;
  }>();

  const { state, toggleBookmark, toggleEnroll } = useCourses();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const courseId = params.courseId ? Number(params.courseId) : null;

  const courseData = useMemo(() => ({
    title: params.courseTitle ?? 'Welcome to LearnHub',
    description: params.courseDescription ?? 'Select a course to view its content here.',
    category: params.courseCategory ?? 'General',
    instructor: params.courseInstructor ?? 'LearnHub Team',
    instructorAvatar: params.courseInstructorAvatar ?? 'https://randomuser.me/api/portraits/lego/1.jpg',
    rating: parseFloat(params.courseRating ?? '4.5'),
    price: parseFloat(params.coursePrice ?? '0'),
    studentsEnrolled: parseInt(params.courseStudents ?? '0', 10),
    images: params.courseImages ? JSON.parse(params.courseImages) as string[] : [],
  }), [params]);

  const isBookmarked = courseId ? state.bookmarkedIds.includes(courseId) : false;
  const isEnrolled = courseId ? state.enrolledIds.includes(courseId) : false;

  const html = useMemo(() => generateCourseContentHTML(courseData), [courseData]);

  const injectedHeaders = useMemo(() => {
    const headers = {
      'X-App-Name': 'LearnHub',
      'X-App-Version': '1.0.0',
      'X-Course-Id': params.courseId ?? '',
      'X-User-Bookmarked': isBookmarked ? 'true' : 'false',
      'X-User-Enrolled': isEnrolled ? 'true' : 'false',
      'X-Platform': 'react-native',
      'X-Timestamp': new Date().toISOString(),
    };
    return `
      window.__NATIVE_HEADERS__ = ${JSON.stringify(headers)};
      window.__NATIVE_CONTEXT__ = {
        courseId: '${params.courseId ?? ''}',
        isBookmarked: ${isBookmarked},
        isEnrolled: ${isEnrolled},
        appVersion: '1.0.0',
      };
      true;
    `;
  }, [params.courseId, isBookmarked, isEnrolled]);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as {
        type: string;
        payload?: Record<string, unknown>;
      };

      switch (data.type) {
        case 'WEBVIEW_READY':
          webViewRef.current?.postMessage(
            JSON.stringify({ type: 'UPDATE_STATUS', message: '✅ Connected to LearnHub' })
          );
          break;
        case 'TOGGLE_BOOKMARK':
          if (courseId) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            toggleBookmark(courseId);
            webViewRef.current?.postMessage(
              JSON.stringify({ type: 'BOOKMARK_UPDATED', isBookmarked: !isBookmarked })
            );
          }
          break;
        case 'TOGGLE_ENROLL':
          if (courseId) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            toggleEnroll(courseId);
            webViewRef.current?.postMessage(
              JSON.stringify({ type: 'ENROLL_UPDATED', isEnrolled: !isEnrolled })
            );
          }
          break;
        case 'MARK_COMPLETE':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          webViewRef.current?.postMessage(
            JSON.stringify({ type: 'UPDATE_STATUS', message: '🎉 Section marked as complete!' })
          );
          break;
      }
    } catch {
      // Malformed message — ignore
    }
  }, [courseId, isBookmarked, isEnrolled, toggleBookmark, toggleEnroll]);

  const sendNativeUpdate = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: 'UPDATE_STATUS',
        message: `📱 Status: ${isEnrolled ? 'Enrolled' : 'Not enrolled'} • ${isBookmarked ? 'Bookmarked' : 'Not bookmarked'}`,
      })
    );
  }, [isEnrolled, isBookmarked]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  }, []);

  const handleBack = useCallback(() => {
    router.navigate('/(tabs)/home');
  }, []);

  if (!params.courseId) {
    return (
      <SafeAreaView className="flex-1 bg-dark-950" edges={['top']}>
        <View className="px-5 pt-4 pb-3">
          <Text className="text-white text-2xl font-inter-bold">Course Content</Text>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-full bg-dark-800 items-center justify-center mb-6">
            <Ionicons name="reader-outline" size={36} color="#17B07E" />
          </View>
          <Text className="text-white text-xl font-inter-bold text-center mb-2">
            No Content Selected
          </Text>
          <Text className="text-dark-300 text-sm font-inter-regular text-center mb-6">
            Open a course and tap "View Course Content" to see it here.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/home')}
            className="bg-primary-500 px-6 py-3 rounded-2xl"
          >
            <Text className="text-white font-inter-semibold">Browse Courses</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark-950" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-dark-800">
        <TouchableOpacity onPress={handleBack} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-inter-semibold flex-1" numberOfLines={1}>
          {courseData.title}
        </Text>
        <TouchableOpacity
          onPress={sendNativeUpdate}
          className="ml-2 w-9 h-9 rounded-full bg-dark-800 items-center justify-center"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="sync-outline" size={18} color="#17B07E" />
        </TouchableOpacity>
      </View>

      {/* Error State */}
      {hasError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text className="text-white text-lg font-inter-semibold mt-4 mb-2">
            Failed to Load
          </Text>
          <Text className="text-dark-300 text-sm text-center mb-6">
            The course content could not be loaded.
          </Text>
          <TouchableOpacity onPress={handleRetry} className="bg-primary-500 px-6 py-3 rounded-2xl">
            <Text className="text-white font-inter-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-1">
          {isLoading && (
            <View className="absolute inset-0 items-center justify-center z-10 bg-dark-950">
              <ActivityIndicator size="large" color="#17B07E" />
              <Text className="text-dark-300 text-sm mt-3">Loading content...</Text>
            </View>
          )}
          <WebView
            ref={webViewRef}
            source={{ html }}
            className="flex-1 bg-dark-950"
            onLoadEnd={() => setIsLoading(false)}
            onError={() => { setHasError(true); setIsLoading(false); }}
            onHttpError={() => { setHasError(true); setIsLoading(false); }}
            onMessage={handleMessage}
            injectedJavaScriptBeforeContentLoaded={injectedHeaders}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={['*']}
            style={{ backgroundColor: '#0D1321' }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
