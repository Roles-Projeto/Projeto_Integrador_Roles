const fs = require('fs');
const path = require('path');

function getAllHtml(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) results = results.concat(getAllHtml(full));
    else if (f.endsWith('.html')) results.push(full);
  });
  return results;
}

const files = getAllHtml('frontend');
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('config.js')) return;

  const depth = file.split(path.sep).length - 2;
  const prefix = depth <= 1 ? '' : '../'.repeat(depth - 1);
  const configPath = prefix + 'js/config.js';
  const tag = '<script src="' + configPath + '"></script>';

  const replaced = content.replace(/(<script(?! src="https))/i, tag + '\n    $1');

  if (replaced !== content) {
    fs.writeFileSync(file, replaced, 'utf8');
    console.log('OK:', file);
    count++;
  }
});
console.log('Total:', count, 'HTMLs atualizados');
