const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { discoverUnits } = require('./generate-units');
const { parseUnitCsv, validateManifest } = require('../src/unitData');

function fixture(t, files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'psych-units-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), text);
  return dir;
}

test('discovers new units without metadata, sorts numeric segments, ignores unrelated files', t => {
  const dir = fixture(t, Object.fromEntries(['UNIT10.csv', 'UNIT2-10.csv', 'UNIT2-2.csv', 'UNIT2.csv', 'notes.csv'].map(name => [name, 'term,meaning'])));
  fs.mkdirSync(path.join(dir, 'UNIT3.csv'));
  assert.deepEqual(discoverUnits(dir).map(unit => unit.name), ['Unit 2', 'Unit 2-2', 'Unit 2-10', 'Unit 10']);
  assert.equal(discoverUnits(dir, { 'UNIT2.csv': { description: 'Custom description' } })[0].description, 'Custom description');
});

test('rejects mistyped unit filenames and empty discovery', t => {
  for (const name of ['unit1.csv', 'UNIT01.csv', 'UNIT1-a.csv', 'UNIT2.CSV']) {
    assert.throws(() => discoverUnits(fixture(t, { [name]: 'a,b' })), /Unrecognized/);
  }
  assert.throws(() => discoverUnits(fixture(t, { 'notes.csv': 'a,b' })), /empty unit manifest/);
});

test('validates CSVs and metadata during discovery', t => {
  assert.throws(() => discoverUnits(fixture(t, { 'UNIT1.csv': 'a,' })), /UNIT1.csv/);
  const dir = fixture(t, { 'UNIT1.csv': 'a,b' });
  assert.throws(() => discoverUnits(dir, { 'UNIT1.csv': { fileName: 'other.csv' } }), /Invalid metadata/);
  assert.throws(() => discoverUnits(dir, { 'UNIT1.csv': { name: '' } }), /Invalid/);
});

test('preserves commas, apostrophes, escaped quotes, CRLF, BOM and embedded newlines', () => {
  const cards = parseUnitCsv('\ufeffTerm,Definition\r\n\r\n"Freud\'s theory","One, two and ""three""\r\nnext line"\r\n , \r\n');
  assert.deepEqual(cards, [{ id: 1, term: "Freud's theory", definition: 'One, two and "three"\r\nnext line' }]);
  assert.deepEqual(parseUnitCsv(' A , B \n'), [{ id: 1, term: 'A', definition: 'B' }]);
});

test('rejects malformed, empty and non-two-column data instead of dropping records', () => {
  for (const csv of ['', '\n , \n', 'Term,Definition\n', 'a,', ',b', 'a,b,c', 'a', '"a,b', '<html>error</html>']) {
    assert.throws(() => parseUnitCsv(csv, 'UNIT9.csv'), /UNIT9.csv/);
  }
});

test('rejects invalid manifest shapes and duplicate units', () => {
  for (const manifest of [{}, [], [{ fileName: '../secret' }]]) assert.throws(() => validateManifest(manifest), /manifest/);
  const unit = { id: 'unit1', name: 'Unit 1', description: '', fileName: 'UNIT1.csv' };
  assert.throws(() => validateManifest([unit, unit]), /manifest/);
});

test('all repository CSVs validate', () => {
  const dir = path.resolve(__dirname, '../public');
  const units = discoverUnits(dir);
  assert.ok(units.length > 0);
  for (const unit of units) {
    const text = fs.readFileSync(path.join(dir, unit.fileName), 'utf8');
    const cards = parseUnitCsv(text, unit.fileName);
    assert.ok(cards.length > 0);
    console.log(`${unit.fileName}: ${cards.length} terms`);
  }
});
