const { JWT } = require("google-auth-library");

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
const registrationToken = process.env.FIREBASE_TEST_REGISTRATION_TOKEN;

if (!projectId || !clientEmail || !privateKey || !registrationToken) {
  throw new Error(
    "Set Firebase Admin credentials and FIREBASE_TEST_REGISTRATION_TOKEN before sending a test notification."
  );
}

const message = {
  notification: {
    title: "Hello from Kya Khayen",
    body: "This notification is sent from the server to test Firebase Cloud Messaging.",
  },
  token: registrationToken,
};

const sendNotification = async () => {
  const client = new JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });
  const { access_token: accessToken } = await client.authorize();

  if (!accessToken) {
    throw new Error("Unable to authorize Firebase messaging request.");
  }

  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  console.log("Successfully sent message:", await response.json());
};

sendNotification().catch((error) => {
  console.error("Error sending message:", error);
  process.exitCode = 1;
});
