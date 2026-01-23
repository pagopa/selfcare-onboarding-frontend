import { useContext } from 'react';
import isEmpty from 'lodash/isEmpty';
import {
  storageTokenOps,
  storageUserOps,
} from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { MOCK_USER } from '../utils/constants';
import { UserContext } from '../lib/context';
import { redirectToLogin } from '../utils/unloadEvent-utils';

const testToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJmaXNjYWxfbnVtYmVyIjoiU1JUTkxNMDlUMDZHNjM1UyIsIm5hbWUiOiJBbnNlbG1vIiwiZmFtaWx5X25hbWUiOiJTYXJ0b3JpIiwidWlkIjoiNTA5NmU0YzYtMjVhMS00NWQ1LTliZGYtMmZiOTc0YTdjMWM4Iiwic3BpZF9sZXZlbCI6Imh0dHBzOi8vd3d3LnNwaWQuZ292Lml0L1NwaWRMMiIsImlzcyI6IlNQSUQiLCJhdWQiOiJhcGkuZGV2LnNlbGZjYXJlLnBhZ29wYS5pdCIsImlhdCI6MTc2MTIzMjQzMiwiZXhwIjoxODYxMjY0ODMyLCJqdGkiOiIwZjNhY2Q0Ni1kOGI5LTRmMDItYjUyZS1lMjlhMzEyZjNhMWEifQ.sq_8S5LaM_9UK_hmx8CDB9xj0DPxKmJbo76HRFTZJg2hPFxc2hmUBQMYf-wiuywWYINzpOAUL1IqFUKFC6Egaq6wscMGmTxHvomtSYLm0RzvMBEbI2ot9nFSk4HTo2KCw3xX_Cqcy7vi68jgwadFSSC6Ov92LX2Shbq5yM-jmBWZr6vHvcogV3wGSX2cHSxx0w1nOFYDy4oVkLe2STCIXKf4qmdflE8291Vr2D1ZoUEG6_OU6LDZrWt38D5RokUnyZtfy34YdyaC-pfS3WMIOBNhMwzX-Uc_ULccsz3GGlbAHS4q_xGUpBsQT_qR4wmS2K-A0KPnL2O2MFSNKIQlpA';
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
      redirectToLogin();
      // This return is necessary
      return;
    }

    // Otherwise, set the user to the one stored in the storage
    setUser(sessionStorageUser);
  };

  return { attemptSilentLogin };
};
