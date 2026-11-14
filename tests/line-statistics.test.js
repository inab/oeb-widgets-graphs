import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { getComparableAreas, rankAreas, compareAreasToMean, meanArea } from '../src/line-statistics.js';

test('integrates curves over their shared X range in either direction', () => {
  const result = getComparableAreas([
    { x: [0, 1, 2], y: [0, 2, 4] },
    { x: [3, 1], y: [4, 2] },
  ]);
  assert.deepEqual(result, { areas: [3, 2.5], range: [1, 2] });
});

test('uses the optimization direction for quartiles and mean comparison', () => {
  const areas = [-2, 0, 2, 4];
  assert.deepEqual(rankAreas(areas, false), [4, 3, 2, 1]);
  assert.deepEqual(rankAreas(areas, true), [1, 2, 3, 4]);
  assert.deepEqual(compareAreasToMean(areas, false), [-3, -1, 1, 3]);
  assert.deepEqual(compareAreasToMean(areas, true), [3, 1, -1, -3]);
  assert.equal(meanArea(areas), 1);
  assert.deepEqual(rankAreas([1, 1, 1], false), [1, 1, 1]);
  assert.deepEqual(compareAreasToMean(Array(6).fill(0.2), false), Array(6).fill(0));
});

test('reports invalid, non-monotonic, and non-overlapping curves', () => {
  assert.match(getComparableAreas([{ x: [0], y: [1] }]).error, /at least two finite/);
  assert.match(getComparableAreas([{ x: [0, 1], y: [1, NaN] }]).error, /finite/);
  assert.match(getComparableAreas([{ x: [0, 2, 1], y: [0, 2, 1] }]).error, /monotonic/);
  assert.match(getComparableAreas([
    { x: [0, 1], y: [1, 1] },
    { x: [1, 2], y: [2, 2] },
  ]).error, /shared X range/);
});
