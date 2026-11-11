import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// Every app must respect the system setting "reduce motion"
// (prefers-reduced-motion), as the project standards require.
describe('prefers-reduced-motion in all apps', () => {
  const appsDir = path.join(process.cwd(), 'apps');
  const apps = fs.readdirSync(appsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(appsDir, d.name, 'index.html')))
    .map((d) => d.name);

  it('finds all 10 apps', () => {
    assert.ok(apps.length >= 10, `expected at least 10 apps, found ${apps.length}: ${apps.join(', ')}`);
  });

  for (const app of apps) {
    const html = fs.readFileSync(path.join(appsDir, app, 'index.html'), 'utf8');

    it(`${app}: CSS media query for prefers-reduced-motion: reduce`, () => {
      assert.match(
        html,
        /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/,
        `apps/${app}/index.html must contain @media (prefers-reduced-motion: reduce)`
      );
    });

    it(`${app}: JS checks matchMedia before canvas / requestAnimationFrame effects`, (t) => {
      const usesCanvasEffects = /<canvas[\s>]/i.test(html) || /requestAnimationFrame\s*\(/.test(html);
      if (!usesCanvasEffects) {
        t.skip('no canvas or requestAnimationFrame effects');
        return;
      }
      assert.match(
        html,
        /matchMedia\(\s*['"]\(prefers-reduced-motion:\s*reduce\)['"]\s*\)/,
        `apps/${app}/index.html uses canvas/requestAnimationFrame and must check matchMedia('(prefers-reduced-motion: reduce)')`
      );
    });
  }
});
