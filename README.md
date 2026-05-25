# 🎓 LearnHub — Mini LMS Mobile App

A production-grade **Mini Learning Management System** built with **React Native Expo**, showcasing proficiency in native features, WebView integration, state management, and full-stack development best practices.

---

## 📸 Screenshots

| Login | Course Catalog | Course Details | Profile |
|-------|---------------|----------------|---------|
| Dark themed login | Scrollable course list | Full course info | User stats |

---

## 🚀 Features

### ✅ Authentication & User Management
- User registration and login via FreeAPI endpoints
- Secure token storage with **Expo SecureStore**
- Auto-login on app restart with token validation
- Token refresh handling on 401 responses
- Profile picture update with **Expo ImagePicker**
- Logout with confirmation dialog

### ✅ Course Catalog
- Course list fetched from `/api/v1/public/randomproducts` (mapped as courses)
- Instructor data from `/api/v1/public/randomusers`
- **LegendList** virtualized rendering with item recycling
- Pull-to-refresh without UI jank
- Debounced search filtering (400ms)
- Infinite scroll pagination
- Memoized course cards with `React.memo`

### ✅ Course Details
- Hero image with overlay controls
- Instructor card with avatar and location
- Stats grid (students, duration, lessons)
- Price section with discount display
- Enroll/Bookmark toggle with haptic feedback
- Image gallery carousel
- Navigate to WebView content

### ✅ WebView Integration
- Embedded HTML content viewer for course details
- **Bidirectional communication**: Native → WebView via `postMessage`
- WebView → Native via `onMessage` handler
- Custom styled HTML template with dark theme
- Loading indicator and error handling with retry

### ✅ Local Notifications
- Permission request on first launch
- **Bookmark milestone**: Notification when user bookmarks 5+ courses
- **Inactivity reminder**: Scheduled notification after 24 hours of inactivity
- Notification response handling for deep linking

### ✅ State Management & Persistence
- **Auth State**: Context + useReducer pattern with SecureStore persistence
- **Course State**: Bookmarks and enrollments persisted in AsyncStorage
- **App State**: Network status monitoring, user preferences
- Global state hydration on app launch

### ✅ Performance Optimization
- **LegendList** with `recycleItems` and `estimatedItemSize`
- `keyExtractor` with unique course IDs
- `React.memo` on CourseCard with shallow prop comparison
- `useMemo` for filtered/sorted course lists
- `useCallback` for stable event handler references
- **Expo Image** with `cachePolicy="memory-disk"`

### ✅ Error Handling
- **React Error Boundary** with fallback UI and retry
- Axios interceptors for response errors
- Retry with exponential backoff (3 attempts for 5xx)
- Request timeout handling (15s)
- User-friendly error messages
- Offline mode banner via `@react-native-community/netinfo`
- WebView error handling with retry button

---

## 🛠 Technology Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React Native Expo (SDK 56) |
| **Language** | TypeScript (strict mode) |
| **Navigation** | Expo Router (file-based) |
| **Styling** | NativeWind v4 (Tailwind CSS for RN) |
| **Secure Storage** | expo-secure-store |
| **App Data** | @react-native-async-storage/async-storage |
| **List Rendering** | @legendapp/list (LegendList) |
| **WebView** | react-native-webview |
| **Notifications** | expo-notifications |
| **HTTP Client** | Axios (interceptors + retry) |
| **Forms** | React Hook Form + Zod |
| **Image Handling** | expo-image (with caching) |
| **Haptics** | expo-haptics |
| **Network Monitoring** | @react-native-community/netinfo |

---

## 📁 Project Structure

```
mini-lms/
├── app/                          # Expo Router file-based routes
│   ├── _layout.tsx               # Root layout (providers, fonts)
│   ├── index.tsx                 # Splash/redirect screen
│   ├── (auth)/                   # Auth group (unauthenticated)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (tabs)/                   # Main app (authenticated)
│       ├── _layout.tsx           # Tab navigator
│       ├── home/
│       │   ├── _layout.tsx       # Stack for home
│       │   ├── index.tsx         # Course catalog
│       │   └── [id].tsx          # Course details
│       ├── bookmarks.tsx         # Bookmarked courses
│       ├── webview.tsx           # WebView content viewer
│       └── profile.tsx           # User profile
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # Design system primitives
│   │   ├── CourseCard.tsx        # Memoized course card
│   │   ├── SearchBar.tsx         # Debounced search
│   │   ├── OfflineBanner.tsx     # Network status
│   │   ├── EmptyState.tsx        # Empty state placeholder
│   │   └── ErrorView.tsx        # Error with retry
│   ├── services/                 # API & native services
│   │   ├── api.ts               # Axios + interceptors
│   │   ├── auth.service.ts      # Auth API calls
│   │   ├── course.service.ts    # Course API calls
│   │   ├── notification.service.ts
│   │   └── storage.service.ts   # SecureStore + AsyncStorage
│   ├── stores/                   # State management
│   │   ├── auth.store.tsx       # Auth context + reducer
│   │   ├── course.store.tsx     # Course context + reducer
│   │   └── app.store.tsx        # App preferences + network
│   ├── types/                    # TypeScript interfaces
│   ├── utils/                    # Constants & helpers
│   └── templates/                # WebView HTML templates
├── app.json                      # Expo configuration
├── tailwind.config.js            # NativeWind theme
├── tsconfig.json                 # TypeScript strict config
└── babel.config.js               # Babel + NativeWind preset
```

---

## 🏗 Setup Instructions

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **Expo Go** app on your device (for development testing)
- **Android Studio** (for APK build) or **Xcode** (for iOS)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/mini-lms.git
cd mini-lms

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running on Device

```bash
# Android
npx expo start --android

# iOS
npx expo start --ios

# Scan QR code with Expo Go app
npx expo start
```

### Environment Variables

No environment variables are required. The app uses the public FreeAPI at `https://api.freeapi.app/api/v1`.

---

## 📱 Building APK

### Development Build (EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build Android APK
eas build --platform android --profile preview
```

### Local APK Build

```bash
# Generate native Android project
npx expo prebuild --platform android

# Build APK
cd android
./gradlew assembleRelease
# APK will be at: android/app/build/outputs/apk/release/app-release.apk
```

---

## 🔑 Key Architectural Decisions

1. **Context + useReducer over Redux**: Chosen for simplicity and zero extra dependencies. The app's state complexity doesn't warrant Redux Toolkit.

2. **Expo Router (file-based routing)**: Mirrors Next.js patterns, enables typed routes, and simplifies navigation structure.

3. **LegendList over FlatList**: As required by the assignment — provides better virtualization with item recycling and dynamic sizes.

4. **Dual storage strategy**: SecureStore for auth tokens (encrypted), AsyncStorage for bookmarks/preferences (fast JSON serialization).

5. **Axios interceptors**: Centralized error handling, automatic token refresh on 401, and exponential backoff retry for 5xx errors.

6. **NativeWind v4**: Tailwind CSS utilities for React Native — enables rapid UI development with consistent design tokens.

---

## ⚠️ Known Limitations

- **FreeAPI data mapping**: Products are mapped as courses and random users as instructors. Some fields (duration, lessons) use placeholder values.
- **Profile picture upload**: The FreeAPI `/users/avatar` endpoint may not persist across sessions.
- **Offline mode**: The app shows an offline banner but doesn't cache course data for full offline access.
- **Notifications**: The 24-hour inactivity reminder requires the app to have been opened at least once to schedule.

---

## 📄 License

MIT License — Built as a technical assignment for House of EdTech.
