/**
 * Browser Notification Helper Utility
 * Gracefully handles Notification permission request and desktop alert popups.
 */

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notifications.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (err) {
      console.warn('Error requesting notification permission:', err);
      return false;
    }
  }

  return false;
};

export const sendDesktopNotification = (title, options = {}) => {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });

      if (options.onClick) {
        notification.onclick = options.onClick;
      }
    } catch (err) {
      console.warn('Error sending desktop notification:', err);
    }
  }
};
