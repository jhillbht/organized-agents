#!/bin/bash
# Organized AI - Standalone App Installer
# This creates a proper macOS app from your working dev build

set -e

echo "🚀 Installing Organized AI as Standalone App..."
echo "============================================="

# Set paths
PROJECT_DIR="/Users/supabowl/Downloads/Cursor/Organized AI Client/organized-agents"
APP_PATH="/Applications/Organized AI.app"

# Navigate to project
cd "$PROJECT_DIR"

# Remove old app if exists
echo "🧹 Cleaning up old installation..."
rm -rf "$APP_PATH" 2>/dev/null || true

# Create app bundle structure
echo "📁 Creating app bundle..."
mkdir -p "$APP_PATH/Contents/MacOS"
mkdir -p "$APP_PATH/Contents/Resources"

# Find and copy executable
echo "🔍 Locating executable..."
if [ -f "src-tauri/target/debug/organized-agents" ]; then
    echo "✅ Found debug build"
    cp "src-tauri/target/debug/organized-agents" "$APP_PATH/Contents/MacOS/Organized AI"
elif [ -f "src-tauri/target/release/organized-agents" ]; then
    echo "✅ Found release build"
    cp "src-tauri/target/release/organized-agents" "$APP_PATH/Contents/MacOS/Organized AI"
else
    echo "❌ No executable found!"
    echo "🔧 Attempting to build..."
    cd src-tauri && cargo build && cd ..
    cp "src-tauri/target/debug/organized-agents" "$APP_PATH/Contents/MacOS/Organized AI"
fi

# Make executable
chmod +x "$APP_PATH/Contents/MacOS/Organized AI"

# Copy icon
echo "🎨 Adding app icon..."
if [ -f "src-tauri/icons/icon.icns" ]; then
    cp "src-tauri/icons/icon.icns" "$APP_PATH/Contents/Resources/icon.icns"
else
    echo "⚠️  Icon not found, app will use default"
fi

# Create Info.plist
echo "📝 Creating app metadata..."
cat > "$APP_PATH/Contents/Info.plist" << 'EOF'
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
    <key>CFBundleDisplayName</key>
    <string>Organized AI</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.15</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>LSApplicationCategoryType</key>
    <string>public.app-category.developer-tools</string>
</dict>
</plist>
EOF

# Remove quarantine and sign
echo "🔐 Preparing app for launch..."
xattr -cr "$APP_PATH"
codesign --force --deep --sign - "$APP_PATH" 2>/dev/null || true

echo ""
echo "✅ SUCCESS! Organized AI has been installed!"
echo "============================================="
echo ""
echo "📍 Location: /Applications/Organized AI"
echo "🚀 You can now:"
echo "   • Double-click to launch from Applications"
echo "   • Search with Spotlight (Cmd+Space)"
echo "   • Drag to Dock for quick access"
echo ""

# Open Applications folder and launch
echo "Opening Applications folder..."
open /Applications
sleep 1
echo "Launching Organized AI..."
open "$APP_PATH"

echo ""
echo "🎉 Enjoy your Organized AI desktop app!"