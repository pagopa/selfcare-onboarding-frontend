import { getUploadErrorMessageKey } from '../UploadErrorModal';

test.each([
  ['GENERIC', false, 'completeRegistration.errors.GENERIC.message'],
  ['GENERIC', true, 'completeRegistration.errors.GENERIC.message'],
  ['INVALID_SIGN', true, 'completeRegistration.errors.INVALID_SIGN.user.message'],
  ['INVALID_DOCUMENT', false, 'completeRegistration.errors.INVALID_DOCUMENT.product.message'],
] as const)('%s with addUserFlow=%s uses key %s', (errorCode, addUserFlow, expected) => {
  expect(getUploadErrorMessageKey(errorCode, addUserFlow)).toBe(expected);
});
