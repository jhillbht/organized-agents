#!/bin/bash

echo "🚀 Setting up Organized Agents Dev Container..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if VS Code is installed
if ! command -v code &> /dev/null; then
    echo "❌ VS Code is not installed or not in PATH."
    echo "Please install VS Code and the Dev Containers extension."
    exit 1
fi

echo "✅ Docker is running"
echo "✅ VS Code is available"

# Check if Dev Containers extension is installed
echo "📦 Checking for Dev Containers extension..."

# Create .devcontainer directory if it doesn't exist
mkdir -p .devcontainer

echo "✅ Dev container files are ready"
echo ""
echo "🎯 Next steps:"
echo "1. Open this project in VS Code: code ."
echo "2. VS Code will prompt 'Reopen in Container?' - click Yes"
echo "3. Wait for container to build (first time: ~5-10 minutes)"
echo "4. Run: bun run dev"
echo "5. Open http://localhost:1420 in your browser"
echo ""
echo "🔥 For alpha testers:"
echo "git clone https://github.com/jhillbht/organized-agents"
echo "cd organized-agents"
echo "code ."
echo ""
echo "That's it! Zero setup required for contributors."
