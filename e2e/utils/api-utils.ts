import { Page } from '@playwright/test';
import { isLocalMode } from './global.setup';

export const getOnboardingIdByTaxCode = async (page: Page, taxCode: string): Promise<string> => {

  // eslint-disable-next-line functional/no-let
  let token: string;

  if (isLocalMode) {
    console.log('⚠️ Local mode detected');
    token =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJmaXNjYWxfbnVtYmVyIjoiU1NUTVRUNzZDMjNGMjA1VCIsIm5hbWUiOiJNYXR0aWEiLCJmYW1pbHlfbmFtZSI6IlNpc3RpIiwidWlkIjoiZWUwYmY2ZGEtODE4Ni00YjZkLWJkMjgtYWE4ZTNhOGRiZDc2Iiwic3BpZF9sZXZlbCI6Imh0dHBzOi8vd3d3LnNwaWQuZ292Lml0L1NwaWRMMiIsImlzcyI6IlNQSUQiLCJhdWQiOiJhcGkuZGV2LnNlbGZjYXJlLnBhZ29wYS5pdCIsImlhdCI6MTc2MjI0NjIzNywiZXhwIjoxNzYyMjc4NjM3LCJqdGkiOiIxOWM0NDdkNS04Nzc1LTRhMGUtYjdhNy1iMDFlYWFiZDc1ZDEifQ.ITL8SlGUPPQY2Hy_eKnXz94vnmtB4-BGR5fJeDsvhNqsqg_7-Ic6rBZ2ozGdGAy5xKo2SiG0MAKbKCe6QBYV_fHXJdgtbYiM1TId7M0DXjuQZ1p4LCxbszMU09hgn0KCkgzJOaYfTjxfSRY6pAgWANZ9AQEAwNLrjYvKG0EFgGZQUNptgNoaXDYsa5cu5XJY5-MmHb_bw2zI4LMyHNV9fh9MmWFRZgf7X9Sr6t_CpPwYirdiKQFxaUB5vmJqxwbyx8h3IALWHMykQ73SGociU0BzhqOcEvyhQx3chDKf-IDiJwNxvi5eVjAEFgm5OhLVPTc4Qh8J1dUbqxa0iLXEaQ';
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
        'Ocp-Apim-Subscription-Key': '' // TODO. take the value form env variable
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
