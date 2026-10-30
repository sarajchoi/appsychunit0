const Papa = require('papaparse');
const UNIT_FILE = /^UNIT(0|[1-9]\d*)(?:-(0|[1-9]\d*))*\.csv$/;

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
    !unit || !UNIT_FILE.test(unit.fileName) ||
    unit.id !== unit.fileName.slice(0, -4).toLowerCase() ||
    typeof unit.name !== 'string' || !unit.name.trim() ||
    typeof unit.description !== 'string') ||
    new Set(units.map(unit => unit.id)).size !== units.length) {
    throw new Error('Invalid or empty unit manifest. Rebuild the site to generate units.json.');
  }
  return units;
}

module.exports = { UNIT_FILE, parseUnitCsv, validateManifest };
