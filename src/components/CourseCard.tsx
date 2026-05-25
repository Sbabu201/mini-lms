import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Course } from '../types/course.types';
import { Badge } from './ui/Badge';
import { formatPrice, formatRating, formatCount, getCategoryLabel, truncateText } from '../utils/helpers';
import * as Haptics from 'expo-haptics';

interface CourseCardProps {
  course: Course;
  isBookmarked: boolean;
  isEnrolled: boolean;
  onPress: (course: Course) => void;
  onBookmark: (courseId: number) => void;
}

function CourseCardComponent({
  course,
  isBookmarked,
  isEnrolled,
  onPress,
  onBookmark,
}: CourseCardProps) {
  const handleBookmark = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBookmark(course.id);
  }, [course.id, onBookmark]);

  const handlePress = useCallback(() => {
    onPress(course);
  }, [course, onPress]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      className="bg-dark-800 rounded-3xl mb-4 mx-4 overflow-hidden border border-dark-700"
    >
      {/* Thumbnail */}
      <View className="relative">
        <Image
          source={{ uri: course.thumbnail }}
          className="w-full h-44"
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
        />

        {/* Bookmark Button */}
        <TouchableOpacity
          onPress={handleBookmark}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-dark-950/70 items-center justify-center"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isBookmarked ? '#17B07E' : '#FFFFFF'}
          />
        </TouchableOpacity>

        {/* Price Badge */}
        <View className="absolute bottom-3 left-3 bg-primary-600 rounded-xl px-3 py-1.5">
          <Text className="text-white font-inter-bold text-sm">
            {formatPrice(course.price)}
          </Text>
        </View>

        {/* Enrolled Badge */}
        {isEnrolled && (
          <View className="absolute top-3 left-3 bg-primary-500 rounded-xl px-3 py-1.5 flex-row items-center">
            <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
            <Text className="text-white font-inter-semibold text-xs ml-1">
              Enrolled
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View className="p-4">
        {/* Category */}
        <Badge
          label={getCategoryLabel(course.category)}
          variant="primary"
          size="sm"
          className="self-start mb-2"
        />

        {/* Title */}
        <Text className="text-white text-lg font-inter-bold mb-1" numberOfLines={2}>
          {course.title}
        </Text>

        {/* Description */}
        <Text className="text-dark-300 text-sm font-inter-regular mb-3" numberOfLines={2}>
          {truncateText(course.description, 100)}
        </Text>

        {/* Instructor Row */}
        <View className="flex-row items-center mb-3">
          <Image
            source={{ uri: course.instructor.avatar }}
            className="w-7 h-7 rounded-full"
            contentFit="cover"
            cachePolicy="memory-disk"
          />
          <Text className="text-dark-200 text-sm font-inter-medium ml-2">
            {course.instructor.name}
          </Text>
        </View>

        {/* Stats Row */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="star" size={14} color="#FFA520" />
            <Text className="text-accent-400 text-sm font-inter-semibold ml-1">
              {formatRating(course.rating)}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="people-outline" size={14} color="#6B7D96" />
            <Text className="text-dark-300 text-sm font-inter-regular ml-1">
              {formatCount(course.studentsEnrolled)} students
            </Text>
          </View>

          {course.discountPercentage > 0 && (
            <View className="flex-row items-center">
              <Text className="text-dark-400 text-xs font-inter-regular line-through">
                {formatPrice(course.originalPrice)}
              </Text>
              <Text className="text-primary-400 text-xs font-inter-semibold ml-1">
                {Math.round(course.discountPercentage)}% off
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export const CourseCard = memo(CourseCardComponent, (prev, next) => {
  return (
    prev.course.id === next.course.id &&
    prev.isBookmarked === next.isBookmarked &&
    prev.isEnrolled === next.isEnrolled
  );
});
