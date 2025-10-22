/* eslint-disable functional/no-let */
// e2e/utils/api-utils.ts
import { Page } from '@playwright/test';

const isLocalMode = process.env.REACT_APP_ENV === 'LOCAL_DEV' || process.env.NODE_ENV === 'test';

export const getOnboardingIdByTaxCode = async (page: Page, taxCode: string): Promise<string> => {
  const apiUrl = process.env.BASE_API_URL;

  if (!apiUrl) {
    return '';
  }

  let token: string;

  if (isLocalMode) {
    token =
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Imp3dF84Njo3NDoxZTozNTphZTphNjpkODo0YjpkYzplOTpmYzo4ZTphMDozNTo2ODpiNSJ9.eyJlbWFpbCI6ImZ1cmlvdml0YWxlQG1hcnRpbm8uaXQiLCJmYW1pbHlfbmFtZSI6IlNhcnRvcmkiLCJmaXNjYWxfbnVtYmVyIjoiU1JUTkxNMDlUMDZHNjM1UyIsIm5hbWUiOiJBbnNlbG1vIiwiZnJvbV9hYSI6ZmFsc2UsInVpZCI6IjUwOTZlNGM2LTI1YTEtNDVkNS05YmRmLTJmYjk3NGE3YzFjOCIsImxldmVsIjoiTDIiLCJpYXQiOjE2NzQ4MTQxODAsImF1ZCI6ImFwaS5kZXYuc2VsZmNhcmUucGFnb3BhLml0IiwiaXNzIjoiU1BJRCIsImp0aSI6IjAxR1FTQjhLSDNCSks4QkFTRDE4MlZKSDhEIn0.JOfxEC3o8Wor0l430Fq68mWVl4h-NUpFlFuSf6Xgxmu-wqeQyUjRKIfl3M9J0H_8ihxyNMEu5u3PqqQBubGx1mjy24uEsoRPFdLQxlGnpMAM-15SFv8ShDWvMaTSz8hO6vCRJxUtNQgX7SplIG7ZlBBSt7ihwioW1CsKWFISuG0tHwe797NWwaMJlRnzW3R7BIrsGU1eJeue2QqYUnKXZIwYQh21E3EssCNFrusATEuJT_opGaTMzSHpUZxI6cCG2pOE8Cmm0Z75Q2HAM2eoi1_Mx8llZvuk1oVhgDGsACpNRb9Vyxt6jAPUEh3DlkGpLqS8AUD1vRQydzNifiSb4A';
  } else {
    token = (await page.evaluate(() => localStorage.getItem('token'))) || '';
  }

  if (!token) {
    return '';
  }

  try {
    const response = await page.request.get(`${apiUrl}/v2/institutions`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { taxCode },
    });

    console.log(response.status);

    if (!response.ok) {
      return '';
    }

    const data = await response.json();
    return data.onboardingId || '';
  } catch (error) {
    return '';
  }
};
