---
layout: example
title: Line plot
widget_type: line-plot
samples:
  - label: ROC curve
    file: LINEPLOT.json
    description: False positive rate versus true positive rate.
  - label: Precision-recall
    file: LINEPLOT_PRECISION_RECALL.json
    description: Precision versus recall; both axes maximize.
---

Display curves for participants across a continuous X range. Select a legend
entry to show or hide a curve; at least one participant must remain visible.
Statistics use all participants, including hidden ones.

**Quartiles (AUC)** ranks areas under the curves, with Q1 representing the best
group according to Y-axis optimization. **Average (AUC)** compares each area
with the mean. Both use the X range shared by all participants, interpolating
at the boundaries, and show classifications in the legend and table. The IQR
view summarizes pooled X and Y values rather than ranking participants.

The ROC example includes a random-classifier diagonal as a chance baseline.
It is not a participant and is excluded from statistics; the precision-recall
example does not add this baseline.