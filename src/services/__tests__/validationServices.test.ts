import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OnboardingApi } from '../../api/OnboardingApiClient';
import { userValidate, verifyVatNumber } from '../validationServices';

vi.mock('../../api/OnboardingApiClient', () => ({
  OnboardingApi: {
    userValidate: vi.fn(),
    verifyOnboardingExternal: vi.fn(),
  },
}));

vi.mock('@pagopa/selfcare-common-frontend/lib/services/analyticsService', () => ({
  trackEvent: vi.fn(),
}));

describe('validationServices', () => {
  const onForwardAction = vi.fn();
  const onValidationError = vi.fn();
  const onRedirectToLogin = vi.fn();
  const setLoading = vi.fn();

  const baseArgs = (overrides = {}) => ({
    partyId: 'party-1',
    user: { name: 'Mario', surname: 'Rossi', taxCode: 'RSSMRA80A01H501Z' } as any,
    userId: 'user-1',
    onForwardAction,
    onValidationError,
    onRedirectToLogin,
    setLoading,
    eventName: 'TEST_EVENT',
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('userValidate', () => {
    it('chiama onForwardAction e gestisce loading quando la validazione ha successo', async () => {
      vi.mocked(OnboardingApi.userValidate).mockResolvedValue(undefined);
      const a = baseArgs();

      await userValidate(
        a.partyId,
        a.user,
        a.userId,
        a.onForwardAction,
        a.onValidationError,
        a.setLoading,
        a.eventName
      );

      expect(OnboardingApi.userValidate).toHaveBeenCalledWith(
        a.user.name ?? '',
        a.user.surname ?? '',
        a.user.taxCode ?? ''
      );
      expect(onForwardAction).toHaveBeenCalled();
      expect(onValidationError).not.toHaveBeenCalled();
      expect(setLoading).toHaveBeenNthCalledWith(1, true);
      expect(setLoading).toHaveBeenLastCalledWith(false);
    });

    it('chiama onValidationError e trackEvent quando arriva 409 con invalidParams', async () => {
      const conflictError = Object.assign(new Error('conflict'), {
        httpStatus: 409,
        httpBody: {
          detail: 'name does not match',
          invalidParams: [{ name: 'name', reason: 'mismatch' }],
        },
      });
      vi.mocked(OnboardingApi.userValidate).mockRejectedValue(conflictError);
      const a = baseArgs();

      await userValidate(
        a.partyId,
        a.user,
        a.userId,
        a.onForwardAction,
        a.onValidationError,
        a.setLoading,
        a.eventName
      );

      expect(onValidationError).toHaveBeenCalledWith('user-1', { name: ['conflict'] });
      expect(trackEvent).toHaveBeenCalledWith('TEST_EVENT_CONFLICT_ERROR', {
        party_id: 'party-1',
        reason: 'name does not match',
      });
      expect(onForwardAction).not.toHaveBeenCalled();
    });

    it('chiama onForwardAction quando arriva un errore diverso da 409 (preserva comportamento legacy)', async () => {
      const serverError = Object.assign(new Error('boom'), {
        httpStatus: 500,
      });
      vi.mocked(OnboardingApi.userValidate).mockRejectedValue(serverError);
      const a = baseArgs();

      await userValidate(
        a.partyId,
        a.user,
        a.userId,
        a.onForwardAction,
        a.onValidationError,
        a.setLoading,
        a.eventName
      );

      expect(onForwardAction).toHaveBeenCalled();
      expect(onValidationError).not.toHaveBeenCalled();
      expect(trackEvent).not.toHaveBeenCalled();
    });

    it('disattiva il loading anche in caso di errore', async () => {
      vi.mocked(OnboardingApi.userValidate).mockRejectedValue(new Error('nope'));
      const a = baseArgs();

      await userValidate(
        a.partyId,
        a.user,
        a.userId,
        a.onForwardAction,
        a.onValidationError,
        a.setLoading,
        a.eventName
      );

      expect(setLoading).toHaveBeenNthCalledWith(1, true);
      expect(setLoading).toHaveBeenLastCalledWith(false);
    });
  });

  describe('verifyVatNumber', () => {
    const setVatVerificationGenericError = vi.fn();
    const setIsVatRegistrated = vi.fn();
    const setOpenVatNumberErrorModal = vi.fn();
    const setRequiredLogin = vi.fn();
    const formik = {
      values: { taxCode: 'RSSMRA80A01H501Z', vatNumber: '12345678901' },
    } as any;
    const stepHistoryState = { isTaxCodeEquals2PIVA: false } as any;

    const callVerify = () =>
      verifyVatNumber(
        'GSP' as any,
        'ext-1',
        formik,
        stepHistoryState,
        setVatVerificationGenericError,
        setIsVatRegistrated,
        setOpenVatNumberErrorModal,
        setRequiredLogin,
        'prod-1'
      );

    it('segna come registrato quando la HEAD risponde 204', async () => {
      vi.mocked(OnboardingApi.verifyOnboardingExternal).mockResolvedValue(undefined);

      await callVerify();

      expect(setIsVatRegistrated).toHaveBeenCalledWith(true);
      expect(setVatVerificationGenericError).toHaveBeenCalledWith(false);
    });

    it('segna come non registrato sul 404', async () => {
      vi.mocked(OnboardingApi.verifyOnboardingExternal).mockRejectedValue(
        Object.assign(new Error('nf'), { httpStatus: 404 })
      );

      await callVerify();

      expect(setIsVatRegistrated).toHaveBeenCalledWith(false);
      expect(setVatVerificationGenericError).toHaveBeenCalledWith(false);
      expect(setOpenVatNumberErrorModal).not.toHaveBeenCalled();
    });

    it('apre il modale di errore su errore generico', async () => {
      vi.mocked(OnboardingApi.verifyOnboardingExternal).mockRejectedValue(
        Object.assign(new Error('boom'), { httpStatus: 500 })
      );

      await callVerify();

      expect(setOpenVatNumberErrorModal).toHaveBeenCalledWith(true);
      expect(setVatVerificationGenericError).toHaveBeenCalledWith(true);
    });
  });
});
