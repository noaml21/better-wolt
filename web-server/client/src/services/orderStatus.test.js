import { DELIVERY_SECONDS, STAGE_STARTS, getSegmentFill, getStageIndex, getStageTimes } from './orderStatus';

test('stage starts agree with the stage thresholds', () => {
  STAGE_STARTS.forEach((start, index) => {
    expect(getStageIndex(DELIVERY_SECONDS - start)).toBe(index);
  });
});

test('each rail segment fills over its own stage', () => {
  expect(getSegmentFill(0, DELIVERY_SECONDS)).toBe(0);
  expect(getSegmentFill(0, DELIVERY_SECONDS - 30)).toBeCloseTo(0.5);
  expect(getSegmentFill(0, DELIVERY_SECONDS - 60)).toBe(1);
  expect(getSegmentFill(1, DELIVERY_SECONDS - 60)).toBe(0);
  expect(getSegmentFill(2, 450)).toBeCloseTo(0.5);
  expect(getSegmentFill(2, 0)).toBe(1);
  // The last stop has no segment after it.
  expect(getSegmentFill(3, 0)).toBe(0);
});

test('stage times are clock times from the order start, and absent without one', () => {
  const start = new Date(2026, 8, 24, 20, 0, 0).getTime();

  expect(getStageTimes({ startTime: start })).toEqual(['20:00', '20:01', '20:15', '20:30']);
  expect(getStageTimes({})).toEqual([]);
});
