const fs = require('fs');
const path = require('path');
const { unitFromFilename, parseUnitCsv, validateManifest } = require('../src/unitData');

function discoverUnits(publicDir, metadata = {}) {
  if (!metadata || Array.isArray(metadata) || typeof metadata !== 'object') {
    throw new Error('Unit metadata must be an object keyed by CSV filename.');
  }
  const files = fs.readdirSync(publicDir, { withFileTypes: true })
    .filter(entry => entry.isFile()).map(entry => entry.name);
  const seen = new Map();
  const units = files.sort().flatMap(fileName => {
    const unit = unitFromFilename(fileName);
    if (!unit) {
      if (/^unit.*\.csv$/i.test(fileName)) {
        throw new Error(`Unrecognized unit filename: ${fileName}. Use a numbered name such as UNIT2.csv, UNIT2.5.csv, or UNIT2-5.csv.`);
      }
      return [];
    }
    if (seen.has(unit.id)) {
      throw new Error(`Duplicate unit: "${seen.get(unit.id)}" and "${fileName}" both identify ${unit.id}. Keep only the intended file.`);
    }
    seen.set(unit.id, fileName);
    return [{ fileName, ...unit }];
  }).sort((a, b) => {
    for (let i = 0; i < Math.min(a.segments.length, b.segments.length); i++) {
      const left = BigInt(a.segments[i]);
      const right = BigInt(b.segments[i]);
      if (left !== right) return left < right ? -1 : 1;
    }
    return a.segments.length - b.segments.length;
  }).map(({ fileName, id, name }) => {
    parseUnitCsv(fs.readFileSync(path.join(publicDir, fileName), 'utf8'), fileName);
    const extra = metadata[fileName] || {};
    if (typeof extra !== 'object' || Array.isArray(extra) ||
        Object.keys(extra).some(key => !['name', 'description'].includes(key))) {
      throw new Error(`Invalid metadata for ${fileName}: only name and description are supported.`);
    }
    return {
      id,
      name,
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
