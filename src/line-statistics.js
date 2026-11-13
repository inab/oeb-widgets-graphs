export function getComparableAreas(data) {
  if (!data.length || data.some(trace => !Array.isArray(trace.x) || !Array.isArray(trace.y) ||
    trace.x.length < 2 || trace.x.length !== trace.y.length ||
    trace.x.some(value => !Number.isFinite(value)) || trace.y.some(value => !Number.isFinite(value)))) {
    return { error: 'AUC classification requires at least two finite X and Y values for each participant.' };
  }

  const curves = [];
  for (const trace of data) {
    const increases = trace.x.some((x, i) => i > 0 && x > trace.x[i - 1]);
    const decreases = trace.x.some((x, i) => i > 0 && x < trace.x[i - 1]);
    if (increases && decreases) {
      return { error: 'AUC classification requires each curve to have monotonic X values.' };
    }
    const points = trace.x.map((x, i) => [x, trace.y[i]]);
    curves.push(decreases ? points.reverse() : points);
  }

  const start = Math.max(...curves.map(points => points[0][0]));
  const end = Math.min(...curves.map(points => points[points.length - 1][0]));
  if (start >= end) {
    return { error: 'AUC classification requires a shared X range across all participants.' };
  }

  const areas = curves.map(points => {
    let area = 0;
    for (let i = 1; i < points.length; i++) {
      const [x0, y0] = points[i - 1];
      const [x1, y1] = points[i];
      const left = Math.max(x0, start);
      const right = Math.min(x1, end);
      if (right <= left) continue;
      const yLeft = y0 + (y1 - y0) * (left - x0) / (x1 - x0);
      const yRight = y0 + (y1 - y0) * (right - x0) / (x1 - x0);
      area += (right - left) * (yLeft + yRight) / 2;
    }
    return area;
  });
  if (areas.some(area => !Number.isFinite(area))) {
    return { error: 'AUC classification could not calculate finite areas for these values.' };
  }
  return { areas, range: [start, end] };
}

export function meanArea(areas) {
  return areas.reduce((sum, area) => sum + area / areas.length, 0);
}

export function rankAreas(areas, minimize) {
  const scores = areas.map(area => minimize ? -area : area);
  const sorted = [...scores].sort((a, b) => a - b);
  const percentile = p => {
    const index = p * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  };
  const q1 = percentile(0.25);
  const q2 = percentile(0.5);
  const q3 = percentile(0.75);
  return scores.map(score => score >= q3 ? 1 : score >= q2 ? 2 : score >= q1 ? 3 : 4);
}

export function compareAreasToMean(areas, minimize) {
  const mean = meanArea(areas);
  return areas.map(area => {
    const difference = area - mean;
    const tolerance = Number.EPSILON * Math.max(Math.abs(area), Math.abs(mean)) * areas.length;
    return Math.abs(difference) <= tolerance ? 0 : difference * (minimize ? -1 : 1);
  });
}
