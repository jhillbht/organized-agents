#!/bin/bash

echo "🔧 Fixing Blank Organized AI App"
echo "================================"

# Kill any running instances
echo "1. Stopping existing app instances..."
killall "Organized AI" 2>/dev/null || echo "   No running instances found"

# Kill dev server that might be interfering
echo "2. Stopping development server..."
pkill -f "vite" 2>/dev/null || echo "   No dev server running"

# Build fresh frontend assets
echo "3. Building fresh frontend assets..."
npm run build

# Verify dist directory
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo "❌ Frontend build failed or dist/ missing"
    echo "Run: npm run build"
    exit 1
fi

echo "✅ Frontend assets built in dist/"

# Build the Tauri app properly
echo "4. Building Tauri app for production..."
npm run tauri:build

# Check if build succeeded
if [ $? -eq 0 ]; then
    echo "✅ Tauri app built successfully"
    echo ""
    echo "📋 Next steps:"
    echo "1. Install the new app: open src-tauri/target/release/bundle/dmg/"
    echo "2. Or replace existing app: cp -r 'src-tauri/target/release/bundle/macos/Organized AI.app' '/Applications/'"
    echo "3. Launch from Applications folder"
else
    echo "❌ Tauri build failed"
    echo ""
    echo "🔧 Alternative: Run in development mode"
    echo "1. npm run tauri:dev"
    echo "2. This will work with live reloading"
fi

echo ""
echo "🎯 The issue was: App was looking for dev server instead of using built assets"
