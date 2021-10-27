import { useContext } from 'react';
import isEmpty from 'lodash/isEmpty';
import { MOCK_USER, URL_FE_LOGIN } from '../lib/constants';
import { UserContext } from '../lib/context';
import { storageDelete, storageRead } from '../lib/storage-utils';

export const useLogin = () => {
  const { setUser } = useContext(UserContext);

  // This happens when the user does a hard refresh when logged in
  // Instead of losing the user, we attempt at logging it back in
  // with the credentials stored in the sessionStorage
  // WARNING: this is not secure and will ultimately be rewritten
  // See PIN-403
  const attemptSilentLogin = async () => {
    if (MOCK_USER) {
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

    const sessionStorageUser = storageRead('user', 'object');

    // If there are no credentials, it is impossible to get the user, so
    if (isEmpty(sessionStorageUser)) {
      // Remove any partial data that might have remained, just for safety
      storageDelete('user');
      // Go to the login view
      window.location.assign(URL_FE_LOGIN);
      // This return is necessary
      return;
    }

    // Otherwise, set the user to the one stored in the storage
    setUser(sessionStorageUser);
  };

  return { attemptSilentLogin };
};
