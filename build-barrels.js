const { execSync } = require('child_process');
const fs = require('fs');

console.log('📦 Running Barrelsby...');

// eslint-disable-next-line sonarjs/no-os-command-from-path
execSync('npx barrelsby --config ./barrelsby.json', { stdio: 'inherit' });

const componentBarrelPath = './components/index.ts';

if (fs.existsSync(componentBarrelPath)) {
  const currentContent = fs.readFileSync(componentBarrelPath, 'utf8');

  if (!currentContent.startsWith("'use client';")) {
    fs.writeFileSync(componentBarrelPath, `'use client';\n${currentContent}`);
    console.log(`✨ Successfully added 'use client' to ${componentBarrelPath}`);
  }
}
