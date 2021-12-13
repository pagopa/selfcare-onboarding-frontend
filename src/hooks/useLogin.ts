import { useContext } from 'react';
import isEmpty from 'lodash/isEmpty';
import { MOCK_USER, URL_FE_LOGIN } from '../utils/constants';
import { UserContext } from '../lib/context';
import { storageDelete, storageRead, storageWrite } from '../lib/storage-utils';

const testToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJmYW1pbHlfbmFtZSI6IlNhcnRvcmkiLCJmaXNjYWxfbnVtYmVyIjoiU1JUTkxNMDlUMDZHNjM1UyIsIm5hbWUiOiJBbnNlbG1vIiwiZnJvbV9hYSI6ZmFsc2UsImxldmVsIjoiTDIiLCJpYXQiOjE2MzkxNTcyNDAsImV4cCI6MTYzOTE2MDg0MCwiaXNzIjoiU1BJRCIsImp0aSI6IjAxRlBKUDU1MlRaRFcwUlc2UVlYMTZRR1pIIn0.SQ-8xcHvIDERLB5UsTGH0GLn5s7GCOcYMolmwa0M90uaJekobgqIjTISSzIH3yp2_vQxzTu8oJLklPKzSUEJjBL6yBq7s96yUBRMuAmNhgSbWbW1oCbSycIdUUja-Q-3LQlYSGKUIMDhXldU6syqIavdW9ngn2sBwXzNsWDXu886BVI0-tOnEgutgwdnSIcUya3HGCb5uv_vThWvtYmBhTFa28LdYBZbMKwzXwrMU97du565EN7UbcRAcSlgdNhGLPP2hjgipJP7ASqw_bV229_LpkNBzaFtswyq8YLcL-M6__u7w3siddmT9BVsmoX1M6PZDcUsddCmo5iWnQrcGw';

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
        uid: '0',
        taxCode: 'AAAAAA00A00A000A',
        name: 'loggedName',
        surname: 'loggedSurname',
        email: 'loggedEmail@aa.aa',
      });
      storageWrite('token', testToken, 'string');
      return;
    }

    const sessionStorageUser = storageRead('user', 'object');

    // If there are no credentials, it is impossible to get the user, so
    if (isEmpty(sessionStorageUser)) {
      // Remove any partial data that might have remained, just for safety
      storageDelete('user');
      // Go to the login view
      window.location.assign(URL_FE_LOGIN + '?onSuccess=' + location.pathname);
      // This return is necessary
      return;
    }

    // Otherwise, set the user to the one stored in the storage
    setUser(sessionStorageUser);
  };

  return { attemptSilentLogin };
};
