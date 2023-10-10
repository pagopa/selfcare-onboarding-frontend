import { useContext } from 'react';
import isEmpty from 'lodash/isEmpty';
import { storageTokenOps, storageUserOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { ENV } from '../utils/env';
import { UserContext } from '../lib/context';

const testToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Imp3dF82ZDplNTphNDo4NToyYjplMDpjYjplYToyZDo5Yzo1MjoxMjpmZTphNTpmMjo2MCJ9.eyJlbWFpbCI6ImJlbmVkZXR0YS5kZWx2ZWNjaGlvQG50dGRhdGEuY29tIiwiZmFtaWx5X25hbWUiOiJEZWx2ZWNjaGlvIiwiZmlzY2FsX251bWJlciI6IkRMVkJEVDkyQTQxRjIwNUMiLCJuYW1lIjoiQmVuZWRldHRhIiwiZnJvbV9hYSI6ZmFsc2UsInVpZCI6ImQ3Y2FlZjhhLTZiYmUtNGY5My1iMWI4LTkzNGE4OGEyMmIxNyIsImxldmVsIjoiTDIiLCJpYXQiOjE2OTY5NDQ4MzQsImV4cCI6MTY5Njk3NzIzNCwiYXVkIjoiYXBpLmRldi5zZWxmY2FyZS5wYWdvcGEuaXQiLCJpc3MiOiJTUElEIiwianRpIjoiXzM0OTkzOGZlNWM3Njg5ZGFiNGRiIn0.bynNihmyuz_E1siKts-28XSQejX2x8M4qKNHZU78I3vOszS1xjbyUp5oBTvD4ccLgL4ATHPUhdyrvBrVveULUM-VeoalRegfk9lDjWJNtiTMa_jqB0-HPOAi0QXivJj4MZmkFaNMyDbY_Ognxak6t_g41f4eTUq_BhA-9L1iWlu7BZL-NC6RECWPzBG4E93iVReZLw9IqHPm9cfvme0sF-Xl0h0kbkJdd2O68Gm0zOljI5v00HJavs1OxiiCI7BesJYEQ8uo-Grcn5waKexdm9Ok3VpXvWP8C-1EWjCt3so7qkdpeEq99P1lgsui0jkoEbWGd0z2-aMbhkGjPK0qZg';

export const useLogin = () => {
  const { setUser } = useContext(UserContext);

  const mock = false;

  // This happens when the user does a hard refresh when logged in
  // Instead of losing the user, we attempt at logging it back in
  // with the credentials stored in the sessionStorage
  // WARNING: this is not secure and will ultimately be rewritten
  // See PIN-403
  const attemptSilentLogin = async () => {
    if (mock) {
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
