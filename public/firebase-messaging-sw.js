importScripts(
  "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js"
);
// Require your Firebase configuration using CommonJS syntax
firebase.initializeApp({
  apiKey: "AIzaSyDNK78V91P-kgX2F3BSHto39v8KMBJjIOM",
  authDomain: "kya-khayen-6873c.firebaseapp.com",
  projectId: "kya-khayen-6873c",
  storageBucket: "kya-khayen-6873c.appspot.com",
  messagingSenderId: "426670113115",
  appId: "1:426670113115:web:777a166f791b3684879a7e",
  measurementId: "G-PL83R815TK",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/firebase-logo.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
