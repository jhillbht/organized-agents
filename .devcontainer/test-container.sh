#!/bin/bash

# Dev Container Validation Test Script
# Tests that all development tools and dependencies work correctly

set -e

echo "🧪 Testing Organized Agents Dev Container"
echo "========================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Test function
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_pattern="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "Testing $test_name... "
    
    if output=$(eval "$test_command" 2>&1); then
        if [[ -z "$expected_pattern" ]] || echo "$output" | grep -q "$expected_pattern"; then
            echo -e "${GREEN}✅ PASS${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
            return 0
        else
            echo -e "${RED}❌ FAIL${NC} (unexpected output)"
            echo "  Expected pattern: $expected_pattern"
            echo "  Got: $output"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            return 1
        fi
    else
        echo -e "${RED}❌ FAIL${NC} (command failed)"
        echo "  Command: $test_command"
        echo "  Error: $output"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

echo ""
echo -e "${BLUE}📦 Testing Core Development Tools${NC}"
echo "--------------------------------"

# Test Rust toolchain
run_test "Rust compiler" "rustc --version" "rustc"
run_test "Cargo package manager" "cargo --version" "cargo"
run_test "Rust clippy linter" "cargo clippy --version" "clippy"

# Test Node.js toolchain
run_test "Node.js runtime" "node --version" "v18"
run_test "npm package manager" "npm --version" ""
run_test "Bun package manager" "bun --version" ""

# Test Tauri
run_test "Tauri CLI" "cargo tauri --version" "tauri-cli"

# Test system tools
run_test "Git version control" "git --version" "git version"
run_test "jq JSON processor" "jq --version" "jq"

echo ""
echo -e "${BLUE}🔧 Testing Project Dependencies${NC}"
echo "------------------------------"

# Test project structure
run_test "Package.json exists" "test -f package.json" ""
run_test "Tauri config exists" "test -f src-tauri/tauri.conf.json" ""
run_test "Cargo.toml exists" "test -f src-tauri/Cargo.toml" ""
run_test ".env file exists" "test -f .env" ""

# Test dependency installation
if [ -d "node_modules" ]; then
    run_test "Node modules installed" "test -d node_modules" ""
else
    echo -e "${YELLOW}⚠️  Node modules not installed (run: bun install)${NC}"
fi

echo ""
echo -e "${BLUE}🔐 Testing Authentication${NC}"
echo "-------------------------"

# Test Claude CLI
if command -v claude >/dev/null 2>&1; then
    run_test "Claude CLI available" "command -v claude" "claude"
    
    # Test authentication status (don't fail if not authenticated)
    if claude whoami >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Claude authenticated: $(claude whoami)${NC}"
    else
        echo -e "${YELLOW}⚠️  Claude not authenticated (run: claude login)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Claude CLI not installed${NC}"
fi

echo ""
echo -e "${BLUE}🌐 Testing Network Connectivity${NC}"
echo "-------------------------------"

# Test internet connectivity
run_test "Internet connectivity" "curl -s --max-time 5 https://www.google.com" ""
run_test "GitHub connectivity" "curl -s --max-time 5 https://api.github.com" ""
run_test "Anthropic API connectivity" "curl -s --max-time 5 https://api.anthropic.com" ""

echo ""
echo -e "${BLUE}🚀 Testing Build Process${NC}"
echo "------------------------"

# Test basic compilation (if dependencies are installed)
if [ -d "node_modules" ]; then
    run_test "TypeScript compilation" "bun run build" ""
else
    echo -e "${YELLOW}⚠️  Skipping build tests (dependencies not installed)${NC}"
fi

# Test Rust compilation (basic check)
if [ -f "src-tauri/Cargo.toml" ]; then
    run_test "Rust compilation check" "cd src-tauri && cargo check" ""
else
    echo -e "${YELLOW}⚠️  Skipping Rust compilation test${NC}"
fi

echo ""
echo "================================================="
echo -e "${BLUE}📊 Test Results Summary${NC}"
echo "================================================="

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! ($TESTS_PASSED/$TOTAL_TESTS)${NC}"
    echo ""
    echo -e "${GREEN}✅ Development environment is ready!${NC}"
    echo ""
    echo "🚀 Quick start commands:"
    echo "  • bun install           - Install dependencies"
    echo "  • bun run tauri:dev     - Start desktop app"
    echo "  • bun run dev           - Start web version"
    echo "  • claude login          - Authenticate with Claude"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some tests failed ($TESTS_FAILED/$TOTAL_TESTS failed)${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Development environment needs attention${NC}"
    echo ""
    echo "🔧 Common fixes:"
    echo "  • Run: bun install"
    echo "  • Run: claude login"
    echo "  • Check Docker container logs"
    echo "  • Rebuild container: docker-compose build --no-cache"
    echo ""
    exit 1
fi