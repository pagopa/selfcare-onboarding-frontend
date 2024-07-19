import { Grid, Typography } from '@mui/material';
import SessionModal from '@pagopa/selfcare-common-frontend/lib/components/SessionModal';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { uniqueId } from 'lodash';
import { useContext, useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { AxiosResponse } from 'axios';
import {
  InstitutionType,
  Product,
  RequestOutcomeMessage,
  StepperStepComponentProps,
  UserOnCreate,
} from '../../../types';
import { UserContext } from '../../lib/context';
import { objectIsEmpty } from '../../lib/object-utils';
import { userValidate } from '../../utils/api/userValidate';
import { OnboardingStepActions } from '../OnboardingStepActions';
import { PlatformUserForm, validateUser } from '../PlatformUserForm';
import { useHistoryState } from '../useHistoryState';
import { RolesInformations } from '../RolesInformations';
import { fetchWithLogs } from '../../lib/api-utils';
import { OnboardingFormData } from '../../model/OnboardingFormData';
import { getFetchOutcome } from '../../lib/error-utils';
import { genericError } from '../../views/onboardingProduct/components/StepVerifyOnboarding';

// Could be an ES6 Set but it's too bothersome for now
export type UsersObject = { [key: string]: UserOnCreate };
export type UsersError = { [key: string]: { [userField: string]: Array<string> } };

type Props = StepperStepComponentProps & {
  externalInstitutionId: string;
  addUserFlow: boolean;
  readOnly?: boolean;
  subProduct?: Product;
  isTechPartner?: boolean;
  onboardingFormData?: OnboardingFormData;
  selectedParty?: any;
  institutionType?: InstitutionType;
  setOutcome: React.Dispatch<React.SetStateAction<RequestOutcomeMessage | null | undefined>>;
};

export function StepAddManager({
  readOnly,
  externalInstitutionId,
  product,
  forward,
  back,
  subProduct,
  isTechPartner,
  addUserFlow,
  onboardingFormData,
  selectedParty,
  institutionType,
  setOutcome,
}: Props) {
  const { setRequiredLogin } = useContext(UserContext);
  const [_loading, setLoading] = useState(true);
  const [people, setPeople, setPeopleHistory] = useHistoryState<UsersObject>('people_step2', {});
  const [peopleErrors, setPeopleErrors] = useState<UsersError>();
  const [isGenericError, setIsGenericError] = useState<boolean>(false);
  const [isChangedManager, setIsChangedManager] = useState<boolean>(false);
  const requestIdRef = useRef<string>();
  const { t } = useTranslation();
  const premiumFlow = !!subProduct;

  useEffect(() => {
    if (premiumFlow) {
      // eslint-disable-next-line functional/immutable-data
      requestIdRef.current = uniqueId(
        `onboarding-step-manager-${externalInstitutionId}-${product?.id}-${subProduct?.id}`
      );

      trackEvent('ONBOARDING_PREMIUM_ADD_MANAGER', {
        request_id: requestIdRef?.current,
        party_id: externalInstitutionId,
        product_id: product?.id,
        subproduct_id: subProduct?.id,
      });
    }
  }, [premiumFlow]);

  const onUserValidateSuccess = () => {
    setIsGenericError(false);
    onForwardAction();
  };

  const onUserValidateError = (userId: string, errors: { [fieldName: string]: Array<string> }) => {
    setPeopleErrors({
      [userId]: errors,
    });
  };

  const onUserValidateGenericError = () => {
    setIsGenericError(true);
  };

  const checkManager = async (user: UserOnCreate) => {
    setLoading(true);
    const request = await fetchWithLogs(
      {
        endpoint: 'ONBOARDING_CHECK_MANAGER',
      },
      {
        method: 'POST',
        data: {
          institutionType,
          origin: selectedParty?.origin,
          originId: selectedParty?.originId,
          productId: product?.id,
          subunitCode: onboardingFormData?.aooUniqueCode ?? onboardingFormData?.uoUniqueCode,
          taxCode: selectedParty?.taxCode ?? onboardingFormData?.taxCode,
          users: [user],
        },
      },
      () => setRequiredLogin(true)
    );

    const result = getFetchOutcome(request);

    if (result === 'success') {
      const response = (request as AxiosResponse).data.result;
      setIsChangedManager(!response);
      if (response) {
        validateUserData(people.LEGAL, 'LEGAL', externalInstitutionId, subProduct);
      }
    } else {
      setOutcome(genericError);
    }
    setLoading(false);
  };

  const validateUserData = (
    user: UserOnCreate,
    prefix: string,
    externalInstitutionId: string,
    subProduct?: Product | undefined
  ) => {
    userValidate(
      externalInstitutionId,
      user,
      prefix,
      onUserValidateSuccess,
      onUserValidateError,
      onUserValidateGenericError,
      () => setRequiredLogin(true),
      setLoading,
      subProduct ? 'ONBOARDING_PREMIUM_ADD_MANAGER' : 'ONBOARDING_ADD_MANAGER'
    ).catch((reason) => reason);
  };

  const onForwardAction = () => {
    savePageState();
    forward({ users: Object.values(people) });
  };

  const onBackAction = () => {
    savePageState();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    back!();
  };

  const savePageState = () => {
    setPeopleHistory(people);
  };

  const handleCloseGenericErrorModal = () => {
    setIsGenericError(false);
  };

  return (
    <Grid container direction="column">
      <Grid container item justifyContent="center">
        <Grid item xs={12}>
          <Typography variant="h3" component="h2" align="center" sx={{ lineHeight: '1.2' }}>
            <Trans i18nKey="stepAddManager.title">Indica il Legale Rappresentante</Trans>
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={1}>
        <Grid item xs={12} mb={1}>
          <Typography sx={{ fontWeight: 400 }} variant="body1" component="h2" align="center">
            <Trans
              i18nKey={
                subProduct
                  ? 'stepAddManager.subTitle.flow.premium'
                  : addUserFlow
                  ? 'stepAddManager.subTitle.flow.addNewUser'
                  : 'stepAddManager.subTitle.flow.base'
              }
              components={{ 1: <br />, 3: <strong />, 4: <br /> }}
              values={{ productTitle: product?.title }}
            >
              {subProduct
                ? `Inserisci i dati del Legale Rappresentante del tuo ente. <1/> La persona che indicherai sarà firmataria del contratto per <3/> <strong>Premium<strong/>.`
                : addUserFlow
                ? `La persona indicata firmerà il Modulo di aggiunta per il nuovo Amministratore e lo <1 />autorizzerà ad operare sul prodotto <3>{{productTitle}}</3> per il tuo ente.`
                : `Inserisci i dati del Legale Rappresentante del tuo ente. <1/> Sarà responsabile della firma del contratto per <3>{{productTitle}}</3> <4/> e avrà il ruolo di Amministratore per questo prodotto nell'Area Riservata.`}
            </Trans>
          </Typography>
        </Grid>
        <Grid item>
          <RolesInformations isTechPartner={isTechPartner} />
        </Grid>
      </Grid>

      <Grid container item display="flex" justifyContent="center" mt={3}>
        <Grid item xs={8} display="flex" justifyContent="center">
          <PlatformUserForm
            prefix="LEGAL"
            role="MANAGER"
            people={people}
            peopleErrors={peopleErrors}
            allPeople={people}
            setPeople={setPeople}
            readOnly={readOnly}
            addUserFlow={addUserFlow}
          />
        </Grid>
      </Grid>

      <Grid item mb={10} mt={2}>
        <OnboardingStepActions
          back={{
            action: onBackAction,
            label: t('stepAddManager.back'),
            disabled: false,
          }}
          forward={{
            action: () => {
              if (addUserFlow) {
                void checkManager(people.LEGAL);
              } else {
                validateUserData(people.LEGAL, 'LEGAL', externalInstitutionId, subProduct);
              }
            },
            label: t('stepAddManager.continue'),
            disabled:
              objectIsEmpty(people) || !validateUser('LEGAL', people.LEGAL, people, addUserFlow),
          }}
        />
      </Grid>
      <SessionModal
        open={isGenericError}
        title={t('onboarding.error.title')}
        message={
          <Trans i18nKey="onboarding.error.description">
            {'A causa di un errore del sistema non è possibile completare la procedura.'} <br />
            {'Ti chiediamo di riprovare più tardi.'}
          </Trans>
        }
        onCloseLabel={t('onboarding.backHome')}
        handleClose={handleCloseGenericErrorModal}
      />
      <SessionModal
        open={isChangedManager}
        title={t('stepAddManager.changedManager.title')}
        message={
          <Trans i18nKey="stepAddManager.changedManager.message" components={{ 1: <br /> }}>
            {
              'I dati del Legale Rappresentante inseriti sono diversi da quelli indicati in <1 />precedenza. Vuoi continuare?'
            }
          </Trans>
        }
        onCloseLabel={t('stepAddManager.back')}
        onConfirmLabel={t('stepAddManager.continue')}
        onConfirm={() => validateUserData(people.LEGAL, 'LEGAL', externalInstitutionId, subProduct)}
        handleClose={() => setIsChangedManager(false)}
      />
    </Grid>
  );
}
