const example = document.querySelector('.live-example');
const buttons = [...example.querySelectorAll('.sample-button')];
const description = example.querySelector('.sample-description');
const source = example.querySelector('.sample-source');
const status = example.querySelector('.example-status');
const chartContainer = example.querySelector('.example-chart');
const chart = example.querySelector('.example-chart-content');
const usage = document.querySelector('.example-usage-code');
let requestId = 0;

async function waitForPlot(widget, currentRequest) {
  const deadline = Date.now() + 20000;
  while (currentRequest === requestId && Date.now() < deadline) {
    const plot = widget.shadowRoot?.querySelector('bar-plot, scatter-plot, box-plot, radar-plot, line-plot');
    const graph = plot?.shadowRoot?.querySelector('.js-plotly-plot');
    if (graph?._fullData?.length && graph.querySelector('.main-svg')) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (currentRequest === requestId) throw new Error('The plot did not finish rendering.');
}

async function showSample(button) {
  const currentRequest = ++requestId;
  for (const item of buttons) {
    item.setAttribute('aria-pressed', String(item === button));
  }
  description.textContent = button.dataset.description;
  source.href = example.dataset.sourceRoot + encodeURIComponent(button.dataset.file);
  status.textContent = 'Loading plot...';
  status.dataset.state = 'loading';
  chartContainer.dataset.state = 'loading';
  chart.setAttribute('aria-busy', 'true');
  usage.textContent = 'Loading example...';
  usage.dataset.copyReady = 'false';
  chart.replaceChildren();

  try {
    if (!customElements.get('widget-element')) {
      throw new Error('The widget library could not be loaded.');
    }
    const response = await fetch(example.dataset.sampleRoot + encodeURIComponent(button.dataset.file));
    if (!response.ok) {
      throw new Error(`Sample request failed (${response.status}).`);
    }
    const data = await response.json();
    if (currentRequest !== requestId) return;
    const widget = document.createElement('widget-element');
    widget.type = example.dataset.widgetType;
    widget.data = JSON.stringify(data);
    chart.replaceChildren(widget);
    const json = JSON.stringify(data, null, 2).replace(/</g, '\\u003c');
    usage.textContent = `<script src="${example.dataset.bundleUrl}"></script>
<widget-element id="example-widget"></widget-element>
<script>
  const graphData = ${json};
  const widget = document.getElementById('example-widget');
  widget.type = ${JSON.stringify(example.dataset.widgetType)};
  widget.data = JSON.stringify(graphData);
</script>`;
    usage.dataset.copyReady = 'true';
    if (globalThis.Prism) globalThis.Prism.highlightElement(usage);
    await waitForPlot(widget, currentRequest);
    if (currentRequest !== requestId) return;
    status.textContent = '';
    status.dataset.state = 'ready';
    chartContainer.dataset.state = 'ready';
    chart.setAttribute('aria-busy', 'false');
  } catch (error) {
    if (currentRequest !== requestId) return;
    console.error('Could not load the example:', error);
    status.textContent = `Could not load the example: ${error.message}`;
    status.dataset.state = 'error';
    chartContainer.dataset.state = 'error';
    chart.setAttribute('aria-busy', 'false');
    usage.textContent = 'Could not load the example data.';
    usage.dataset.copyReady = 'false';
  }
}

for (const button of buttons) {
  button.addEventListener('click', () => showSample(button));
}
if (buttons.length) showSample(buttons[0]);
