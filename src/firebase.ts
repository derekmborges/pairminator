import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const analytics = getAnalytics(app);
export const auth = getAuth(app);

let db: Firestore
if (process.env.NODE_ENV === "development" && process.env.REACT_APP_DATA_SOURCE === "emulators") {
    console.log('*Connecting to Firebase Emulators*')
    let firestoreSettings = {
        host: 'localhost:8080',
        ssl: false,
        experimentalForceLongPolling: true
    };
    db = initializeFirestore(app, firestoreSettings)
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
} else {
    db = getFirestore(app);
}

export const database = db