# Claude Code Preparation Guide - Organized Agents

## 🎯 Project Status Summary

**Current State:** Functional web app with desktop build issues  
**Goal:** Production-ready desktop app for alpha testing  
**Main Issues:** Missing Rust, TypeScript errors, build configuration  

---

## 🚀 Claude Code Plan Mode Instructions

### **Phase 1: Environment Setup & Dependencies**

```
Plan: Fix the development environment and resolve all dependency issues for organized-agents project.

Context: 
- Project is a Tauri-based desktop app with React frontend
- Currently works as web app (localhost:1420) but desktop build fails
- Missing Rust installation preventing Tauri builds
- TypeScript compilation errors in several components
- Dev container configuration exists but needs testing

Issues to resolve:
1. Rust/Cargo missing (error: "failed to get cargo metadata")
2. TypeScript errors in App.tsx, AgentExecution.tsx, and other components
3. Desktop app in /Applications/Organized AI.app is blank
4. Build configuration issues between dev and production modes

Steps:
1. Install Rust toolchain properly for Tauri development
2. Fix all TypeScript compilation errors
3. Verify dev container configuration works
4. Test both development and production builds
5. Ensure desktop app launches with proper frontend assets

Requirements:
- Desktop app must work offline (not depend on dev server)
- All TypeScript errors resolved for clean builds
- Both development and production modes functional
- Icons and branding properly applied
```

### **Phase 2: Fix TypeScript Compilation Errors**

```
Plan: Resolve all TypeScript compilation errors preventing clean builds.

Current errors to fix:
1. App.tsx(435,38): 'onClose' prop missing in AgentRouterCoordinationProps
2. AgentExecution.tsx: Unused import 'PlanModeDisplay'
3. AgentRouterCoordination.tsx: Multiple unused variables
4. Type mismatches in ClaudeStreamMessage interfaces
5. Settings.tsx: Missing 'openrouterApiKey' property
6. Multiple unused React imports

Steps:
1. Fix prop interface definitions and component props
2. Remove or properly use unused imports and variables
3. Align interface definitions across components
4. Update type definitions for message types
5. Add missing properties to configuration interfaces
6. Test compilation with 'npm run build'

Requirements:
- Zero TypeScript compilation errors
- All props and interfaces properly typed
- No unused imports or variables (unless intentionally kept)
- Clean build output without warnings
```

### **Phase 3: Desktop App Build & Installation**

```
Plan: Create properly configured desktop app that works offline.

Issues:
- Current /Applications/Organized AI.app is blank (empty window)
- App tries to connect to localhost:1420 instead of using bundled assets
- Build configuration mixes development and production settings

Steps:
1. Verify Rust installation and Tauri CLI availability
2. Update tauri.conf.json for proper production builds
3. Build frontend assets correctly (npm run build)
4. Build Tauri app for production (npm run tauri:build)
5. Test that built app works without development server
6. Create proper installer/DMG for distribution
7. Verify app icons appear correctly

Requirements:
- Desktop app works completely offline
- No dependency on development server
- Proper icons and branding applied
- App installs and launches correctly from /Applications/
- Production build creates distributable installer
```

### **Phase 4: Alpha Testing Preparation**

```
Plan: Prepare the project for alpha testing with proper documentation and setup.

Context:
- Dev container configuration exists for consistent environments
- Alpha testing readiness template created
- Marketing materials prepared
- GitHub repository updated

Steps:
1. Test dev container setup end-to-end
2. Verify one-click setup works for new contributors
3. Create clear alpha testing instructions
4. Test build pipeline and release process
5. Prepare downloadable alpha releases
6. Update README with current status and setup instructions
7. Create troubleshooting guide for common issues

Requirements:
- Alpha testers can set up environment in <10 minutes
- Clear documentation for both web and desktop versions
- Automated build process for releases
- Comprehensive troubleshooting guide
- Ready for public GitHub repository sharing
```

