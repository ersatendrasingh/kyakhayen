const admin = require("firebase-admin");
const serviceAccount = require("../app/config/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const registrationToken =
  "fhMwfoRqy6KyIccimA1x2j:APA91bGuRCpv1A721dyI8zJ_GATNuRDAFic5y4ILKcLTK-iW-zNWtBNXvcW0QI6rAlN4trR3ldZrJMiV7zxH_sH2_YILXeVkGqofdNs9bUjQ4anP_Jp569J7XsDigU_F4hFT52dKvbME";

const message = {
  notification: {
    title: "Hello from Kya Khayen",
    body: "This notification is sent from the server to test Firebase Cloud Messaging.",
  },
  token: registrationToken,
};

admin
  .messaging()
  .send(message)
  .then((response) => {
    console.log("Successfully sent message:", response);
  })
  .catch((error) => {
    console.log("Error sending message:", error);
  });
