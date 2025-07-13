#!/bin/bash

# Rust Environment Setup Script for Organized AI Desktop App
# This script sets up the Rust environment needed for Tauri desktop builds

echo "🚀 Setting up Rust environment for Organized AI Desktop App..."

# Step 1: Install Rust if not already installed
if command -v cargo &> /dev/null; then
    echo "✅ Rust is already installed: $(cargo --version)"
else
    echo "📦 Installing Rust toolchain..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source ~/.cargo/env
    echo "✅ Rust installed successfully"
fi

# Step 2: Install Tauri CLI
echo "📦 Installing Tauri CLI..."
cargo install tauri-cli --version "^2.0"

# Step 3: Verify installations
echo "🔍 Verifying installations..."
echo "Rust version: $(rustc --version)"
echo "Cargo version: $(cargo --version)"
echo "Tauri CLI version: $(cargo tauri --version)"

# Step 4: Set up environment variables
echo "🔧 Setting up environment variables..."
export OPENROUTER_API_KEY="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"
echo "export OPENROUTER_API_KEY=\"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\"" >> ~/.bashrc
echo "export OPENROUTER_API_KEY=\"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\"" >> ~/.zshrc

# Step 5: Clean and install npm dependencies
echo "📦 Installing npm dependencies..."
npm install

# Step 6: Test TypeScript compilation
echo "🔍 Testing TypeScript compilation..."
npm run build

echo ""
echo "✅ Environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Run: npm run tauri:dev (to test development build)"
echo "2. Run: npm run tauri:build (to create production build)"
echo "3. Test the desktop app functionality"
echo ""
echo "The built app will be available in src-tauri/target/release/bundle/"