/* @jest-environment node */

const { getUserHistory, addUserHistory } = require('../demo-store');

describe('demo-store', () => {
  test('returns empty array for new user', () => {
    expect(getUserHistory('u1')).toEqual([]);
  });

  test('adds and retrieves history for user', () => {
    const id = addUserHistory('u1', { text: 't', score: 80 });
    expect(typeof id).toBe('string');
    const list = getUserHistory('u1');
    expect(list.length).toBe(1);
    expect(list[0].score).toBe(80);
  });
});

