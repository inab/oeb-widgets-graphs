---
layout: example
title: Radar plot
widget_type: radar-plot
samples:
  - label: Standard
    file: RADARPLOT.json
    description: Raw values for metrics on similar scales.
  - label: Technical (normalized)
    file: RADARPLOT_TECHNICAL.json
    description: Synthetic technical metrics with per-axis normalization.
---

Compare multiple metrics for each participant. Click a participant in the
legend to show or hide it.

The standard example displays raw values. In the synthetic technical example,
each metric uses its own raw range and linear or logarithmic scale. The widget
maps each range independently onto the shared 0–1 radial axis shown by Plotly:
the outer edge is preferred, so minimized metrics are inverted. Hover shows
the original values. Positions on different axes do not make different units
directly comparable.

The technical sample uses these ranges:

| Metric | Scale | Raw range | Preferred direction |
| --- | --- | --- | --- |
| Peak RAM usage | Logarithmic | 10–100,000 MB | Lower |
| Mean CPU usage | Linear | 0–800% | Lower |
| Wall-clock runtime | Logarithmic | 10–10,000 s | Lower |
| Disk I/O | Logarithmic | 100–100,000 MB | Lower |
| Accuracy | Linear | 0–1 | Higher |
| Throughput | Logarithmic | 1,000–1,000,000 reads/s | Higher |

CPU and accuracy specify their bounds in the sample JSON. The other ranges
are derived from the sample values and rounded outward to powers of ten.