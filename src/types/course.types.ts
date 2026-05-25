// ─── Course Types ───────────────────────────────────────────────────

/** Raw product shape from /api/v1/public/randomproducts */
export interface RawProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

/** Raw user shape from /api/v1/public/randomusers */
export interface RawInstructor {
  id: number;
  gender: string;
  name: { title: string; first: string; last: string };
  email: string;
  picture: { large: string; medium: string; thumbnail: string };
  location: {
    city: string;
    state: string;
    country: string;
  };
  phone: string;
  nat: string;
}

/** Mapped course model used throughout the app */
export interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  rating: number;
  studentsEnrolled: number;
  category: string;
  thumbnail: string;
  images: string[];
  instructor: Instructor;
}

export interface Instructor {
  id: number;
  name: string;
  email: string;
  avatar: string;
  location: string;
}

export interface CourseState {
  courses: Course[];
  instructors: Instructor[];
  bookmarkedIds: number[];
  enrolledIds: number[];
  searchQuery: string;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
}

export type CourseAction =
  | { type: 'COURSES_LOADING' }
  | { type: 'COURSES_REFRESHING' }
  | { type: 'COURSES_SUCCESS'; payload: { courses: Course[]; hasMore: boolean; page: number } }
  | { type: 'COURSES_FAILURE'; payload: string }
  | { type: 'SET_INSTRUCTORS'; payload: Instructor[] }
  | { type: 'TOGGLE_BOOKMARK'; payload: number }
  | { type: 'TOGGLE_ENROLL'; payload: number }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'HYDRATE_BOOKMARKS'; payload: number[] }
  | { type: 'HYDRATE_ENROLLED'; payload: number[] };
