import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { CourseState, CourseAction, Course, Instructor } from '../types/course.types';
import { courseService } from '../services/course.service';
import { AppStorage } from '../services/storage.service';
import { notificationService } from '../services/notification.service';
import { STORAGE_KEYS } from '../utils/constants';
import { getErrorMessage } from '../services/api';

// ─── Initial State ───────────────────────────────────────────────────

const initialState: CourseState = {
  courses: [],
  instructors: [],
  bookmarkedIds: [],
  enrolledIds: [],
  searchQuery: '',
  isLoading: false,
  isRefreshing: false,
  error: null,
  currentPage: 1,
  hasMore: true,
};

// ─── Reducer ─────────────────────────────────────────────────────────

function courseReducer(state: CourseState, action: CourseAction): CourseState {
  switch (action.type) {
    case 'COURSES_LOADING':
      return { ...state, isLoading: true, error: null };
    case 'COURSES_REFRESHING':
      return { ...state, isRefreshing: true, error: null };
    case 'COURSES_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isRefreshing: false,
        courses:
          action.payload.page === 1
            ? action.payload.courses
            : [...state.courses, ...action.payload.courses],
        hasMore: action.payload.hasMore,
        currentPage: action.payload.page,
        error: null,
      };
    case 'COURSES_FAILURE':
      return {
        ...state,
        isLoading: false,
        isRefreshing: false,
        error: action.payload,
      };
    case 'SET_INSTRUCTORS':
      return { ...state, instructors: action.payload };
    case 'TOGGLE_BOOKMARK': {
      const isBookmarked = state.bookmarkedIds.includes(action.payload);
      const newBookmarkedIds = isBookmarked
        ? state.bookmarkedIds.filter((id) => id !== action.payload)
        : [...state.bookmarkedIds, action.payload];
      return { ...state, bookmarkedIds: newBookmarkedIds };
    }
    case 'TOGGLE_ENROLL': {
      const isEnrolled = state.enrolledIds.includes(action.payload);
      const newEnrolledIds = isEnrolled
        ? state.enrolledIds.filter((id) => id !== action.payload)
        : [...state.enrolledIds, action.payload];
      return { ...state, enrolledIds: newEnrolledIds };
    }
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'HYDRATE_BOOKMARKS':
      return { ...state, bookmarkedIds: action.payload };
    case 'HYDRATE_ENROLLED':
      return { ...state, enrolledIds: action.payload };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────

interface CourseContextValue {
  state: CourseState;
  fetchCourses: (page?: number) => Promise<void>;
  refreshCourses: () => Promise<void>;
  toggleBookmark: (courseId: number) => void;
  toggleEnroll: (courseId: number) => void;
  setSearch: (query: string) => void;
  filteredCourses: Course[];
  bookmarkedCourses: Course[];
}

const CourseContext = createContext<CourseContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────

export function CourseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(courseReducer, initialState);

  // Hydrate persisted data on mount
  useEffect(() => {
    const hydrate = async () => {
      const bookmarks = await AppStorage.get<number[]>(STORAGE_KEYS.BOOKMARKS);
      const enrolled = await AppStorage.get<number[]>(STORAGE_KEYS.ENROLLED);
      if (bookmarks) dispatch({ type: 'HYDRATE_BOOKMARKS', payload: bookmarks });
      if (enrolled) dispatch({ type: 'HYDRATE_ENROLLED', payload: enrolled });
    };
    hydrate();
  }, []);

  // Persist bookmarks whenever they change
  useEffect(() => {
    AppStorage.set(STORAGE_KEYS.BOOKMARKS, state.bookmarkedIds);
  }, [state.bookmarkedIds]);

  // Persist enrollments whenever they change
  useEffect(() => {
    AppStorage.set(STORAGE_KEYS.ENROLLED, state.enrolledIds);
  }, [state.enrolledIds]);

  const fetchCourses = useCallback(async (page: number = 1) => {
    dispatch({ type: page === 1 ? 'COURSES_LOADING' : 'COURSES_LOADING' });
    try {
      const { courses, hasMore } = await courseService.fetchCourses(page);
      // Extract instructors from fetched courses
      const instructors = courses.map((c) => c.instructor);
      dispatch({ type: 'SET_INSTRUCTORS', payload: instructors });
      dispatch({
        type: 'COURSES_SUCCESS',
        payload: { courses, hasMore, page },
      });
    } catch (error) {
      dispatch({ type: 'COURSES_FAILURE', payload: getErrorMessage(error) });
    }
  }, []);

  const refreshCourses = useCallback(async () => {
    dispatch({ type: 'COURSES_REFRESHING' });
    try {
      const { courses, hasMore } = await courseService.fetchCourses(1);
      const instructors = courses.map((c) => c.instructor);
      dispatch({ type: 'SET_INSTRUCTORS', payload: instructors });
      dispatch({
        type: 'COURSES_SUCCESS',
        payload: { courses, hasMore, page: 1 },
      });
    } catch (error) {
      dispatch({ type: 'COURSES_FAILURE', payload: getErrorMessage(error) });
    }
  }, []);

  const toggleBookmark = useCallback(
    (courseId: number) => {
      dispatch({ type: 'TOGGLE_BOOKMARK', payload: courseId });

      // Check if we've hit the notification threshold
      const isAdding = !state.bookmarkedIds.includes(courseId);
      if (isAdding) {
        const newCount = state.bookmarkedIds.length + 1;
        notificationService.sendBookmarkMilestoneNotification(newCount);
      }
    },
    [state.bookmarkedIds]
  );

  const toggleEnroll = useCallback((courseId: number) => {
    dispatch({ type: 'TOGGLE_ENROLL', payload: courseId });
  }, []);

  const setSearch = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH', payload: query });
  }, []);

  // Computed: filter courses by search query
  const filteredCourses = React.useMemo(() => {
    if (!state.searchQuery.trim()) return state.courses;
    const query = state.searchQuery.toLowerCase();
    return state.courses.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query) ||
        course.instructor.name.toLowerCase().includes(query)
    );
  }, [state.courses, state.searchQuery]);

  // Computed: bookmarked courses
  const bookmarkedCourses = React.useMemo(() => {
    return state.courses.filter((course) => state.bookmarkedIds.includes(course.id));
  }, [state.courses, state.bookmarkedIds]);

  const value: CourseContextValue = {
    state,
    fetchCourses,
    refreshCourses,
    toggleBookmark,
    toggleEnroll,
    setSearch,
    filteredCourses,
    bookmarkedCourses,
  };

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────

export function useCourses(): CourseContextValue {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
}
