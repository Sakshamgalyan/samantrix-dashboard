import test from 'node:test';
import assert from 'node:assert';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function evaluateCsrf(method, headers, origin, trustedOrigin) {
  if (SAFE_METHODS.has(method)) return null;
  if (!headers['x-device-id']) return 'Missing x-device-id header';
  if (origin && origin !== trustedOrigin) {
    return 'Cross-origin request rejected';
  }
  return null;
}

test('Dashboard BFF Security: CSRF & Device ID Validation', async (t) => {
  await t.test('allows safe idempotent HTTP methods without x-device-id', () => {
    assert.strictEqual(evaluateCsrf('GET', {}, null, 'http://localhost:4100'), null);
    assert.strictEqual(evaluateCsrf('HEAD', {}, null, 'http://localhost:4100'), null);
    assert.strictEqual(evaluateCsrf('OPTIONS', {}, null, 'http://localhost:4100'), null);
  });

  await t.test('blocks state-changing mutations missing x-device-id header', () => {
    assert.strictEqual(
      evaluateCsrf('POST', {}, 'http://localhost:4100', 'http://localhost:4100'),
      'Missing x-device-id header',
    );
    assert.strictEqual(
      evaluateCsrf('PUT', {}, 'http://localhost:4100', 'http://localhost:4100'),
      'Missing x-device-id header',
    );
    assert.strictEqual(
      evaluateCsrf('DELETE', {}, 'http://localhost:4100', 'http://localhost:4100'),
      'Missing x-device-id header',
    );
  });

  await t.test('blocks cross-origin mutations even with x-device-id present', () => {
    assert.strictEqual(
      evaluateCsrf('POST', { 'x-device-id': 'dev-1' }, 'https://attacker.com', 'http://localhost:4100'),
      'Cross-origin request rejected',
    );
  });

  await t.test('allows legitimate same-origin mutations with x-device-id', () => {
    assert.strictEqual(
      evaluateCsrf('POST', { 'x-device-id': 'dev-1' }, 'http://localhost:4100', 'http://localhost:4100'),
      null,
    );
  });
});
