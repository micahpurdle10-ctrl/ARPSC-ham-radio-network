// Firebase Configuration
// Replace these values with your actual Firebase project credentials
// Get these from: Firebase Console > Project Settings > Your apps > SDK setup and configuration

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
}

export default firebaseConfig

/*
SETUP INSTRUCTIONS:
1. Go to https://console.firebase.google.com/
2. Create a new project or select existing
3. Click "Add app" and select Web (</>) icon
4. Copy your config values and replace above
5. Enable Firestore Database:
   - Go to Firestore Database in Firebase Console
   - Click "Create database"
   - Choose "Start in test mode" for development
   - Click "Enable"
6. (Optional) Set up security rules in Firestore for production
*/
