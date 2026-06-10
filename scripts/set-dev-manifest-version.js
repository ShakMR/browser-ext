const fs = require('fs');
const path = require('path');

const mode = process.argv[2];
const manifestPath = path.join(__dirname, '..', 'extensions', 'workday', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const baseVersion = (manifest.version_name || manifest.version).split('-')[0].split('.').slice(0, 3).join('.');

if (mode === 'dev') {
  const build = Math.floor(Date.now() / 1000) % 65535;
  manifest.version = `${baseVersion}.${build}`;
  manifest.version_name = `${baseVersion}-dev.${build}`;
} else {
  manifest.version = baseVersion;
  delete manifest.version_name;
}

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
