import { useContext } from 'react';
import isEmpty from 'lodash/isEmpty';
import { storageTokenOps, storageUserOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { MOCK_USER } from '../utils/constants';
import { ENV } from '../utils/env';
import { UserContext } from '../lib/context';

const testToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Imp3dF82ZDplNTphNDo4NToyYjplMDpjYjplYToyZDo5Yzo1MjoxMjpmZTphNTpmMjo2MCJ9.eyJlbWFpbCI6ImZ1cmlvdml0YWxlQG1hcnRpbm8uaXQiLCJmYW1pbHlfbmFtZSI6IlNhcnRvcmkiLCJmaXNjYWxfbnVtYmVyIjoiU1JUTkxNMDlUMDZHNjM1UyIsIm5hbWUiOiJBbnNlbG1vIiwiZnJvbV9hYSI6ZmFsc2UsInVpZCI6IjUwOTZlNGM2LTI1YTEtNDVkNS05YmRmLTJmYjk3NGE3YzFjOCIsImxldmVsIjoiTDIiLCJpYXQiOjE2OTM5OTQwNzYsImV4cCI6MTY5NDAyNjQ3NiwiYXVkIjoiYXBpLmRldi5zZWxmY2FyZS5wYWdvcGEuaXQiLCJpc3MiOiJTUElEIiwianRpIjoiXzkxZjVmYmJlZTgzZjFjYTYyM2ExIn0.gOO6-NRyIcFrBXiLlvMShta1zHfp4iKGbQFDFXh-0o3bT9wSNMr6b_3fZ9qe082CgltJbU9Swjz0_B-TPW6G3ZBL13gLfGcctzCzTZfUUFuLcyVRFisnO_DqeoLL1ik3a3F3KpxvXAP-oBIRGneVL-XH4hnzSFCnVnWdZuxdWyTntTE0bAT5Ho_JeAN_NJWs4psZjUx9BouzGVw9nboMYB5tDOgKDrfFgUlnR4G1x7ntnJonYs3tys2LjOzg85VfZtrVua4eW7Tq29EuioZtB7jsc_Sz5ioO2qsMYp0WWv-0I5iBaAd2D679PpLggCdrpdGbF0UNldViOVFZSmdeAw';

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
