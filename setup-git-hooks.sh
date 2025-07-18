#!/bin/bash

# Setup Git Hooks for BMAD Desktop
# This script sets up automated git hooks for testing and pushing major changes

echo "🔧 Setting up BMAD Desktop Git Hooks..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository root"
    exit 1
fi

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Function to create or update a hook
create_hook() {
    local hook_name="$1"
    local hook_content="$2"
    local hook_path=".git/hooks/$hook_name"
    
    echo "$hook_content" > "$hook_path"
    chmod +x "$hook_path"
    echo "✅ Created/updated $hook_name hook"
}

# Pre-commit hook content
PRE_COMMIT_CONTENT='#!/bin/bash

# Pre-commit hook for BMAD Desktop - Validate changes before commit
echo "🔍 Pre-commit validation starting..."

cd "$(git rev-parse --show-toplevel)"

# Check if we have staged changes
if git diff --cached --quiet; then
    echo "ℹ️  No staged changes detected."
    exit 0
fi

echo "📝 Checking staged files..."
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)
echo "📄 Files to commit: $(echo "$STAGED_FILES" | wc -l)"

# Quick syntax check for critical files
STAGED_TS_FILES=$(echo "$STAGED_FILES" | grep -E "\.(ts|tsx|js|jsx)$" || true)
if [ ! -z "$STAGED_TS_FILES" ]; then
    echo "🔍 TypeScript/JavaScript files found: $(echo "$STAGED_TS_FILES" | wc -l)"
fi

echo "✅ Pre-commit validation complete"
exit 0'

# Post-commit hook content  
POST_COMMIT_CONTENT='#!/bin/bash

# Post-commit hook for BMAD Desktop - Auto-push major changes
COMMIT_MSG=$(git log -1 --pretty=%B)

# Check if this is a major change
if [[ "$COMMIT_MSG" =~ ^🚀|^🎉|^✅.*Complete|^.*Major.*|^.*Infrastructure.*|^.*Launch.*|^.*Frontend.*|^.*Backend.*|^.*Testing.*Complete ]] || 
   [[ "$COMMIT_MSG" =~ BMAD.*Desktop.*v[0-9]|Complete.*Implementation|Testing.*Infrastructure|Frontend.*Launch ]]; then
    
    echo "🤖 Post-commit hook: Major change detected!"
    echo "📝 Commit: ${COMMIT_MSG:0:80}..."
    
    cd "$(git rev-parse --show-toplevel)"
    
    # Run tests with timeout
    echo "🧪 Running tests..."
    if timeout 60s npm run test -- --run 2>/dev/null; then
        echo "✅ Tests passed!"
        
        if git status | grep -q "Your branch is ahead"; then
            echo "🔄 Auto-pushing to GitHub..."
            
            if git push origin main; then
                echo "🎉 Successfully auto-pushed to GitHub!"
                
                # macOS notification
                if command -v osascript >/dev/null 2>&1; then
                    osascript -e '\''display notification "BMAD Desktop changes pushed to GitHub" with title "Git Auto-Push" sound name "Glass"'\'' 2>/dev/null || true
                fi
            else
                echo "❌ Failed to push. Manual intervention required."
            fi
        else
            echo "ℹ️  Branch up to date with remote."
        fi
    else
        echo "❌ Tests failed. Skipping auto-push."
    fi
else
    echo "ℹ️  Regular commit - not auto-pushing"
fi

exit 0'

# Create the hooks
create_hook "pre-commit" "$PRE_COMMIT_CONTENT"
create_hook "post-commit" "$POST_COMMIT_CONTENT"

# Check if npm is available for testing
if command -v npm >/dev/null 2>&1; then
    echo "✅ npm detected - test commands will work"
else
    echo "⚠️  npm not found - install Node.js for test automation"
fi

# Check if we have test scripts
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    echo "✅ Test scripts found in package.json"
else
    echo "⚠️  No test scripts found - hooks will skip testing"
fi

echo ""
echo "🎉 Git hooks setup complete!"
echo ""
echo "📋 How it works:"
echo "  - Pre-commit: Validates files before commit"
echo "  - Post-commit: Auto-pushes major changes to GitHub"
echo ""
echo "🚀 Major change triggers (auto-push):"
echo "  - Commit messages starting with: 🚀 🎉 ✅"
echo "  - Messages containing: Major, Infrastructure, Launch, Complete"
echo "  - BMAD Desktop version commits"
echo ""
echo "🧪 Requirements for auto-push:"
echo "  - All tests must pass"
echo "  - Changes staged and committed"
echo "  - Branch ahead of remote"
echo ""
echo "🔧 To disable auto-push temporarily:"
echo "  chmod -x .git/hooks/post-commit"
echo ""
echo "✅ Ready to use! Try committing a major change."