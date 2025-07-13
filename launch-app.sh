#!/bin/bash

# Organized AI Launch Script
echo "🚀 Launching Organized AI Application"
echo "===================================="
echo

# Navigate to project directory
cd "/Users/supabowl/Downloads/Cursor/Organized AI Client/organized-agents"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ ERROR: .env file not found!"
    echo "Creating .env from template..."
    cp .env.example .env
fi

# Check authentication mode
AUTH_MODE=$(grep "^AUTH_MODE=" .env | cut -d'=' -f2)

if [ "$AUTH_MODE" = "claude-max" ]; then
    echo "✅ Using Claude Max Plan authentication"
    echo
    
    # Check if Claude Code CLI is installed
    if ! command -v claude &> /dev/null; then
        echo "❌ ERROR: Claude Code CLI not found!"
        echo "Please install Claude Code from: https://claude.ai/download"
        exit 1
    fi
    
    # Check if user is logged in
    if ! claude whoami &> /dev/null; then
        echo "⚠️  You need to login to Claude Max Plan"
        echo
        echo "Running 'claude login' to authenticate..."
        echo "This will open a browser window for login."
        echo
        claude login
        echo
        echo "Login complete! Continuing with app launch..."
    else
        echo "✅ Already logged in to Claude Max Plan"
    fi
    
elif [ "$AUTH_MODE" = "api-key" ] || [ -z "$AUTH_MODE" ]; then
    # Check if API key is set
    if grep -q "ANTHROPIC_API_KEY=$" .env; then
        echo "⚠️  WARNING: ANTHROPIC_API_KEY is not set in .env file!"
        echo "Please edit .env and add your Anthropic API key."
        echo
        echo "To get an API key:"
        echo "1. Visit: https://console.anthropic.com/account/keys"
        echo "2. Create a new key"
        echo "3. Add it to .env file after ANTHROPIC_API_KEY="
        echo
        echo "Example:"
        echo "ANTHROPIC_API_KEY=sk-ant-api03-your-key-here"
        echo
        echo "Or switch to Claude Max authentication by setting:"
        echo "AUTH_MODE=claude-max"
        echo
        read -p "Press Enter after adding your API key to continue..."
    fi
fi

# Check for Bun
if command -v bun &> /dev/null; then
    echo "✅ Using Bun package manager"
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    bun install
    
    # Launch development server
    echo "🎯 Starting Organized AI in development mode..."
    echo
    echo "The app will open in a new window. This may take 2-3 minutes on first run."
    echo "Look for the Education tab or 🎓 icon to test the education system."
    echo
    bun run tauri dev
    
elif command -v npm &> /dev/null; then
    echo "✅ Using npm package manager"
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    npm install
    
    # Launch development server
    echo "🎯 Starting Organized AI in development mode..."
    echo
    echo "The app will open in a new window. This may take 2-3 minutes on first run."
    echo "Look for the Education tab or 🎓 icon to test the education system."
    echo
    npm run tauri dev
    
else
    echo "❌ ERROR: Neither Bun nor npm found!"
    echo
    echo "Please install one of the following:"
    echo "- Bun (recommended): curl -fsSL https://bun.sh/install | bash"
    echo "- Node.js: https://nodejs.org/"
    exit 1
fi