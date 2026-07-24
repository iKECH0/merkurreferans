const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
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

// 1. Build the dictionary from the old pristine project
const oldFiles = walk('../merkuregitimuygulama/src');
const wordMap = new Map();

oldFiles.forEach(file => {
  // Read correctly: the old files might be utf8 or windows-1254. 
  // Let's assume they are utf8 because they display correctly when viewed.
  // Wait, if they were utf8, why did they get mangled? 
  // Because they WERE utf8 but I double-encoded them? 
  // Let's just read them natively and find all words with Turkish characters.
  const correctContent = fs.readFileSync(file, 'utf8');
  
  // Create the mangled version using the EXACT SAME bug I caused earlier
  // Bug step 1: My replace-name script or earlier script read it
  // Wait, if it was just double-encoding, let's just use the words directly.
  
  const words = correctContent.split(/[\s\"\',\.<>\{\}\(\)\:\[\]\=\+\-\;\`]+/);
  
  words.forEach(w => {
    if (w.match(/[ğşıöüçĞŞİÖÜÇ]/)) {
      // Simulate the mangling to find what this word became
      // The mangling was: file read as utf8 (replacing bad bytes), then latin1 to utf8
      // Wait, let's just find the mangled word in the current project by context!
      // Actually, building the mapping manually is safer and fast.
    }
  });
});
