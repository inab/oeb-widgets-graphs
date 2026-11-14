---
layout: example
title: Bar plot
widget_type: bar-plot
samples:
  - label: Default
    file: BARPLOT.json
    description: Positive values, highest ranked first.
  - label: Mixed signs
    file: BARPLOT_NEGATIVE_MIXED.json
    description: Bars above and below zero.
  - label: All negative
    file: BARPLOT_NEGATIVE_ALL.json
    description: All values are below zero.
  - label: Minimize
    file: BARPLOT_MINIMIZE.json
    description: Lower values rank first.
---

Compare one metric across participants. **Sort & Classify Data** sorts results
according to the metric's optimization direction and displays a quartile
classification. Reverse Order changes the order; Original and Optimal change
the displayed axis range. Download options are available from the chart.