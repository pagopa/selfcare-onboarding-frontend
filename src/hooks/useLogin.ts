import { useContext } from 'react';
import isEmpty from 'lodash/isEmpty';
import { storageTokenOps, storageUserOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { MOCK_USER } from '../utils/constants';
import { ENV } from '../utils/env';
import { UserContext } from '../lib/context';

const testToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Imp3dF9hMjo3YTo0NjozYjoyYTo2MDo1Njo0MDo4ODphMDo1ZDphNDpmODowMToxZTozZSJ9.eyJmYW1pbHlfbmFtZSI6IkxhbXBlZHVzYSIsImZpc2NhbF9udW1iZXIiOiJMTVBUTVM4MEEwMUY4MzlNIiwibmFtZSI6IlRvbW1hc28iLCJzcGlkX2xldmVsIjoiaHR0cHM6Ly93d3cuc3BpZC5nb3YuaXQvU3BpZEwyIiwiZnJvbV9hYSI6ZmFsc2UsInVpZCI6IjZhMzNhMjhjLTg0MTUtNDc0MS04NmFkLTIyOWFjMjc0OTMyZSIsImxldmVsIjoiTDIiLCJpYXQiOjE3MTk4MTg1OTUsImV4cCI6MTcxOTg1MDk5NSwiYXVkIjoiYXBpLmRldi5zZWxmY2FyZS5wYWdvcGEuaXQiLCJpc3MiOiJTUElEIiwianRpIjoiX2MzMmJjMjE0ZTI5MTY4ZDhhMWVlIn0.SREDVYWVOz5wgx2QpC4Qz1gtp8MFRcOBrFJig2hKjmLugxelYjp4PQBeMmqxcC2vxOWn7phk7WyOaqS4CKuP67VWWEbneO7QeKLoIFE4IOf5EhluQVto-N5JHCFr8_fixjhQDVwIlh0Y6xSLrROXiDFoN0EHIYxbJjY54ZNXIyPA4AwEtYWkrtKdkcg6kC_c9lbQ3DdBcbOSKHJ6ViKaFSBZnLkQcYFtqFodpQgXYTb_3hRUvkhbOBcE3gPhpVhwEhMauJX_a71gI_2Z2kzeOC7o0LSHM3vd4TP2V6qjPMzTm82cyB9ukM6ddohX01le8uNR0WQroDn3QNDzv3nW_A';

export const useLogin = () => {
  storageTokenOps.write(testToken);
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
