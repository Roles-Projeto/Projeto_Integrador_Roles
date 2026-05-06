const fs = require('fs');
const path = require('path');

function getAllFiles(dir, ext) {
  let results = [];
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) results = results.concat(getAllFiles(full, ext));
    else if (f.endsWith(ext)) results.push(full);
  });
  return results;
}

let count = 0;
const files = [...getAllFiles('frontend', '.js'), ...getAllFiles('frontend', '.html')];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  content = content.replace(/\/Frontend\//g, '/frontend/');
  content = content.replace(/\/Frontend"/g, '/frontend"');
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('OK:', file);
    count++;
  }
});
console.log('Total:', count, 'arquivos corrigidos');