---

## 🔧 Immediate Commands for Claude Code

### **Quick Status Check:**
```bash
# Check current environment
node --version && npm --version
cargo --version || echo "Rust missing"
which tauri || echo "Tauri CLI missing"

# Check TypeScript compilation
npm run build

# Check current processes
lsof -i :1420
ps aux | grep "Organized AI"
```

### **Environment Setup:**
```bash
# Install Rust if missing
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install Tauri CLI
cargo install tauri-cli

# Verify installation
cargo tauri --version
```

### **Fix Build Issues:**
```bash
# Clean and rebuild
rm -rf node_modules dist src-tauri/target
npm install
npm run build

# Test Tauri development
npm run tauri:dev

# Build for production
npm run tauri:build
```

---

## 📋 Known Issues & Solutions

### **Issue 1: Blank Desktop App**
**Symptoms:** App window opens but shows blank/white screen  
**Cause:** App looking for localhost:1420 instead of bundled assets  
**Solution:** Rebuild with proper production configuration

### **Issue 2: TypeScript Compilation Errors**
**Symptoms:** `npm run build` fails with type errors  
**Cause:** Interface mismatches, unused imports, missing properties  
**Solution:** Fix type definitions and clean up unused code

### **Issue 3: Missing Rust/Cargo**
**Symptoms:** "failed to get cargo metadata" error  
**Cause:** Rust toolchain not installed  
**Solution:** Install Rust with rustup

### **Issue 4: Dev Container Issues**
**Symptoms:** Container fails to build or start  
**Cause:** Docker configuration or missing dependencies  
**Solution:** Test container build and update Dockerfile if needed

---

## 🎯 Success Criteria

### **Development Environment:**
- [ ] Rust and Tauri CLI installed and working
- [ ] TypeScript compiles without errors
- [ ] Dev container builds and runs successfully
- [ ] Web version runs on localhost:1420
- [ ] Desktop development mode works (npm run tauri:dev)

### **Production Build:**
- [ ] Frontend builds cleanly (npm run build)
- [ ] Tauri builds without errors (npm run tauri:build)
- [ ] Desktop app works offline
- [ ] App icons display correctly
- [ ] Installer/DMG created successfully

### **Alpha Testing Ready:**
- [ ] GitHub repository updated with latest code
- [ ] Dev container setup works for new users
- [ ] Clear setup instructions documented
- [ ] Troubleshooting guide available
- [ ] Ready for public sharing and feedback

---

## 🚀 Claude Code Execution Strategy

### **Recommended Order:**
1. **Start with Phase 1** - Get environment working
2. **Run immediate commands** - Quick status check
3. **Fix TypeScript errors** - Enable clean builds
4. **Test development mode** - Verify functionality
5. **Build production app** - Create working desktop version
6. **Test end-to-end** - Verify alpha testing readiness

### **For Each Phase:**
- Use Claude Code's plan mode with the exact prompts above
- Test each step before moving to the next
- Document any issues or deviations
- Update this guide with new findings

### **Validation Points:**
- After Phase 1: `npm run tauri:dev` should work
- After Phase 2: `npm run build` should succeed
- After Phase 3: Desktop app should work offline
- After Phase 4: Project should be alpha testing ready

---

## 📁 Project Structure Reference

```
organized-agents/
├── .devcontainer/          # Dev container configuration
├── src-tauri/             # Tauri backend (Rust)
│   ├── icons/             # App icons (update these!)
│   └── src/               # Rust source code
├── src/                   # React frontend
│   ├── components/        # UI components
│   └── lib/              # Utilities
├── dist/                 # Built frontend assets
├── ALPHA_TESTING_READINESS_TEMPLATE.md
├── DEV_CONTAINER_SETUP.md
└── QUICK_START_DEVCONTAINER.md
```

**This guide is designed for Claude Code plan mode - use the exact prompts above for systematic problem-solving and implementation.**
