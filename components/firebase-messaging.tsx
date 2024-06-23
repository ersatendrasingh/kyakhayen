"use client";

import { useEffect } from "react";
import { getFirebaseToken } from "@/lib/generateFirebaseToken";
import { useCurrentUser } from "@/hooks/use-current-user";

const FirebaseMessaging = () => {
  const user = useCurrentUser();

  useEffect(() => {
    const saveToken = async () => {
      if (!user) {
        return;
      }

      if (user.firebaseToken) {
        return;
      }
      await getFirebaseToken();
    };

    saveToken();
  }, [user]);
  return null;
};

export default FirebaseMessaging;
