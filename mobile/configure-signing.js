const fs = require('fs');
const path = require('path');

const gradlePath = path.join(__dirname, 'android', 'app', 'build.gradle');

if (!fs.existsSync(gradlePath)) {
  console.error('build.gradle not found at', gradlePath);
  process.exit(0);
}

let content = fs.readFileSync(gradlePath, 'utf8');

// Define release signing config pointing to mobile/release.keystore
const releaseSigningBlock = `
        release {
            storeFile file('../../release.keystore')
            storePassword 'merkurreferans2026'
            keyAlias 'merkurkey'
            keyPassword 'merkurreferans2026'
        }
`;

// Insert release signingConfig
if (content.includes('signingConfigs {') && !content.includes('keyAlias \'merkurkey\'')) {
  content = content.replace('signingConfigs {', `signingConfigs {${releaseSigningBlock}`);
}

// Ensure release buildType uses release signingConfig
content = content.replace(
  /buildTypes\s*\{\s*release\s*\{([^}]*?)signingConfig\s+signingConfigs\.\w+/s,
  (match, p1) => `buildTypes {\n        release {${p1}signingConfig signingConfigs.release`
);

// If signingConfig wasn't in release block at all, inject it
if (!content.includes('signingConfig signingConfigs.release')) {
  content = content.replace(
    'buildTypes {\n        release {',
    'buildTypes {\n        release {\n            signingConfig signingConfigs.release'
  );
}

fs.writeFileSync(gradlePath, content, 'utf8');
console.log('✅ Release signing configured successfully in build.gradle');
