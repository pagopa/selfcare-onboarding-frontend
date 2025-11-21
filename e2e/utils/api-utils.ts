import { Page } from '@playwright/test';
import { isLocalMode } from './global.setup';

export const getOnboardingIdByTaxCode = async (
  page: Page,
  taxCode: string,
  productId: string
): Promise<string> => {
  // eslint-disable-next-line functional/no-let
  let token: string;

  if (isLocalMode) {
    console.log('⚠️ Local mode detected');
    token =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJmaXNjYWxfbnVtYmVyIjoiU1NUTVRUNzZDMjNGMjA1VCIsIm5hbWUiOiJNYXR0aWEiLCJmYW1pbHlfbmFtZSI6IlNpc3RpIiwidWlkIjoiZWUwYmY2ZGEtODE4Ni00YjZkLWJkMjgtYWE4ZTNhOGRiZDc2Iiwic3BpZF9sZXZlbCI6Imh0dHBzOi8vd3d3LnNwaWQuZ292Lml0L1NwaWRMMiIsImlzcyI6IlNQSUQiLCJhdWQiOiJhcGkuZGV2LnNlbGZjYXJlLnBhZ29wYS5pdCIsImlhdCI6MTc2MzcxNDY1NywiZXhwIjoxNzYzNzQ3MDU3LCJqdGkiOiI1ODRlZjUwNS02MTczLTRlZWEtODI4MS05NjI1MGIzOGM5MzkifQ.taPHeSQa-x--5n5eiDf5H4R08y0jja3fAaiRjs7ls8BbFizVMOBpfZBPw4IfJAUw-vaUjuIbctR2jU2yf13TV5F3STZ9HVxzN9HFgapMpPBq0nUwB3cih3H4jgpkL1wwTkm53H2XnbjGSgdEHhn4c_k54wqiIKPlPu5HY2TR9y_4Aa7bUDzcVfM7uWPupC-PflEIDwN61brhOWwZkPQdzQXpsKjOsEL2h4bT9vVifHEi5EtUUhszA1mnL10O6QEjrtpHTBvnBE7yzWxa7zl9EegdlYvcmZ8NpNebW0z6GTp37w1ae5yKL3w21fQKEDPvPIu0BgYbNaNQL9IKqw6awQ';
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

  const fetchOnboarding = async (): Promise<string> => {
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
        const matchingOnboarding = data.find((onb: any) => onb.productId === productId);

        if (matchingOnboarding) {
          console.log(`✅ Found onboarding for product ${productId}: ${matchingOnboarding.id}`);
          return matchingOnboarding.id;
        }

        const foundProducts = data.map((onb: any) => onb.productId).join(', ');
        console.warn(
          `⚠️ Found ${data.length} onboarding(s), but none matching productId ${productId}. Found: [${foundProducts}]`
        );
        return '';
      }

      console.error('❌ No data in array');
      return '';
    } catch (error) {
      console.error('❌ Fetch error:', error);
      return '';
    }
  };

  const result = await fetchOnboarding();

  if (!result) {
    console.log('⏳ Retrying once after 2 seconds...');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return await fetchOnboarding();
  }

  return result;
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
