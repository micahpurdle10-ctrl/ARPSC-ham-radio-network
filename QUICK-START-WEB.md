# 🚀 QUICK START - Launch Web App

## ⚡ FASTEST METHOD (Recommended)

**Just double-click one of these files:**

### In Windows Explorer:
1. Navigate to: `C:\Users\mpurd\New folder\ARPSCApp`
2. Double-click: **LAUNCH-EDGE.bat**

**That's it!** The app will open in Microsoft Edge automatically.

---

## 🌐 Alternative Browsers

- **For Chrome:** Double-click `LAUNCH-CHROME.bat`
- **For Firefox/Safari:** Use Method 2 below

---

## 📋 OTHER METHODS

### Method 2: From VS Code Terminal

1. Open VS Code terminal (Ctrl+`)
2. Copy and paste:
   ```bash
   powershell -ExecutionPolicy Bypass -Command "npm run web"
   ```
3. Wait for "Compiled successfully" message
4. Open browser to: **http://localhost:19006**

---

### Method 3: PowerShell (Advanced)

1. Open PowerShell
2. Navigate to project:
   ```powershell
   cd "C:\Users\mpurd\New folder\ARPSCApp"
   ```
3. Run:
   ```powershell
   powershell -ExecutionPolicy Bypass -Command "npm run web"
   ```
4. Open browser to: **http://localhost:19006**

---

## 🔗 Access URLs

Once running:

- **Your Computer:** http://localhost:19006
- **LAN/Other Devices:** http://YOUR-IP:19006
- **Default Port:** 19006

---

## ⏱️ First-Time Startup

**First launch takes 30-60 seconds** to:
- Build the web bundle
- Start Metro bundler
- Compile JavaScript

**Subsequent launches are much faster** (5-10 seconds)

---

## ✅ SUCCESS INDICATORS

You'll know it's ready when you see:

```
Metro waiting on exp://localhost:19000
› Press w │ open web

Logs for your project will appear below.
```

Then just open: **http://localhost:19006** in your browser!

---

## 🛑 To Stop the Server

- Press **Ctrl+C** in the terminal window
- Or close the Metro/PowerShell window

---

## ⚠️ Troubleshooting

### "Port already in use"
- Close all Metro/PowerShell windows
- Wait 10 seconds
- Try again

### Dependencies Missing
```bash
powershell -ExecutionPolicy Bypass -Command "npm install"
```

### Still Having Issues?
- Restart your computer
- Delete `node_modules` folder
- Run `npm install` again

---

## 🎯 RECOMMENDED: Use .bat Files

The `.bat` files handle everything automatically:
- ✅ Start the server
- ✅ Wait for it to be ready  
- ✅ Open your browser
- ✅ Navigate to the correct URL

**Just double-click and go!**

---

**Updated:** March 7, 2026  
**Server Port:** 19006  
**Browser:** Any modern browser
