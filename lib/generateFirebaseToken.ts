import { initializeApp } from "firebase/app";
import { isSupported, getMessaging, getToken } from "firebase/messaging";
import axios from "axios";

const FIREBASE_VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_VAPID_KEY;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

initializeApp(firebaseConfig);

export const getFirebaseToken = async () => {
  try {
    const hasFirebaseMessagingSupport = await isSupported();
    if (!hasFirebaseMessagingSupport) {
      return;
    }

    const messaging = getMessaging();
    const currentToken = await getToken(messaging, {
      vapidKey: FIREBASE_VAPID_KEY,
    });

    if (!currentToken) {
      return;
    }

    await sendTokenToServer(currentToken);
  } catch (error) {
    console.log("Problem generating Firebase token:", error);
  }
};

const sendTokenToServer = async (token: string) => {
  try {
    const response = await axios.patch("/api/user/save-firebase-token", {
      firebaseToken: token,
    });

    if (response.status !== 200) {
      throw new Error("Failed to send token to server");
    }
  } catch (error) {
    console.log("Error sending token to server:", error);
  }
};
