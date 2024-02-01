const fs = require('fs');

const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

function clearAnsi(str) {
  return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry]/g, '');
}

const printSection = (title, items) => {
  let output = `<h4>${title}</h4>`;
  items.forEach((item) => {
    const language = item.declaration ? 'typescript' : 'diff';
    const code = item.declaration ? item.declaration : clearAnsi(item.diff);

    output += `<b>${item.name}</b><br>\n`;
    output += `<sub>${item.location}</sub><br>\n`;
    output += `<pre lang="${language}">\n${code}\n</pre><br>\n`;
  });
  return output;
};

let markdown = '';

if (data.removals.length > 0) {
  markdown += printSection('Removals', data.removals);
}
if (data.changes.length > 0) {
  markdown += printSection('Changes', data.changes);
}

console.log(markdown);
