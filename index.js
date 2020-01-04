const dotenv = require("dotenv");
const firebase = require("firebase");
const { execSync } = require("child_process");
const moment = require("moment");
const fs = require("fs");

const PATH_TO_LOG = "/Users/scott/Dropbox/jrnl/log.txt";

require("firebase/firestore");

dotenv.config({ path: __dirname + "/.env" });

firebase.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID
});

const db = firebase.firestore();

const json = execSync(`jrnl fin --export json`, {
  encoding: "utf-8"
});

const jrnl = db.collection("jrnl");

const TIME_STAMP = moment().toISOString();
const entries = JSON.parse(json).entries;

firebase
  .auth()
  .signInWithEmailAndPassword(
    process.env.FIREBASE_EMAIL,
    process.env.FIREBASE_PASSWORD
  )
  .then(() => {
    jrnl
      .doc("entries")
      .set({ entries })
      .then(() => {
        fs.appendFile(
          PATH_TO_LOG,
          `${TIME_STAMP} SUCCESS ${entries.length} ${" "}\r\n`,
          function() {
            console.log("✅ sync successful.");
            process.exit(1);
          }
        );
      })
      .catch(err => {
        fs.appendFile(
          PATH_TO_LOG,
          `${TIME_STAMP} FAILURE ${" "} ${JSON.stringify(err)}\r\n`,
          function() {
            console.log("❌ sync failed. See log for full error.");
            process.exit(1);
          }
        );
      });
  });
