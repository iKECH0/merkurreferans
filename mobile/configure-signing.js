const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'android', 'app');
const gradlePath = path.join(appDir, 'build.gradle');
const keystoreSrc = path.join(__dirname, 'upload.keystore');
const keystoreDest = path.join(appDir, 'upload.keystore');

// 1. Copy upload.keystore directly into android/app/
if (fs.existsSync(keystoreSrc)) {
  fs.copyFileSync(keystoreSrc, keystoreDest);
  console.log('✅ upload.keystore copied directly into android/app/upload.keystore');
} else {
  console.error('❌ upload.keystore not found at', keystoreSrc);
}

if (!fs.existsSync(gradlePath)) {
  console.error('build.gradle not found at', gradlePath);
  process.exit(0);
}

let content = fs.readFileSync(gradlePath, 'utf8');

// 2. Define release signing block pointing to upload.keystore in the same directory
const releaseSigningBlock = `
        release {
            storeFile file('upload.keystore')
            storePassword 'merkuryorunge'
            keyAlias 'upload'
            keyPassword 'merkuryorunge'
        }
`;

if (content.includes('signingConfigs {') && !content.includes("keyAlias 'upload'")) {
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
