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
    token =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJmaXNjYWxfbnVtYmVyIjoiU1JUTkxNMDlUMDZHNjM1UyIsIm5hbWUiOiJBbnNlbG1vIiwiZmFtaWx5X25hbWUiOiJTYXJ0b3JpIiwidWlkIjoiNTA5NmU0YzYtMjVhMS00NWQ1LTliZGYtMmZiOTc0YTdjMWM4Iiwic3BpZF9sZXZlbCI6Imh0dHBzOi8vd3d3LnNwaWQuZ292Lml0L1NwaWRMMiIsImlzcyI6IlNQSUQiLCJhdWQiOiJhcGkuZGV2LnNlbGZjYXJlLnBhZ29wYS5pdCIsImlhdCI6MTc2NDAwNTY4NywiZXhwIjoxNzY0MDM4MDg3LCJqdGkiOiI3MmFjNTgwYi05OWJmLTRkNTUtYmIyZC0wM2RlY2JkZTJmZTYifQ.tWredKjYhh3JP0VQqi3Dt-u7kz0mhSgHLAtz45pQk1CP0q5gJRVBSG2GqHP56nJEIJ5h8Oo8gDT3NcFhwCQZKUfjJBXX86dDG1UzyLRTwtG5wUa6v26vbACa2HNfS6lkcS5PFq1OYTurmc3D5PoFqEhtzKRNMQDAJFUN3S12BE3a0PlxwLZJvIOdXvoss9iSIiQMvb4chmyyhtC38iHi32VDcGowfZi304tJlYafJxCJiGWcaoR5dIPaTNp0MzCULMuvZPhlo0A821q_Je5aa01_uts-m2y2ZIbYDPKSiu6bQLq4tE0hxl9vEesuKZ8qDrLwqQIHOOnl9HpF1wQVeQ';
  } else {
    token = (await page.evaluate(() => localStorage.getItem('token'))) || '';
  }

  const apiUrl = 'https://api.dev.selfcare.pagopa.it/onboarding';
  const fullUrl = `${apiUrl}/v2/institutions/onboardings?taxCode=${taxCode}&status=PENDING`;

  const fetchOnboarding = async (): Promise<string> => {
    try {
      const response = await fetch(fullUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        return '';
      }

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const matchingOnboarding = data.find((onb: any) => onb.productId === productId);

        if (matchingOnboarding) {
          return matchingOnboarding.id;
        }

        return '';
      }

      return '';
    } catch (error) {
      console.error('Fetch error:', error);
      return '';
    }
  };

  const result = await fetchOnboarding();

  if (!result) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return await fetchOnboarding();
  }

  return result;
};

export const deleteOnboardingById = async (page: Page, onboardingId: string): Promise<boolean> => {
  const apiUrl = 'https://api.dev.selfcare.pagopa.it/external/internal/v1';

  const fullUrl = `${apiUrl}/onboarding/${onboardingId}`;

  try {
    const response = await page.request.delete(fullUrl, {
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.APIM_SUBSCRIPTION_KEY || '',
      },
    });

    if (response.ok()) {
      return true;
    } else {
      console.error(`Failed to delete onboarding ${onboardingId}: ${response.status()}`);
      return false;
    }
  } catch (error) {
    console.error(`Error deleting onboarding ${onboardingId}:`, error);
    return false;
  }
};
