import { Page } from '@playwright/test';
import { isLocalMode } from './global.setup';

export const getOnboardingIdByTaxCode = async (page: Page, taxCode: string): Promise<string> => {

  // eslint-disable-next-line functional/no-let
  let token: string;

  if (isLocalMode) {
    console.log('⚠️ Local mode detected');
    token =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJmaXNjYWxfbnVtYmVyIjoiU1JUTkxNMDlUMDZHNjM1UyIsIm5hbWUiOiJBbnNlbG1vIiwiZmFtaWx5X25hbWUiOiJTYXJ0b3JpIiwidWlkIjoiNTA5NmU0YzYtMjVhMS00NWQ1LTliZGYtMmZiOTc0YTdjMWM4Iiwic3BpZF9sZXZlbCI6Imh0dHBzOi8vd3d3LnNwaWQuZ292Lml0L1NwaWRMMiIsImlzcyI6IlNQSUQiLCJhdWQiOiJhcGkuZGV2LnNlbGZjYXJlLnBhZ29wYS5pdCIsImlhdCI6MTc2MzU0NDQ1NCwiZXhwIjoxNzYzNTc2ODU0LCJqdGkiOiIyZWMzOGY1OS0xMzNiLTQxNjEtYTE5Yi05NmE4YzQwYjMzZjMifQ.YhWZ4GzXCmRXLfW_P8oW20Hv82eZf7GDLkpGQ9i7TXVOXKuBKq11AeYwY2WR1eFz8QlvwY7nECbhH0yzlQxfvicWTD9ovUtemT1bQOLn1YBbIUn41Hy4WXBB7UeRYRoN8yLcxd0DLduee8b_d_fRBtMxJ0nL3MUKgNjoN_MwbTDaLGnim2e4WclgvqYSeL1m0Y6_BWEciDAWCcYR1sDh_JemI36FBI1zKYoL4kDgTSu3efQi7ucwRN_dLF9OaBjOUuTsRVHXccdrm1Fzcio7SXFlS_clGlPZW3YXGfj5RP-ODlmH6qZP8dmmsRGWChsQwWB9orE1f2ECWEmpqcAL3Q';
  } else {
    token = (await page.evaluate(() => localStorage.getItem('token'))) || '';
    console.log('✅ Token from localStorage');
  }

  const apiUrl = 'https://api.dev.selfcare.pagopa.it/onboarding';

  if (!apiUrl) {
    console.error('❌ apiUrl not set!');
    return '';
  }

  const fullUrl = `${apiUrl}/v2/institutions/onboardings?taxCode=${taxCode}&status=PENDING`;

  try {
    const response = await fetch(fullUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return '';
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      return data[0].id;
    }

    console.error('❌ No data in array');
    return '';
  } catch (error) {
    console.error('❌ Fetch error:', error);
    return '';
  }
};

export const deleteOnboardingById = async (
  page: Page,
  onboardingId: string
): Promise<boolean> => {

  const apiUrl ='https://api.dev.selfcare.pagopa.it/external/internal/v1';
  
  const fullUrl = `${apiUrl}/onboarding/${onboardingId}`;

  try {
    const response = await page.request.delete(fullUrl, {
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.APIM_SUBSCRIPTION_KEY || ''
      },
    });

    if (response.ok()) {
      console.log(`✅ Successfully deleted onboarding: ${onboardingId}`);
      return true;
    } else {
      console.error(`❌ Failed to delete onboarding ${onboardingId}: ${response.status()}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error deleting onboarding ${onboardingId}:`, error);
    return false;
  }
};
