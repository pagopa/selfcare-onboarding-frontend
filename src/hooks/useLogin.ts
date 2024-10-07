import { useContext } from 'react';
import isEmpty from 'lodash/isEmpty';
import {
  storageTokenOps,
  storageUserOps,
} from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { MOCK_USER } from '../utils/constants';
import { ENV } from '../utils/env';
import { UserContext } from '../lib/context';

const testToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Imp3dF84Njo3NDoxZTozNTphZTphNjpkODo0YjpkYzplOTpmYzo4ZTphMDozNTo2ODpiNSJ9.eyJlbWFpbCI6ImZ1cmlvdml0YWxlQG1hcnRpbm8uaXQiLCJmYW1pbHlfbmFtZSI6IlNhcnRvcmkiLCJmaXNjYWxfbnVtYmVyIjoiU1JUTkxNMDlUMDZHNjM1UyIsIm5hbWUiOiJBbnNlbG1vIiwiZnJvbV9hYSI6ZmFsc2UsInVpZCI6IjUwOTZlNGM2LTI1YTEtNDVkNS05YmRmLTJmYjk3NGE3YzFjOCIsImxldmVsIjoiTDIiLCJpYXQiOjE2NzQ4MTQxODAsImF1ZCI6ImFwaS5kZXYuc2VsZmNhcmUucGFnb3BhLml0IiwiaXNzIjoiU1BJRCIsImp0aSI6IjAxR1FTQjhLSDNCSks4QkFTRDE4MlZKSDhEIn0.JOfxEC3o8Wor0l430Fq68mWVl4h-NUpFlFuSf6Xgxmu-wqeQyUjRKIfl3M9J0H_8ihxyNMEu5u3PqqQBubGx1mjy24uEsoRPFdLQxlGnpMAM-15SFv8ShDWvMaTSz8hO6vCRJxUtNQgX7SplIG7ZlBBSt7ihwioW1CsKWFISuG0tHwe797NWwaMJlRnzW3R7BIrsGU1eJeue2QqYUnKXZIwYQh21E3EssCNFrusATEuJT_opGaTMzSHpUZxI6cCG2pOE8Cmm0Z75Q2HAM2eoi1_Mx8llZvuk1oVhgDGsACpNRb9Vyxt6jAPUEh3DlkGpLqS8AUD1vRQydzNifiSb4A';

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
