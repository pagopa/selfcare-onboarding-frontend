import { useContext, useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import { AxiosResponse } from 'axios';
import { Party } from '../../types';
import { fetchAllWithLogs, fetchWithLogs } from '../lib/api-utils';
import { URL_FE_LOGIN } from '../lib/constants';
import { PartyContext, UserContext } from '../lib/context';
import { isFetchError } from '../lib/error-utils';
import { storageDelete, storageRead } from '../lib/storage-utils';

export const useLogin = () => {
  const [loadingText, setLoadingText] = useState<string | undefined>();
  const { setUser } = useContext(UserContext);
  const { setAvailableParties, setParty } = useContext(PartyContext);

  const setPartiesInContext = async (data: any) => {
    // Store them in a variable
    // eslint-disable-next-line functional/no-let
    let parties: Array<Party> = data.institutions;
    // Fetch all the partyIds (this can be optimized)
    const partyIdsResponses = await fetchAllWithLogs(
      parties.map(({ institutionId }) => ({
        path: { endpoint: 'PARTY_GET_PARTY_ID', endpointParams: { institutionId } },
        config: { method: 'GET' },
      }))
    );

    // Associate each partyId to the correspondent party, along with its attributes
    parties = parties.map((party) => {
      const currentParty = (partyIdsResponses as Array<AxiosResponse>).find(
        (r: AxiosResponse) => r.data.institutionId === party.institutionId
      );

      return {
        ...party,
        partyId: currentParty?.data.partyId,
        attributes: currentParty?.data.attributes,
      };
    });

    // Then set them
    setAvailableParties(parties);
  };

  const fetchAndSetAvailableParties = async (taxCode: string) => {
    setLoadingText('Stiamo associando la tua utenza ai tuoi enti');

    // Get all available parties related to the user
    const availablePartiesResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_GET_AVAILABLE_PARTIES', endpointParams: { taxCode } },
      { method: 'GET' }
    );

    // If user already has institutions subscribed
    if (!isFetchError(availablePartiesResponse)) {
      // Set parties
      await setPartiesInContext((availablePartiesResponse as AxiosResponse).data!);
    }
  };

  // This happens when the user does a hard refresh when logged in
  // Instead of losing the user, we attempt at logging it back in
  // with the credentials stored in the sessionStorage
  // WARNING: this is not secure and will ultimately be rewritten
  // See PIN-403
  const attemptSilentLogin = async () => {
    const sessionStorageUser = storageRead('user', 'object');
    const sessionStorageParty = storageRead('currentParty', 'object');
    const sessionStorageBearerToken = storageRead('bearer', 'string');

    // TODO remove this entire if
    if (isEmpty(sessionStorageUser)) {
      setUser({
        name: 'loggedName',
        surname: 'loggedSurname',
        email: 'loggedEmail@aa.aa',
        taxCode: 'AAAAAA00A00A000A',
        role: 'Delegate',
        platformRole: 'admin',
        status: 'active',
      });
      return;
    }

    // If there are no credentials, it is impossible to get the user, so
    if (isEmpty(sessionStorageUser) || isEmpty(sessionStorageParty) || !sessionStorageBearerToken) {
      // Remove any partial data that might have remained, just for safety
      storageDelete('user');
      storageDelete('currentParty');
      storageDelete('bearer');
      // Go to the login view
      window.location.assign(URL_FE_LOGIN);
      // This return is necessary
      return;
    }

    // Otherwise, set the user to the one stored in the storage
    setUser(sessionStorageUser);

    // Then fetch and set the parties available for this user
    await fetchAndSetAvailableParties(sessionStorageUser.taxCode);

    // In the end, set the user to the last known party
    setParty(sessionStorageParty);
  };

  return { attemptSilentLogin, loadingText };
};
