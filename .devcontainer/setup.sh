#!/bin/bash

# Organized Agents Dev Container Setup Script
# Initializes the development environment inside the container

set -e

echo "🔧 Initializing Organized Agents development environment..."

# Check if we're inside a container
if [ ! -f /.dockerenv ]; then
    echo "⚠️  This script should be run inside the dev container"
    echo "Use: docker-compose run organized-agents-dev bash setup.sh"
    exit 1
fi

# Verify essential tools are available
echo "📦 Verifying development tools..."

check_tool() {
    if command -v "$1" >/dev/null 2>&1; then
        echo "  ✅ $1: $(command -v "$1")"
    else
        echo "  ❌ $1: Not found"
        return 1
    fi
}

check_tool "rustc"
check_tool "cargo"
check_tool "node"
check_tool "bun"
check_tool "git"

# Check if Tauri CLI is available
if cargo tauri --version >/dev/null 2>&1; then
    echo "  ✅ Tauri CLI: $(cargo tauri --version)"
else
    echo "  ⚠️  Tauri CLI: Installing..."
    cargo install tauri-cli --version ^2.0
fi

# Check Claude CLI
if command -v claude >/dev/null 2>&1; then
    echo "  ✅ Claude CLI: $(claude --version 2>/dev/null || echo 'Available')"
else
    echo "  ⚠️  Claude CLI: Installing..."
    curl -fsSL https://claude.ai/install.sh | bash
fi

echo ""
echo "📁 Setting up project..."

# Install dependencies if package.json exists
if [ -f "package.json" ]; then
    echo "  📦 Installing Node.js dependencies..."
    bun install
else
    echo "  ⚠️  No package.json found in $(pwd)"
fi

# Build Rust dependencies
if [ -f "src-tauri/Cargo.toml" ]; then
    echo "  🦀 Building Rust dependencies..."
    cd src-tauri
    cargo build
    cd ..
else
    echo "  ⚠️  No Rust project found"
fi

echo ""
echo "🔐 Authentication setup..."

# Check Claude authentication
if command -v claude >/dev/null 2>&1; then
    if claude whoami >/dev/null 2>&1; then
        echo "  ✅ Claude already authenticated: $(claude whoami)"
    else
        echo "  ⚠️  Claude not authenticated"
        echo "  Run: claude login"
    fi
fi

echo ""
echo "✅ Development environment setup complete!"
echo ""
echo "🚀 Quick start commands:"
echo "  • bun run dev           - Start web development server"
echo "  • bun run tauri:dev     - Start desktop application"
echo "  • bun run build         - Build for production"
echo "  • claude login          - Authenticate with Claude Max"
echo ""
echo "🌐 Ports:"
echo "  • http://localhost:1420 - Main application"
echo "  • http://localhost:3000 - Alternative port"
echo ""