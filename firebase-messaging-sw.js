importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDp3LDZTM9Zy3k-xqCgRmmEEZKj4HXQ7po",
  authDomain: "pushnotification-civic.firebaseapp.com",
  projectId: "pushnotification-civic",
  storageBucket: "pushnotification-civic.firebasestorage.app",
  messagingSenderId: "16419014370",
  appId: "1:16419014370:web:cfe97d704c4650ef2240bb"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});