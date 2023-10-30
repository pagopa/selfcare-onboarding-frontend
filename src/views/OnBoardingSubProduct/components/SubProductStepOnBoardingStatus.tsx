import { Grid } from '@mui/material';
import { AxiosError } from 'axios';
import { useContext, useEffect, useRef, useState } from 'react';
import { resolvePathVariables } from '@pagopa/selfcare-common-frontend/utils/routes-utils';
import { useTranslation, Trans } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { History } from 'history';
import { IllusError } from '@pagopa/mui-italia';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { uniqueId } from 'lodash';
import { EndingPage } from '@pagopa/selfcare-common-frontend';
import { RequestOutcomeMessage, StepperStepComponentProps } from '../../../../types';
import { MessageNoAction } from '../../../components/MessageNoAction';
import { HeaderContext, UserContext } from '../../../lib/context';
import { ENV } from '../../../utils/env';
import { LoadingOverlay } from '../../../components/LoadingOverlay';
import { fetchWithLogs } from '../../../lib/api-utils';
import { getFetchOutcome } from '../../../lib/error-utils';
import { ROUTES } from '../../../utils/constants';
import { ReactComponent as SubscribedIcon } from '../../../assets/already-onboarded.svg';
import { unregisterUnloadEvent } from '../../../utils/unloadEvent-utils';

type Props = StepperStepComponentProps & {
  externalInstitutionId: string;
  productId: string;
  subProductId: string;
  productTitle: string;
};

const alreadyOnboardedSubProduct: RequestOutcomeMessage = {
  title: '',
  description: [
    <Grid container direction="column" key="0">
      <Grid container item justifyContent="center" mt={1}>
        <EndingPage
          minHeight="52vh"
          icon={<SubscribedIcon />}
          variantTitle={'h4'}
          variantDescription={'body1'}
          title={
            <Trans i18nKey="onBoardingSubProduct.alreadyOnboardedError.title">
              Sottoscrizione già avvenuta
            </Trans>
          }
          description={
            <Trans i18nKey="onBoardingSubProduct.alreadyOnboardedError.message">
              L&apos;ente che hai selezionato ha già sottoscritto l&apos;offerta <br />
              Premium.
            </Trans>
          }
          buttonLabel={
            <Trans i18nKey="onBoardingSubProduct.alreadyOnboardedError.closeButton">Chiudi</Trans>
          }
          onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
        />
      </Grid>
    </Grid>,
  ],
};

const buildNotBasicProduct = (
  productTitle: string,
  productId: string,
  externalInstitutionId: string,
  history: History
): RequestOutcomeMessage => ({
  title: '',
  description: [
    <>
      <EndingPage
        minHeight="52vh"
        icon={<IllusError size={60} />}
        title={
          <Trans i18nKey="onBoardingSubProduct.notBasicProductError.title">
            L&apos;ente non ha aderito a {{ selectedProduct: productTitle }}
          </Trans>
        }
        description={
          <Trans i18nKey="onBoardingSubProduct.notBasicProductError.message">
            Per poter sottoscrivere l&apos;offerta Premium, l&apos;ente che hai <br />
            selezionato deve prima aderire al prodotto {{ selectedProduct: productTitle }}
          </Trans>
        }
        variantTitle={'h4'}
        variantDescription={'body1'}
        buttonLabel={
          <Trans i18nKey="onBoardingSubProduct.notBasicProductError.adhesionButton">Aderisci</Trans>
        }
        onButtonClick={() => {
          history.push(
            resolvePathVariables(ROUTES.ONBOARDING.PATH, { productId }).concat(
              `?partyExternalId=${externalInstitutionId}`
            )
          );
        }}
      />
    </>,
  ],
});

const genericError: RequestOutcomeMessage = {
  title: '',
  description: [
    <>
      <EndingPage
        minHeight="52vh"
        icon={<IllusError size={60} />}
        title={<Trans i18nKey="onboardingStep1_5.genericError.title" />}
        description={
          <Trans i18nKey="onboardingStep1_5.genericError.description">
            A causa di un errore del sistema non è possibile completare la procedura.
            <br />
            Ti chiediamo di riprovare più tardi.
          </Trans>
        }
        variantTitle={'h4'}
        variantDescription={'body1'}
        buttonLabel={<Trans i18nKey="onboardingStep1_5.genericError.backAction" />}
        onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
      />
    </>,
  ],
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export function SubProductStepOnBoardingStatus({
  forward,
  externalInstitutionId,
  productId,
  subProductId,
  productTitle,
}: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [outcome, setOutcome] = useState<RequestOutcomeMessage | null>();
  const { setOnExit } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);
  const requestIdRef = useRef<string>();
  const history = useHistory();

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    requestIdRef.current = uniqueId(
      `onboarding-subproduct-verify-onboarding${externalInstitutionId}-${productId}-`
    );
  }, [productId]);

  const checkProduct = async (): Promise<boolean> => {
    const onboardingProductStatus = await fetchWithLogs(
      {
        endpoint: 'VERIFY_ONBOARDING',
      },
      {
        method: 'HEAD',
        params: {
          taxCode: externalInstitutionId,
          productId,
        },
      },
      () => setRequiredLogin(true)
    );
    const restOutcomeProduct = getFetchOutcome(onboardingProductStatus);
    if (
      restOutcomeProduct === 'error' &&
      ((onboardingProductStatus as AxiosError<any>).response?.status === 404 ||
        (onboardingProductStatus as AxiosError<any>).response?.status === 400)
    ) {
      trackEvent('ONBOARDING_PREMIUM_WITHOUT_BASE_PRODUCT', {
        request_id: requestIdRef.current,
        party_id: externalInstitutionId,
        product_id: productId,
        subproduct_id: subProductId,
      });
      setOutcome(buildNotBasicProduct(productTitle, productId, externalInstitutionId, history));
      return false;
    } else {
      return true;
    }
  };

  const checkSubProduct = async (): Promise<boolean> => {
    const onboardingSubProductStatus = await fetchWithLogs(
      {
        endpoint: 'VERIFY_ONBOARDING',
      },
      {
        method: 'HEAD',
        params: {
          taxCode: externalInstitutionId,
          productId: subProductId,
        },
      },
      () => setRequiredLogin(true)
    );
    const restOutcomeSubProduct = getFetchOutcome(onboardingSubProductStatus);
    if (restOutcomeSubProduct === 'success') {
      trackEvent('ONBOARDING_PREMIUM_ALREADY_SUBSCRIBED', {
        request_id: requestIdRef.current,
        party_id: externalInstitutionId,
        product_id: productId,
        subproduct_id: subProductId,
      });
      setOutcome(alreadyOnboardedSubProduct);
      return false;
    } else {
      if (
        (onboardingSubProductStatus as AxiosError<any>).response?.status === 404 ||
        (onboardingSubProductStatus as AxiosError<any>).response?.status === 400
      ) {
        return true;
      } else {
        setOutcome(genericError);
        return false;
      }
    }
  };

  const submit = async () => {
    setLoading(true);

    const checkProductResult = await checkProduct();
    if (checkProductResult) {
      const checkSubProductResult = await checkSubProduct();
      if (checkSubProductResult) {
        forward();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    void submit();
  }, []);

  if (outcome) {
    unregisterUnloadEvent(setOnExit);
  }
  return loading ? (
    <LoadingOverlay loadingText={t('onboarding.loading.loadingText')} />
  ) : outcome ? (
    <MessageNoAction {...outcome} />
  ) : (
    <></>
  );
}
export default SubProductStepOnBoardingStatus;
