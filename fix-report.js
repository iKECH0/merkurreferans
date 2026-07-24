const fs = require('fs');
const filePath = 'src/app/admin/users/[id]/report/page.js';
let content = fs.readFileSync(filePath, 'utf8');
content = content.replace(/MERKÜR ODAK/g, 'MERKÜR DERS');
fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed report page');
