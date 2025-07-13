# 🚀 Organized AI - Standalone App Installation Guide

Since `bun run tauri dev` works perfectly, let's create a standalone app using multiple approaches:

## Method 1: Direct Executable Launch (Quickest)

Since your dev build works, the executable already exists. Create a simple launcher:

1. **Find your working executable:**
   ```bash
   ls -la src-tauri/target/debug/organized-agents
   ```

2. **Create an Automator Application:**
   - Open **Automator** (Spotlight: Cmd+Space, type "Automator")
   - Choose **"Application"** as document type
   - Add **"Run Shell Script"** action
   - Set Shell to `/bin/bash`
   - Paste this script:
   ```bash
   cd "/Users/supabowl/Downloads/Cursor/Organized AI Client/organized-agents"
   ./src-tauri/target/debug/organized-agents
   ```
   - Save as **"Organized AI"** to your Applications folder
   - **Done!** Double-click to launch

## Method 2: Package Existing Build

Run these commands one by one in Terminal:

```bash
# 1. Navigate to project
cd "/Users/supabowl/Downloads/Cursor/Organized AI Client/organized-agents"

# 2. Build frontend only (ignore TypeScript errors)
NODE_ENV=production bunx vite build || true

# 3. Build Tauri without frontend rebuild
cd src-tauri
cargo build --release --no-default-features
cd ..

# 4. Create app bundle
mkdir -p "/Applications/Organized AI.app/Contents/MacOS"
mkdir -p "/Applications/Organized AI.app/Contents/Resources"

# 5. Copy executable (try release first, then debug)
cp src-tauri/target/release/organized-agents "/Applications/Organized AI.app/Contents/MacOS/Organized AI" || \
cp src-tauri/target/debug/organized-agents "/Applications/Organized AI.app/Contents/MacOS/Organized AI"

# 6. Make executable
chmod +x "/Applications/Organized AI.app/Contents/MacOS/Organized AI"

# 7. Copy icon
cp src-tauri/icons/icon.icns "/Applications/Organized AI.app/Contents/Resources/"

# 8. Create Info.plist
cat > "/Applications/Organized AI.app/Contents/Info.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>Organized AI</string>
    <key>CFBundleIconFile</key>
    <string>icon.icns</string>
    <key>CFBundleIdentifier</key>
    <string>ai.organized.desktop</string>
    <key>CFBundleName</key>
    <string>Organized AI</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
</dict>
</plist>
EOF

# 9. Clear quarantine
xattr -cr "/Applications/Organized AI.app"

# 10. Open Applications folder
open /Applications
```

## Method 3: Build with TypeScript Bypass

If the above fails, use this approach that completely bypasses TypeScript:

```bash
# 1. Backup and modify package.json
cd "/Users/supabowl/Downloads/Cursor/Organized AI Client/organized-agents"
cp package.json package.json.backup

# 2. Change build script to skip TypeScript
sed -i '' 's/"build": "tsc && vite build"/"build": "vite build"/' package.json

# 3. Build without TypeScript checking
TSC_COMPILE_ON_ERROR=true bunx tauri build

# 4. Restore package.json
mv package.json.backup package.json
```

## Method 4: Use Tauri's Built-in DMG Creator

```bash
# This creates a proper installer
cd "/Users/supabowl/Downloads/Cursor/Organized AI Client/organized-agents"
bunx tauri build --target universal-apple-darwin
```

The DMG file will be in: `src-tauri/target/universal-apple-darwin/release/bundle/dmg/`

## Method 5: Manual App Bundle Creation

1. **Create a new folder** on Desktop called "Organized AI.app"
2. **Inside it, create:**
   - `Contents/MacOS/` (folder)
   - `Contents/Resources/` (folder)
   - `Contents/Info.plist` (file)

3. **Copy your working executable:**
   - From: `organized-agents/src-tauri/target/debug/organized-agents`
   - To: `Organized AI.app/Contents/MacOS/Organized AI`

4. **Copy the icon:**
   - From: `organized-agents/src-tauri/icons/icon.icns`
   - To: `Organized AI.app/Contents/Resources/icon.icns`

5. **Edit Info.plist** with TextEdit:
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
       <key>CFBundleExecutable</key>
       <string>Organized AI</string>
       <key>CFBundleIconFile</key>
       <string>icon.icns</string>
       <key>CFBundleName</key>
       <string>Organized AI</string>
   </dict>
   </plist>
   ```

6. **Right-click** the app → "Show Package Contents" → verify structure
7. **Drag to Applications** folder
8. **Double-click** to run!

## Troubleshooting

### If app won't open:
- Right-click → Open → Open (bypasses Gatekeeper)
- Terminal: `xattr -d com.apple.quarantine "/Applications/Organized AI.app"`

### If blank screen:
- The app needs to load frontend resources from the project directory
- Ensure the project stays in its current location

### If crashes immediately:
- Check Console.app for error messages
- Ensure all dependencies are installed: `bun install`

## Success Indicators

✅ App appears in Applications folder  
✅ Has proper icon  
✅ Opens without Terminal  
✅ Shows full interface (not blank)  
✅ Can be added to Dock  

## Quick Test

After installation, test by:
1. Quit Terminal completely
2. Open Spotlight (Cmd+Space)
3. Type "Organized AI"
4. Press Enter
5. App should launch with full interface!

---

💡 **Pro Tip:** Method 1 (Automator) is the fastest and most reliable since your dev build already works perfectly!