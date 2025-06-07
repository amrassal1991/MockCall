#!/usr/bin/env node

/**
 * Test Runner Script for MockCall
 * Provides a simple interface to run different types of tests
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
    log(`\n${description}`, 'cyan');
    log('='.repeat(50), 'blue');
    
    try {
        const output = execSync(command, { 
            encoding: 'utf8', 
            stdio: 'inherit',
            cwd: __dirname 
        });
        log(`✅ ${description} completed successfully`, 'green');
        return true;
    } catch (error) {
        log(`❌ ${description} failed`, 'red');
        log(`Error: ${error.message}`, 'red');
        return false;
    }
}

function checkTestFiles() {
    const testDir = path.join(__dirname, 'tests');
    const testFiles = fs.readdirSync(testDir).filter(file => file.endsWith('.test.js'));
    
    log('\n📁 Test Files Found:', 'magenta');
    testFiles.forEach(file => {
        log(`  • ${file}`, 'yellow');
    });
    
    return testFiles.length;
}

function showCoverageReport() {
    const coverageDir = path.join(__dirname, 'coverage');
    if (fs.existsSync(coverageDir)) {
        log('\n📊 Coverage report generated in ./coverage/', 'green');
        log('Open ./coverage/lcov-report/index.html in your browser to view detailed coverage', 'cyan');
    }
}

function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'all';
    
    log('🧪 MockCall Test Runner', 'bright');
    log('========================', 'blue');
    
    // Check if we're in the right directory
    if (!fs.existsSync('package.json')) {
        log('❌ Error: package.json not found. Please run this script from the project root.', 'red');
        process.exit(1);
    }
    
    // Check test files
    const testCount = checkTestFiles();
    if (testCount === 0) {
        log('❌ No test files found in ./tests/', 'red');
        process.exit(1);
    }
    
    log(`\n🎯 Found ${testCount} test files`, 'green');
    
    let success = true;
    
    switch (command) {
        case 'unit':
            log('\n🔬 Running Unit Tests Only', 'bright');
            success = runCommand('npm test -- --testPathPattern="(complaints|speechService|qualityScoring|messageHandler).test.js"', 'Unit Tests');
            break;
            
        case 'integration':
            log('\n🔗 Running Integration Tests Only', 'bright');
            success = runCommand('npm test -- --testPathPattern="integration.test.js"', 'Integration Tests');
            break;
            
        case 'app':
            log('\n🖥️  Running Application Tests Only', 'bright');
            success = runCommand('npm test -- --testPathPattern="app.test.js"', 'Application Tests');
            break;
            
        case 'coverage':
            log('\n📊 Running Tests with Coverage Report', 'bright');
            success = runCommand('npm run test:coverage', 'Coverage Tests');
            if (success) {
                showCoverageReport();
            }
            break;
            
        case 'watch':
            log('\n👀 Running Tests in Watch Mode', 'bright');
            success = runCommand('npm run test:watch', 'Watch Mode Tests');
            break;
            
        case 'all':
        default:
            log('\n🚀 Running All Tests', 'bright');
            success = runCommand('npm test', 'All Tests');
            break;
    }
    
    // Final summary
    log('\n' + '='.repeat(50), 'blue');
    if (success) {
        log('🎉 All tests completed successfully!', 'green');
        log('\nNext steps:', 'cyan');
        log('  • Run "npm run test:coverage" for detailed coverage report', 'yellow');
        log('  • Run "npm run serve" to start the development server', 'yellow');
        log('  • Open index.html in your browser to test the application', 'yellow');
    } else {
        log('💥 Some tests failed. Please check the output above.', 'red');
        process.exit(1);
    }
}

// Show help if requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    log('🧪 MockCall Test Runner', 'bright');
    log('========================', 'blue');
    log('\nUsage: node test-runner.js [command]', 'cyan');
    log('\nCommands:', 'yellow');
    log('  all         Run all tests (default)', 'white');
    log('  unit        Run unit tests only', 'white');
    log('  integration Run integration tests only', 'white');
    log('  app         Run application tests only', 'white');
    log('  coverage    Run tests with coverage report', 'white');
    log('  watch       Run tests in watch mode', 'white');
    log('\nExamples:', 'yellow');
    log('  node test-runner.js', 'white');
    log('  node test-runner.js unit', 'white');
    log('  node test-runner.js coverage', 'white');
    process.exit(0);
}

main();