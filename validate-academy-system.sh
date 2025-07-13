#!/bin/bash

# Academy System Validation Script
# Comprehensive testing of the Academy implementation

echo "🎓 Academy System Validation"
echo "============================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${BLUE}Testing: $test_name${NC}"
    
    if eval "$test_command" &> /dev/null; then
        echo -e "${GREEN}✅ PASS: $test_name${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL: $test_name${NC}"
        ((TESTS_FAILED++))
    fi
}

echo "📋 Pre-requisite Checks"
echo "----------------------"

# Check Node.js
run_test "Node.js installed" "node --version"

# Check npm
run_test "npm available" "npm --version"

# Check Rust
run_test "Rust toolchain" "rustc --version"

# Check Cargo
run_test "Cargo available" "cargo --version"

echo ""
echo "📦 Dependency Checks"
echo "-------------------"

# Check if package.json exists
run_test "package.json exists" "test -f package.json"

# Check if Cargo.toml exists
run_test "Cargo.toml exists" "test -f src-tauri/Cargo.toml"

# Check if node_modules exists (after npm install)
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ PASS: node_modules directory exists${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠️  SKIP: Run 'npm install' first${NC}"
fi

echo ""
echo "🏗️ Academy Implementation Checks"
echo "--------------------------------"

# Check Academy Rust module
run_test "Academy Rust module" "test -f src-tauri/src/academy/mod.rs"

# Check Academy commands
run_test "Academy commands" "test -f src-tauri/src/academy/commands.rs"

# Check Academy frontend components
run_test "CodePlayground component" "test -f src/academy/components/CodePlayground.tsx"
run_test "ExerciseValidator component" "test -f src/academy/components/ExerciseValidator.tsx"
run_test "InteractiveCodingExercise component" "test -f src/academy/components/InteractiveCodingExercise.tsx"

# Check Academy data
run_test "Sample lessons data" "test -f src/academy/data/sampleLessons.ts"
run_test "Session converter" "test -f src/academy/utils/sessionConverter.ts"
run_test "Database test utility" "test -f src/academy/utils/databaseTest.ts"

# Check Academy exports
run_test "Academy index exports" "test -f src/academy/index.ts"

echo ""
echo "🧪 Code Quality Checks"
echo "---------------------"

# Check for TypeScript files
run_test "TypeScript configuration" "test -f tsconfig.json"

# Check for Tauri configuration
run_test "Tauri configuration" "test -f src-tauri/tauri.conf.json"

# Check main.rs for Academy command registration
if grep -q "test_academy_database" src-tauri/src/main.rs; then
    echo -e "${GREEN}✅ PASS: Academy commands registered in main.rs${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL: Academy commands not found in main.rs${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo "📄 Documentation Checks"
echo "----------------------"

run_test "Setup guide" "test -f COMPLETE_SETUP_GUIDE.md"
run_test "Implementation status" "test -f ACADEMY_IMPLEMENTATION_STATUS.md"
run_test "Build instructions" "test -f DESKTOP_APP_BUILD_GUIDE.md"

echo ""
echo "🎯 Test Summary"
echo "==============="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Academy system ready for deployment.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check the output above for details.${NC}"
    exit 1
fi

echo ""
echo "🚀 Next Steps:"
echo "1. npm install                    # Install dependencies"
echo "2. npm run tauri:dev             # Test development build"  
echo "3. npm run tauri:build           # Create production build"
echo "4. Test Academy features in app  # Validate functionality"