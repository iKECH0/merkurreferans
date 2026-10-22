const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'android', 'app');
const gradlePath = path.join(appDir, 'build.gradle');
const keystoreSrc = path.join(__dirname, 'upload.keystore');
const keystoreDest = path.join(appDir, 'upload.keystore');

// 1. Copy upload.keystore directly into android/app/
if (process.env.ANDROID_KEYSTORE_PASSWORD && process.env.ANDROID_KEY_ALIAS && process.env.ANDROID_KEY_PASSWORD && fs.existsSync(keystoreSrc)) {
  fs.copyFileSync(keystoreSrc, keystoreDest);
  console.log('✅ upload.keystore copied directly into android/app/upload.keystore');
} else {
  console.error('❌ Signing setup skipped. Provide ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS and ANDROID_KEY_PASSWORD locally.');
  process.exitCode = 1;
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
            storePassword System.getenv('ANDROID_KEYSTORE_PASSWORD')
            keyAlias System.getenv('ANDROID_KEY_ALIAS')
            keyPassword System.getenv('ANDROID_KEY_PASSWORD')
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

// 4. Force targetSdkVersion 36, versionCode 5, versionName "1.0.5"
content = content.replace(/targetSdkVersion\s+.*$/m, 'targetSdkVersion 36');
content = content.replace(/versionCode\s+.*$/m, 'versionCode 5');
content = content.replace(/versionName\s+.*$/m, 'versionName "1.0.5"');

fs.writeFileSync(gradlePath, content, 'utf8');
console.log('✅ Release signing, targetSdkVersion 36 and versionCode 5 configured successfully in app/build.gradle');

// 5. Also update root android/build.gradle
const rootGradlePath = path.join(__dirname, 'android', 'build.gradle');
if (fs.existsSync(rootGradlePath)) {
  let rootContent = fs.readFileSync(rootGradlePath, 'utf8');
  rootContent = rootContent.replace(/targetSdkVersion\s*=\s*.*$/m, 'targetSdkVersion = 36');
  fs.writeFileSync(rootGradlePath, rootContent, 'utf8');
  console.log('✅ targetSdkVersion 36 configured in root android/build.gradle');
}

// 6. Also write to android/gradle.properties
const propertiesPath = path.join(__dirname, 'android', 'gradle.properties');
if (fs.existsSync(propertiesPath)) {
  let propContent = fs.readFileSync(propertiesPath, 'utf8');
  propContent += '\nandroid.targetSdkVersion=36\nandroid.suppressUnsupportedCompileSdk=36\n';
  fs.writeFileSync(propertiesPath, propContent, 'utf8');
  console.log('✅ android.targetSdkVersion=36 appended to android/gradle.properties');
}
