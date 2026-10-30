# Psychology Unit 0 Review Hub

An interactive flashcard study app designed for psychology students to master Unit 0 terminology and concepts.

## Features

- **Flashcards**: Traditional flip-card study mode with shuffle and reset options
- **Matching Game**: Timed memory game to match terms with definitions
- **Multiple Choice Quiz**: Test knowledge with randomized quizzes
- **Study List**: Comprehensive view of all terms and definitions
- **CSV Import/Export**: Load custom term sets and export progress
- **Secure Login**: Protected access with authentication

## Login Credentials

- **Username**: `APPSYCH2025`
- **Password**: `IVANPAVLOV`

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/psychology-flashcard-app.git
cd psychology-flashcard-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Usage

### Study Modes

1. **Flashcards**: Click cards to flip between terms and definitions
2. **Matching Game**: Match 8 pairs of terms and definitions as quickly as possible
3. **Quiz Mode**: Answer 10 multiple choice questions with instant feedback
4. **Study List**: Review all terms in a scrollable list format

### Adding or updating units

Put UTF-8 CSV files directly in `public/`, named `UNIT0.csv`, `UNIT1.csv`,
`UNIT1-1.csv`, `UNIT2.csv`, etc. Use uppercase `UNIT`, lowercase `.csv`,
and numeric segments without leading zeros. Units sort numerically (Unit 2
before Unit 10; Unit 1 before Unit 1-1). Other files are ignored; unit-like
CSV filenames with invalid spelling fail the build with a clear error.

Each nonblank CSV record must have exactly two nonempty columns: term and
definition. An optional first row `Term,Definition` is recognized as a header.
Quote fields containing commas or line breaks, and double embedded quotes:

```csv
Term,Definition
Heredity,"Traits passed down, including biological characteristics"
```

No code registration is needed. `npm run build` and `npm start` generate
`public/units.json` from the CSVs and validate every unit before proceeding.
The manifest is generated and ignored by Git. Restart the development server
after adding/removing files or changing metadata. For a deployed site, commit
and push the CSVs, then rebuild/redeploy; uploading a CSV alone to an already
built site cannot update its menu. Standard Netlify Git deployments running
`npm run build` and publishing `build/` need no additional API or secrets.
Whether pushes automatically deploy depends on the site's Netlify settings.

Optional `unit-metadata.json` entries are keyed by filename and may provide
`name` and/or `description`. New CSVs work without an entry. Existing Unit 0
and Unit 1-1 descriptions are preserved; units without metadata use an inferred
name and no description. Remove obsolete metadata when removing a unit.

Loading failures display an error on the unit selector instead of substituting
sample terms. Correct the CSV and rebuild; select the unit again to retry.
Reload the page after correcting a manifest failure.

### Validation

```bash
npm ci
npm run test:units
CI=true npm test -- --watchAll=false --runInBand
npm run build
```

Discovery/parser tests cover numeric sorting, future units without registration,
invalid filenames and data, quoted commas/newlines, BOM, headers and blank lines.
UI tests cover unit loading and explicit failure handling. All repository CSVs
are validated both by the tests and every production build.

## File Structure

- `public/UNIT*.csv`: study data
- `unit-metadata.json`: optional names/descriptions
- `scripts/generate-units.js`: build-time discovery and validation
- `src/unitData.js`: shared CSV and manifest validation
- `src/App.js`: study interface

## Technologies Used

- **React 18**: Frontend framework
- **Tailwind CSS**: Styling and responsive design
- **Lucide React**: Icon components
- **Papa Parse**: CSV file parsing
- **Local Storage**: Data persistence

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built for psychology education
- Inspired by effective spaced repetition learning techniques
- Named after Ivan Pavlov, the famous psychologist