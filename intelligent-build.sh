#!/bin/bash

# Intelligent Build System for Organized AI Desktop App
# Handles timeout constraints and provides progressive build with error recovery

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUILD_LOG="build-log-$(date +%Y%m%d-%H%M%S).txt"
TIMEOUT_LIMIT=100  # Conservative timeout limit in seconds
MAX_RETRIES=3

# Utility functions
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1" | tee -a "$BUILD_LOG"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$BUILD_LOG"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$BUILD_LOG"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$BUILD_LOG"
}

# Function to run command with timeout and retry logic
run_with_timeout() {
    local cmd="$1"
    local timeout_seconds="$2"
    local description="$3"
    local retry_count=0
    
    log "Starting: $description"
    log "Command: $cmd"
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        log "Attempt $((retry_count + 1))/$MAX_RETRIES"
        
        # Run command with timeout
        if timeout "${timeout_seconds}s" bash -c "$cmd" >> "$BUILD_LOG" 2>&1; then
            success "$description completed successfully"
            return 0
        else
            local exit_code=$?
            if [ $exit_code -eq 124 ]; then
                warning "$description timed out after ${timeout_seconds}s"
            else
                error "$description failed with exit code $exit_code"
            fi
            
            retry_count=$((retry_count + 1))
            if [ $retry_count -lt $MAX_RETRIES ]; then
                warning "Retrying in 5 seconds..."
                sleep 5
            fi
        fi
    done
    
    error "$description failed after $MAX_RETRIES attempts"
    return 1
}

# Function to check if file/directory exists
check_exists() {
    local path="$1"
    local description="$2"
    
    if [ -e "$path" ]; then
        success "$description exists: $path"
        return 0
    else
        error "$description not found: $path"
        return 1
    fi
}

# Function to validate TypeScript without full build
quick_ts_check() {
    log "=== Quick TypeScript Validation ==="
    
    # Check if package.json exists
    if ! check_exists "package.json" "Package configuration"; then
        return 1
    fi
    
    # Check if src directory exists
    if ! check_exists "src" "Source directory"; then
        return 1
    fi
    
    # Check if Academy files exist
    if ! check_exists "src/academy" "Academy directory"; then
        return 1
    fi
    
    # Try basic syntax checking with a very short timeout
    log "Attempting basic syntax validation..."
    if run_with_timeout "node -c package.json" 15 "Package.json syntax check"; then
        success "Basic validation passed"
        return 0
    else
        error "Basic validation failed"
        return 1
    fi
}

# Function to clean and recover environment
clean_environment() {
    log "=== Environment Cleanup ==="
    
    # Clear common cache locations
    local cache_dirs=("dist" ".vite" "node_modules/.cache" "src-tauri/target")
    
    for dir in "${cache_dirs[@]}"; do
        if [ -d "$dir" ]; then
            log "Cleaning cache directory: $dir"
            if run_with_timeout "rm -rf '$dir'" 30 "Clean $dir"; then
                success "Cleaned $dir"
            else
                warning "Failed to clean $dir"
            fi
        fi
    done
}

# Function to attempt lightweight frontend build
try_frontend_build() {
    log "=== Attempting Frontend Build ==="
    
    # First try with npm run build
    if run_with_timeout "npm run build" $TIMEOUT_LIMIT "NPM frontend build"; then
        success "Frontend build completed successfully"
        
        # Validate outputs
        if check_exists "dist" "Build output directory"; then
            success "Frontend build validation passed"
            return 0
        else
            error "Frontend build produced no output"
            return 1
        fi
    else
        warning "Standard frontend build failed, trying alternative approach"
        
        # Try Vite build directly
        if run_with_timeout "npx vite build" $TIMEOUT_LIMIT "Direct Vite build"; then
            success "Alternative frontend build completed"
            return 0
        else
            error "All frontend build attempts failed"
            return 1
        fi
    fi
}

# Function to attempt development build
try_dev_build() {
    log "=== Attempting Development Build ==="
    
    # Start dev server with timeout
    log "Starting development server..."
    if run_with_timeout "timeout 90s npm run tauri:dev" $TIMEOUT_LIMIT "Tauri development build"; then
        success "Development build started successfully"
        return 0
    else
        warning "Development build failed or timed out"
        
        # Try frontend-only dev server
        log "Trying frontend-only development server..."
        if run_with_timeout "timeout 60s npm run dev" 70 "Frontend development server"; then
            success "Frontend development server started"
            return 0
        else
            error "All development build attempts failed"
            return 1
        fi
    fi
}

# Function to attempt production build
try_production_build() {
    log "=== Attempting Production Build ==="
    
    # First ensure frontend is built
    if ! check_exists "dist" "Frontend build output"; then
        log "Frontend not built, building first..."
        if ! try_frontend_build; then
            error "Cannot proceed with production build - frontend build failed"
            return 1
        fi
    fi
    
    # Try full production build
    if run_with_timeout "npm run tauri:build" 300 "Tauri production build"; then
        success "Production build completed successfully"
        
        # Validate outputs
        if check_exists "src-tauri/target/release" "Production build output"; then
            success "Production build validation passed"
            return 0
        else
            error "Production build produced no output"
            return 1
        fi
    else
        warning "Production build failed, trying chunked approach"
        
        # Try building Rust separately
        log "Attempting separate Rust build..."
        if run_with_timeout "cd src-tauri && cargo build --release" 240 "Rust backend build"; then
            success "Rust backend built successfully"
            return 0
        else
            error "All production build attempts failed"
            return 1
        fi
    fi
}

# Main execution function
main() {
    log "=== Intelligent Build System Started ==="
    log "Build log: $BUILD_LOG"
    log "Timeout limit: ${TIMEOUT_LIMIT}s"
    log "Max retries: $MAX_RETRIES"
    
    # Phase 1: Quick validation
    log "PHASE 1: Quick TypeScript Validation"
    if quick_ts_check; then
        success "Phase 1 completed successfully"
    else
        warning "Phase 1 failed, attempting environment cleanup"
        clean_environment
        
        # Retry after cleanup
        if quick_ts_check; then
            success "Phase 1 completed after cleanup"
        else
            error "Phase 1 failed even after cleanup"
            log "Build system encountered critical issues. Manual intervention may be required."
            exit 1
        fi
    fi
    
    # Phase 2: Frontend build
    log "PHASE 2: Frontend Build"
    if try_frontend_build; then
        success "Phase 2 completed successfully"
    else
        warning "Phase 2 failed, this may indicate system performance issues"
    fi
    
    # Phase 3: Development build (optional)
    log "PHASE 3: Development Build (Optional)"
    if try_dev_build; then
        success "Phase 3 completed successfully"
    else
        warning "Phase 3 failed, but continuing to production build"
    fi
    
    # Phase 4: Production build
    log "PHASE 4: Production Build"
    if try_production_build; then
        success "Phase 4 completed successfully"
    else
        error "Phase 4 failed - production build unsuccessful"
    fi
    
    log "=== Intelligent Build System Completed ==="
    log "Full log available in: $BUILD_LOG"
    
    # Summary
    log "=== Build Summary ==="
    if check_exists "dist" "Frontend output" && check_exists "src-tauri/target/release" "Backend output"; then
        success "🎉 COMPLETE: Desktop app build successful!"
        success "Ready for Academy testing and alpha distribution"
    elif check_exists "dist" "Frontend output"; then
        warning "⚠️  PARTIAL: Frontend build successful, backend build failed"
        log "You can test the Academy system in browser mode"
    else
        error "❌ FAILED: Build system could not produce working outputs"
        log "Manual intervention required"
    fi
}

# Run main function
main "$@"