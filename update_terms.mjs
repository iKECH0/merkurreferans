import fs from 'fs/promises';
import path from 'path';

const SRC_DIR = 'C:\\Users\\Ufuk ÇELEBİ\\Desktop\\PROJELER\\merkur-ders-platformu\\src';

const replacements = [
  { from: /Bayi/g, to: 'Referans' },
  { from: /bayi/g, to: 'referans' },
  { from: /BAYİ/g, to: 'REFERANS' },
  { from: /BAYI/g, to: 'REFERANS' },
  { from: /Eğitmen/g, to: 'Referans' },
  { from: /eğitmen/g, to: 'referans' },
  { from: /EĞİTMEN/g, to: 'REFERANS' },
  { from: /MERKÜR DERS/g, to: 'MERKÜR REFERANS' },
  { from: /MERKÜR EĞİTİM/g, to: 'MERKÜR REFERANS' },
  { from: /Merkür Eğitim Akademisi/g, to: 'Merkür Referans Platformu' },
  { from: /Merkür Ders/g, to: 'Merkür Referans' }
];

async function processDirectory(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.js')) {
      let content = await fs.readFile(fullPath, 'utf-8');
      let modified = false;

      for (const replacement of replacements) {
        if (replacement.from.test(content)) {
          content = content.replace(replacement.from, replacement.to);
          modified = true;
        }
      }

      if (modified) {
        await fs.writeFile(fullPath, content, 'utf-8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(SRC_DIR).then(() => {
  console.log('Term replacement complete.');
}).catch(console.error);
