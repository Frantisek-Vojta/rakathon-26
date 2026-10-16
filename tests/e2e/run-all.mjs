// Spustí všechny testy v prohlížeči za sebou.
// Použití:  BASE_URL=https://rakathon-26.vercel.app npm run test:e2e
//           (bez BASE_URL se testuje http://localhost:8765, viz README)
import { spawnSync } from 'node:child_process';

const suites = ['auth', 'children', 'letters', 'screens'];
let failedSuites = 0;
for (const name of suites) {
  console.log(`\n=== ${name} ===`);
  const r = spawnSync(process.execPath, [new URL(`./${name}.test.mjs`, import.meta.url).pathname], { stdio: 'inherit' });
  if (r.status !== 0) failedSuites++;
}
console.log(failedSuites ? `\nSelhalo sad testů: ${failedSuites}` : '\nVšechny testy prošly.');
process.exit(failedSuites ? 1 : 0);
