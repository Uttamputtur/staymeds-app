/**
 * Patient Application Local Notification Helper
 */

export const requestPatientNotificationPermission = async () => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (err) {
      return false;
    }
  }
  return false;
};

export const sendPatientReminderNotification = (medicineName, scheduledTime) => {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification('💊 StayMeds Medication Reminder', {
        body: `Time to take your ${medicineName}. Scheduled for ${scheduledTime}.`,
        icon: '/favicon.ico',
      });
    } catch (err) {
      console.warn('Error sending patient reminder notification:', err);
    }
  }
};
