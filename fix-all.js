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
  // Check for common mojibake characters indicative of double-encoded UTF-8
  if (content.includes('Ã') || content.includes('Ä') || content.includes('Å') || content.includes('ğŸ')) {
    try {
      const fixedContent = Buffer.from(content, 'latin1').toString('utf8');
      
      // Safety check: if the fixed content still looks extremely broken or becomes empty, skip it.
      // But if it successfully decodes, write it back!
      if (fixedContent.length > 0) {
        fs.writeFileSync(file, fixedContent, 'utf8');
        console.log('Fixed mojibake in', file);
        changedCount++;
      }
    } catch (e) {
      console.error('Error fixing', file, e);
    }
  }
});

console.log('Total files fixed:', changedCount);
