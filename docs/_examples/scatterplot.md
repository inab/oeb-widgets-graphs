---
layout: example
title: Scatter plot
widget_type: 2D-plot
samples:
  - label: Top-right
    file: SCATTERPLOT.json
    description: Both metrics maximize.
  - label: Top-left
    file: SCATTERPLOT_TOP_LEFT.json
    description: X minimizes and Y maximizes.
  - label: Bottom-right
    file: SCATTERPLOT_BOTTOM_RIGHT.json
    description: X maximizes and Y minimizes.
  - label: Bottom-left
    file: SCATTERPLOT_BOTTOM_LEFT.json
    description: Both metrics minimize.
  - label: Negative values
    file: SCATTERPLOT_NEGATIVE.json
    description: Points appear on both sides of zero.
---

Compare participants on two metrics. The classification menu offers square
quartiles, diagonal quartiles and K-means clustering. The optimal corner is
determined by the metrics' optimization directions.

Select a participant in the legend or classification table to show or hide
it. At least one participant must stay visible; K-means requires four.
Original and Optimal change the axis range without changing the selection.
On narrow layouts, the table appears below the chart and the legend scrolls.