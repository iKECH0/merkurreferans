const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.css')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  // Remove BOM or the specific invalid char if it exists at the start
  if (content.charCodeAt(0) === 0xFEFF || content.charCodeAt(0) === 0xFFFD) {
    content = content.substring(1);
    changed = true;
  }
  
  // Replace case insensitive Merkür Odak
  if (content.match(/Merkür Odak/i)) {
    content = content.replace(/Merkür Odak/gi, 'Merkür Ders');
    changed = true;
  }
  
  // Replace missing MerkÃ¼r Odak if any (case insensitive just in case)
  if (content.match(/MerkÃ¼r Odak/i)) {
    content = content.replace(/MerkÃ¼r Odak/gi, 'Merkür Ders');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
    changedCount++;
  }
});

console.log('Total files cleaned:', changedCount);
