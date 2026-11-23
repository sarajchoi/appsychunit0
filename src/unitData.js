const Papa = require('papaparse');
const UNIT_FILE = /^unit *(\d+(?: *[.-] *\d+)*)\.csv$/i;

function unitFromFilename(fileName) {
  const match = UNIT_FILE.exec(fileName);
  if (!match || match[0] !== fileName) return null;
  const number = match[1].replace(/ /g, '').replace(/\d+/g, digits =>
    digits.replace(/^0+(?=\d)/, ''));
  const segments = number.split(/[.-]/);
  return { id: 'unit' + segments.join('-'), name: 'Unit ' + number, segments };
}

function parseUnitCsv(text, fileName = 'CSV') {
  const result = Papa.parse(text, { delimiter: ',', skipEmptyLines: 'greedy' });
  if (result.errors.length) {
    throw new Error(`${fileName}: ${result.errors[0].message}`);
  }
  const rows = result.data;
  if (rows.length && rows[0].length === 2 &&
      rows[0][0].trim().toLowerCase() === 'term' &&
      rows[0][1].trim().toLowerCase() === 'definition') rows.shift();
  if (!rows.length) throw new Error(`${fileName}: no terms found.`);
  return rows.map((row, index) => {
    if (row.length !== 2 || !row[0].trim() || !row[1].trim()) {
      throw new Error(`${fileName}: data record ${index + 1} must contain exactly one nonempty term and definition.`);
    }
    return { id: index + 1, term: row[0].trim(), definition: row[1].trim() };
  });
}

function validateManifest(units) {
  if (!Array.isArray(units) || !units.length || units.some(unit =>
    typeof unit?.fileName !== 'string' || typeof unit.id !== 'string' ||
    unit.id !== unitFromFilename(unit.fileName)?.id ||
    typeof unit.name !== 'string' || !unit.name.trim() ||
    typeof unit.description !== 'string') ||
    new Set(units.map(unit => unit.id)).size !== units.length) {
    throw new Error('Invalid or empty unit manifest. Rebuild the site to generate units.json.');
  }
  return units;
}

module.exports = { unitFromFilename, parseUnitCsv, validateManifest };
