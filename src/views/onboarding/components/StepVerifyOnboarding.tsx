import { AxiosError } from 'axios';
import { useEffect, useState, useContext, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { IllusError, theme } from '@pagopa/mui-italia';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { uniqueId } from 'lodash';
import { EndingPage } from '@pagopa/selfcare-common-frontend';
import { Grid, Link, Typography } from '@mui/material';
import {
  Party,
  Product,
  RequestOutcomeMessage,
  StepperStepComponentProps,
} from '../../../../types';
import { fetchWithLogs } from '../../../lib/api-utils';
import { ENV } from '../../../utils/env';
import { getFetchOutcome } from '../../../lib/error-utils';
import { HeaderContext, UserContext } from '../../../lib/context';
import { unregisterUnloadEvent } from '../../../utils/unloadEvent-utils';
import { LoadingOverlay } from '../../../components/LoadingOverlay';
import { MessageNoAction } from '../../../components/MessageNoAction';
import UserNotAllowedPage from '../../UserNotAllowedPage';
import { AooData } from '../../../model/AooData';
import { UoData } from '../../../model/UoModel';
import { RolesInformations } from '../../../components/RolesInformations';
import { addUserFlowProducts } from '../../../utils/constants';

type Props = StepperStepComponentProps & {
  externalInstitutionId: string;
  productId: string;
  selectedProduct?: Product | null;
  selectedParty?: Party;
  aooSelected?: AooData;
  uoSelected?: UoData;
};

export const genericError: RequestOutcomeMessage = {
  title: '',
  description: [
    <>
      <EndingPage
        minHeight="52vh"
        icon={<IllusError size={60} />}
        title={<Trans i18nKey="stepVerifyOnboarding.genericError.title" />}
        description={
          <Trans i18nKey="stepVerifyOnboarding.genericError.description">
            A causa di un errore del sistema non è possibile completare la procedura.
            <br />
            Ti chiediamo di riprovare più tardi.
          </Trans>
        }
        variantTitle={'h4'}
        variantDescription={'body1'}
        buttonLabel={<Trans i18nKey="stepVerifyOnboarding.genericError.backAction" />}
        onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
      />
    </>,
  ],
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export function StepVerifyOnboarding({
  forward,
  externalInstitutionId,
  productId,
  selectedProduct,
  selectedParty,
  aooSelected,
  uoSelected,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [outcome, setOutcome] = useState<RequestOutcomeMessage | null>();
  const { setOnExit } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);
  const requestIdRef = useRef<string>();
  const { t } = useTranslation();

  const notAllowedErrorNoParty: RequestOutcomeMessage = {
    title: '',
    description: [
      <>
        <UserNotAllowedPage
          partyName={selectedParty?.description}
          productTitle={selectedProduct?.title}
        />
      </>,
    ],
  };

  const alreadyOnboarded: RequestOutcomeMessage = {
    title: '',
    description: [
      <>
        <EndingPage
          minHeight="52vh"
          variantTitle={'h4'}
          variantDescription={'body1'}
          icon={<IllusError size={60} />}
          title={<Trans i18nKey="stepVerifyOnboarding.alreadyOnboarded.title" />}
          description={
            <Grid container sx={{ display: 'flex', flexDirection: 'column' }}>
              <Trans
                i18nKey="stepVerifyOnboarding.alreadyOnboarded.description"
                components={{ 1: <br /> }}
              >
                {
                  'Per operare sul prodotto, chiedi a un Amministratore di <1/>aggiungerti nella sezione Utenti.'
                }
              </Trans>
              <Grid item pt="4px">
                <RolesInformations />
              </Grid>
            </Grid>
          }
          isParagraphPresent={addUserFlowProducts(productId)}
          paragraph={
            <Typography sx={{ fontVariant: 'body1', color: theme.palette.text.secondary }}>
              <Trans
                i18nKey="stepVerifyOnboarding.alreadyOnboarded.addNewAdmin"
                components={{
                  1: <br />,
                  3: (
                    <Link
                      underline="none"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => forward(true)}
                    />
                  ),
                }}
              >
                {
                  'Gli attuali Amministratori non sono più disponibili e hai l’esigenza <1 />di gestire i prodotti? <3>Aggiungi un nuovo Amministratore</3>'
                }
              </Trans>
            </Typography>
          }
          buttonLabel={<Trans i18nKey="stepVerifyOnboarding.alreadyOnboarded.backHome" />}
          onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
        />
      </>,
    ],
  };

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    requestIdRef.current = uniqueId(
      `onboarding-verify-onboarding${externalInstitutionId}-${productId}-`
    );
  }, [productId]);

  const submit = async () => {
    setLoading(true);

    const onboardingStatus = await fetchWithLogs(
      {
        endpoint: 'VERIFY_ONBOARDING',
      },
      {
        method: 'HEAD',
        params: {
          taxCode: selectedParty?.taxCode,
          productId,
          subunitCode: aooSelected
            ? aooSelected.codiceUniAoo
            : uoSelected
            ? uoSelected.codiceUniUo
            : undefined,
          origin: selectedParty?.origin,
          originId: selectedParty?.originId,
        },
      },
      () => setRequiredLogin(true)
    );

    setLoading(false);

    // Check the outcome
    const restOutcome = getFetchOutcome(onboardingStatus);
    if (restOutcome === 'success') {
      trackEvent('ONBOARDING_PRODUCT_ALREADY_SUBSCRIBED', {
        request_id: requestIdRef.current,
        party_id: selectedParty?.externalId,
        product_id: selectedProduct?.id,
      });
      setOutcome(alreadyOnboarded);
    } else {
      if (
        (onboardingStatus as AxiosError<any>).response?.status === 404 ||
        (onboardingStatus as AxiosError<any>).response?.status === 400
      ) {
        setOutcome(null);
        onForwardAction();
      } else if ((onboardingStatus as AxiosError<any>).response?.status === 403) {
        trackEvent('ONBOARDING_NOT_ALLOWED_ERROR', {
          request_id: requestIdRef.current,
          party_id: externalInstitutionId,
          product_id: productId,
        });
        setOutcome(notAllowedErrorNoParty);
      } else {
        setOutcome(genericError);
      }
    }
  };

  useEffect(() => {
    void submit();
  }, []);

  const onForwardAction = () => {
    forward();
  };

  if (outcome) {
    unregisterUnloadEvent(setOnExit);
  }
  return loading ? (
    <LoadingOverlay loadingText={t('stepVerifyOnboarding.loadingText')} />
  ) : outcome ? (
    <MessageNoAction {...outcome} />
  ) : (
    <></>
  );
}
export default StepVerifyOnboarding;
