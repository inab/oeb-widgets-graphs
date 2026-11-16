import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

test('preserves package metadata in the distributable manifest', async t => {
  const root = await mkdtemp(join(tmpdir(), 'oeb-dist-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'scripts'));
  await mkdir(join(root, 'dist'));
  const source = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  await writeFile(join(root, 'package.json'), JSON.stringify(source));
  await copyFile(fileURLToPath(new URL('../scripts/prepare-dist.cjs', import.meta.url)), join(root, 'scripts/prepare-dist.cjs'));
  execFileSync(process.execPath, [join(root, 'scripts/prepare-dist.cjs')]);
  const dist = JSON.parse(await readFile(join(root, 'dist/package.json'), 'utf8'));

  for (const field of ['name', 'version', 'description', 'keywords', 'repository', 'homepage', 'bugs', 'author', 'license']) {
    assert.deepEqual(dist[field], source[field], field);
  }
  assert.equal(dist.exports['.'].import, './oeb-widgets-graphs.es.js');
  assert.equal(dist.exports['.'].require, './oeb-widgets-graphs.umd.js');
});
