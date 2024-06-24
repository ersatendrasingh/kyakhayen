importScripts(
  "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js"
);

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

// Handle background messages
messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || "/icons-192.png",
    image: payload.notification.image,
    data: {
      url: payload.data.url, // Assuming click_action contains the URL
    },
  };

  // Close all existing notifications to ensure only one is shown
  self.registration.getNotifications().then((notifications) => {
    notifications.forEach((notification) => {
      notification.close();
    });

    // Show the new notification
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
});

// Handle the push event and show a custom notification
self.addEventListener("push", function (event) {
  if (event.data) {
    const payload = event.data.json();
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: payload.notification.icon || "/icons-192.png",
      image: payload.notification.image,
      data: {
        url: payload.data.url, // Assuming click_action contains the URL
      },
    };

    // Close all existing notifications to ensure only one is shown
    self.registration.getNotifications().then((notifications) => {
      notifications.forEach((notification) => {
        notification.close();
      });

      // Show the new notification
      self.registration.showNotification(
        notificationTitle,
        notificationOptions
      );
    });
  }
});

// Optional: Handle notification click event
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const urlToOpen = event.notification.data.url;

  event.waitUntil(clients.openWindow(urlToOpen));
});
