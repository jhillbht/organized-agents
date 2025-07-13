#!/bin/bash

# Install Tauri CLI
# This script installs the Tauri CLI for desktop app development

echo "🦀 Installing Tauri CLI..."
echo "=========================="

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust/Cargo not found. Please install Rust first:"
    echo "   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    echo "   source ~/.cargo/env"
    exit 1
fi

echo "✅ Rust found: $(rustc --version)"

# Install Tauri CLI
echo "📦 Installing Tauri CLI (this may take a few minutes)..."
cargo install tauri-cli --version ^2.0

# Verify installation
if command -v cargo tauri &> /dev/null; then
    echo "✅ Tauri CLI installed successfully!"
    echo "📋 Version: $(cargo tauri --version)"
    echo ""
    echo "🎯 Next steps:"
    echo "   npm install           # Install Node.js dependencies"
    echo "   npm run tauri:dev     # Start desktop app development"
    echo "   npm run tauri:build   # Build desktop app for production"
else
    echo "❌ Tauri CLI installation failed"
    echo "💡 Try running: cargo install tauri-cli --locked"
    exit 1
fi

echo ""
echo "🚀 Ready for desktop app development!"