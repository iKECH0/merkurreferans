const fs = require('fs');
const path = require('path');

function getOldPath(newPath) {
  // Map merkur-ders-platformu path to merkuregitimuygulama path
  let p = newPath.replace('merkur-ders-platformu', 'merkuregitimuygulama');
  // Handle the students -> users rename
  p = p.replace(/\\admin\\users\\/g, '\\admin\\students\\');
  p = p.replace(/\/admin\/users\//g, '/admin/students/');
  return p;
}

function getWords(text) {
  return text.split(/([\s\"\'\,\.\<\>\{\}\(\)\:\[\]\=\+\-\;\`\n]+)/);
}

function fixFile(newPath) {
  const content = fs.readFileSync(newPath, 'utf8');
  if (!content.includes('\ufffd')) return false;

  const oldPath = getOldPath(newPath);
  if (!fs.existsSync(oldPath)) {
    console.log('Old file not found for', newPath);
    return false;
  }

  const oldContent = fs.readFileSync(oldPath, 'utf8');
  const newTokens = getWords(content);
  const oldTokens = getWords(oldContent).filter(t => t.trim().length > 0);
  
  // Create a search helper
  function findOldWord(mangledWord, prefix, suffix) {
    for (let i = 0; i < oldTokens.length; i++) {
      if (oldTokens[i].match(/[ğşıöüçĞŞİÖÜÇ]/)) { // it's a turkish word
        // check context
        const prev = oldTokens[i-1] || '';
        const next = oldTokens[i+1] || '';
        // If it roughly matches the prefix/suffix context
        if (prefix && prev.includes(prefix.trim()) || suffix && next.includes(suffix.trim())) {
           // Also, it should be same length roughly or start with same char if possible
           return oldTokens[i];
        }
      }
    }
    return null;
  }

  // Actually, simpler mapping! We already know the mapping from my manual list!
  // Let's just use a hardcoded map for 100% safety and speed!
  return false; 
}

