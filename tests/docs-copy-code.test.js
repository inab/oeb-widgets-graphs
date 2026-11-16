import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const script = await readFile(new URL('../docs/assets/copy-code.js', import.meta.url), 'utf8');

function setup(writeText) {
  const elements = [];
  const code = { textContent: 'first sample', dataset: {}, parentElement: { before() {} } };
  class MutationObserver {
    constructor(callback) { this.callback = callback; }
    observe() { code.onChange = this.callback; }
  }
  vm.runInNewContext(script, {
    document: {
      querySelectorAll() { return [code]; },
      createElement(tag) {
        const element = {
          tag, children: [], setAttribute() {},
          classList: { toggle(name, value) { element.singleLine = value; } },
          append(...children) { this.children.push(...children); },
          addEventListener(event, callback) { this.callback = callback; },
        };
        elements.push(element);
        return element;
      },
    },
    navigator: { clipboard: { writeText } },
    MutationObserver,
    console: { error() {} },
  });
  return { code, frame: elements[1], status: elements[2], button: elements[3] };
}

test('copies the current code and clears feedback when it changes', async () => {
  const copied = [];
  const app = setup(async text => copied.push(text));
  await app.button.callback();
  assert.deepEqual(copied, ['first sample']);
  assert.equal(app.status.textContent, 'Copied!');
  assert.equal(app.frame.singleLine, true);
  app.code.textContent = 'second\nsample';
  app.code.onChange();
  assert.equal(app.frame.singleLine, false);
  assert.equal(app.status.textContent, '');
  await app.button.callback();
  assert.deepEqual(copied, ['first sample', 'second\nsample']);
});

test('reports clipboard failures and does not copy an unavailable sample', async () => {
  let calls = 0;
  const app = setup(async () => { calls++; throw new Error('Permission denied'); });
  app.code.dataset.copyReady = 'false';
  await app.button.callback();
  assert.equal(calls, 0);
  assert.match(app.status.textContent, /not ready/);
  app.code.dataset.copyReady = 'true';
  await app.button.callback();
  assert.equal(calls, 1);
  assert.match(app.status.textContent, /copy failed/i);
  assert.equal(app.button.disabled, false);
});
