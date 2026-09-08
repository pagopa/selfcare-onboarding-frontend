import { extractResponse } from '@pagopa/selfcare-common-frontend/lib/utils/api-utils';
import { isRight } from 'fp-ts/lib/Either';
import { expect, it, vi } from 'vitest';
import { Problem } from '../../../types';
import { transcodeErrorCode } from '../../views/onboardingRequest/complete/CompleteRequest';
import { createClient } from '../generated/onboarding/client';
import {
  completeOnboardingUsersUsingPOSTDefaultResponses,
  completeUsingPOSTDefaultResponses,
  uploadAttachmentUsingPOSTDefaultResponses,
} from '../generated/onboarding/requestTypes';

// The 400 payload of the upload endpoints must survive the codegen decoders:
// onboardingContractUpload feeds it to transcodeErrorCode to tell the user
// which document/signature problem occurred, and a t.undefined decoder (what
// gen-api-models emits for the inline schema in the spec) silently degrades
// every failure to the GENERIC error. See api-onboarding_fixPreGen.js.
const uploadResponses = {
  'accordo di adesione': completeUsingPOSTDefaultResponses,
  'add-user module': completeOnboardingUsersUsingPOSTDefaultResponses,
  attachment: uploadAttachmentUsingPOSTDefaultResponses,
};

// Verbatim payload returned by the backend when the accordo di adesione is
// signed in the wrong form (PAdES instead of CAdES/p7m).
const problem = {
  status: 400,
  errors: [
    {
      code: '002-1003',
      detail: 'Only CAdES signature form is admitted. Invalid signatures forms detected: PAdES',
    },
  ],
};

it('test upload endpoints decode the 400 Problem body', () => {
  for (const [name, responses] of Object.entries(uploadResponses)) {
    const decoded = responses[400].decode(problem);

    expect(isRight(decoded), `${name} drops the 400 body`).toBe(true);
    if (isRight(decoded)) {
      expect((decoded.right as Problem).errors[0].code).toBe('002-1003');
    }
  }
});

it('test contract upload 400 reaches the caller as an error carrying the Problem', async () => {
  const client = createClient({
    baseUrl: 'https://api.example.it',
    basePath: '',
    fetchApi: vi.fn().mockResolvedValue(
      new Response(JSON.stringify(problem), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    ) as unknown as typeof fetch,
  });

  const result = await client.completeUsingPOST({
    bearerAuth: 'Bearer token',
    onboardingId: 'onboarding-1',
    contract: new File(['data'], 'contract.p7m'),
  });

  await expect(
    extractResponse(result, 204, () => undefined, 401, 403, undefined)
  ).rejects.toMatchObject({ httpStatus: 400, httpBody: problem });
});

it('test the backend Problem is transcoded to the signature format error', () => {
  expect(transcodeErrorCode(problem as Problem)).toBe('INVALID_SIGN_FORMAT');
});
