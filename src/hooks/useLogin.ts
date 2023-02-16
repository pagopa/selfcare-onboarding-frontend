import { useContext } from 'react';
import isEmpty from 'lodash/isEmpty';
import { storageTokenOps, storageUserOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { MOCK_USER } from '../utils/constants';
import { ENV } from '../utils/env';
import { UserContext } from '../lib/context';

const testToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Imp3dF8yNDpiMjo0ODpmZTo3MTpjNTplMzoxOTo1Nzo1ODowYzphNzoxNTo5NDplZDphMyJ9.eyJlbWFpbCI6ImRtYXJ0aW5vQGxpdmUuY29tIiwiZmFtaWx5X25hbWUiOiJMb25nbyIsImZpc2NhbF9udW1iZXIiOiJMTkdNTEU4NVAxOUM4MjZKIiwibmFtZSI6IkVtaWxpYSIsImZyb21fYWEiOmZhbHNlLCJ1aWQiOiJiOWI4OWVmOS00ZGNiLTRlMjctODE5Mi1kOTcyZWZlZjYxNGUiLCJsZXZlbCI6IkwyIiwiaWF0IjoxNjc2NTM0NzkxLCJleHAiOjE2NzY1NjcxOTEsImF1ZCI6ImFwaS51YXQuc2VsZmNhcmUucGFnb3BhLml0IiwiaXNzIjoiU1BJRCIsImp0aSI6IjAxR1NDTTVGQlRZS1kzMDgwWktUNEhXVkZEIn0.X5jfTJi04GVzs6foL7RNMx87B3vluKGphsMJ9R3qd96quaiK_v4D0sVPiWE_qs9MPfRGBdFIb5Hh7fcvcMZ_kDO5Ib0BgODnM_X-Br8seXR1QroU6mpVGdG-M7wM9hTYxgkjCPaALLPDmga6xKakOBq1pWiOMMZBWCjZaDKyJkX1RnfOB5JbTV6AWldUgcKyQFmyJDqLDxPQVP2QA1Pwspv3m-UxuxlLLZOIwk-qoVuvqbpf2LSdg4Qlxe5dkf2MIm-84hp4fdXrJwxYh-r68tPobOSskhUfDiRy2XTtZcad3xOK9QlKuaUPINr_uFuex8MP1zU19VieUOrAOHPp8A';

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
        taxCode: 'LGGLGD80A01B354S',
        name: 'loggedName',
        surname: 'loggedSurname',
        email: 'loggedEmail@aa.aa',
      });
      storageTokenOps.write(testToken);
      return;
    }

    const sessionStorageUser = storageUserOps.read();

    // If there are no credentials, it is impossible to get the user, so
    if (isEmpty(sessionStorageUser)) {
      // Remove any partial data that might have remained, just for safety
      storageUserOps.delete();
      const onSuccessEncoded = encodeURIComponent(location.pathname + location.search);
      // Go to the login view
      window.location.assign(ENV.URL_FE.LOGIN + '?onSuccess=' + onSuccessEncoded);
      // This return is necessary
      return;
    }

    // Otherwise, set the user to the one stored in the storage
    setUser(sessionStorageUser);
  };

  return { attemptSilentLogin };
};
