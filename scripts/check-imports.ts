#!/usr/bin/env node
/**
 * check-imports.ts
 * Identifica imports que deveriam usar aliases com @ mas estão sem o prefixo.
 *
 * Uso:
 *   ts-node -r tsconfig-paths/register scripts/check-imports.ts
 *   ts-node -r tsconfig-paths/register scripts/check-imports.ts --fix
 */

import * as fs from 'fs';
import * as path from 'path';

// Mapeamento: alias sem @ -> alias correto com @
// Derivado do tsconfig.json paths
const ALIAS_MAP: Record<string, string> = {
  modules: '@modules',
  configs: '@configs',
  shared: '@shared',
  utils: '@utils',
  globalTypes: '@globalTypes',
  middleware: '@middleware',
  typesGlobal: '@typesGlobal',
};

const ROOT_DIR = path.resolve(__dirname, '..', 'src');
const FIX_MODE = process.argv.includes('--fix');

// Regex que captura imports/requires com alias sem @
// Ex: from 'modules/foo/bar'  |  require('shared/utils/x')
const ALIAS_KEYS = Object.keys(ALIAS_MAP).join('|');
const IMPORT_REGEX = new RegExp(
  `(from\\s+['"]|require\\s*\\(\\s*['"])(${ALIAS_KEYS})(\/[^'"]+)(['"])`,
  'g',
);

interface Occurrence {
  file: string;
  line: number;
  column: number;
  original: string;
  fixed: string;
}

function collectTsFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTsFiles(fullPath));
    } else if (entry.isFile() && /\.tsx?$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

function checkFile(filePath: string): Occurrence[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const occurrences: Occurrence[] = [];

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    let match: RegExpExecArray | null;
    IMPORT_REGEX.lastIndex = 0;

    while ((match = IMPORT_REGEX.exec(line)) !== null) {
      const [fullMatch, prefix, aliasKey, rest, quote] = match;
      const correctAlias = ALIAS_MAP[aliasKey];
      const fixedImport = `${prefix}${correctAlias}${rest}${quote}`;

      occurrences.push({
        file: path.relative(ROOT_DIR + '/..', filePath),
        line: lineIdx + 1,
        column: match.index + 1,
        original: fullMatch,
        fixed: fixedImport,
      });
    }
  }

  return occurrences;
}

function fixFile(filePath: string, occurrences: Occurrence[]): void {
  let content = fs.readFileSync(filePath, 'utf-8');

  for (const occ of occurrences) {
    content = content.replace(occ.original, occ.fixed);
  }

  fs.writeFileSync(filePath, content, 'utf-8');
}

function run(): void {
  const files = collectTsFiles(ROOT_DIR);
  const allOccurrences: Occurrence[] = [];

  for (const file of files) {
    const found = checkFile(file);
    allOccurrences.push(...found);
  }

  if (allOccurrences.length === 0) {
    console.log('✅ Nenhum import incorreto encontrado.');
    return;
  }

  const byFile = allOccurrences.reduce<Record<string, Occurrence[]>>(
    (acc, occ) => {
      if (!acc[occ.file]) acc[occ.file] = [];
      acc[occ.file].push(occ);
      return acc;
    },
    {},
  );

  console.log(
    `\n⚠️  ${allOccurrences.length} import(s) incorreto(s) em ${Object.keys(byFile).length} arquivo(s):\n`,
  );

  for (const [file, occs] of Object.entries(byFile)) {
    console.log(`  📄 ${file}`);
    for (const occ of occs) {
      console.log(`     linha ${occ.line}:${occ.column}`);
      console.log(`       ❌ ${occ.original.trim()}`);
      console.log(`       ✅ ${occ.fixed.trim()}`);
    }
    console.log('');
  }

  if (FIX_MODE) {
    console.log('🔧 Aplicando correções...\n');
    for (const [file, occs] of Object.entries(byFile)) {
      const absPath = path.resolve(__dirname, '..', file);
      fixFile(absPath, occs);
      console.log(`  ✅ Corrigido: ${file}`);
    }
    console.log('\n✅ Todas as correções aplicadas. Execute yarn build novamente.');
  } else {
    console.log('💡 Execute com --fix para corrigir automaticamente:');
    console.log(
      '   ts-node -r tsconfig-paths/register scripts/check-imports.ts --fix\n',
    );
    process.exit(1);
  }
}

run();
