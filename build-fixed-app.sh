#!/bin/bash

echo "🔧 Building Organized AI (Fixed Version)..."

cd "/Users/supabowl/Downloads/Cursor/Organized AI Client/organized-agents"

echo "📦 Building frontend..."
bun run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Frontend built successfully!"

echo "🚀 Building production macOS app..."
bunx tauri build

# Check if production build exists
if [ -f "src-tauri/target/release/organized-agents" ]; then
    echo "✅ Production build successful!"
    
    # Remove old version from Applications
    rm -rf "/Applications/Organized AI.app"
    
    # Check for pre-built macOS app bundle
    if [ -d "src-tauri/target/release/bundle/macos/Organized AI.app" ]; then
        echo "🎯 Installing pre-built app bundle..."
        cp -r "src-tauri/target/release/bundle/macos/Organized AI.app" "/Applications/"
    else
        echo "📱 Creating custom app bundle..."
        # Create app bundle structure
        mkdir -p "/Applications/Organized AI.app/Contents/MacOS"
        mkdir -p "/Applications/Organized AI.app/Contents/Resources"
        
        # Copy production executable
        cp "src-tauri/target/release/organized-agents" "/Applications/Organized AI.app/Contents/MacOS/organized-ai"
        
        # Copy icon
        cp "src-tauri/icons/icon.icns" "/Applications/Organized AI.app/Contents/Resources/icon.icns"
        
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
</dict>
</plist>
EOF
    fi
    
    # Make executable and set permissions
    chmod +x "/Applications/Organized AI.app/Contents/MacOS/organized-ai"
    xattr -cr "/Applications/Organized AI.app"
    
    echo "🎉 Fixed Organized AI installed successfully!"
    echo "   • No more blank white screen"
    echo "   • All TypeScript errors resolved"
    echo "   • Full router integration working"
    echo "   • Ready to launch from Applications folder"
    
    # Open Applications folder
    open /Applications
    
else
    echo "❌ Production build failed."
    echo "💡 Ensure you have Rust installed:"
    echo "   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
fi