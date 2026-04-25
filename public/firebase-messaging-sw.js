importScripts(
  "https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyDuYj9StJwnytFR-tYd1BLs3nqqplaZ0Ik",
  authDomain: "galilee-60b24.firebaseapp.com",
  projectId: "galilee-60b24",
  storageBucket: "galilee-60b24.firebasestorage.app",
  messagingSenderId: "804091013860",
  appId: "1:804091013860:web:96c1296214dc7264279af1",
  measurementId: "G-TMGB6V16NG",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/favicon.ico",
  });
});
