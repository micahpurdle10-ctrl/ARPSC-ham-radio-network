# Login System Documentation

## Overview
The app now has a secure PIN-based login system with three user roles.

## Login PINs

| Role | PIN | Badge | Description |
|------|-----|-------|-------------|
| **Owner** | 501 | 👑 | Full access and control |
| **Moderator** | 236 | 🛡️ | Moderation privileges |
| **User** | 958 | 👤 | Standard user access |

## How It Works

### 1. Login Screen
- When you first open the app, you'll see the login screen
- Enter the 3-digit PIN for your role
- Click the eye icon to show/hide the PIN as you type
- Press "Login" to access the app

### 2. After Login
- Your role badge appears on the Home screen
- Example: "👑 Logged in as: Owner"
- You can use all app features

### 3. Logout
- Click the logout button (🚪 icon) in the top-right of the Home screen
- Confirm you want to logout
- You'll return to the login screen

## Features

✅ **Secure PIN Entry**
- 3-digit PIN codes
- Show/hide PIN option
- Numeric keyboard

✅ **Role Identification**
- Each role has a unique badge emoji
- Role name displayed on Home screen
- Welcome message on successful login

✅ **Error Handling**
- Invalid PIN shows error alert
- Login button disabled until 3 digits entered
- Confirmation dialog before logout

## Using the Login System

### To Login as Owner:
1. Enter PIN: **501**
2. See: "Welcome Owner! 👑"

### To Login as Moderator:
1. Enter PIN: **236**
2. See: "Welcome Moderator! 🛡️"

### To Login as User:
1. Enter PIN: **958**
2. See: "Welcome User! 👤"

## Customization

To change PINs or add new roles, edit the `USER_ROLES` object in App.js:

```javascript
const USER_ROLES = {
    MOD: { pin: '236', name: 'Moderator', badge: '🛡️' },
    OWNER: { pin: '501', name: 'Owner', badge: '👑' },
    USER: { pin: '958', name: 'User', badge: '👤' }
}
```

## Future Enhancements

Potential additions for the login system:
- Role-based permissions (e.g., only moderators can delete messages)
- User profiles with callsigns
- Session persistence (stay logged in)
- Password/biometric authentication
- Multiple user accounts

## Security Notes

⚠️ **Important**: The current PIN system is basic authentication. For production use, consider:
- Using Firebase Authentication
- Implementing proper password hashing
- Adding session management
- Enabling two-factor authentication

---

**73!** 📻
