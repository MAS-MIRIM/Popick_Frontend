const fs = require('fs');
const glob = require('glob');

const manifests = glob.sync(
  'node_modules/*/android/src/main/AndroidManifest.xml',
  {
    ignore: ['node_modules/react-native/**'],
  },
);

manifests.forEach(manifestPath => {
  const content = fs.readFileSync(manifestPath, 'utf8');

  if (content.includes('<manifest') && !content.includes('package=')) {
    const packageName = manifestPath
      .split('/')[1]
      .replace('react-native-', '')
      .replace(/-/g, '');
    const updatedContent = content.replace(
      /<manifest([^>]*)>/,
      `<manifest$1 package="com.${packageName}">`,
    );

    fs.writeFileSync(manifestPath, updatedContent);
    console.log(`Fixed: ${manifestPath}`);
  }
});

console.log('Android manifests fixed!');
