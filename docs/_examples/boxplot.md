---
layout: example
title: Box plot
widget_type: box-plot
samples:
  - label: Minimum
    file: BOXPLOT.json
    description: Sorted by lowest median first.
  - label: Maximum
    file: BOXPLOT_MAXIMIZE.json
    description: Sorted by highest median first.
  - label: No optimization
    file: BOXPLOT_NO_OPTIMIZATION.json
    description: Input order with no optimization selected.
  - label: Negative values
    file: BOXPLOT_NEGATIVE.json
    description: Distributions above and below zero.
---

Compare distributions using summary values, including the median, quartiles
and fences. Sort by median or restore the input order, change orientation and
choose a graph style. Table and hover values use five decimal places.

Click a participant in the legend or table to show or hide it. Hidden
participants display `--` in the table; at least one must remain visible.