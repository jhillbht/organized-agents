#!/bin/bash

# Tauri Release Build Script
# This script builds the release version of the Organized AI application

echo "Starting Tauri release build..."
echo "Working directory: $(pwd)"

cd "src-tauri" || exit 1

echo "Current directory: $(pwd)"
echo "Checking Cargo availability..."

# Check if cargo is available
if ! command -v cargo &> /dev/null; then
    echo "Error: Cargo not found. Please install Rust."
    exit 1
fi

echo "Cargo version:"
cargo --version

echo "Starting release build..."
echo "This may take several minutes..."

# Run the release build
cargo build --release

if [ $? -eq 0 ]; then
    echo "Release build completed successfully!"
    echo "Checking for release executable..."
    
    if [ -f "target/release/organized-agents" ]; then
        echo "Success! Release executable created at: target/release/organized-agents"
        ls -la target/release/organized-agents
    else
        echo "Warning: Build succeeded but executable not found at expected location"
        echo "Checking target/release directory:"
        ls -la target/release/
    fi
else
    echo "Error: Release build failed"
    exit 1
fi