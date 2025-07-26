const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const watchPaths = [
  'screens/ShortPickScreen.tsx',
  'utils/api.ts',
  '__tests__/ShortPickScreen.test.tsx',
  '__tests__/youtube-shorts-api.test.ts'
];

const testFiles = [
  '__tests__/ShortPickScreen.test.tsx',
  '__tests__/youtube-shorts-api.test.ts'
];

let isRunning = false;

function runTests() {
  if (isRunning) {
    console.log('Tests are already running, skipping...');
    return;
  }

  isRunning = true;
  console.log('\n🧪 Running tests...\n');
  
  try {
    execSync(`npm test -- ${testFiles.join(' ')} --watchAll=false`, {
      stdio: 'inherit'
    });
    console.log('\n✅ All tests passed!\n');
  } catch (error) {
    console.log('\n❌ Some tests failed. Please check the output above.\n');
  } finally {
    isRunning = false;
  }
}

function watchFiles() {
  console.log('👀 Watching for file changes...');
  console.log('Files being watched:', watchPaths.join(', '));
  
  // Run tests initially
  runTests();
  
  // Watch for changes
  watchPaths.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      fs.watchFile(fullPath, { interval: 1000 }, (curr, prev) => {
        if (curr.mtime !== prev.mtime) {
          console.log(`\n📝 File changed: ${filePath}`);
          runTests();
        }
      });
    } else {
      console.warn(`⚠️  File not found: ${filePath}`);
    }
  });
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Stopping file watcher...');
  process.exit(0);
});

// Start watching
watchFiles();