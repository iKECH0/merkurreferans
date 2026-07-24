const fs = require('fs');
const path = require('path');

const replacements = {
  "\ufffda": "Ça",
  "\ufffd \ufffdxretmen": "Öğretmen",
  "\ufffd \ufffdxrenci": "Öğrenci",
  "\ufffd \ufffd$": "Ö ", // not sure, maybe just Ö
  "\ufffd deme": "Ödeme",
  "\ufffd demeleri": "Ödemeleri",
  "\ufffd \ufffd️": "Ö ",
  "\ufffd rne\ufffdxin": "Örneğin",
  "A\ufffdx": "Ağ",
  "\ufffd \ufffd": "Ö ",
  "Ü\ufffd️": "Ü",
  "\ufffd dendi": "Ödendi",
  "\ufffd de": "Öde",
  "Olu\ufffdxtur": "Oluştur",
  "\ufffd rn": "Örn",
  "\ufffd zel": "Özel",
  "\ufffd \ufffdxrencisi": "Öğrencisi",
  "\ufffd \ufffdxrenciyi": "Öğrenciyi",
  "\ufffd \ufffdxretmenin": "Öğretmenin",
  "\ufffd \ufffdxrenciler": "Öğrenciler",
  "\ufffd ": " ", // Wait
  "\ufffd mür": "Ömür",
  "\ufffd \ufffdxrencilerinizi": "Öğrencilerinizi",
  "\ufffd \ufffdxretmenler": "Öğretmenler",
  "\ufffd demesini": "Ödemesini",
  "Çekildi/\ufffd dendi": "Çekildi/Ödendi",
  "\ufffd \ufffdxretmene": "Öğretmene",
  "\ufffd \ufffdxrencim": "Öğrencim",
  "\ufffd \ufffdxrencileriniz": "Öğrencileriniz",
  "\ufffd \ufffdxrencilerim": "Öğrencilerim",
  "oluşturaca\ufffdxınız": "oluşturacağınız",
  "ke\ufffdfedebilirsiniz": "keşfedebilirsiniz",
  "\ufffd lçü": "Ölçü",
  "\ufffd zgüven": "Özgüven",
  "\ufffd zgürlük": "Özgürlük",
  "\ufffd lçeklenebilirlik": "Ölçeklenebilirlik",
  "\ufffd!": "Ç",
  "\ufffdx": "ğ", // default fallback for \ufffdx? It can be 'ş' or 'ğ'. Let's do manual ones first.
  "keğfedebilirsiniz": "keşfedebilirsiniz", // in case it was replaced by ğ
  "Oluğtur": "Oluştur"
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
  
  if (content.includes('\ufffd')) {
    keys.forEach(k => {
      if (content.includes(k)) {
        content = content.split(k).join(replacements[k]);
      }
    });

    if (content !== originalContent) {
      fs.writeFileSync(f, content, 'utf8');
      filesChanged++;
    }
  }
});

console.log('Fixed files count:', filesChanged);
