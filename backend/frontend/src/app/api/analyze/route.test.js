/* @jest-environment node */

jest.mock('@/ai/flows/detect-logical-fallacies', () => ({
  detectLogicalFallacies: async ({ text }) => ({
    fallacies: text ? [{ type: 'Ad Hominem', passage: 'p', explanation: 'e' }] : [],
  }),
}));

describe('POST /api/analyze', () => {
  const { POST } = require('./route');

  function makeReq(text) {
    return { json: async () => ({ text }) };
  }

  test('rejects short text', async () => {
    const res = await POST(makeReq('short text under 50 chars'));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/al menos 50 caracteres/i);
  });

  test('returns fallacies for valid text', async () => {
    const long = 'x'.repeat(80);
    const res = await POST(makeReq(long));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.fallacies)).toBe(true);
    expect(data.fallacies.length).toBeGreaterThan(0);
  });
});

