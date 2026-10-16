import { InstitutionType, UserOnCreate } from '../../../../types';
import { isTechPartner } from '../../../utils/institutionTypeUtils';

/**
 * Prepares the users collected by the wizard for the onboarding submit: tax codes are upper-cased,
 * emails lower-cased and, for tech partners, the first user (the legal representative) is dropped.
 */
export const normalizeUsers = (
  users: Array<UserOnCreate> | undefined,
  institutionType?: InstitutionType
): Array<UserOnCreate> | undefined => {
  const normalized = users?.map((u) => ({
    ...u,
    taxCode: u?.taxCode?.toUpperCase(),
    email: u?.email?.toLowerCase(),
  }));

  return isTechPartner(institutionType) ? normalized?.slice(1) : normalized;
};
