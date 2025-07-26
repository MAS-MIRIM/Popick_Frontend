#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  info: msg => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: msg => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warning: msg =>
    console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
};

const projectRoot = path.resolve(__dirname, '..');
const gitHooksDir = path.join(projectRoot, '.git', 'hooks');

// Pre-commit hook content
const preCommitHook = `#!/bin/sh
# Pre-commit hook for automatic testing

echo "Running tests before commit..."

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(js|jsx|ts|tsx)$')

if [ -z "$STAGED_FILES" ]; then
  echo "No JS/TS files staged. Skipping tests."
  exit 0
fi

# Run tests for staged files
for FILE in $STAGED_FILES; do
  echo "Testing changes in: $FILE"
  node scripts/auto-test.js "$FILE"
  
  if [ $? -ne 0 ]; then
    echo "❌ Tests failed! Please fix the tests before committing."
    exit 1
  fi
done

echo "✅ All tests passed!"
exit 0
`;

// Check if .git directory exists
if (!fs.existsSync(path.join(projectRoot, '.git'))) {
  log.warning(
    'No .git directory found. Please run this script from a git repository.',
  );
  process.exit(1);
}

// Create hooks directory if it doesn't exist
if (!fs.existsSync(gitHooksDir)) {
  fs.mkdirSync(gitHooksDir, {recursive: true});
}

// Write pre-commit hook
const preCommitPath = path.join(gitHooksDir, 'pre-commit');
fs.writeFileSync(preCommitPath, preCommitHook);
fs.chmodSync(preCommitPath, '755');

log.success('Git pre-commit hook installed successfully!');
log.info('Tests will now run automatically before each commit.');
log.info('To skip the hook temporarily, use: git commit --no-verify');
