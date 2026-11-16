import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = (await readFile(new URL('../src/radar-plot.js', import.meta.url), 'utf8'))
  .replace(/^import .*$/gm, '')
  .replace('export class RadarPlot', 'class RadarPlot');
const technical = JSON.parse(await readFile(new URL('../src/demo/files/RADARPLOT_TECHNICAL.json', import.meta.url), 'utf8'));
const standard = JSON.parse(await readFile(new URL('../src/demo/files/RADARPLOT.json', import.meta.url), 'utf8'));

function renderTemplate(strings, ...values) {
  return strings.map((part, index) => part + (Array.isArray(values[index])
    ? values[index].flat(Infinity).join('')
    : values[index] ?? '')).join('');
}

let RadarPlot;
vm.runInNewContext(source, {
  LitElement: class {},
  html: renderTemplate,
  css: renderTemplate,
  plotlyStyles: '',
  graphStyles: '',
  oebIcon: '',
  isBSC: () => false,
  window: { customElements: { define(_name, component) { RadarPlot = component; } } },
});

function createPlot(data) {
  const plot = new RadarPlot();
  plot.data = data;
  plot.firstUpdated();
  return plot;
}

function scaleRows(plot) {
  const table = plot.render().match(/<table class="custom-table scale-table">([\s\S]*?)<\/table>/);
  assert.ok(table);
  return [...table[1].matchAll(/<tr>([\s\S]*?)<\/tr>/g)]
    .map(match => match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
    .slice(1);
}

test('shows actual per-metric bounds, scales and preferred direction for normalized radar data', () => {
  const plot = createPlot(technical);
  assert.deepEqual(scaleRows(plot), [
    'PEAK_RAM (Peak RAM usage) Logarithmic 10 – 100000 MB Lower',
    'CPU_MEAN (Mean CPU usage) Linear 0 – 800 % Lower',
    'RUNTIME (Wall-clock runtime) Logarithmic 10 – 10000 s Lower',
    'DISK_IO (Disk I/O) Logarithmic 100 – 100000 MB Lower',
    'ACCURACY (Accuracy) Linear 0 – 1 Higher',
    'THROUGHPUT (Throughput) Logarithmic 1000 – 1000000 reads/s Higher',
  ]);
  assert.equal(plot.traces[0].r[1], 1 - 95 / 800);
});

test('uses linear scale for unspecified metrics and hides scale details in standard mode', () => {
  const mixed = structuredClone(technical);
  delete mixed.visualization.representations[0].metrics_series[1].scale;
  assert.equal(scaleRows(createPlot(mixed))[1], 'CPU_MEAN (Mean CPU usage) Linear 0 – 800 % Lower');
  assert.doesNotMatch(createPlot(standard).render(), /Metric scales and bounds/);
});
