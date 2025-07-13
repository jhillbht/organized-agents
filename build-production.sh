#!/bin/bash

echo "🔧 Building Organized AI Production Version..."

cd "/Users/supabowl/Downloads/Cursor/Organized AI Client/organized-agents"

# Ensure frontend is built
echo "📦 Building frontend..."
bun run build

# Build production Tauri app
echo "🚀 Building production macOS app..."
bunx tauri build

# Check if production build exists
if [ -f "src-tauri/target/release/organized-agents" ]; then
    echo "✅ Production build successful!"
    
    # Remove old debug version from Applications
    rm -rf "/Applications/Organized AI.app"
    
    # Check for macOS app bundle
    if [ -d "src-tauri/target/release/bundle/macos/Organized AI.app" ]; then
        echo "🎯 Installing production app bundle..."
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
</dict>
</plist>
EOF
    fi
    
    # Make executable and set permissions
    chmod +x "/Applications/Organized AI.app/Contents/MacOS/organized-ai"
    xattr -cr "/Applications/Organized AI.app"
    
    echo "🎉 Production Organized AI installed!"
    echo "   • Launch from Applications folder"
    echo "   • Should now load properly (no blank screen)"
    
    # Open Applications folder
    open /Applications
    
else
    echo "❌ Production build failed. Trying alternative approach..."
    
    # Try with npm
    npm run build
    npx tauri build
    
    if [ -f "src-tauri/target/release/organized-agents" ]; then
        echo "✅ Build successful with npm! Installing..."
        # Same installation logic as above
        rm -rf "/Applications/Organized AI.app"
        mkdir -p "/Applications/Organized AI.app/Contents/MacOS"
        cp "src-tauri/target/release/organized-agents" "/Applications/Organized AI.app/Contents/MacOS/organized-ai"
        chmod +x "/Applications/Organized AI.app/Contents/MacOS/organized-ai"
        echo "🎉 Organized AI production version installed!"
    else
        echo "❌ Both build methods failed. Check console for errors."
        echo "💡 You may need to install Rust or update dependencies:"
        echo "   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    fi
fi