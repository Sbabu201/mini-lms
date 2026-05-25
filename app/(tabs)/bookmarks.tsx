import React, { useCallback } from 'react';
import { View, Text, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LegendList } from '@legendapp/list';
import { useCourses } from '../../src/stores/course.store';
import { CourseCard } from '../../src/components/CourseCard';
import { EmptyState } from '../../src/components/EmptyState';
import { Button } from '../../src/components/ui/Button';
import { Course } from '../../src/types/course.types';

export default function BookmarksScreen() {
  const { state, bookmarkedCourses, toggleBookmark, refreshCourses } = useCourses();

  const handleCoursePress = useCallback((course: Course) => {
    router.push({ pathname: '/(tabs)/home/[id]', params: { id: course.id.toString() } });
  }, []);

  const handleBookmark = useCallback((courseId: number) => {
    toggleBookmark(courseId);
  }, [toggleBookmark]);

  const renderItem = useCallback(({ item }: { item: Course }) => (
    <CourseCard
      course={item}
      isBookmarked={true}
      isEnrolled={state.enrolledIds.includes(item.id)}
      onPress={handleCoursePress}
      onBookmark={handleBookmark}
    />
  ), [state.enrolledIds, handleCoursePress, handleBookmark]);

  const keyExtractor = useCallback((item: Course) => item.id.toString(), []);

  return (
    <SafeAreaView className="flex-1 bg-dark-950" edges={['top']}>
      <View className="px-5 pt-4 pb-3">
        <Text className="text-white text-2xl font-inter-bold">Bookmarks</Text>
        <Text className="text-dark-300 text-sm font-inter-regular mt-1">
          {bookmarkedCourses.length} saved courses
        </Text>
      </View>
      <LegendList
        data={bookmarkedCourses}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          <EmptyState
            icon="bookmark-outline"
            title="No bookmarks yet"
            message="Save courses you're interested in to view them here."
            action={<Button title="Explore Courses" onPress={() => router.push('/(tabs)/home')} variant="primary" size="md" />}
          />
        }
        refreshControl={
          <RefreshControl refreshing={state.isRefreshing} onRefresh={refreshCourses} tintColor="#8347FF" colors={['#8347FF']} progressBackgroundColor="#1C164D" />
        }
        estimatedItemSize={340}
        recycleItems
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}
