#!/bin/bash

echo "Building Organized AI Desktop App..."

# Navigate to project directory
cd "/Users/supabowl/Downloads/Cursor/Organized AI Client/organized-agents"

# Install dependencies if needed
echo "Installing dependencies..."
bun install

# Build the frontend
echo "Building frontend..."
bun run build

# Build the Tauri app
echo "Building macOS app bundle..."
bunx tauri build

# Check if build was successful
if [ -f "src-tauri/target/release/bundle/macos/Organized AI.app" ]; then
    echo "✅ Build successful!"
    echo "App location: src-tauri/target/release/bundle/macos/Organized AI.app"
    
    # Copy to Applications folder
    echo "Installing to Applications folder..."
    cp -r "src-tauri/target/release/bundle/macos/Organized AI.app" "/Applications/"
    
    echo "🚀 Organized AI has been installed to your Applications folder!"
    echo "You can now launch it from Launchpad or the Applications folder."
else
    echo "❌ Build failed. Trying alternative approach..."
    
    # Try with npm
    npm run build
    npx tauri build
    
    if [ -f "src-tauri/target/release/bundle/macos/Organized AI.app" ]; then
        echo "✅ Build successful with npm!"
        cp -r "src-tauri/target/release/bundle/macos/Organized AI.app" "/Applications/"
        echo "🚀 Organized AI has been installed to your Applications folder!"
    else
        echo "❌ Build failed. Please check the console output for errors."
    fi
fi