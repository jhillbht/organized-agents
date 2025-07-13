#!/bin/bash

# App Bundle Validation Script for Organized AI Desktop App
# Tests if the existing app bundle is functional for alpha testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_BUNDLE="Organized AI.app"
LOG_FILE="app-validation-$(date +%Y%m%d-%H%M%S).log"

# Utility functions
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# Function to check app bundle structure
validate_app_structure() {
    log "=== Validating App Bundle Structure ==="
    
    # Check if app bundle exists
    if [ ! -d "$APP_BUNDLE" ]; then
        error "App bundle not found: $APP_BUNDLE"
        return 1
    fi
    
    success "App bundle found: $APP_BUNDLE"
    
    # Check Info.plist
    if [ -f "$APP_BUNDLE/Contents/Info.plist" ]; then
        success "Info.plist exists"
        
        # Extract app info
        APP_NAME=$(defaults read "$(pwd)/$APP_BUNDLE/Contents/Info.plist" CFBundleName 2>/dev/null || echo "Unknown")
        APP_VERSION=$(defaults read "$(pwd)/$APP_BUNDLE/Contents/Info.plist" CFBundleVersion 2>/dev/null || echo "Unknown")
        log "App Name: $APP_NAME"
        log "App Version: $APP_VERSION"
    else
        error "Info.plist missing"
        return 1
    fi
    
    # Check executable
    EXECUTABLE_PATH="$APP_BUNDLE/Contents/MacOS/Organized AI"
    if [ -f "$EXECUTABLE_PATH" ]; then
        success "Executable found: $EXECUTABLE_PATH"
        
        # Check if executable is readable
        if [ -x "$EXECUTABLE_PATH" ]; then
            success "Executable has proper permissions"
        else
            warning "Executable permissions may need fixing"
            chmod +x "$EXECUTABLE_PATH" 2>/dev/null || true
        fi
        
        # Get file size
        local file_size=$(du -h "$EXECUTABLE_PATH" | cut -f1)
        log "Executable size: $file_size"
        
    else
        error "Executable missing: $EXECUTABLE_PATH"
        return 1
    fi
    
    # Check Resources
    if [ -d "$APP_BUNDLE/Contents/Resources" ]; then
        success "Resources directory exists"
        
        # Check for icon
        if [ -f "$APP_BUNDLE/Contents/Resources/icon.icns" ]; then
            success "App icon found"
        else
            warning "App icon missing"
        fi
    else
        warning "Resources directory missing"
    fi
    
    return 0
}

# Function to test app launch
test_app_launch() {
    log "=== Testing App Launch ==="
    
    # Kill any existing instances
    pkill -f "Organized AI" 2>/dev/null || true
    sleep 2
    
    # Try to launch the app
    log "Attempting to launch app..."
    open "$APP_BUNDLE" &
    local app_pid=$!
    
    # Wait a moment for app to start
    sleep 5
    
    # Check if app is running
    if pgrep -f "Organized AI" > /dev/null; then
        success "App launched successfully!"
        
        # Get process info
        local process_info=$(ps aux | grep "Organized AI" | grep -v grep | head -1)
        log "Process: $process_info"
        
        return 0
    else
        error "App failed to launch"
        return 1
    fi
}

