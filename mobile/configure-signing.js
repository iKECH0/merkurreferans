const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'android', 'app');
const gradlePath = path.join(appDir, 'build.gradle');
const keystoreSrc = path.join(__dirname, 'release.keystore');
const keystoreDest = path.join(appDir, 'release.keystore');

// 1. Copy release.keystore directly into android/app/
if (fs.existsSync(keystoreSrc)) {
  fs.copyFileSync(keystoreSrc, keystoreDest);
  console.log('✅ release.keystore copied directly into android/app/release.keystore');
} else {
  console.error('❌ release.keystore not found at', keystoreSrc);
}

if (!fs.existsSync(gradlePath)) {
  console.error('build.gradle not found at', gradlePath);
  process.exit(0);
}

let content = fs.readFileSync(gradlePath, 'utf8');

// 2. Define release signing block pointing to release.keystore in the same directory
const releaseSigningBlock = `
        release {
            storeFile file('release.keystore')
            storePassword 'merkurreferans2026'
            keyAlias 'merkurkey'
            keyPassword 'merkurreferans2026'
        }
`;

if (content.includes('signingConfigs {') && !content.includes("keyAlias 'merkurkey'")) {
  content = content.replace('signingConfigs {', `signingConfigs {${releaseSigningBlock}`);
}

// 3. Ensure release buildType uses signingConfigs.release
content = content.replace(
  /(release\s*\{[\s\S]*?signingConfig\s+)signingConfigs\.\w+/,
  '$1signingConfigs.release'
);

if (!content.includes('signingConfig signingConfigs.release')) {
  content = content.replace(
    /release\s*\{/,
    'release {\n            signingConfig signingConfigs.release'
  );
}

fs.writeFileSync(gradlePath, content, 'utf8');
console.log('✅ Release signing configured successfully in build.gradle');
