import { Grid, Typography, useTheme } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { AxiosResponse } from 'axios';
import { useTranslation } from 'react-i18next';
import { ReactElement } from 'react';
import { InstitutionType, IPACatalogParty, Party, StepperStepComponentProps } from '../../../types';
import { getFetchOutcome } from '../../lib/error-utils';
import { fetchWithLogs } from '../../lib/api-utils';
import { UserContext } from '../../lib/context';
import { OnboardingStepActions } from '../OnboardingStepActions';
import { useHistoryState } from '../useHistoryState';
import { LoadingOverlay } from '../LoadingOverlay';
import { AsyncAutocompleteV2 } from '../autocomplete/AsyncAutocompleteV2';

type Props = {
  subTitle: string | ReactElement;
  institutionType?: InstitutionType;
} & StepperStepComponentProps;

const handleSearchExternalId = async (
  externalInstitutionId: string,
  onRedirectToLogin: () => void
): Promise<IPACatalogParty | null> => {
  const searchResponse: any = await fetchWithLogs(
    {
      endpoint: 'ONBOARDING_GET_PARTY',
      endpointParams: { externalInstitutionId },
    },
    { method: 'GET', params: { origin: 'INFOCAMERE' } },
    onRedirectToLogin
  );

  const outcome = getFetchOutcome(searchResponse);

  if (outcome === 'success') {
    return (searchResponse as AxiosResponse).data as IPACatalogParty;
  }

  return null;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export function StepSearchPartyFromTaxCode({ subTitle, institutionType, forward, back }: Props) {
  const partyExternalIdByQuery = new URLSearchParams(window.location.search).get('partyExternalId');
  const { setRequiredLogin } = useContext(UserContext);
  const theme = useTheme();

  const [loading, setLoading] = useState(!!partyExternalIdByQuery);
  const [selected, setSelected, setSelectedHistory] = useHistoryState<IPACatalogParty | null>(
    'selected_step1',
    null
  );
  const [confirmAction, setConfirmAction] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  const onForwardAction = () => {
    setSelectedHistory(selected);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { id } = selected!;
    forward({ externalId: id }, { ...selected, externalId: id } as Party, institutionType, origin);
  };

  const onBackAction = () => {
    setSelected(null);
    setSelectedHistory(null);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    back!();
  };

  const { t } = useTranslation();
  const titleOfSearch = t('stepSearchPartyFromTaxCode.titleOfSearch');
  const titleOfSelection = t('stepSearchPartyFromTaxCode.titleOfSelection');

  useEffect(() => {
    if (partyExternalIdByQuery) {
      handleSearchExternalId(partyExternalIdByQuery, () => setRequiredLogin(true))
        .then((ipaParty) => {
          if (ipaParty) {
            setSelected(ipaParty);
          } else {
            // eslint-disable-next-line functional/immutable-data
            window.location.search = '';
          }
        })
        .catch((reason) => {
          // eslint-disable-next-line functional/immutable-data
          window.location.search = '';
          console.error(reason);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  return loading ? (
    <LoadingOverlay loadingText={t('onboardingStep1.loadingOverlayText')} />
  ) : (
    <Grid container direction="column">
      <Grid container item justifyContent="center">
        <Grid item xs={12}>
          <Typography variant="h3" component="h2" align="center" color={theme.palette.text.primary}>
            {!selected ? titleOfSearch : titleOfSelection}
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={1}>
        <Grid item xs={12}>
          <Typography variant="body1" align="center" color={theme.palette.text.primary}>
            {subTitle}
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={4} mb={4}>
        <Grid item xs={8} md={6} lg={5}>
          <AsyncAutocompleteV2
            theme={theme}
            searchByTaxCode={true}
            confirmAction={confirmAction}
            setConfirmAction={setConfirmAction}
            selected={selected}
            setSelected={setSelected}
            setInput={setInput}
            input={input}
            error={error}
            setError={setError}
            endpoint={{ endpoint: 'ONBOARDING_GET_PARTY' }}
            transformFn={(data: { items: Array<IPACatalogParty> }) =>
              /* removed transformation into lower case in order to send data to BE as obtained from registry
              // eslint-disable-next-line functional/immutable-data
              data.items.forEach((i) => (i.description = i.description.toLowerCase()));
              */
              data.items
            }
            optionKey="taxCode"
            optionLabel="taxCode"
          />
        </Grid>
      </Grid>

      <Grid item mt={4}>
        <OnboardingStepActions
          back={{
            action: onBackAction,
            label: t('onboardingStep1.onboarding.onboardingStepActions.backAction'),
            disabled: false,
          }}
          forward={{
            action: () => (!selected ? setConfirmAction(true) : onForwardAction()),
            label: t('onboardingStep1.onboarding.onboardingStepActions.confirmAction'),
            disabled: !selected && (error || !(input.length >= 11 && input.length <= 16)),
          }}
        />
      </Grid>
    </Grid>
  );
}
