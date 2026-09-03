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

// 4. Force targetSdkVersion and compileSdkVersion to 36 for Google Play requirement
content = content.replace(/targetSdkVersion\s+\d+/g, 'targetSdkVersion 36');
content = content.replace(/compileSdkVersion\s+\d+/g, 'compileSdkVersion 36');
content = content.replace(/compileSdk\s+\d+/g, 'compileSdk 36');
content = content.replace(/targetSdk\s+\d+/g, 'targetSdk 36');

fs.writeFileSync(gradlePath, content, 'utf8');
console.log('✅ Release signing and API Level 36 configured successfully in app/build.gradle');

// 5. Also update root android/build.gradle
const rootGradlePath = path.join(__dirname, 'android', 'build.gradle');
if (fs.existsSync(rootGradlePath)) {
  let rootContent = fs.readFileSync(rootGradlePath, 'utf8');
  rootContent = rootContent.replace(/compileSdkVersion\s*=\s*\d+/g, 'compileSdkVersion = 36');
  rootContent = rootContent.replace(/targetSdkVersion\s*=\s*\d+/g, 'targetSdkVersion = 36');
  fs.writeFileSync(rootGradlePath, rootContent, 'utf8');
  console.log('✅ API Level 36 configured successfully in root android/build.gradle');
}
