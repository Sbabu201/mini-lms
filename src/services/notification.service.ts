import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { AppStorage } from './storage.service';
import { STORAGE_KEYS, APP_CONFIG } from '../utils/constants';

// Detect if we are running inside Expo Go on Android
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const isAndroidExpoGo = Platform.OS === 'android' && isExpoGo;

// Dynamically load expo-notifications to prevent fatal crash on import in Android Expo Go
let Notifications: any = null;
if (!isAndroidExpoGo) {
  try {
    Notifications = require('expo-notifications');
  } catch {
    // Fallback to null if loading fails
  }
}

// Configure how notifications appear when app is foregrounded
if (Notifications && typeof Notifications.setNotificationHandler === 'function') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch {
    // Silently ignore configuration errors
  }
}

export const notificationService = {
  /**
   * Requests notification permissions from the user.
   * Returns true if granted.
   */
  async requestPermissions(): Promise<boolean> {
    if (!Notifications) {
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      if (existingStatus === 'granted') return true;

      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  },

  /**
   * Sends a local notification when user hits the bookmark threshold.
   */
  async sendBookmarkMilestoneNotification(bookmarkCount: number): Promise<void> {
    if (bookmarkCount !== APP_CONFIG.BOOKMARK_NOTIFICATION_THRESHOLD) return;

    if (!Notifications) {
      return;
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📚 Great Collection!',
          body: `You've bookmarked ${bookmarkCount} courses! Ready to start learning?`,
          data: { type: 'bookmark_milestone', count: bookmarkCount },
          sound: 'default',
        },
        trigger: null, // Send immediately
      });
    } catch {
      // Graceful fallback
    }
  },

  /**
   * Schedules a reminder notification if the user hasn't opened the app for 24 hours.
   */
  async scheduleInactivityReminder(): Promise<void> {
    if (!Notifications) {
      return;
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;

      // Cancel any existing inactivity reminders
      await this.cancelInactivityReminder();

      // Schedule a notification 24 hours from now
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎓 We miss you!',
          body: 'Your courses are waiting. Jump back in and keep learning!',
          data: { type: 'inactivity_reminder' },
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: APP_CONFIG.INACTIVITY_REMINDER_HOURS * 60 * 60,
        },
        identifier: 'inactivity_reminder',
      });
    } catch {
      // Graceful fallback
    }
  },

  /**
   * Cancels the inactivity reminder notification.
   */
  async cancelInactivityReminder(): Promise<void> {
    if (!Notifications) return;

    try {
      await Notifications.cancelScheduledNotificationAsync('inactivity_reminder');
    } catch {
      // Graceful fallback
    }
  },

  /**
   * Records the current timestamp as the last time the app was opened.
   */
  async recordAppOpen(): Promise<void> {
    try {
      await AppStorage.set(STORAGE_KEYS.LAST_OPENED, Date.now());
      // Reschedule inactivity reminder from this moment
      await this.scheduleInactivityReminder();
    } catch {
      // Graceful fallback
    }
  },

  /**
   * Sets up notification response handler for deep linking.
   */
  addNotificationResponseListener(
    callback: (response: any) => void
  ): any {
    if (!Notifications) {
      return {
        remove: () => {},
      };
    }

    try {
      return Notifications.addNotificationResponseReceivedListener(callback);
    } catch {
      return {
        remove: () => {},
      };
    }
  },
};
