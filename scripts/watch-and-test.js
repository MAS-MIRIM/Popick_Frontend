#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {spawn} = require('child_process');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

const log = {
  info: msg => console.log(`${colors.blue}[WATCH]${colors.reset} ${msg}`),
  success: msg => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  error: msg => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  warning: msg =>
    console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  change: msg => console.log(`${colors.magenta}[CHANGE]${colors.reset} ${msg}`),
};

const projectRoot = path.resolve(__dirname, '..');
const watchDirs = [
  path.join(projectRoot, 'screens'),
  path.join(projectRoot, 'components'),
  path.join(projectRoot, 'utils'),
  path.join(projectRoot, 'services'),
];

// Files to ignore
const ignorePatterns = [
  /node_modules/,
  /\.git/,
  /\.test\.(js|jsx|ts|tsx)$/,
  /\.spec\.(js|jsx|ts|tsx)$/,
  /__tests__/,
  /\.(json|md|lock)$/,
];

// Keep track of running tests to avoid multiple simultaneous runs
let isTestRunning = false;
let pendingTests = new Set();

log.info('Starting file watcher for automatic testing...');
log.info(
  `Watching directories: ${watchDirs
    .filter(fs.existsSync)
    .map(d => path.relative(projectRoot, d))
    .join(', ')}`,
);

// Watch each directory
watchDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    watchDirectory(dir);
  }
});

// Also watch the project root for new files
fs.watch(projectRoot, {recursive: false}, (eventType, filename) => {
  if (filename && shouldWatchFile(filename)) {
    handleFileChange(path.join(projectRoot, filename));
  }
});

function watchDirectory(dir) {
  fs.watch(dir, {recursive: true}, (eventType, filename) => {
    if (filename && shouldWatchFile(filename)) {
      const fullPath = path.join(dir, filename);
      handleFileChange(fullPath);
    }
  });
}

function shouldWatchFile(filename) {
  // Check if file should be ignored
  for (const pattern of ignorePatterns) {
    if (pattern.test(filename)) {
      return false;
    }
  }

  // Only watch JS/TS files
  const ext = path.extname(filename);
  return ['.js', '.jsx', '.ts', '.tsx'].includes(ext);
}

function handleFileChange(filePath) {
  // Check if file exists (might have been deleted)
  if (!fs.existsSync(filePath)) {
    return;
  }

  const relativePath = path.relative(projectRoot, filePath);
  log.change(`File changed: ${relativePath}`);

  // Add to pending tests
  pendingTests.add(filePath);

  // If no test is running, process the queue
  if (!isTestRunning) {
    processPendingTests();
  }
}

function processPendingTests() {
  if (pendingTests.size === 0) {
    return;
  }

  isTestRunning = true;
  const filesToTest = Array.from(pendingTests);
  pendingTests.clear();

  // If multiple files changed, run all tests
  if (filesToTest.length > 3) {
    log.info('Multiple files changed. Running all tests...');
    runAllTests();
  } else {
    // Run tests for each changed file
    filesToTest.forEach(file => {
      runTestForFile(file);
    });
  }
}

function runTestForFile(filePath) {
  const autoTest = spawn(
    'node',
    [path.join(__dirname, 'auto-test.js'), filePath],
    {
      stdio: 'inherit',
    },
  );

  autoTest.on('close', code => {
    isTestRunning = false;

    if (code === 0) {
      log.success('Tests completed successfully!');
    } else {
      log.error('Tests failed! Please fix the issues.');
    }

    // Process any pending tests that accumulated while this was running
    if (pendingTests.size > 0) {
      setTimeout(processPendingTests, 1000); // Small delay to avoid rapid re-runs
    }
  });
}

function runAllTests() {
  const jest = spawn('npm', ['test'], {
    stdio: 'inherit',
    shell: true,
  });

  jest.on('close', code => {
    isTestRunning = false;

    if (code === 0) {
      log.success('All tests passed!');
    } else {
      log.error('Some tests failed!');
    }

    // Process any pending tests
    if (pendingTests.size > 0) {
      setTimeout(processPendingTests, 1000);
    }
  });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log.info('Stopping file watcher...');
  process.exit(0);
});

log.info('Watching for file changes. Press Ctrl+C to stop.');
log.info('Tests will run automatically when you save files.');
