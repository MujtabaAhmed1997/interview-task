import { isAnswerCorrect, scoreSubmission } from '../../src/participation/services/scoring';

describe('isAnswerCorrect', () => {
  it('marks a single-select correct only when the one correct option is chosen', () => {
    expect(isAnswerCorrect(['a'], ['a'])).toBe(true);
    expect(isAnswerCorrect(['a'], ['b'])).toBe(false);
    expect(isAnswerCorrect(['a'], [])).toBe(false);
    expect(isAnswerCorrect(['a'], ['a', 'b'])).toBe(false);
  });

  it('marks a true/false correct on the matching single option', () => {
    expect(isAnswerCorrect(['t'], ['t'])).toBe(true);
    expect(isAnswerCorrect(['t'], ['f'])).toBe(false);
  });

  it('marks multi-select correct only on an exact set match (all-or-nothing)', () => {
    expect(isAnswerCorrect(['c', 'd'], ['c', 'd'])).toBe(true);
    expect(isAnswerCorrect(['c', 'd'], ['d', 'c'])).toBe(true);
    expect(isAnswerCorrect(['c', 'd'], ['c'])).toBe(false);
    expect(isAnswerCorrect(['c', 'd'], ['c', 'd', 'e'])).toBe(false);
  });
});

describe('scoreSubmission', () => {
  it('sums points for correct answers and adds nothing for incorrect ones', () => {
    const score = scoreSubmission([
      { points: 1, correctOptionIds: ['a'], selectedOptionIds: ['a'] },
      { points: 2, correctOptionIds: ['c', 'd'], selectedOptionIds: ['c', 'd'] },
      { points: 5, correctOptionIds: ['x'], selectedOptionIds: ['y'] },
    ]);
    expect(score).toBe(3);
  });

  it('never goes negative and is zero when nothing is answered', () => {
    const score = scoreSubmission([
      { points: 3, correctOptionIds: ['a'], selectedOptionIds: [] },
      { points: 4, correctOptionIds: ['b'], selectedOptionIds: [] },
    ]);
    expect(score).toBe(0);
  });
});
