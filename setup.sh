#!/bin/bash

echo "🤝🤖 Setting up Organized Agents..."
echo "The world's first comprehensive parallel agentic development education system"
echo

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install bun first:"
    echo "curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

# Check if Rust is installed
if ! command -v rustc &> /dev/null; then
    echo "❌ Rust is not installed. Please install Rust first:"
    echo "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

echo "✅ Dependencies check passed"
echo

# Install dependencies
echo "📦 Installing dependencies..."
bun install

echo "✅ Dependencies installed"
echo

# Check if icons need to be updated
if [ ! -f "src-tauri/icons/organized-agents-logo.png" ]; then
    echo "⚠️  LOGO SETUP REQUIRED:"
    echo "   1. Use the logo converter tool to generate icon files"
    echo "   2. Copy generated icons to src-tauri/icons/"
    echo "   3. Run this setup script again"
    echo
fi

echo "🎯 Setup complete! Available commands:"
echo
echo "  Development:"
echo "    bun run tauri dev     # Start development server"
echo
echo "  Production:"
echo "    bun run tauri build   # Build for production"
echo
echo "  Your built app will be available in:"
echo "    📁 src-tauri/target/release/bundle/"
echo
echo "🚀 Ready to master parallel agent coordination!"
echo
echo "📚 Next steps:"
echo "   • Check out the 12 pre-installed agents in cc_agents/"
echo "   • Start with the Environmental Mastery Agent"
echo "   • Follow the 23-week progression to become a master"
echo
