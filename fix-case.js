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

let count = 0;
getAllHtml('frontend').forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  content = content.replace(/\.\.\/JS\//g, '../js/');
  content = content.replace(/\.\.\/CSS\//g, '../css/');
  content = content.replace(/src="js\//g, 'src="/frontend/js/');
  content = content.replace(/href="css\//g, 'href="/frontend/css/');
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('OK:', file);
    count++;
  }
});
console.log('Total:', count, 'arquivos corrigidos');
