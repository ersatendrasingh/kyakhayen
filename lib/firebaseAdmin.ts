import { JWT } from "google-auth-library";

type FirebaseMessage = {
  token: string;
  notification: {
    title: string;
    body: string;
    image?: string;
  };
  android?: {
    notification?: {
      icon?: string;
      color?: string;
    };
  };
  data?: Record<string, string>;
};

export const sendFirebaseMessage = async (message: FirebaseMessage) => {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin credentials are not configured.");
  }

  const client = new JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });
  const credentials = await client.authorize();

  if (!credentials.access_token) {
    throw new Error("Unable to authorize Firebase messaging request.");
  }

  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credentials.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    }
  );

  if (!response.ok) {
    throw new Error(`Firebase messaging failed: ${await response.text()}`);
  }

  return response.json();
};
