const fs = require('fs');
const { execSync } = require('child_process');

// 1. Append to .env
fs.appendFileSync('.env', '\nZOOM_ACCOUNT_ID="17mjyIdfQymPEBcSu9F1jA"\nZOOM_CLIENT_ID="LeU5hCSdQ4eoHAhTaZqUNg"\nZOOM_CLIENT_SECRET="skSHDqRFjbvYPufQAPvE5Bfz80xxydY7"\n');
console.log('Appended to .env');

// 2. Add to Vercel (Production)
try {
  console.log('Adding ZOOM_ACCOUNT_ID...');
  execSync('npx vercel env add ZOOM_ACCOUNT_ID production --scope kodivas-projects', { input: '17mjyIdfQymPEBcSu9F1jA', stdio: ['pipe', 'pipe', 'pipe'] });
  
  console.log('Adding ZOOM_CLIENT_ID...');
  execSync('npx vercel env add ZOOM_CLIENT_ID production --scope kodivas-projects', { input: 'LeU5hCSdQ4eoHAhTaZqUNg', stdio: ['pipe', 'pipe', 'pipe'] });
  
  console.log('Adding ZOOM_CLIENT_SECRET...');
  execSync('npx vercel env add ZOOM_CLIENT_SECRET production --scope kodivas-projects', { input: 'skSHDqRFjbvYPufQAPvE5Bfz80xxydY7', stdio: ['pipe', 'pipe', 'pipe'] });
  
  console.log('Successfully added keys to Vercel!');
} catch(e) {
  console.log('Error adding to vercel. Maybe they already exist?');
  console.log(e.message);
  console.log(e.stdout ? e.stdout.toString() : '');
  console.log(e.stderr ? e.stderr.toString() : '');
}
