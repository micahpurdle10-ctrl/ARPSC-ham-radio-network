# 🌐 WEB APP LAUNCH GUIDE

## ✅ Your app is now configured to run in web browsers!

---

## 🚀 QUICK START - 3 Easy Ways to Launch

### Method 1: Double-Click Launch Files (Easiest!)

Just double-click one of these files in Windows Explorer:

- **LAUNCH-EDGE.bat** - Opens in Microsoft Edge
- **LAUNCH-CHROME.bat** - Opens in Google Chrome

That's it! The app will automatically start and open in your chosen browser.

---

### Method 2: From VS Code Terminal

Open the terminal in VS Code and run:

```bash
# For any browser (will show options)
npm run web

# Then manually open browser to:
# http://localhost:19006
```

---

### Method 3: Command Line with Auto-Open

Open PowerShell in the project folder and run:

**For Microsoft Edge:**
```powershell
powershell -ExecutionPolicy Bypass -Command "npm run web"
# Then open Edge to http://localhost:19006
```

**For Google Chrome:**
```powershell
powershell -ExecutionPolicy Bypass -Command "npm run web"
# Then open Chrome to http://localhost:19006
```

---

## 📱 Accessing the Web App

Once launched, the app will be available at:

**http://localhost:19006**

You can also access it from other devices on your network:
- Find your computer's IP address (e.g., 192.168.1.100)
- Open browser on another device
- Navigate to: http://YOUR-IP:19006

---

## 🎯 Browser Compatibility

Your app works great in:
- ✅ Microsoft Edge (Recommended)
- ✅ Google Chrome
- ✅ Mozilla Firefox
- ✅ Safari
- ✅ Any modern browser

---

## 📋 What's Included

All features work in the web version:
- ✅ Login system (3 PINs)
- ✅ Multi-room chat
- ✅ Weather & emergency alerts
- ✅ Operator check-in system
- ✅ Meeting scheduler
- ✅ Enhanced frequency list
- ✅ Dark mode
- ✅ All 10 tabs/screens
- ✅ Firebase real-time sync
- ✅ Message reactions
- ✅ Everything!

---

## 🛠️ Troubleshooting

### Server Won't Start?

1. Make sure dependencies are installed:
   ```bash
   powershell -ExecutionPolicy Bypass -Command "npm install"
   ```

2. Check if port 19006 is already in use

3. Try restarting your computer

### Browser Won't Open?

- Manually navigate to: **http://localhost:19006**
- Wait a few extra seconds for the server to fully start
- Check Windows Firewall isn't blocking the connection

### Can't See the App?

- Clear browser cache (Ctrl+Shift+Delete)
- Try a different browser
- Make sure the Expo Metro bundler window shows "Compiled successfully"

---

## 💡 Pro Tips

### Keep the Metro Window Open
- Don't close the black PowerShell/Metro window
- That's your development server
- Closing it will stop the app

### Reload the App
- Press Ctrl+R in the browser to reload
- Or use F5

### Open Developer Tools
- Press F12 in any browser
- View console logs
- Debug any issues

### Running Multiple Times
- If you get "port already in use" error
- Close all Metro/PowerShell windows
- Wait 10 seconds
- Try again

---

## 🎨 Mobile-Like Experience

For a mobile app feel in your browser:

**In Chrome/Edge:**
1. Press F12 (Developer Tools)
2. Click the device toggle icon (or Ctrl+Shift+M)
3. Select a phone model (iPhone, Samsung, etc.)
4. Now it looks just like a mobile app!

---

## 📦 Building for Production

When you're ready to deploy:

```bash
# Build for web hosting
expo build:web

# Your files will be in web-build/ folder
# Upload to any web host (Netlify, Vercel, etc.)
```

---

## 🔥 Quick Commands Reference

```bash
# Start web app
npm run web

# Install dependencies
npm install

# Start with clearing cache
npm start --clear

# View all Expo commands
expo --help
```

---

## 🌟 Access URLs

Once running, you can access the app at:

- **Local:** http://localhost:19006
- **LAN:** http://YOUR-IP-ADDRESS:19006
- **QR Code:** Shown in Metro window (for phone access)

---

## 📞 Need Help?

If you encounter issues:

1. Check the Metro bundler window for error messages
2. Check browser console (F12) for errors
3. Make sure all dependencies are installed
4. Try `npm install` again if needed
5. Restart the server

---

## 🎉 That's It!

Your ARPSC Hams Emergency Communications app is now fully configured for web browsers!

**Just double-click LAUNCH-EDGE.bat or LAUNCH-CHROME.bat to get started!**

---

**Updated:** March 7, 2026  
**Web Support:** ✅ Complete  
**Browser Tested:** Edge, Chrome, Firefox, Safari  
**Mobile Responsive:** ✅ Yes
