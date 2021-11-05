import { Button, Stack } from '@mui/material';
import { Box } from '@mui/system';
import { AxiosResponse } from 'axios';
import { useEffect, useState } from 'react';
import { InstitutionInfo, OnBoardingInfo, StepperStepComponentProps } from '../../types';
import { fetchWithLogs } from '../lib/api-utils';
import { URL_FE_DASHBOARD } from '../lib/constants';
import { getFetchOutcome } from '../lib/error-utils';
import { LoadingOverlay } from './LoadingOverlay';
import { StyledIntro, StyledIntroChildrenProps } from './StyledIntro';

type Props = StepperStepComponentProps & {
  institutionId: string;
};

const alreadyOnboarded: StyledIntroChildrenProps = {
  title: "L'Ente che hai scelto ha già aderito",
  description: (
    <>
      Per accedere, chiedi al Referente incaricato di aggiungerti al portale Self Care del tuo Ente.
    </>
  ),
};

const genericError: StyledIntroChildrenProps = {
  title: "C'è stato un problema...",
  description: <>Qualcosa è andato storto durante la verifica dell&quot;ente, riprova più tardi.</>,
};

export function OnboardingStep1_5({ forward, institutionId }: Props) {
  const [loading, setLoading] = useState(true);
  const [outcome, setOutcome] = useState<StyledIntroChildrenProps | null>();

  const submit = async () => {
    setLoading(true);

    const onboardingStatus = await fetchWithLogs(
      { endpoint: 'ONBOARDING_GET_INFO' },
      { method: 'GET', params: { institutionId } }
    );

    setLoading(false);

    // Check the outcome
    const restOutcome = getFetchOutcome(onboardingStatus);

    if (restOutcome === 'success') {
      const onBoardingInfo: OnBoardingInfo = (onboardingStatus as AxiosResponse<OnBoardingInfo>)
        .data;
      const institution: InstitutionInfo | null =
        onBoardingInfo.institutions?.length > 0 ? onBoardingInfo.institutions[0] : null;
      if (institution && institution.status === 'active') {
        setOutcome(alreadyOnboarded);
      } else {
        setOutcome(null);
        onForwardAction();
      }
    } else {
      setOutcome(genericError);
    }
  };

  useEffect(() => {
    void submit();
  }, []);

  const onForwardAction = () => {
    forward();
  };

  return loading ? (
    <LoadingOverlay loadingText="Stiamo verificando i tuoi dati" />
  ) : outcome ? (
    <Stack spacing={10}>
      <StyledIntro>{outcome}</StyledIntro>
      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="contained"
          sx={{ width: '200px', alignSelf: 'center' }}
          onClick={() => window.location.assign(URL_FE_DASHBOARD)} // TODO to landing
        >
          Torna al portale
        </Button>
        {/* TODO other actions? */}
      </Box>
    </Stack>
  ) : (
    <></>
  );
}
