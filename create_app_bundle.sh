#!/bin/bash

# Create Organized AI standalone app bundle
echo "Creating Organized AI standalone app bundle..."

# Set variables
PROJECT_DIR="/Users/supabowl/Downloads/Cursor/Organized AI Client/organized-agents"
APP_NAME="Organized AI"
APP_BUNDLE="$PROJECT_DIR/$APP_NAME.app"
EXECUTABLE_PATH="$PROJECT_DIR/src-tauri/target/debug/organized-agents"
ICON_PATH="$PROJECT_DIR/src-tauri/icons/icon.icns"

# Create app bundle structure
echo "Creating app bundle structure..."
mkdir -p "$APP_BUNDLE/Contents/MacOS"
mkdir -p "$APP_BUNDLE/Contents/Resources"

# Copy executable
echo "Copying executable..."
cp "$EXECUTABLE_PATH" "$APP_BUNDLE/Contents/MacOS/$APP_NAME"

# Copy icon
echo "Copying icon..."
cp "$ICON_PATH" "$APP_BUNDLE/Contents/Resources/icon.icns"

# Create Info.plist
echo "Creating Info.plist..."
cat > "$APP_BUNDLE/Contents/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleName</key>
    <string>Organized AI</string>
    <key>CFBundleDisplayName</key>
    <string>Organized AI</string>
    <key>CFBundleIdentifier</key>
    <string>ai.organized.agents</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleSignature</key>
    <string>????</string>
    <key>CFBundleExecutable</key>
    <string>Organized AI</string>
    <key>CFBundleIconFile</key>
    <string>icon</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13</string>
    <key>LSUIElement</key>
    <false/>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
EOF

# Set permissions
echo "Setting permissions..."
chmod +x "$APP_BUNDLE/Contents/MacOS/$APP_NAME"
chmod 755 "$APP_BUNDLE"

# Remove quarantine
echo "Removing quarantine..."
xattr -rd com.apple.quarantine "$APP_BUNDLE" 2>/dev/null || true

echo "App bundle created at: $APP_BUNDLE"

# Move to Applications folder
echo "Moving to Applications folder..."
if [ -d "/Applications/$APP_NAME.app" ]; then
    rm -rf "/Applications/$APP_NAME.app"
fi
cp -R "$APP_BUNDLE" "/Applications/"

echo "Standalone app created successfully!"
echo "You can now find 'Organized AI' in your Applications folder."