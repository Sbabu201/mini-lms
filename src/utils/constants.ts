export const API_BASE_URL = 'https://api.freeapi.app/api/v1';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'learnhub_access_token',
  REFRESH_TOKEN: 'learnhub_refresh_token',
  USER_DATA: 'learnhub_user_data',
  BOOKMARKS: 'learnhub_bookmarks',
  ENROLLED: 'learnhub_enrolled',
  PREFERENCES: 'learnhub_preferences',
  LAST_OPENED: 'learnhub_last_opened',
} as const;

export const APP_CONFIG = {
  API_TIMEOUT: 15000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  COURSES_PER_PAGE: 10,
  SEARCH_DEBOUNCE_MS: 400,
  BOOKMARK_NOTIFICATION_THRESHOLD: 5,
  INACTIVITY_REMINDER_HOURS: 24,
} as const;

export const COURSE_CATEGORIES = [
  'All',
  'smartphones',
  'laptops',
  'fragrances',
  'skincare',
  'groceries',
  'home-decoration',
] as const;
