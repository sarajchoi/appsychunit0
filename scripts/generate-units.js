const fs = require('fs');
const path = require('path');
const { UNIT_FILE, parseUnitCsv, validateManifest } = require('../src/unitData');

function discoverUnits(publicDir, metadata = {}) {
  if (!metadata || Array.isArray(metadata) || typeof metadata !== 'object') {
    throw new Error('Unit metadata must be an object keyed by CSV filename.');
  }
  const files = fs.readdirSync(publicDir, { withFileTypes: true })
    .filter(entry => entry.isFile()).map(entry => entry.name);
  for (const file of files) {
    if (/^unit.*\.csv$/i.test(file) && !UNIT_FILE.test(file)) {
      throw new Error(`Unrecognized unit filename: ${file}. Use UNIT1.csv or UNIT1-1.csv (no leading zeros).`);
    }
  }
  const units = files.filter(file => UNIT_FILE.test(file)).sort((a, b) => {
    const left = a.slice(4, -4).split('-').map(BigInt);
    const right = b.slice(4, -4).split('-').map(BigInt);
    for (let i = 0; i < Math.min(left.length, right.length); i++) {
      if (left[i] !== right[i]) return left[i] < right[i] ? -1 : 1;
    }
    return left.length - right.length;
  }).map(fileName => {
    parseUnitCsv(fs.readFileSync(path.join(publicDir, fileName), 'utf8'), fileName);
    const extra = metadata[fileName] || {};
    if (typeof extra !== 'object' || Array.isArray(extra) ||
        Object.keys(extra).some(key => !['name', 'description'].includes(key))) {
      throw new Error(`Invalid metadata for ${fileName}: only name and description are supported.`);
    }
    return {
      id: fileName.slice(0, -4).toLowerCase(),
      name: `Unit ${fileName.slice(4, -4)}`,
      description: '',
      ...extra,
      fileName
    };
  });
  return validateManifest(units);
}

if (require.main === module) {
  try {
    const root = path.resolve(__dirname, '..');
    const metadataPath = path.join(root, 'unit-metadata.json');
    const metadata = fs.existsSync(metadataPath) ? JSON.parse(fs.readFileSync(metadataPath, 'utf8')) : {};
    const units = discoverUnits(path.join(root, 'public'), metadata);
    fs.writeFileSync(path.join(root, 'public/units.json'), JSON.stringify(units, null, 2) + '\n');
    console.log(`Generated units.json: ${units.map(unit => unit.name).join(', ')}`);
  } catch (error) {
    console.error(`Unit generation failed: ${error.message}`);
    process.exitCode = 1;
  }
}
module.exports = { discoverUnits };
