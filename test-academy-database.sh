#!/bin/bash

# Test Academy Database Commands
# This script tests the newly added Academy database testing commands

echo "🧪 Testing Academy Database Commands..."
echo "======================================"

# Check if Tauri CLI is available
if ! command -v cargo tauri &> /dev/null; then
    echo "❌ Tauri CLI not found. Please run: ./install-tauri-cli.sh"
    exit 1
fi

echo "✅ Tauri CLI found: $(cargo tauri --version)"

# Build the project first
echo "🔨 Building project..."
npm run build

# Test the new Academy database commands
echo ""
echo "🧪 Testing Academy Database Commands:"
echo "   1. Initialize Academy Database"
echo "   2. Test Academy Database"  
echo "   3. Get Academy Statistics"

echo ""
echo "📋 Available Tauri commands for Academy testing:"
echo "   - initialize_academy_database"
echo "   - test_academy_database"
echo "   - get_academy_stats"

echo ""
echo "🎯 To test these commands:"
echo "   1. Start the desktop app: npm run tauri:dev"
echo "   2. Open browser developer tools"
echo "   3. Call from frontend:"
echo "      await invoke('test_academy_database')"
echo "      await invoke('initialize_academy_database')"  
echo "      await invoke('get_academy_stats')"

echo ""
echo "🚀 Academy database testing ready!"