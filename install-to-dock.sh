#!/bin/bash

echo "🚀 Installing Organized AI to your Applications folder..."

# Create app bundle structure
mkdir -p "/Applications/Organized AI.app/Contents/MacOS"
mkdir -p "/Applications/Organized AI.app/Contents/Resources"

# Copy the executable
cp "/Users/supabowl/Downloads/Cursor/Organized AI Client/organized-agents/src-tauri/target/debug/organized-agents" "/Applications/Organized AI.app/Contents/MacOS/organized-ai"

# Copy the icon
cp "/Users/supabowl/Downloads/Cursor/Organized AI Client/organized-agents/src-tauri/icons/icon.icns" "/Applications/Organized AI.app/Contents/Resources/icon.icns"

# Make executable
chmod +x "/Applications/Organized AI.app/Contents/MacOS/organized-ai"

# Set proper app bundle attributes
xattr -cr "/Applications/Organized AI.app"

echo "✅ Organized AI has been installed to your Applications folder!"
echo "🎯 You can now:"
echo "   • Find it in Applications folder"
echo "   • Launch from Launchpad"
echo "   • Drag to Dock for permanent access"
echo "   • Double-click to run (no terminal needed!)"

# Optional: Open Applications folder to show the new app
open /Applications