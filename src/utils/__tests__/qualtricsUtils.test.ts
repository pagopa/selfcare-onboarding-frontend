import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { hasCookieConsent, triggerQualtricsIntercept } from '../qualtricsUtils';

const setOptanonConsent = (value: string) => {
  vi.spyOn(document, 'cookie', 'get').mockReturnValue(value);
};

const config = { scriptUrl: 'https://example.qualtrics.com/SIE/', siteId: 'ZN_test' };

beforeEach(() => {
  (window as any).QSI = undefined;
});

afterEach(() => {
  vi.restoreAllMocks();
  (window as any).QSI = undefined;
});

test('hasCookieConsent returns true when the analytics group is accepted', () => {
  setOptanonConsent('OptanonConsent=groups=C0001%3A1%2CC0002%3A1');
  expect(hasCookieConsent()).toBe(true);
});

test('hasCookieConsent returns false when the analytics group is refused', () => {
  setOptanonConsent('OptanonConsent=groups=C0001%3A1%2CC0002%3A0');
  expect(hasCookieConsent()).toBe(false);
});

test('hasCookieConsent returns false when no OptanonConsent cookie is present', () => {
  setOptanonConsent('foo=bar');
  expect(hasCookieConsent()).toBe(false);
});

test('triggerQualtricsIntercept does not run the survey without cookie consent', async () => {
  setOptanonConsent('OptanonConsent=groups=C0002%3A0');
  const run = vi.fn();
  (window as any).QSI = { API: { unload: vi.fn(), load: vi.fn(), run } };

  await triggerQualtricsIntercept({ productId: 'prod-test' }, config);

  expect(run).not.toHaveBeenCalled();
});

test('triggerQualtricsIntercept runs the survey when cookie consent is given', async () => {
  setOptanonConsent('OptanonConsent=groups=C0002%3A1');
  const unload = vi.fn();
  const load = vi.fn();
  const run = vi.fn();
  (window as any).QSI = { API: { unload, load, run } };

  await triggerQualtricsIntercept({ productId: 'prod-test' }, config);

  expect(unload).toHaveBeenCalledOnce();
  expect(load).toHaveBeenCalledOnce();
  expect(run).toHaveBeenCalledOnce();
});
