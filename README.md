# OpenEBench Graph Widgets

Interactive benchmarking charts for [OpenEBench](https://openebench.bsc.es/),
built with Lit and Plotly.

- [Documentation and interactive examples](https://inab.github.io/oeb-widgets-graphs/)
- [npm package](https://www.npmjs.com/package/@inb/oeb-widgets-graphs)
- [Example applications](https://github.com/inab/demo_oeb-widgets-graphs)

## Development

Use the Node.js version in `.nvmrc`, then install and run the demo:

```sh
nvm install
nvm use
npm ci
npm run dev
```

The demo opens at `/src/demo/index.html`. Its plot and sample selectors cover
the examples listed below. Run the focused statistics tests with
`node --test tests/line-statistics.test.js`.

```sh
npm run build
```

The build produces the package in `dist`. The version in the source is
`1.2.0`; changing it does not publish a new npm release.

## Usage

```js
import '@inb/oeb-widgets-graphs';

const widget = document.querySelector('widget-element');
widget.type = 'bar-plot';
widget.data = JSON.stringify(graphData);
```

```html
<widget-element></widget-element>
```

Use `bar-plot`, `2D-plot` (scatter), `box-plot`, `radar-plot`, or `line-plot`
as the widget type. The sample JSON files show the data structure for each
plot; radar and line use metric-series representations.

## Plots and samples

### Bar plot

Compare one metric across participants. Sort and classify by quartiles, reverse
the order, switch between Original and Optimal axis ranges, or download the
result. Optimization determines whether lower or higher values rank first.

Samples: [default](src/demo/files/BARPLOT.json),
[mixed signs](src/demo/files/BARPLOT_NEGATIVE_MIXED.json),
[all negative](src/demo/files/BARPLOT_NEGATIVE_ALL.json),
[minimize](src/demo/files/BARPLOT_MINIMIZE.json).

### Scatter plot

Compare two metrics using square quartiles, diagonal quartiles or K-means.
The optimal corner follows the metrics' optimization directions. Select
participants in the legend or table; at least one must remain visible, or
four for K-means. Original and Optimal change the axis range without changing
the selection. The table stacks below the chart in narrow layouts, and the
legend scrolls when necessary.

Samples: [top-right](src/demo/files/SCATTERPLOT.json),
[top-left](src/demo/files/SCATTERPLOT_TOP_LEFT.json),
[bottom-right](src/demo/files/SCATTERPLOT_BOTTOM_RIGHT.json),
[bottom-left](src/demo/files/SCATTERPLOT_BOTTOM_LEFT.json),
[negative values](src/demo/files/SCATTERPLOT_NEGATIVE.json).

### Box plot

Compare distributions and sort participants by median. Change orientation and
graph style, or select participants in the legend or table. Hidden rows show
`--`; at least one participant must remain visible. Table and hover values use
five decimal places.

Samples: [minimum](src/demo/files/BOXPLOT.json),
[maximum](src/demo/files/BOXPLOT_MAXIMIZE.json),
[no optimization](src/demo/files/BOXPLOT_NO_OPTIMIZATION.json),
[negative values](src/demo/files/BOXPLOT_NEGATIVE.json).

### Radar plot

Compare multiple metrics and use the legend to show or hide participants.
Metrics with a declared scale are normalized per axis to 0–1, respecting
optimization direction; hover shows the original values. Normalization does
not make different units directly comparable.

Samples: [standard](src/demo/files/RADARPLOT.json),
[synthetic technical metrics](src/demo/files/RADARPLOT_TECHNICAL.json).

### Line plot

Show participant curves and use the legend to hide or show them; at least one
must remain visible. Quartiles and Average compare areas under curves over the
shared X range. Q1 is best according to Y-axis optimization, and the legend
and table show each classification. The IQR view summarizes pooled X and Y
values. Statistics include hidden participants.

The ROC example includes a random-classifier diagonal as a chance baseline,
excluded from statistics. No baseline is added to the precision–recall
example.

Samples: [ROC](src/demo/files/LINEPLOT.json),
[precision–recall](src/demo/files/LINEPLOT_PRECISION_RECALL.json).

## Documentation and GitHub Pages

The Jekyll site is in `docs`. To preview it locally with Ruby and Bundler:

```sh
cd docs
bundle install
bundle exec jekyll serve
```

The interactive documentation loads the widget bundle and sample JSON from
the public GitHub revision pinned as `demo_revision` in `docs/_config.yml`.
Each plot page includes a runnable HTML usage example with the selected
sample JSON inline and a link to that JSON, which opens in a new tab.
Update that revision after the desired bundle and samples are published to
GitHub; the examples do not depend on the npm release. Browsers need access
to jsDelivr to load them.

The repository has no Pages deployment workflow. Check **Settings → Pages**
for the configured publishing source. GitHub Pages can publish a selected
branch's `/docs` folder, or a GitHub Actions workflow can build and deploy
Jekyll. The current site uses the `jekyll-prismjs-compile` plugin; if the
branch-based Pages build does not support it, build the site with a custom
workflow or remove that plugin after verifying the static Prism assets.
See [GitHub's publishing source guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## License

[Apache License 2.0](LICENSE).
