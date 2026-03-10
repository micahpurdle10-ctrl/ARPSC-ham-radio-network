# FIX TO OPEN IN EDGE - DO THIS NOW

The folder path "New folder" is blocking everything.

## Quick Fix (2 minutes):

### Step 1: Close VS Code
- Click File → Exit
- Close ALL VS Code windows

### Step 2: Move the Folder
1. Open Windows Explorer
2. Go to: `C:\Users\mpurd\New folder\`
3. Find the **ARPSCApp** folder
4. **Cut it** (Ctrl+X)
5. Go to: `C:\Users\mpurd\`
6. **Paste it** (Ctrl+V)

### Step 3: Reopen VS Code
1. Open VS Code
2. File → Open Folder
3. Select: `C:\Users\mpurd\ARPSCApp`

### Step 4: Launch in Edge
In VS Code terminal, type:
```
npm start -- --web
```

Then open Edge to: **http://localhost:8081**

---

## OR - I can make an automatic script for you!

Close VS Code, then run: `C:\Users\mpurd\New folder\AUTO-FIX.bat`

This will do everything automatically!
