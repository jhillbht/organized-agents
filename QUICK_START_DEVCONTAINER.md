# 🚀 Quick Start with Dev Containers

**Zero setup required!** Use dev containers for instant development environment.

## For Alpha Testers & Contributors

### **Option 1: One-Click Dev Container (Recommended)**
```bash
git clone https://github.com/jhillbht/organized-agents
cd organized-agents
code .
```

When VS Code opens:
1. Click **"Reopen in Container"** when prompted
2. Wait 5-10 minutes for first-time setup
3. Run `bun run dev` in the terminal
4. Open http://localhost:1420

**That's it!** Full Rust + Tauri + Node.js environment ready.

### **Option 2: Quick Setup Script**
```bash
./setup-devcontainer.sh
```

### **Option 3: Manual Setup (Not Recommended)**
See [DEV_CONTAINER_SETUP.md](./DEV_CONTAINER_SETUP.md) for manual setup instructions.

## Why Dev Containers?

✅ **Identical environment** on Windows, macOS, Linux  
✅ **Zero dependency conflicts** - everything containerized  
✅ **Instant onboarding** for new contributors  
✅ **Cross-platform builds** without owning all platforms  
✅ **Alpha testing confidence** - if it works in container, it works everywhere  

## Requirements

- Docker Desktop installed and running
- VS Code with Dev Containers extension
- That's it!

## For Project Maintainers

Dev containers solve the "does it even work?" alpha testing problem by ensuring:
- Consistent builds across all platforms
- Zero setup friction for alpha testers
- Automated cross-platform binary generation
- Professional deployment pipeline

See [DEV_CONTAINER_SETUP.md](./DEV_CONTAINER_SETUP.md) for complete implementation details.
