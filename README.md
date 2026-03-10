# ARPSC Ham Radio Club App

A React Native mobile app for the ARPSC Ham Radio Club, built with Expo.

## Features

- 📱 **Home Screen**: Quick access to club info and upcoming events
- 📡 **Info Screen**: Detailed club information, frequencies, and contact details
- 👥 **Members Screen**: Browse and search club members with callsigns
- 💬 **Chat Screen**: Real-time chat with Firebase integration
- 📅 **Events Screen**: View club events and activities

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add a Web app to your project
4. Copy the configuration and update `firebaseConfig.js`
5. Enable Firestore Database in your Firebase project

### 3. Run the App

```bash
# Start Expo
npm start

# Run on specific platform
npm run android
npm run ios
npm run web
```

## Technologies Used

- **React Native** with Expo
- **React Navigation** for tab navigation
- **Firebase Firestore** for real-time chat
- **@expo/vector-icons** for icons

## Project Structure

```
ARPSCApp/
├── App.js              # Main app component
├── firebaseConfig.js   # Firebase configuration
├── package.json        # Dependencies
├── app.json           # Expo configuration
└── babel.config.js    # Babel configuration
```

## Features Included

### Chat System
- Real-time messaging with Firebase
- User identification with callsigns
- Message timestamps
- Long-press to delete own messages

### Member Management
- Search members by name or callsign
- Display license class
- Member count display

### Frequency Information
- Multiple repeater frequencies
- Modal with detailed frequency info
- Offset and tone information

### Events Calendar
- Upcoming events display
- Event details (date, location, frequency)
- Categorized by type

## Customization

To customize the app for your club:

1. Update `clubInfo` object in App.js with your club details
2. Modify `members` array with your club members
3. Update `events` array with your club events
4. Add your Firebase configuration in `firebaseConfig.js`

## License

MIT
