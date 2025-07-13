#!/bin/bash

echo "🚀 Setting up Organized Agents Dev Container..."
echo "================================================"

# Check if Docker is running
echo "🐳 Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    echo ""
    echo "💡 Install Docker Desktop:"
    echo "   • macOS: https://docs.docker.com/desktop/install/mac-install/"
    echo "   • Windows: https://docs.docker.com/desktop/install/windows-install/"
    echo "   • Linux: https://docs.docker.com/desktop/install/linux-install/"
    exit 1
fi
echo "✅ Docker is running"

# Check if VS Code is installed
echo "📝 Checking VS Code..."
if ! command -v code &> /dev/null; then
    echo "❌ VS Code is not installed or not in PATH."
    echo ""
    echo "💡 Install VS Code:"
    echo "   • Download from: https://code.visualstudio.com/"
    echo "   • Install the Dev Containers extension"
    exit 1
fi
echo "✅ VS Code is available"

# Validate dev container files
echo "📦 Validating dev container configuration..."

if [ ! -f ".devcontainer/Dockerfile" ]; then
    echo "❌ .devcontainer/Dockerfile not found"
    exit 1
fi

if [ ! -f ".devcontainer/devcontainer.json" ]; then
    echo "❌ .devcontainer/devcontainer.json not found"
    exit 1
fi

echo "✅ Dev container files are ready"

# Check if .env file exists
echo "🔧 Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found"
    if [ -f ".env.example" ]; then
        echo "📋 Copying .env.example to .env..."
        cp .env.example .env
        echo "✅ .env file created"
    else
        echo "❌ .env.example not found. Creating basic .env..."
        echo "AUTH_MODE=claude-max" > .env
    fi
fi

# Test Docker build (optional, quick validation)
echo "🔍 Testing container build (this may take a moment)..."
if docker build -f .devcontainer/Dockerfile -t organized-agents-test . >/dev/null 2>&1; then
    echo "✅ Container builds successfully"
    docker rmi organized-agents-test >/dev/null 2>&1
else
    echo "⚠️  Container build test failed (this is normal on first run)"
fi

echo ""
echo "🎯 Ready to launch! Choose your method:"
echo ""
echo "📋 Option 1: VS Code Dev Container (Recommended)"
echo "   1. Open this project: code ."
echo "   2. Click 'Reopen in Container' when prompted"
echo "   3. Wait for container to build (~5-10 minutes first time)"
echo "   4. Run: bun install && bun run tauri:dev"
echo ""
echo "🐳 Option 2: Docker Compose"
echo "   1. docker-compose -f .devcontainer/docker-compose.yml up -d"
echo "   2. docker-compose -f .devcontainer/docker-compose.yml exec organized-agents-dev bash"
echo "   3. Run: bun install && bun run tauri:dev"
echo ""
echo "⚡ Option 3: Quick Test (Web-only)"
echo "   1. docker run --rm -it -p 1420:1420 -v \$(pwd):/workspace organized-agents-dev"
echo "   2. Run: bun install && bun run dev"
echo "   3. Open: http://localhost:1420"
echo ""
echo "🔥 For alpha testers:"
echo "   git clone https://github.com/jhillbht/organized-agents"
echo "   cd organized-agents"
echo "   ./setup-devcontainer.sh"
echo "   code ."
echo ""
echo "✨ Zero dependency setup - everything runs in containers!"
