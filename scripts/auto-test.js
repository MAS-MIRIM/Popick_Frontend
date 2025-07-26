#!/usr/bin/env node

const {spawn} = require('child_process');
const path = require('path');
const fs = require('fs');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  info: msg => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: msg => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  error: msg => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  warning: msg =>
    console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
};

// Get the file that was changed from command line argument
const changedFile = process.argv[2];

if (!changedFile) {
  log.warning('No file specified. Running all tests...');
  runAllTests();
} else {
  const filePath = path.resolve(changedFile);
  const fileExt = path.extname(filePath);

  // Check if it's a TypeScript/JavaScript file
  if (!['.ts', '.tsx', '.js', '.jsx'].includes(fileExt)) {
    log.info(`File ${changedFile} is not a JS/TS file. Skipping tests.`);
    process.exit(0);
  }

  // Determine test file path
  const testFilePath = getTestFilePath(filePath);

  if (fs.existsSync(testFilePath)) {
    log.info(`Running tests for ${path.basename(filePath)}...`);
    runTest(testFilePath);
  } else {
    log.warning(
      `No test file found for ${path.basename(filePath)}. Running all tests...`,
    );
    runAllTests();
  }
}

function getTestFilePath(filePath) {
  const dir = path.dirname(filePath);
  const filename = path.basename(filePath, path.extname(filePath));
  const ext = path.extname(filePath);

  // Check if it's already a test file
  if (filename.endsWith('.test') || filename.endsWith('.spec')) {
    return filePath;
  }

  // Check for test file in __tests__ directory
  const projectRoot = path.resolve(__dirname, '..');
  const relativePath = path.relative(projectRoot, filePath);
  const testInTestsDir = path.join(
    projectRoot,
    '__tests__',
    relativePath.replace(ext, `.test${ext}`),
  );

  if (fs.existsSync(testInTestsDir)) {
    return testInTestsDir;
  }

  // Check for test file in same directory
  const testInSameDir = path.join(dir, `${filename}.test${ext}`);
  if (fs.existsSync(testInSameDir)) {
    return testInSameDir;
  }

  // Check for spec file
  const specInSameDir = path.join(dir, `${filename}.spec${ext}`);
  if (fs.existsSync(specInSameDir)) {
    return specInSameDir;
  }

  return testInTestsDir; // Return expected path even if it doesn't exist
}

function runTest(testFilePath) {
  const jest = spawn('npm', ['test', '--', testFilePath], {
    stdio: 'inherit',
    shell: true,
  });

  jest.on('close', code => {
    if (code === 0) {
      log.success('Tests passed! ✅');
      // If tests pass, also create/update the test if it's a new file
      const sourceFile = getSourceFilePath(testFilePath);
      if (sourceFile && !fs.existsSync(testFilePath)) {
        log.info('Creating test file for new component...');
        createTestFile(sourceFile, testFilePath);
      }
    } else {
      log.error('Tests failed! ❌');
      log.warning('Please fix the failing tests before proceeding.');
      process.exit(1);
    }
  });
}

function runAllTests() {
  const jest = spawn('npm', ['test'], {
    stdio: 'inherit',
    shell: true,
  });

  jest.on('close', code => {
    if (code === 0) {
      log.success('All tests passed! ✅');
    } else {
      log.error('Some tests failed! ❌');
      process.exit(1);
    }
  });
}

function getSourceFilePath(testFilePath) {
  const filename = path
    .basename(testFilePath)
    .replace('.test', '')
    .replace('.spec', '');

  // Try to find the source file
  const possiblePaths = [
    path.join(path.dirname(testFilePath), filename),
    path.join(path.dirname(testFilePath), '..', filename),
    path.join(path.dirname(testFilePath), '..', 'src', filename),
    path.join(path.dirname(testFilePath).replace('__tests__', ''), filename),
  ];

  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      return possiblePath;
    }
  }

  return null;
}

function createTestFile(sourceFile, testFile) {
  const componentName = path.basename(sourceFile, path.extname(sourceFile));
  const isScreen = sourceFile.includes('screens/');

  let testContent;

  if (isScreen) {
    testContent = `import React from 'react';
import { render } from '@testing-library/react-native';
import ${componentName} from '${path
      .relative(path.dirname(testFile), sourceFile)
      .replace(/\\/g, '/')
      .replace('.tsx', '')
      .replace('.ts', '')}';

describe('${componentName}', () => {
  it('renders correctly', () => {
    const { getByText } = render(<${componentName} />);
    
    // Add your assertions here
    expect(getByText('Some text')).toBeTruthy();
  });
  
  // Add more tests as needed
});
`;
  } else {
    testContent = `import React from 'react';
import { render } from '@testing-library/react-native';
import ${componentName} from '${path
      .relative(path.dirname(testFile), sourceFile)
      .replace(/\\/g, '/')
      .replace('.tsx', '')
      .replace('.ts', '')}';

describe('${componentName}', () => {
  it('renders correctly', () => {
    const { container } = render(<${componentName} />);
    expect(container).toBeTruthy();
  });
  
  // Add more tests as needed
});
`;
  }

  // Create directory if it doesn't exist
  const testDir = path.dirname(testFile);
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, {recursive: true});
  }

  fs.writeFileSync(testFile, testContent);
  log.success(`Created test file: ${path.relative(process.cwd(), testFile)}`);

  // Run the newly created test
  runTest(testFile);
}
