#!/bin/bash

# Final setup script for Organized AI app bundle
echo "Finalizing Organized AI app bundle..."

PROJECT_DIR="/Users/supabowl/Downloads/Cursor/Organized AI Client/organized-agents"
APP_BUNDLE="$PROJECT_DIR/Organized AI.app"

# Remove placeholder files
rm -f "$APP_BUNDLE/Contents/MacOS/.keep"
rm -f "$APP_BUNDLE/Contents/Resources/.keep"

# Copy executable with proper naming
cp "$PROJECT_DIR/src-tauri/target/debug/organized-agents" "$APP_BUNDLE/Contents/MacOS/Organized AI"

# Copy icon
cp "$PROJECT_DIR/src-tauri/icons/icon.icns" "$APP_BUNDLE/Contents/Resources/icon.icns"

# Set proper permissions
chmod +x "$APP_BUNDLE/Contents/MacOS/Organized AI"
chmod 755 "$APP_BUNDLE"

# Remove quarantine attribute (if exists)
xattr -rd com.apple.quarantine "$APP_BUNDLE" 2>/dev/null || true

echo "App bundle finalized!"

# Try to move to Applications folder
echo "Attempting to move to Applications folder..."
if [ -d "/Applications/Organized AI.app" ]; then
    rm -rf "/Applications/Organized AI.app"
fi

# Copy to Applications
cp -R "$APP_BUNDLE" "/Applications/"

if [ $? -eq 0 ]; then
    echo "Successfully moved to Applications folder!"
    echo "You can now find 'Organized AI' in your Applications folder."
else
    echo "Could not move to Applications folder. App bundle is available at:"
    echo "$APP_BUNDLE"
fi

# Test launch
echo "Testing app launch..."
open "$APP_BUNDLE" || echo "Could not launch app automatically"

echo "Setup complete!"