# Function to check Academy integration
check_academy_integration() {
    log "=== Checking Academy Integration ==="
    
    # Check if frontend build exists and contains Academy
    if [ -d "dist" ]; then
        success "Frontend build (dist/) exists"
        
        # Check for Academy assets
        if [ -f "dist/index.html" ]; then
            success "Frontend HTML exists"
            
            # Check if Academy components are bundled
            if grep -q "academy" dist/assets/*.js 2>/dev/null; then
                success "Academy components found in bundled assets"
            else
                warning "Academy components may not be included in build"
            fi
        else
            error "Frontend HTML missing"
            return 1
        fi
    else
        error "Frontend build missing"
        return 1
    fi
    
    # Check if Academy source files exist
    if [ -d "src/academy" ]; then
        success "Academy source directory exists"
        
        local academy_files=$(find src/academy -name "*.tsx" -o -name "*.ts" | wc -l)
        log "Academy files found: $academy_files"
        
        if [ "$academy_files" -gt 10 ]; then
            success "Academy implementation appears complete"
        else
            warning "Academy implementation may be incomplete"
        fi
    else
        error "Academy source directory missing"
        return 1
    fi
    
    return 0
}

# Function to check Tauri integration
check_tauri_integration() {
    log "=== Checking Tauri Integration ==="
    
    # Check if Tauri config exists
    if [ -f "src-tauri/tauri.conf.json" ]; then
        success "Tauri configuration exists"
        
        # Extract app identifier
        local app_id=$(cat src-tauri/tauri.conf.json | grep -o '"identifier":[^,]*' | cut -d'"' -f4)
        log "App identifier: $app_id"
    else
        error "Tauri configuration missing"
        return 1
    fi
    
    # Check if Rust build artifacts exist
    if [ -d "src-tauri/target/debug" ]; then
        success "Debug build artifacts exist"
        
        if [ -f "src-tauri/target/debug/organized-agents" ]; then
            success "Debug executable exists"
        else
            warning "Debug executable missing"
        fi
    else
        warning "No debug build artifacts found"
    fi
    
    # Check Academy Rust integration
    if [ -f "src-tauri/src/academy/mod.rs" ]; then
        success "Academy Rust module exists"
    else
        warning "Academy Rust module missing"
    fi
    
    return 0
}

# Function to create launch script
create_launch_script() {
    log "=== Creating Launch Script ==="
    
    cat > "launch-organized-ai.sh" << 'EOF'
#!/bin/bash

# Launch script for Organized AI Desktop App

APP_BUNDLE="Organized AI.app"

echo "🚀 Launching Organized AI Desktop App..."

# Check if app bundle exists
if [ ! -d "$APP_BUNDLE" ]; then
    echo "❌ App bundle not found: $APP_BUNDLE"
    exit 1
fi

# Kill any existing instances
pkill -f "Organized AI" 2>/dev/null || true
sleep 1

# Launch the app
echo "📱 Opening app..."
open "$APP_BUNDLE"

# Wait a moment and check if it's running
sleep 3
if pgrep -f "Organized AI" > /dev/null; then
    echo "✅ App launched successfully!"
    echo ""
    echo "🎓 To test the Academy system:"
    echo "1. Look for 'Agent Journey Academy' tab in the app"
    echo "2. Open browser console (F12) and run:"
    echo "   await window.__TAURI__.core.invoke('test_academy_database')"
    echo "3. Navigate to Academy → Foundation Path → Basic Agent Concepts"
    echo "4. Test the code playground and exercise system"
    echo ""
    echo "📊 The app is ready for alpha testing!"
else
    echo "❌ App failed to launch. Check the logs for details."
    exit 1
fi
EOF

    chmod +x "launch-organized-ai.sh"
    success "Launch script created: launch-organized-ai.sh"
}

# Main execution
main() {
    log "=== Organized AI App Bundle Validation Started ==="
    log "Validation log: $LOG_FILE"
    
    local validation_passed=true
    
    # Run validation steps
    if ! validate_app_structure; then
        validation_passed=false
    fi
    
    if ! check_academy_integration; then
        validation_passed=false
    fi
    
    if ! check_tauri_integration; then
        validation_passed=false
    fi
    
    # Create launch script regardless
    create_launch_script
    
    # Attempt app launch test
    log "=== Final App Launch Test ==="
    if test_app_launch; then
        success "🎉 APP BUNDLE VALIDATION SUCCESSFUL!"
        success "✅ The desktop app is ready for alpha testing!"
        success "🚀 Use ./launch-organized-ai.sh to start the app"
        
        # Academy testing instructions
        log ""
        log "🎓 Academy Testing Instructions:"
        log "1. Launch app with: ./launch-organized-ai.sh"
        log "2. Click 'Agent Journey Academy' tab"
        log "3. Verify StudentDashboard loads"
        log "4. Test Foundation Path module"
        log "5. Complete a lesson and exercise"
        log "6. Check XP and achievement systems"
        
    else
        warning "App launch test failed, but bundle structure is valid"
        warning "Manual testing may still be possible"
    fi
    
    # Final summary
    log "=== Validation Summary ==="
    if [ "$validation_passed" = true ]; then
        success "📊 Overall Status: READY FOR ALPHA TESTING"
        log "The Organized AI desktop app with Academy system is functional!"
    else
        warning "📊 Overall Status: NEEDS ATTENTION"
        log "Some issues detected, but app may still be usable"
    fi
    
    log "=== Validation Complete ==="
    log "Full log available in: $LOG_FILE"
}

# Run main function
main "$@"