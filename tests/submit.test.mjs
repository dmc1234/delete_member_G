import assert from 'node:assert/strict';
import test from 'node:test';
import { POST } from '../app/api/submit/route.ts';

const input = { host: 'pt01.mul-pay.jp', site_id: 'test-site', site_pass: 'dummy&pass', member_id: '00123' };
const request = body => new Request('https://app.invalid/api/submit', { method: 'POST', body });

test('invalid input and untrusted hosts never send a deletion request', async t => {
  const upstream = t.mock.method(globalThis, 'fetch', () => { throw new Error('unexpected request'); });
  for (const body of ['{', '{}', JSON.stringify({ ...input, member_id: '' }),
    JSON.stringify({ ...input, host: 'pt01.mul-pay.jp.example.invalid' })]) {
    const response = await POST(request(body));
    assert.equal(response.status, 400);
    assert.equal(typeof (await response.json()).message, 'string');
  }
  assert.equal(upstream.mock.callCount(), 0);
});

test('sends one form-encoded idPass request per member and preserves the GMO response', async t => {
  const upstream = t.mock.method(globalThis, 'fetch', async () => new Response('MemberID=00123'));
  const response = await POST(request(JSON.stringify(input)));
  assert.equal(upstream.mock.callCount(), 1);
  const [url, options] = upstream.mock.calls[0].arguments;
  assert.equal(url, 'https://pt01.mul-pay.jp/payment/DeleteMember.idPass');
  assert.equal(options.method, 'POST');
  assert.equal(options.redirect, 'error');
  assert.deepEqual(Object.fromEntries(options.body), { SiteID: 'test-site', SitePass: 'dummy&pass', MemberID: '00123' });
  assert.match(options.body.toString(), /SitePass=dummy%26pass/);
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.member_id, '00123');
  assert.equal(result.data, 'MemberID=00123');
  assert.ok(Number.isFinite(Date.parse(result.datetime)));
});

test('an upstream failure returns JSON without retrying or exposing the password', async t => {
  const upstream = t.mock.method(globalThis, 'fetch', async () => new Response('<!DOCTYPE html>', { status: 503 }));
  const response = await POST(request(JSON.stringify(input)));
  assert.equal(response.status, 502);
  const problem = await response.json();
  assert.match(problem.message, /503/);
  assert.equal(problem.member_id, '00123');
  assert.doesNotMatch(JSON.stringify(problem), /dummy|DOCTYPE/);
  assert.equal(upstream.mock.callCount(), 1);
});
