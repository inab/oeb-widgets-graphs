import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { setImmediate } from 'node:timers/promises';

const script = await readFile(new URL('../docs/assets/examples.js', import.meta.url), 'utf8');

function setup(fetch, libraryAvailable = true, graph = { _fullData: [{}], querySelector() { return {}; } }) {
  const buttons = ['first.json', 'second.json'].map((file) => ({
    dataset: { file, description: `Description for ${file}` },
    attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, callback) { this.callback = callback; },
    click() { this.callback(); },
  }));
  const description = { textContent: '' };
  const source = { href: '' };
  const status = { textContent: '', dataset: {} };
  const usage = { textContent: '', dataset: {} };
  const chart = {
    children: [], attributes: {},
    replaceChildren(...children) { this.children = children; },
    setAttribute(name, value) { this.attributes[name] = value; },
  };
  const chartContainer = { dataset: {} };
  const elements = {
    '.sample-description': description,
    '.sample-source': source,
    '.example-status': status,
    '.example-chart': chartContainer,
    '.example-chart-content': chart,
  };
  const example = {
    dataset: { widgetType: 'line-plot', bundleUrl: '/bundle.js', sampleRoot: '/samples/', sourceRoot: '/source/' },
    querySelector(selector) { return elements[selector]; },
    querySelectorAll() { return buttons; },
  };
  const errors = [];
  vm.runInNewContext(script, {
    document: {
      querySelector(selector) { return selector === '.live-example' ? example : usage; },
      createElement(tag) {
        return { tag, shadowRoot: { querySelector() {
          return { shadowRoot: { querySelector() {
            return graph;
          } } };
        } } };
      },
    },
    customElements: { get() { return libraryAvailable; } },
    console: { error(...args) { errors.push(args); } },
    fetch,
    encodeURIComponent,
    setTimeout,
  });
  return { buttons, description, source, status, usage, chart, chartContainer, errors };
}

const response = data => ({ ok: true, json: async () => data });

test('loads and switches samples with the correct widget data', async () => {
  const app = setup(async url => response({ url }));
  await setImmediate();
  assert.equal(app.buttons[0].attributes['aria-pressed'], 'true');
  assert.equal(app.chart.children[0].type, 'line-plot');
  assert.equal(app.chart.attributes['aria-busy'], 'false');
  assert.equal(app.status.dataset.state, 'ready');
  assert.equal(app.chartContainer.dataset.state, 'ready');
  assert.equal(app.usage.dataset.copyReady, 'true');
  assert.deepEqual(JSON.parse(app.chart.children[0].data), { url: '/samples/first.json' });
  assert.match(app.usage.textContent, /"url": "\/samples\/first\.json"/);
  assert.doesNotMatch(app.usage.textContent, /fetch\(/);

  app.buttons[1].click();
  await setImmediate();
  assert.equal(app.buttons[0].attributes['aria-pressed'], 'false');
  assert.equal(app.buttons[1].attributes['aria-pressed'], 'true');
  assert.equal(app.source.href, '/source/second.json');
  assert.equal(app.description.textContent, 'Description for second.json');
  assert.deepEqual(JSON.parse(app.chart.children[0].data), { url: '/samples/second.json' });
  assert.match(app.usage.textContent, /"url": "\/samples\/second\.json"/);
});

test('keeps the loading indicator until the plot has rendered', async () => {
  const graph = { _fullData: [], querySelector() { return {}; } };
  const app = setup(async () => response({}), true, graph);
  await setImmediate();
  assert.equal(app.status.dataset.state, 'loading');
  assert.equal(app.chartContainer.dataset.state, 'loading');
  assert.equal(app.chart.attributes['aria-busy'], 'true');
  graph._fullData.push({});
  await new Promise(resolve => setTimeout(resolve, 150));
  assert.equal(app.status.dataset.state, 'ready');
  assert.equal(app.chart.attributes['aria-busy'], 'false');
});

test('reports sample and widget loading errors', async () => {
  const failed = setup(async () => ({ ok: false, status: 404 }));
  await setImmediate();
  assert.match(failed.status.textContent, /404/);
  assert.equal(failed.errors.length, 1);
  assert.equal(failed.chart.children.length, 0);
  assert.equal(failed.status.dataset.state, 'error');
  assert.equal(failed.chartContainer.dataset.state, 'error');
  assert.equal(failed.chart.attributes['aria-busy'], 'false');
  assert.match(failed.usage.textContent, /could not load/i);
  assert.equal(failed.usage.dataset.copyReady, 'false');

  const missingLibrary = setup(async () => response({}), false);
  await setImmediate();
  assert.match(missingLibrary.status.textContent, /widget library could not be loaded/i);
});

test('ignores a late response from an earlier selection', async () => {
  let resolveFirst;
  const app = setup(url => url.endsWith('first.json')
    ? new Promise(resolve => { resolveFirst = resolve; })
    : Promise.resolve(response({ sample: 'second' })));
  app.buttons[1].click();
  await setImmediate();
  resolveFirst(response({ sample: 'first' }));
  await setImmediate();
  assert.deepEqual(JSON.parse(app.chart.children[0].data), { sample: 'second' });
  assert.match(app.usage.textContent, /"sample": "second"/);
  assert.equal(app.status.textContent, '');
});

test('escapes embedded script-closing text in the usage example', async () => {
  const app = setup(async () => response({ label: '</script><script>alert(1)</script>' }));
  await setImmediate();
  assert.match(app.usage.textContent, /\\u003c\/script>/);
  assert.doesNotMatch(app.usage.textContent, /<\/script><script>alert/);
});
