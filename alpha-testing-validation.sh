#!/bin/bash

# Organized AI Alpha Testing Validation Script
# This script validates that the application is ready for alpha testing

echo "==========================================="
echo "   Organized AI Alpha Testing Validation"
echo "==========================================="
echo "Timestamp: $(date)"
echo

PASSED=0
FAILED=0
WARNINGS=0

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASSED++))
}

fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
    ((WARNINGS++))
}

info() {
    echo -e "${BLUE}ℹ️  INFO${NC}: $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    fail "Not in the organized-agents directory. Please run from project root."
    exit 1
fi

echo "=== 1. SECURITY VALIDATION ==="

# Check for sensitive files
if [ -f ".env" ]; then
    warn ".env file exists - ensure it's not committed to git"
else
    pass "No .env file in repository"
fi

# Check .gitignore
if grep -q "\.env" .gitignore; then
    pass ".gitignore properly excludes .env files"
else
    fail ".gitignore does not exclude .env files"
fi

if grep -q "api-keys" .gitignore; then
    pass ".gitignore excludes API key files"
else
    warn ".gitignore should exclude API key files"
fi

# Check for hardcoded secrets
echo "Checking for hardcoded API keys..."
if grep -r -i "sk-" src/ 2>/dev/null | grep -v node_modules | head -1; then
    fail "Potential hardcoded OpenAI API key found"
else
    pass "No hardcoded OpenAI API keys found"
fi

if grep -r -i "claude-[0-9]" src/ 2>/dev/null | grep -v node_modules | head -1; then
    info "Claude model references found (this is normal)"
fi

echo

echo "=== 2. PROJECT STRUCTURE VALIDATION ==="

# Check essential files
essential_files=(
    "package.json"
    "src-tauri/Cargo.toml" 
    "src-tauri/tauri.conf.json"
    "vite.config.ts"
    "tsconfig.json"
    ".env.example"
    ".gitignore"
    "README.md"
)

for file in "${essential_files[@]}"; do
    if [ -f "$file" ]; then
        pass "Essential file exists: $file"
    else
        fail "Missing essential file: $file"
    fi
done

# Check directory structure
essential_dirs=(
    "src"
    "src-tauri/src"
    "src/components"
    "src/lib"
    "public"
)

for dir in "${essential_dirs[@]}"; do
    if [ -d "$dir" ]; then
        pass "Essential directory exists: $dir"
    else
        fail "Missing essential directory: $dir"
    fi
done

echo

echo "=== 3. DEPENDENCY VALIDATION ==="

# Check if package.json is valid
if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" 2>/dev/null; then
    pass "package.json is valid JSON"
else
    fail "package.json is invalid JSON"
fi

# Check if Cargo.toml is valid
if command -v cargo >/dev/null 2>&1; then
    if cargo check --manifest-path src-tauri/Cargo.toml --quiet 2>/dev/null; then
        pass "Cargo.toml is valid"
    else
        warn "Cargo.toml may have issues (run 'cargo check' for details)"
    fi
else
    warn "Cargo not found - cannot validate Rust dependencies"
fi

echo

echo "=== 4. ENVIRONMENT VALIDATION ==="

# Check .env.example
if [ -f ".env.example" ]; then
    if grep -q "ANTHROPIC_API_KEY" .env.example; then
        pass ".env.example includes Anthropic API key"
    else
        fail ".env.example missing Anthropic API key"
    fi
    
    if grep -q "OPENAI_API_KEY" .env.example; then
        pass ".env.example includes OpenAI API key"
    else
        warn ".env.example missing OpenAI API key"
    fi
    
    if grep -q "GOOGLE_API_KEY" .env.example; then
        pass ".env.example includes Google API key"
    else
        warn ".env.example missing Google API key"
    fi
else
    fail ".env.example file missing"
fi

echo

echo "=== 5. DOCUMENTATION VALIDATION ==="

# Check README
if [ -f "README.md" ]; then
    if grep -q "Prerequisites" README.md; then
        pass "README includes prerequisites"
    else
        warn "README should include prerequisites section"
    fi
    
    if grep -q "Installation" README.md; then
        pass "README includes installation instructions"
    else
        fail "README missing installation instructions"
    fi
    
    if grep -q "ALPHA SOFTWARE" README.md; then
        pass "README includes alpha software warning"
    else
        warn "README should include alpha software disclaimer"
    fi
    
    if grep -q "API" README.md; then
        pass "README mentions API setup"
    else
        warn "README should include API key setup instructions"
    fi
else
    fail "README.md file missing"
fi

echo

echo "=== 6. BUILD VALIDATION ==="

# Check if critical build files exist
if [ -f "vite.config.ts" ]; then
    pass "Vite configuration exists"
else
    fail "Missing vite.config.ts"
fi

if [ -f "tsconfig.json" ]; then
    pass "TypeScript configuration exists"
else
    fail "Missing tsconfig.json"
fi

if [ -f "src-tauri/tauri.conf.json" ]; then
    pass "Tauri configuration exists"
else
    fail "Missing Tauri configuration"
fi

# Check if node_modules exists (dependencies installed)
if [ -d "node_modules" ]; then
    pass "Dependencies appear to be installed"
else
    warn "Dependencies not installed - run 'bun install' or 'npm install'"
fi

echo

echo "=== 7. FEATURE VALIDATION ==="

# Check if key source files exist
key_files=(
    "src/App.tsx"
    "src/main.tsx"
    "src/components/Settings.tsx"
    "src/components/EducationDashboard.tsx"
    "src/lib/api.ts"
    "src-tauri/src/main.rs"
    "src-tauri/src/commands/router.rs"
    "src-tauri/src/education/mod.rs"
)

for file in "${key_files[@]}"; do
    if [ -f "$file" ]; then
        pass "Key feature file exists: $file"
    else
        fail "Missing key feature file: $file"
    fi
done

echo

echo "=== 8. ALPHA READINESS SUMMARY ==="

total_checks=$((PASSED + FAILED + WARNINGS))

echo "Results:"
echo -e "  ${GREEN}Passed: $PASSED${NC}"
echo -e "  ${RED}Failed: $FAILED${NC}"
echo -e "  ${YELLOW}Warnings: $WARNINGS${NC}"
echo "  Total Checks: $total_checks"
echo

# Determine alpha readiness
if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -le 3 ]; then
        echo -e "${GREEN}🎉 ALPHA READY${NC}: Project appears ready for alpha testing!"
        echo "Next steps:"
        echo "1. Create .env file from .env.example"
        echo "2. Add your API keys"
        echo "3. Run 'bun install && bun run tauri dev'"
        echo "4. Test core functionality"
        exit 0
    else
        echo -e "${YELLOW}⚠️  ALPHA READY WITH WARNINGS${NC}: Project is functional but has some issues to address."
        echo "Consider addressing the warnings above before public release."
        exit 0
    fi
else
    echo -e "${RED}❌ NOT ALPHA READY${NC}: Critical issues found that must be fixed."
    echo "Please address the failed checks above before proceeding."
    exit 1
fi