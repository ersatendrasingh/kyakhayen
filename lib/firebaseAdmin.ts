import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = require("../app/config/serviceAccountKey.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
