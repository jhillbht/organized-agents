# 🎨 Icon Update Guide for Organized Agents

## Perfect Icon Choice!

The human-AI handshake perfectly represents organized-agents:
- **Human-AI Collaboration** - Core mission of the project
- **Bridge Building** - Connecting creativity with AI capability  
- **Accessibility** - Welcoming, inclusive technology
- **Partnership** - Augmenting humans, not replacing them

## 🚀 Quick Update Process

### 1. Save Your Icon
Save the handshake image as `source-icon.png` in the project root (this directory).
**Recommended size:** 1024x1024 or higher for best quality.

### 2. Run the Generator
```bash
./generate-icons.sh
```

This script will:
- ✅ Generate all 18 required icon formats
- ✅ Backup existing icons 
- ✅ Create Windows ICO and macOS ICNS bundles
- ✅ Optimize for all platforms

### 3. Test Your Icons
```bash
npm run tauri:dev
```

Check that icons appear correctly in:
- Window title bar
- Dock/taskbar
- Alt+Tab switcher  
- App launcher

### 4. Commit Changes
```bash
git add src-tauri/icons/ generate-icons.sh ICON_UPDATE_GUIDE.md
git commit -m "Update app icons to human-AI handshake design

- Perfectly represents human-AI collaboration mission
- Generated all required platform formats (18 files)
- Professional branding for alpha testing and launch"
```

## 📱 Icon Requirements Met

Your project needs these formats (all will be generated):

**Core Icons:**
- `32x32.png`, `128x128.png`, `128x128@2x.png` 
- `icon.png`, `icon.ico`, `icon.icns`

**Windows Store Icons:**  
- 10 different Square logo sizes (30x30 to 310x310)
- `StoreLogo.png`

## 🎯 Branding Impact

This handshake icon will:
- **Instantly communicate** your mission
- **Stand out** in app stores and social media
- **Build trust** - shows human-centered AI approach
- **Professional appearance** for alpha testing

## 🔧 Troubleshooting

**If you get errors:**
- Ensure `source-icon.png` is in the project root
- ImageMagick is installed: `brew install imagemagick`
- Icon file is not corrupted (try opening it first)

**Icon not appearing?**
- Restart the app completely
- Clear app cache: `rm -rf src-tauri/target`
- Rebuild: `npm run tauri:build`

The handshake icon will make organized-agents immediately recognizable! 🚀
