#!/usr/bin/env node

// Environment validation script for Organized AI
// Checks that all required dependencies and configurations are in place

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

// Validation results
let errors = [];
let warnings = [];
let successes = [];

function log(message, type = 'info') {
  switch (type) {
    case 'error':
      console.log(`${colors.red}[✗] ${message}${colors.reset}`);
      errors.push(message);
      break;
    case 'warning':
      console.log(`${colors.yellow}[!] ${message}${colors.reset}`);
      warnings.push(message);
      break;
    case 'success':
      console.log(`${colors.green}[✓] ${message}${colors.reset}`);
      successes.push(message);
      break;
    default:
      console.log(`    ${message}`);
  }
}

function checkCommand(command, friendlyName, required = true) {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    log(`${friendlyName} is installed`, 'success');
    return true;
  } catch (e) {
    if (required) {
      log(`${friendlyName} is not installed`, 'error');
    } else {
      log(`${friendlyName} is not installed (optional)`, 'warning');
    }
    return false;
  }
}

function checkNodeVersion() {
  try {
    const nodeVersion = process.version;
    const major = parseInt(nodeVersion.split('.')[0].slice(1));
    if (major >= 18) {
      log(`Node.js version ${nodeVersion} meets requirements`, 'success');
    } else {
      log(`Node.js version ${nodeVersion} is too old (need 18+)`, 'error');
    }
  } catch (e) {
    log('Could not determine Node.js version', 'error');
  }
}

function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  if (!fs.existsSync(envPath)) {
    log('.env file not found', 'error');
    if (fs.existsSync(envExamplePath)) {
      log('  Copy .env.example to .env and configure it');
    }
    return false;
  }
  
  log('.env file exists', 'success');
  
  // Check authentication mode
  const envContent = fs.readFileSync(envPath, 'utf8');
  const authModeMatch = envContent.match(/AUTH_MODE=(.+)/);
  const authMode = authModeMatch ? authModeMatch[1].trim() : 'api-key';
  
  if (authMode === 'claude-max') {
    log('Using Claude Max authentication (no API key needed)', 'success');
    
    // Check if Claude CLI is available
    try {
      execSync('claude --version', { stdio: 'ignore' });
      log('Claude Code CLI is available for Claude Max auth', 'success');
    } catch (e) {
      log('Claude Code CLI not found - required for Claude Max auth', 'error');
      log('  Install from: https://claude.ai/download');
      return false;
    }
  } else {
    // Check for API key
    if (!envContent.match(/ANTHROPIC_API_KEY=.+/)) {
      log('ANTHROPIC_API_KEY not set in .env', 'error');
      log('  Or switch to Claude Max auth by setting AUTH_MODE=claude-max');
      return false;
    }
    log('ANTHROPIC_API_KEY is configured', 'success');
  }
  
  return true;
}

function checkDependencies() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  const bunLockPath = path.join(process.cwd(), 'bun.lockb');
  
  if (!fs.existsSync(packageJsonPath)) {
    log('package.json not found', 'error');
    return false;
  }
  
  if (!fs.existsSync(nodeModulesPath)) {
    log('node_modules not found - run "bun install" or "npm install"', 'error');
    return false;
  }
  
  // Check if dependencies are up to date
  if (fs.existsSync(bunLockPath)) {
    log('Dependencies installed (using Bun)', 'success');
  } else {
    log('Dependencies installed (using npm/yarn)', 'success');
  }
  
  return true;
}

function checkTauriConfig() {
  const tauriConfigPath = path.join(process.cwd(), 'src-tauri', 'tauri.conf.json');
  
  if (!fs.existsSync(tauriConfigPath)) {
    log('Tauri configuration not found', 'error');
    return false;
  }
  
  try {
    const config = JSON.parse(fs.readFileSync(tauriConfigPath, 'utf8'));
    log('Tauri configuration is valid', 'success');
    return true;
  } catch (e) {
    log('Tauri configuration is invalid: ' + e.message, 'error');
    return false;
  }
}

function checkAgents() {
  const agentsPath = path.join(process.cwd(), 'cc_agents');
  
  if (!fs.existsSync(agentsPath)) {
    log('cc_agents directory not found', 'warning');
    return false;
  }
  
  const agents = fs.readdirSync(agentsPath).filter(f => f.endsWith('.claudia.json'));
  if (agents.length === 0) {
    log('No agent configurations found', 'warning');
  } else {
    log(`Found ${agents.length} agent configurations`, 'success');
  }
  
  return true;
}

console.log('\n=== Organized AI Environment Validation ===\n');

// Run all checks
console.log('Checking system requirements...\n');
checkCommand('git', 'Git');
checkCommand('rustc', 'Rust');
checkCommand('cargo', 'Cargo');
checkNodeVersion();
checkCommand('bun', 'Bun', false);
checkCommand('claude', 'Claude Code CLI', false);

console.log('\nChecking project setup...\n');
checkEnvFile();
checkDependencies();
checkTauriConfig();
checkAgents();

// Summary
console.log('\n=== Validation Summary ===\n');
console.log(`✓ Successes: ${successes.length}`);
console.log(`! Warnings: ${warnings.length}`);
console.log(`✗ Errors: ${errors.length}`);

if (errors.length > 0) {
  console.log('\nErrors found:');
  errors.forEach(err => console.log(`  - ${err}`));
  console.log('\nPlease fix these errors before running Organized AI.');
  process.exit(1);
}

if (warnings.length > 0) {
  console.log('\nWarnings:');
  warnings.forEach(warn => console.log(`  - ${warn}`));
}

console.log('\nEnvironment validation complete!');
console.log('Run "bun run tauri dev" to start the application.\n');
process.exit(0);