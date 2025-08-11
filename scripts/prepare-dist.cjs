const fs = require('fs');
const path = require('path');

const rootPkgPath = path.join(__dirname, '..', 'package.json');
const distPath = path.join(__dirname, '..', 'dist');
const distPkgPath = path.join(distPath, 'package.json');

const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));

const distPkg = {
  name: rootPkg.name,
  version: rootPkg.version,
  main: 'oeb-widgets-graphs.umd.js',
  module: 'oeb-widgets-graphs.es.js',
  exports: {
    '.': {
      import: './oeb-widgets-graphs.es.js',
      require: './oeb-widgets-graphs.umd.js'
    }
  },
  license: rootPkg.license
};

fs.writeFileSync(distPkgPath, JSON.stringify(distPkg, null, 2));

['README.md', 'LICENSE'].forEach(file => {
  const src = path.join(__dirname, '..', file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(distPath, file));
  }
});

console.log('✅ dist/ preparado para publicación');
