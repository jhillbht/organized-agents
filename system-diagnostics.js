#!/usr/bin/env node

// System Diagnostics for Build Issues
// Designed to run quickly and identify bottlenecks

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 System Diagnostics for Organized AI Build Issues\n');

// Function to safely execute commands with timeout
function safeExec(command, timeoutMs = 5000) {
    try {
        const result = execSync(command, { 
            timeout: timeoutMs,
            encoding: 'utf8',
            stdio: 'pipe'
        });
        return { success: true, output: result.trim() };
    } catch (error) {
        return { 
            success: false, 
            error: error.message,
            timeout: error.code === 'ETIMEDOUT'
        };
    }
}

// Function to check file/directory size safely
function checkPathInfo(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return {
            exists: true,
            size: stats.size,
            isDirectory: stats.isDirectory(),
            modified: stats.mtime
        };
    } catch (error) {
        return {
            exists: false,
            error: error.message
        };
    }
}

// Quick system checks
console.log('📊 System Performance Checks');
console.log('='.repeat(40));

// Check Node.js version
const nodeCheck = safeExec('node --version', 2000);
if (nodeCheck.success) {
    console.log(`✅ Node.js: ${nodeCheck.output}`);
} else {
    console.log(`❌ Node.js check failed: ${nodeCheck.error}`);
}

// Check npm version
const npmCheck = safeExec('npm --version', 2000);
if (npmCheck.success) {
    console.log(`✅ NPM: ${npmCheck.output}`);
} else {
    console.log(`❌ NPM check failed: ${npmCheck.error}`);
}

// Check available memory
const memCheck = safeExec('node -e "console.log(Math.round(process.memoryUsage().rss / 1024 / 1024) + \\"MB\\")"', 2000);
if (memCheck.success) {
    console.log(`✅ Memory usage: ${memCheck.output}`);
} else {
    console.log(`❌ Memory check failed: ${memCheck.error}`);
}

console.log('\n📁 Project Structure Analysis');
console.log('='.repeat(40));

// Check critical project files
const criticalPaths = [
    'package.json',
    'src',
    'src/academy',
    'src-tauri',
    'node_modules'
];

criticalPaths.forEach(filePath => {
    const info = checkPathInfo(filePath);
    if (info.exists) {
        if (info.isDirectory) {
            // For directories, try to count entries (with timeout protection)
            try {
                const files = fs.readdirSync(filePath);
                console.log(`✅ ${filePath}: Directory (${files.length} items)`);
                
                // Special check for node_modules size
                if (filePath === 'node_modules' && files.length > 1000) {
                    console.log(`   ⚠️  Large node_modules detected (${files.length} items) - potential performance impact`);
                }
            } catch (error) {
                console.log(`⚠️  ${filePath}: Directory exists but cannot read contents (${error.message})`);
            }
        } else {
            const sizeKB = Math.round(info.size / 1024);
            console.log(`✅ ${filePath}: File (${sizeKB}KB)`);
        }
    } else {
        console.log(`❌ ${filePath}: Missing (${info.error})`);
    }
});

console.log('\n🔧 TypeScript & Build Configuration');
console.log('='.repeat(40));

// Check package.json
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log(`✅ Package name: ${packageJson.name}`);
    console.log(`✅ Scripts available: ${Object.keys(packageJson.scripts || {}).join(', ')}`);
    
    // Check for build-related dependencies
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const buildDeps = ['vite', 'typescript', '@tauri-apps/cli'];
    buildDeps.forEach(dep => {
        if (deps[dep]) {
            console.log(`✅ ${dep}: ${deps[dep]}`);
        } else {
            console.log(`❌ ${dep}: Missing`);
        }
    });
} catch (error) {
    console.log(`❌ Package.json read failed: ${error.message}`);
}

console.log('\n🎓 Academy System Files Check');
console.log('='.repeat(40));

// Check Academy specific files
const academyFiles = [
    'src/academy/index.ts',
    'src/academy/components/Academy.tsx',
    'src/academy/api.ts',
    'src-tauri/src/academy/mod.rs'
];

academyFiles.forEach(filePath => {
    const info = checkPathInfo(filePath);
    if (info.exists) {
        const sizeKB = Math.round(info.size / 1024);
        console.log(`✅ ${filePath}: ${sizeKB}KB`);
    } else {
        console.log(`❌ ${filePath}: Missing`);
    }
});

console.log('\n🚀 Build Readiness Assessment');
console.log('='.repeat(40));

// Calculate readiness score
let readinessScore = 0;
let maxScore = 0;

const checks = [
    { name: 'Node.js available', passed: nodeCheck.success, weight: 1 },
    { name: 'NPM available', passed: npmCheck.success, weight: 1 },
    { name: 'Package.json exists', passed: checkPathInfo('package.json').exists, weight: 2 },
    { name: 'Source directory exists', passed: checkPathInfo('src').exists, weight: 2 },
    { name: 'Academy system exists', passed: checkPathInfo('src/academy').exists, weight: 3 },
    { name: 'Tauri backend exists', passed: checkPathInfo('src-tauri').exists, weight: 2 },
    { name: 'Dependencies installed', passed: checkPathInfo('node_modules').exists, weight: 2 }
];

checks.forEach(check => {
    maxScore += check.weight;
    if (check.passed) {
        readinessScore += check.weight;
        console.log(`✅ ${check.name}`);
    } else {
        console.log(`❌ ${check.name}`);
    }
});

const readinessPercent = Math.round((readinessScore / maxScore) * 100);
console.log(`\n📈 Build Readiness: ${readinessScore}/${maxScore} (${readinessPercent}%)`);

if (readinessPercent >= 80) {
    console.log('🎉 HIGH CONFIDENCE: Project appears ready for build attempts');
} else if (readinessPercent >= 60) {
    console.log('⚠️  MEDIUM CONFIDENCE: Some issues detected but may be buildable');
} else {
    console.log('❌ LOW CONFIDENCE: Significant issues detected, manual intervention required');
}

console.log('\n💡 Next Steps Recommendations');
console.log('='.repeat(40));

if (!nodeCheck.success || !npmCheck.success) {
    console.log('🔧 Install/fix Node.js and NPM first');
}

if (!checkPathInfo('node_modules').exists) {
    console.log('🔧 Run "npm install" to install dependencies');
}

if (checkPathInfo('node_modules').exists) {
    const nodeModulesInfo = checkPathInfo('node_modules');
    try {
        const files = fs.readdirSync('node_modules');
        if (files.length > 2000) {
            console.log('🧹 Consider "npm ci" for cleaner dependency installation');
        }
    } catch (error) {
        console.log('🧹 Node modules may be corrupted, try "rm -rf node_modules && npm install"');
    }
}

if (readinessPercent >= 80) {
    console.log('🚀 Try "npm run build" for frontend compilation test');
    console.log('🚀 Try "npm run tauri:dev" for development build test');
}

console.log('\n✨ Diagnostics Complete\n');