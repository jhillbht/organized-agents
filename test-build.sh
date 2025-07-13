#!/bin/bash

# Organized AI Build Diagnostic Script
echo "=== Organized AI Build Diagnostic ==="
echo "Timestamp: $(date)"
echo

# Check system requirements
echo "1. Checking system requirements..."
echo "Node.js version:"
node --version 2>/dev/null || echo "❌ Node.js not found"

echo "Bun version:"
bun --version 2>/dev/null || echo "❌ Bun not found"

echo "Rust version:"
rustc --version 2>/dev/null || echo "❌ Rust not found"

echo "Cargo version:"
cargo --version 2>/dev/null || echo "❌ Cargo not found"

echo

# Check dependencies
echo "2. Checking dependencies..."
if [ -f "package.json" ]; then
    echo "✅ package.json found"
else
    echo "❌ package.json not found"
fi

if [ -d "node_modules" ]; then
    echo "✅ node_modules directory exists"
else
    echo "❌ node_modules directory missing"
fi

if [ -f "bun.lock" ]; then
    echo "✅ bun.lock found"
else
    echo "❌ bun.lock not found"
fi

echo

# Check Tauri setup
echo "3. Checking Tauri setup..."
if [ -f "src-tauri/Cargo.toml" ]; then
    echo "✅ Tauri Cargo.toml found"
else
    echo "❌ Tauri Cargo.toml not found"
fi

if [ -d "src-tauri/target" ]; then
    echo "✅ Tauri target directory exists"
else
    echo "❌ Tauri target directory missing"
fi

echo

# Check for environment issues
echo "4. Checking environment..."
echo "Current directory: $(pwd)"
echo "Directory size: $(du -sh . 2>/dev/null | cut -f1)"
echo "Available disk space: $(df -h . 2>/dev/null | tail -1 | awk '{print $4}')"

echo

# Try basic build steps
echo "5. Testing basic build steps..."

echo "Installing dependencies..."
timeout 60s bun install 2>&1 | head -10
install_result=$?

if [ $install_result -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
elif [ $install_result -eq 124 ]; then
    echo "❌ Dependency installation timed out"
else
    echo "❌ Dependency installation failed"
fi

echo

echo "Testing TypeScript compilation..."
timeout 30s npx tsc --noEmit 2>&1 | head -10
tsc_result=$?

if [ $tsc_result -eq 0 ]; then
    echo "✅ TypeScript compilation successful"
elif [ $tsc_result -eq 124 ]; then
    echo "❌ TypeScript compilation timed out"
else
    echo "❌ TypeScript compilation failed"
fi

echo

echo "Testing Vite build..."
timeout 60s bun run build 2>&1 | head -10
build_result=$?

if [ $build_result -eq 0 ]; then
    echo "✅ Vite build successful"
elif [ $build_result -eq 124 ]; then
    echo "❌ Vite build timed out"
else
    echo "❌ Vite build failed"
fi

echo
echo "=== Diagnostic Complete ==="