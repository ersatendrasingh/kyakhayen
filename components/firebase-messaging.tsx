"use client";

import { useEffect, useState } from "react";
import { messaging, getToken, onMessage } from "@/app/firebase-config";

const FirebaseMessagingComponent = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if (!messaging) return;

    async function requestPermissionAndGetToken() {
      try {
        const currentToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_VAPID_KEY,
        });
        if (currentToken) {
          console.log("Current token for client: ", currentToken);
          // Send the token to your server and update the UI if necessary
          // ...
        } else {
          console.log(
            "No registration token available. Request permission to generate one."
          );
          // Show permission UI.
          // ...
        }
      } catch (err) {
        console.log("An error occurred while retrieving token. ", err);
        // ...
      }
    }

    if (isClient) {
      requestPermissionAndGetToken();

      // Handle incoming messages.
      onMessage(messaging, (payload) => {
        console.log("Message received. ", payload);
        // Customize notification here
        // ...
      });
    }
  }, [isClient]);

  return null;
};

export default FirebaseMessagingComponent;
