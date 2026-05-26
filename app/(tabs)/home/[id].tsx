import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCourses } from '../../../src/stores/course.store';
import { Button } from '../../../src/components/ui/Button';
import { Badge } from '../../../src/components/ui/Badge';
import {
  formatPrice,
  formatRating,
  formatCount,
  getCategoryLabel,
} from '../../../src/utils/helpers';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, toggleBookmark, toggleEnroll } = useCourses();

  const course = useMemo(() => {
    return state.courses.find((c) => c.id === Number(id));
  }, [state.courses, id]);

  const isBookmarked = useMemo(() => {
    return state.bookmarkedIds.includes(Number(id));
  }, [state.bookmarkedIds, id]);

  const isEnrolled = useMemo(() => {
    return state.enrolledIds.includes(Number(id));
  }, [state.enrolledIds, id]);

  const handleBookmark = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleBookmark(Number(id));
  }, [id, toggleBookmark]);

  const handleEnroll = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toggleEnroll(Number(id));
    if (!isEnrolled) {
      Alert.alert(
        '🎉 Enrolled Successfully!',
        `You are now enrolled in "${course?.title}". Happy learning!`,
        [{ text: 'Start Learning', style: 'default' }]
      );
    }
  }, [id, isEnrolled, course, toggleEnroll]);

  const handleViewContent = useCallback(() => {
    if (course) {
      router.navigate({
        pathname: '/(tabs)/webview',
        params: {
          courseId: course.id.toString(),
          courseTitle: course.title,
          courseDescription: course.description,
          courseCategory: getCategoryLabel(course.category),
          courseInstructor: course.instructor.name,
          courseInstructorAvatar: course.instructor.avatar,
          courseRating: course.rating.toString(),
          coursePrice: course.price.toString(),
          courseStudents: course.studentsEnrolled.toString(),
          courseImages: JSON.stringify(course.images),
        },
      });
    }
  }, [course]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate('/(tabs)/home');
    }
  }, []);

  if (!course) {
    return (
      <SafeAreaView className="flex-1 bg-dark-950 items-center justify-center">
        <Text className="text-white text-lg">Course not found</Text>
        <TouchableOpacity onPress={handleBack} className="mt-4">
          <Text className="text-primary-400 font-inter-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark-950" edges={['top']}>
      {/* ── Fixed Header Bar ── */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-dark-800">
        <TouchableOpacity
          onPress={handleBack}
          className="w-10 h-10 rounded-full bg-dark-800 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-inter-semibold flex-1 mx-3" numberOfLines={1}>
          {course.title}
        </Text>
        <TouchableOpacity
          onPress={handleBookmark}
          className="w-10 h-10 rounded-full bg-dark-800 items-center justify-center"
        >
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isBookmarked ? '#17B07E' : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Hero Image */}
        <Image
          source={{ uri: course.images[0] ?? course.thumbnail }}
          className="w-full h-56"
          contentFit="cover"
          transition={300}
        />

        <View className="px-5 pt-5">
          {/* Category & Rating */}
          <View className="flex-row items-center justify-between mb-3">
            <Badge
              label={getCategoryLabel(course.category)}
              variant="primary"
              size="md"
            />
            <View className="flex-row items-center">
              <Ionicons name="star" size={16} color="#FFA520" />
              <Text className="text-accent-400 text-base font-inter-bold ml-1">
                {formatRating(course.rating)}
              </Text>
              <Text className="text-dark-400 text-sm font-inter-regular ml-1">
                ({formatCount(course.studentsEnrolled)})
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text className="text-white text-2xl font-inter-bold mb-2">
            {course.title}
          </Text>

          {/* Description */}
          <Text className="text-dark-200 text-base font-inter-regular leading-6 mb-5">
            {course.description}
          </Text>

          {/* Instructor Card */}
          <View className="bg-dark-800 rounded-2xl p-4 flex-row items-center mb-5 border border-dark-700">
            <Image
              source={{ uri: course.instructor.avatar }}
              className="w-14 h-14 rounded-full"
              contentFit="cover"
            />
            <View className="ml-4 flex-1">
              <Text className="text-white text-base font-inter-semibold">
                {course.instructor.name}
              </Text>
              <Text className="text-dark-300 text-sm font-inter-regular mt-0.5">
                Course Instructor
              </Text>
              <Text className="text-dark-400 text-xs font-inter-regular mt-0.5">
                📍 {course.instructor.location}
              </Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View className="flex-row mb-5">
            <View className="flex-1 bg-dark-800 rounded-2xl p-4 mr-2 items-center border border-dark-700">
              <Ionicons name="people" size={24} color="#17B07E" />
              <Text className="text-white text-lg font-inter-bold mt-2">
                {formatCount(course.studentsEnrolled)}
              </Text>
              <Text className="text-dark-400 text-xs font-inter-regular">
                Students
              </Text>
            </View>
            <View className="flex-1 bg-dark-800 rounded-2xl p-4 mx-1 items-center border border-dark-700">
              <Ionicons name="time" size={24} color="#FFA520" />
              <Text className="text-white text-lg font-inter-bold mt-2">
                4.5h
              </Text>
              <Text className="text-dark-400 text-xs font-inter-regular">
                Duration
              </Text>
            </View>
            <View className="flex-1 bg-dark-800 rounded-2xl p-4 ml-2 items-center border border-dark-700">
              <Ionicons name="document-text" size={24} color="#10B981" />
              <Text className="text-white text-lg font-inter-bold mt-2">
                12
              </Text>
              <Text className="text-dark-400 text-xs font-inter-regular">
                Lessons
              </Text>
            </View>
          </View>

          {/* Price Section */}
          <View className="bg-dark-800 rounded-2xl p-5 mb-5 border border-dark-700">
            <View className="flex-row items-end justify-between mb-4">
              <View>
                <Text className="text-dark-400 text-sm font-inter-regular line-through">
                  {formatPrice(course.originalPrice)}
                </Text>
                <Text className="text-white text-3xl font-inter-bold">
                  {formatPrice(course.price)}
                </Text>
              </View>
              <Badge
                label={`${Math.round(course.discountPercentage)}% OFF`}
                variant="success"
                size="md"
              />
            </View>

            <Button
              title={isEnrolled ? '✅ Enrolled' : 'Enroll Now'}
              onPress={handleEnroll}
              variant={isEnrolled ? 'secondary' : 'primary'}
              size="lg"
              className="w-full"
            />
          </View>

          {/* View Content Button */}
          <Button
            title="📖 View Course Content"
            onPress={handleViewContent}
            variant="secondary"
            size="lg"
            className="mb-5"
          />

          {/* Course Images Gallery */}
          {course.images.length > 1 && (
            <View className="mb-5">
              <Text className="text-white text-lg font-inter-bold mb-3">
                Course Gallery
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10 }}
              >
                {course.images.map((img, index) => (
                  <Image
                    key={index}
                    source={{ uri: img }}
                    className="w-48 h-32 rounded-xl"
                    contentFit="cover"
                    transition={200}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
