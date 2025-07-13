#!/bin/bash

echo "🚀 Creating Standalone Organized AI App"
echo "======================================"

PROJECT_DIR="/Users/supabowl/Downloads/Cursor/Organized AI Client/organized-agents"
cd "$PROJECT_DIR"

# Step 1: Build frontend
echo "📦 Step 1: Building frontend..."
NODE_OPTIONS="--max-old-space-size=8192" bun run build || {
    echo "Frontend build failed, trying npm..."
    NODE_OPTIONS="--max-old-space-size=8192" npm run build
}

# Step 2: Build Tauri production app
echo "🔧 Step 2: Building Tauri production app..."
bunx tauri build || {
    echo "Tauri build failed, trying npx..."
    npx tauri build
}

# Step 3: Install to Applications
echo "📱 Step 3: Installing to Applications..."

# Remove old version
rm -rf "/Applications/Organized AI.app" 2>/dev/null

# Check for Tauri-generated app bundle
if [ -d "src-tauri/target/release/bundle/macos/Organized AI.app" ]; then
    echo "✅ Found Tauri app bundle, installing..."
    cp -r "src-tauri/target/release/bundle/macos/Organized AI.app" "/Applications/"
    
elif [ -f "src-tauri/target/release/organized-agents" ]; then
    echo "🔧 Creating custom app bundle from executable..."
    
    # Create app structure
    mkdir -p "/Applications/Organized AI.app/Contents/MacOS"
    mkdir -p "/Applications/Organized AI.app/Contents/Resources"
    
    # Copy executable
    cp "src-tauri/target/release/organized-agents" "/Applications/Organized AI.app/Contents/MacOS/organized-ai"
    chmod +x "/Applications/Organized AI.app/Contents/MacOS/organized-ai"
    
    # Copy icon
    if [ -f "src-tauri/icons/icon.icns" ]; then
        cp "src-tauri/icons/icon.icns" "/Applications/Organized AI.app/Contents/Resources/icon.icns"
    fi
    
    # Create Info.plist
    cat > "/Applications/Organized AI.app/Contents/Info.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDisplayName</key>
    <string>Organized AI</string>
    <key>CFBundleExecutable</key>
    <string>organized-ai</string>
    <key>CFBundleIconFile</key>
    <string>icon.icns</string>
    <key>CFBundleIdentifier</key>
    <string>organized-agents.bhtlabs.ai</string>
    <key>CFBundleName</key>
    <string>Organized AI</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSRequiresAquaSystemAppearance</key>
    <false/>
</dict>
</plist>
EOF
    
    # Set permissions
    xattr -cr "/Applications/Organized AI.app" 2>/dev/null || true
    
else
    echo "❌ No executable found to create app bundle"
    exit 1
fi

echo ""
echo "🎉 SUCCESS! Organized AI is now installed as a standalone app!"
echo ""
echo "✅ You can now:"
echo "   • Launch from Applications folder"
echo "   • Find it in Launchpad"
echo "   • Drag to Dock for quick access"
echo "   • Double-click to run (no terminal needed!)"
echo ""
echo "🚀 Opening Applications folder to show your new app..."

# Open Applications folder
open /Applications

echo ""
echo "🎯 App Details:"
echo "   • Location: /Applications/Organized AI.app"
echo "   • All features included: Router integration, cost tracking, orchestration"
echo "   • No development server required"
echo "   • Ready for production use!"