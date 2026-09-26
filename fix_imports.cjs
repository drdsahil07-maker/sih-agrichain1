const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

function getSharedRelativePath(fromPath, targetModule) {
  const fromDir = path.dirname(fromPath);
  const targetPath = path.resolve('shared', targetModule);
  let rel = path.relative(fromDir, targetPath);
  return rel.startsWith('.') ? rel : './' + rel;
}

const targetModules = {
  'types': 'types',
  'data/seedData': 'data/seedData',
  'data/priceTrends': 'data/priceTrends',
  'data/callRecords': 'data/callRecords',
  'services/chainCompiler': 'services/chainCompiler'
};

const prefixesToReplace = [
  '../types', '../../types', '../../../types',
  '../data/seedData', '../../data/seedData', '../../../data/seedData',
  '../data/priceTrends', '../../data/priceTrends', '../../../data/priceTrends',
  '../data/callRecords', '../../data/callRecords', '../../../data/callRecords',
  '../services/chainCompiler', '../../services/chainCompiler', '../../../services/chainCompiler',
  './chainCompiler'
];

function processFile(filePath) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  prefixesToReplace.forEach(prefix => {
    // Escape prefix for regex
    const escapedPrefix = prefix.replace(/\./g, '\\.').replace(/\//g, '\\/');
    const regex = new RegExp(`from\\s+['"]${escapedPrefix}['"]`, 'g');
    
    // figure out which key it is
    let targetKey = null;
    if (prefix.includes('types')) targetKey = 'types';
    else if (prefix.includes('seedData')) targetKey = 'data/seedData';
    else if (prefix.includes('priceTrends')) targetKey = 'data/priceTrends';
    else if (prefix.includes('callRecords')) targetKey = 'data/callRecords';
    else if (prefix.includes('chainCompiler')) targetKey = 'services/chainCompiler';

    if (targetKey) {
      content = content.replace(regex, () => {
        const newRel = getSharedRelativePath(filePath, targetKey).replace(/\\/g, '/');
        modified = true;
        return `from '${newRel}'`;
      });
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

walk('frontend/src', processFile);
walk('backend', processFile);
