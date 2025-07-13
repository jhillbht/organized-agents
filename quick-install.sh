#!/bin/bash

echo "🚀 Quick Install - Organized AI"

# Check if app already exists in dist
if [ -d "dist" ] && [ -f "src-tauri/target/debug/organized-agents" ]; then
    echo "✅ Found existing builds, creating app bundle..."
    
    # Remove old version
    rm -rf "/Applications/Organized AI.app" 2>/dev/null
    
    # Create app structure
    mkdir -p "/Applications/Organized AI.app/Contents/MacOS"
    mkdir -p "/Applications/Organized AI.app/Contents/Resources"
    
    # Create launcher script
    cat > "/Applications/Organized AI.app/Contents/MacOS/organized-ai" << 'EOF'
#!/bin/bash
cd "/Users/supabowl/Downloads/Cursor/Organized AI Client/organized-agents"
exec bun run tauri dev
EOF
    
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
</dict>
</plist>
EOF
    
    # Set permissions
    xattr -cr "/Applications/Organized AI.app" 2>/dev/null || true
    
    echo "🎉 Organized AI installed to Applications!"
    echo "   • Launch from Applications folder"
    echo "   • Drag to Dock for quick access"
    
    # Open Applications folder
    open /Applications
else
    echo "❌ No existing builds found. Run 'bun run tauri dev' first to create builds."
fi