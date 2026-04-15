/**
 * @file missing-steps.ts
 * @description Detecta steps sin definición en los .feature files y genera
 *              los snippets TypeScript listos para copiar a los step definitions.
 *
 * Ejecutar: npx tsx scripts/missing-steps.ts
 */

import * as fs   from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface FeatureStep {
  keyword: 'Given' | 'When' | 'Then';
  text:    string;
  file:    string;
  line:    number;
}

// ── 1. Obtener steps definidos via bddgen export ──────────────────────────────

function getDefinedPatterns(): RegExp[] {
  const output = execSync('npx bddgen export', {
    cwd:      process.cwd(),
    encoding: 'utf8',
    stdio:    ['pipe', 'pipe', 'ignore'],
  });

  return output
    .split('\n')
    .filter(line => line.trim().startsWith('*'))
    .map(line => {
      // "* Given texto {string}" → "texto {string}"
      const expr = line.trim().replace(/^\*\s+(Given|When|Then|And|But)\s+/, '').trim();
      return cucumberExprToRegex(expr);
    });
}

// ── 2. Convertir Cucumber Expression a RegExp ─────────────────────────────────

function cucumberExprToRegex(expr: string): RegExp {
  const pattern = expr
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')   // escapar regex especiales
    .replace(/\\\{string\\\}/g,  '"[^"]*"')    // {string} → "..."
    .replace(/\\\{int\\\}/g,     '\\d+')       // {int}    → dígitos
    .replace(/\\\{float\\\}/g,   '[\\d.]+')    // {float}
    .replace(/\\\{word\\\}/g,    '\\S+');      // {word}   → sin espacios

  return new RegExp(`^${pattern}$`, 'i');
}

// ── 3. Parsear steps de los .feature files ───────────────────────────────────

function collectFeatureFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory())            results.push(...collectFeatureFiles(full));
    else if (entry.name.endsWith('.feature')) results.push(full);
  }
  return results;
}

function parseFeatureSteps(): FeatureStep[] {
  const stepPattern = /^\s*(Given|When|Then|And|But)\s+(.+)$/;
  const steps: FeatureStep[] = [];

  for (const filePath of collectFeatureFiles('features')) {
    const lines   = fs.readFileSync(filePath, 'utf8').split('\n');
    let lastKw: 'Given' | 'When' | 'Then' = 'Given';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith('#')) continue;

      const match = line.match(stepPattern);
      if (!match) continue;

      const [, rawKw, rawText] = match;

      // And/But heredan el keyword anterior
      const kw: 'Given' | 'When' | 'Then' =
        rawKw === 'And' || rawKw === 'But'
          ? lastKw
          : (rawKw as 'Given' | 'When' | 'Then');

      if (rawKw !== 'And' && rawKw !== 'But') lastKw = kw;

      // Reemplazar "<Param>" (con comillas) y <Param> (sin comillas) por "placeholder"
      // para que coincidan con el patrón {string} de las cucumber expressions
      const text = rawText.trim()
        .replace(/"<[^>]+>"/g, '"placeholder"')  // "<SheetBD>"  → "placeholder"
        .replace(/<[^>]+>/g,   '"placeholder"'); // <SheetBD>   → "placeholder"

      steps.push({ keyword: kw, text, file: path.relative(process.cwd(), filePath), line: i + 1 });
    }
  }

  return steps;
}

// ── 4. Generar snippet TypeScript ─────────────────────────────────────────────

function generateSnippet(keyword: 'Given' | 'When' | 'Then', text: string): string {
  // Restaurar {string} donde había "placeholder" para el snippet
  const stepText = text.replace(/"placeholder"/g, '{string}');

  return (
    `${keyword}(\n` +
    `  '${stepText}',\n` +
    `  async ({ app, scenarioData }) => {\n` +
    `    // TODO: implementar\n` +
    `  }\n` +
    `);`
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main(): void {
  console.log('Escaneando steps definidos...');
  const definedRegexes = getDefinedPatterns();
  console.log(`  → ${definedRegexes.length} steps definidos encontrados.\n`);

  const allSteps    = parseFeatureSteps();
  const seen        = new Set<string>();
  const missing: FeatureStep[] = [];

  for (const step of allSteps) {
    if (seen.has(step.text)) continue;

    const isDefined = definedRegexes.some(rx => rx.test(step.text));
    if (!isDefined) {
      seen.add(step.text);
      missing.push(step);
    }
  }

  if (missing.length === 0) {
    console.log('✓ Todos los steps tienen definición. No hay snippets que generar.\n');
    return;
  }

  console.log(`⚠  ${missing.length} step(s) sin definición:\n`);
  console.log('='.repeat(60));

  for (const step of missing) {
    console.log(`\n// Origen: ${step.file}:${step.line}`);
    console.log(generateSnippet(step.keyword, step.text));
  }

  console.log('\n' + '='.repeat(60));
  console.log('\nCopia los snippets anteriores al archivo de steps correspondiente.');
  console.log('Recuerda importar { Given, When, Then } from \'@support/fixtures\'.\n');
}

main();
