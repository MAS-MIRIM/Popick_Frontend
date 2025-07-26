# Testing Guide

This project includes automated testing infrastructure to ensure code quality and catch bugs early.

## Running Tests

### Manual Test Execution

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests for a specific file
npm test -- __tests__/screens/HomeScreen.test.tsx

# Run tests for a directory
npm test -- __tests__/screens/
```

### Automatic Test Execution

The project includes several ways to run tests automatically:

#### 1. File Watcher Mode

Start the automatic test runner that watches for file changes:

```bash
npm run test:auto
```

This will:
- Watch for changes in `screens/`, `components/`, `utils/`, and `services/` directories
- Automatically run relevant tests when files are saved
- Create test files for new components if they don't exist
- Show test results in real-time

#### 2. Jest Watch Mode

Use Jest's built-in watch mode:

```bash
npm run test:watch
```

This provides an interactive interface to:
- Run all tests
- Run only tests related to changed files
- Filter tests by name or pattern
- Update snapshots

#### 3. Pre-commit Hook

Install the git pre-commit hook:

```bash
node scripts/setup-hooks.js
```

This will:
- Run tests for all staged files before allowing a commit
- Prevent commits if tests fail
- Can be bypassed with `git commit --no-verify` if needed

## Writing Tests

### Test Structure

Tests are located in the `__tests__` directory, mirroring the source file structure:

```
src/
  screens/
    HomeScreen.tsx
__tests__/
  screens/
    HomeScreen.test.tsx
```

### Example Test

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { getByText } = render(<MyComponent />);
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('handles button press', () => {
    const onPress = jest.fn();
    const { getByText } = render(<MyComponent onPress={onPress} />);
    
    fireEvent.press(getByText('Click me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

## Testing Best Practices

1. **Write tests alongside development**: Use the automatic test runner to get immediate feedback
2. **Test user interactions**: Focus on testing what users see and do
3. **Keep tests simple**: Each test should verify one specific behavior
4. **Use descriptive test names**: Test names should clearly describe what is being tested
5. **Mock external dependencies**: Keep tests isolated and fast

## Troubleshooting

### Common Issues

1. **styled-components errors**: The project is configured to work with styled-components. If you see styling-related errors, check the jest setup.

2. **Module not found errors**: Ensure all dependencies are installed with `npm install`

3. **Image import errors**: Images are automatically mocked in tests. Check `__mocks__/fileMock.js`

### Debugging Tests

```bash
# Run tests with coverage
npm test -- --coverage

# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Run a single test suite with verbose output
npm test -- --verbose __tests__/screens/HomeScreen.test.tsx
```

## Configuration

### Jest Configuration

Jest is configured in `package.json`:
- Uses React Native preset
- Includes setup file for styled-components
- Transforms TypeScript files
- Mocks images and other assets

### Test Environment Setup

The `jest.setup.js` file configures:
- React Native gesture handler
- Testing library extensions
- Mock implementations for native modules

## Continuous Integration

When setting up CI/CD pipelines, use:

```bash
# Run tests once with CI-friendly output
CI=true npm test
```

This will:
- Run all tests once (no watch mode)
- Output results in a CI-friendly format
- Exit with appropriate status codes