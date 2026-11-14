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
metrics declaring a scale are normalized separately to a 0–1 range, taking
their optimization direction into account. Runtime, memory, I/O and throughput
use logarithmic scales where specified. Hover shows the original values.
Normalized values indicate relative position within each metric, not that
different units are directly comparable.