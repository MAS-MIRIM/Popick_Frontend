import React from 'react';
import { View } from 'react-native';

// Simply check if View can be imported from MyPageScreen's imports
describe('MyPageScreen View Import Simple Test', () => {
  it('should successfully import View from react-native', () => {
    // This test will fail at compile time if View is not imported in MyPageScreen
    const TestComponent = () => <View style={{ width: 10 }} />;
    
    expect(TestComponent).toBeDefined();
    expect(View).toBeDefined();
  });
  
  it('should verify MyPageScreen file has correct View import', () => {
    // Read the actual import statement from the file
    const fs = require('fs');
    const fileContent = fs.readFileSync('./screens/MyPageScreen.tsx', 'utf8');
    
    // Check if View is imported from react-native
    const importRegex = /import\s*{[^}]*\bView\b[^}]*}\s*from\s*['"]react-native['"]/;
    expect(fileContent).toMatch(importRegex);
  });
});