const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/MERKÜR ODAK/g, 'MERKÜR DERS');
  content = content.replace(/https:\/\/merkuregitimuygulama\.vercel\.app/g, 'https://merkurdersplatformu.vercel.app');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed ${filePath}`);
}

fixFile('src/app/referrer/layout.js');
fixFile('src/app/referrer/page.js');
