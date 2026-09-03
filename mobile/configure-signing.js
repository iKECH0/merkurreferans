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

// 4. Force targetSdkVersion and compileSdkVersion to 36, and versionCode to 3
content = content.replace(/targetSdkVersion\s+.*$/gm, 'targetSdkVersion 36');
content = content.replace(/compileSdkVersion\s+.*$/gm, 'compileSdkVersion 36');
content = content.replace(/versionCode\s+.*$/gm, 'versionCode 3');
content = content.replace(/versionName\s+.*$/gm, 'versionName "1.0.2"');

fs.writeFileSync(gradlePath, content, 'utf8');
console.log('✅ Release signing, API Level 36 and versionCode 3 configured successfully in app/build.gradle');

// 5. Also update root android/build.gradle
const rootGradlePath = path.join(__dirname, 'android', 'build.gradle');
if (fs.existsSync(rootGradlePath)) {
  let rootContent = fs.readFileSync(rootGradlePath, 'utf8');
  rootContent = rootContent.replace(/targetSdkVersion\s*=\s*.*$/gm, 'targetSdkVersion = 36');
  rootContent = rootContent.replace(/compileSdkVersion\s*=\s*.*$/gm, 'compileSdkVersion = 36');
  fs.writeFileSync(rootGradlePath, rootContent, 'utf8');
  console.log('✅ API Level 36 configured successfully in root android/build.gradle');
}

// 6. Also write to android/gradle.properties
const propertiesPath = path.join(__dirname, 'android', 'gradle.properties');
if (fs.existsSync(propertiesPath)) {
  let propContent = fs.readFileSync(propertiesPath, 'utf8');
  propContent += '\nandroid.targetSdkVersion=36\nandroid.compileSdkVersion=36\n';
  fs.writeFileSync(propertiesPath, propContent, 'utf8');
  console.log('✅ API Level 36 appended to android/gradle.properties');
}
