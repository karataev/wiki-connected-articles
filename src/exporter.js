const fs = require('fs');

function toFile(filename, pages) {
  let result = [];
  pages.forEach(page => {
    page.links.forEach(link => {
      result.push(`"${page.title}" -> "${link.title}"`);
    })
  });
  fs.writeFileSync(filename, result.join('\n'));
  console.log('--- DONE ---');
}

module.exports = {
  toFile,
};
