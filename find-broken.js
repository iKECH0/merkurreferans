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
const brokenWords = new Set();
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes('\ufffd')) {
    const lines = content.split('\n');
    lines.forEach(line => {
      if (line.includes('\ufffd')) {
        const words = line.split(/[\s\"\',\.<>\{\}\(\)\:]+/);
        words.forEach(w => {
          if (w.includes('\ufffd')) brokenWords.add(w);
        });
      }
    });
  }
});
console.log(Array.from(brokenWords).join(', '));
