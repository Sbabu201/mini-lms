import React, { useEffect, useCallback, useRef } from 'react';
import { View, Text, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LegendList } from '@legendapp/list';
import { Ionicons } from '@expo/vector-icons';
import { useCourses } from '../../../src/stores/course.store';
import { useAuth } from '../../../src/stores/auth.store';
import { CourseCard } from '../../../src/components/CourseCard';
import { SearchBar } from '../../../src/components/SearchBar';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { ErrorView } from '../../../src/components/ErrorView';
import { EmptyState } from '../../../src/components/EmptyState';
import { Course } from '../../../src/types/course.types';

export default function HomeScreen() {
  const { state: authState } = useAuth();
  const {
    state,
    filteredCourses,
    fetchCourses,
    refreshCourses,
    toggleBookmark,
    setSearch,
  } = useCourses();

  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (isInitialLoad.current && state.courses.length === 0) {
      fetchCourses(1);
      isInitialLoad.current = false;
    }
  }, [fetchCourses, state.courses.length]);

  const handleCoursePress = useCallback((course: Course) => {
    router.push({
      pathname: '/(tabs)/home/[id]',
      params: { id: course.id.toString() },
    });
  }, []);

  const handleBookmark = useCallback(
    (courseId: number) => {
      toggleBookmark(courseId);
    },
    [toggleBookmark]
  );

  const handleLoadMore = useCallback(() => {
    if (!state.isLoading && state.hasMore && !state.searchQuery) {
      fetchCourses(state.currentPage + 1);
    }
  }, [state.isLoading, state.hasMore, state.currentPage, state.searchQuery, fetchCourses]);

  const renderCourseItem = useCallback(
    ({ item }: { item: Course }) => (
      <CourseCard
        course={item}
        isBookmarked={state.bookmarkedIds.includes(item.id)}
        isEnrolled={state.enrolledIds.includes(item.id)}
        onPress={handleCoursePress}
        onBookmark={handleBookmark}
      />
    ),
    [state.bookmarkedIds, state.enrolledIds, handleCoursePress, handleBookmark]
  );

  const keyExtractor = useCallback((item: Course) => item.id.toString(), []);

  const renderHeader = () => (
    <View className="mb-4">
      {/* Greeting */}
      <View className="px-4 pt-2 pb-4">
        <Text className="text-dark-300 text-sm font-inter-regular">
          Welcome back,
        </Text>
        <Text className="text-white text-2xl font-inter-bold mt-1">
          {authState.user?.username ?? 'Learner'} 👋
        </Text>
      </View>

      {/* Search */}
      <SearchBar
        value={state.searchQuery}
        onSearch={setSearch}
        placeholder="Search courses, topics, instructors..."
      />

      {/* Results Count */}
      <View className="px-4 mt-4 flex-row items-center justify-between">
        <Text className="text-dark-300 text-sm font-inter-medium">
          {filteredCourses.length} courses available
        </Text>
        <View className="flex-row items-center">
          <Ionicons name="funnel-outline" size={14} color="#6B7D96" />
          <Text className="text-dark-300 text-xs font-inter-regular ml-1">
            Showing all
          </Text>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (state.isLoading && state.courses.length > 0) {
      return <LoadingSpinner message="Loading more courses..." />;
    }
    if (!state.hasMore && state.courses.length > 0) {
      return (
        <View className="items-center py-6">
          <Text className="text-dark-400 text-sm font-inter-regular">
            You've seen all courses 🎉
          </Text>
        </View>
      );
    }
    return null;
  };

  // Initial loading state
  if (state.isLoading && state.courses.length === 0) {
    return <LoadingSpinner fullScreen message="Loading courses..." />;
  }

  // Error state
  if (state.error && state.courses.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-dark-950">
        <ErrorView message={state.error} onRetry={() => fetchCourses(1)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark-950" edges={['top']}>
      <LegendList
        data={filteredCourses}
        renderItem={renderCourseItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No courses found"
            message="Try adjusting your search to find what you're looking for."
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={state.isRefreshing}
            onRefresh={refreshCourses}
            tintColor="#17B07E"
            colors={['#17B07E']}
            progressBackgroundColor="#141C2B"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        estimatedItemSize={340}
        recycleItems
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}
