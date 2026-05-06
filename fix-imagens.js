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

// Corrige JS e HTML
[...getAllFiles('frontend', '.js'), ...getAllFiles('frontend', '.html')].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // ../Imagens/ → /frontend/imagens/
  content = content.replace(/\.\.\/Imagens\//gi, '/frontend/imagens/');
  // ../imagens/ → /frontend/imagens/
  content = content.replace(/\.\.\/imagens\//gi, '/frontend/imagens/');
  // ./Imagens/ → /frontend/imagens/
  content = content.replace(/\.\/Imagens\//gi, '/frontend/imagens/');
  // caminho/para/placeholder → /frontend/imagens/placeholder
  content = content.replace(/caminho\/para\/placeholder/gi, '/frontend/imagens/placeholder');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('OK:', file);
    count++;
  }
});

console.log('Total:', count, 'arquivos corrigidos');
