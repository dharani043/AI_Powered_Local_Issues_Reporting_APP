import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDp3LDZTM9Zy3k-xqCgRmmEEZKj4HXQ7po",
  authDomain: "pushnotification-civic.firebaseapp.com",
  projectId: "pushnotification-civic",
  storageBucket: "pushnotification-civic.firebasestorage.app",
  messagingSenderId: "16419014370",
  appId: "1:16419014370:web:cfe97d704c4650ef2240bb",
  measurementId: "G-3GGK9TCKJB"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push messaging is not supported');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      const token = await getToken(messaging, {
        vapidKey: 'BPcHM74GWFerL5X0OzWDYYW57KGofH__9YYiUu52uTRJyV1iRI_vkc1nE5ZCVUbe0iEY04CpVKgtSJ9dPiY3kMk',
        serviceWorkerRegistration: registration
      });
      return token;
    }
  } catch (error) {
    console.error('Notification permission error:', error);
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });