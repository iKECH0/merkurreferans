const fs = require('fs');
const path = require('path');

const replacements = {
  "Ö ğretmen": "Öğretmen",
  "Ö ğrenci": "Öğrenci",
  "Ö ğrenciler": "Öğrenciler",
  "Ö ğrencim": "Öğrencim",
  "Ö ğrencileriniz": "Öğrencileriniz",
  "Ö ğrencilerim": "Öğrencilerim",
  "Ö ğrencisi": "Öğrencisi",
  "Ö ğrenciyi": "Öğrenciyi",
  "Ö ğretmenin": "Öğretmenin",
  "Ö ğretmene": "Öğretmene",
  "Ö ğretmenler": "Öğretmenler",
  "Ö deme": "Ödeme",
  "Ö demeleri": "Ödemeleri",
  "Ö demesini": "Ödemesini",
  "Ö dendi": "Ödendi",
  "Ö de": "Öde",
  "Ö rn": "Örn",
  "Ö rneğin": "Örneğin",
  "Ö zel": "Özel",
  "Ö mür": "Ömür",
  "Ö lçü": "Ölçü",
  "Ö zgüven": "Özgüven",
  "Ö zgürlük": "Özgürlük",
  "Ö lçeklenebilirlik": "Ölçeklenebilirlik",
  "\ufffda": "Ça",
  "\ufffdl": "Çl",
  "\ufffdr": "Çr",
  "x\ufffd\ufffd": "🎓",
  "\ufffd ": "Ö",
  "Çekildi/Ö dendi": "Çekildi/Ödendi"
};

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
let filesChanged = 0;

const keys = Object.keys(replacements).sort((a, b) => b.length - a.length);

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let originalContent = content;
  
  keys.forEach(k => {
    if (content.includes(k)) {
      content = content.split(k).join(replacements[k]);
    }
  });

  // some specific ones
  content = content.replace(/Ö ğ/g, 'Öğ');
  content = content.replace(/Ö d/g, 'Öd');
  content = content.replace(/Ö r/g, 'Ör');
  content = content.replace(/Ö z/g, 'Öz');
  content = content.replace(/Ö m/g, 'Öm');
  content = content.replace(/Ö l/g, 'Öl');
  
  if (content !== originalContent) {
    fs.writeFileSync(f, content, 'utf8');
    filesChanged++;
  }
});

console.log('Fixed files count:', filesChanged);
