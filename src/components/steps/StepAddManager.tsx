import { Grid, Typography } from '@mui/material';
import SessionModal from '@pagopa/selfcare-common-frontend/components/SessionModal';
import { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { uniqueId } from 'lodash';
import { Product, StepperStepComponentProps, UserOnCreate } from '../../../types';
import { UserContext } from '../../lib/context';
import { objectIsEmpty } from '../../lib/object-utils';
import { userValidate } from '../../utils/api/userValidate';
import { OnboardingStepActions } from '../OnboardingStepActions';
import { PlatformUserForm, validateUser } from '../PlatformUserForm';
import { useHistoryState } from '../useHistoryState';

// Could be an ES6 Set but it's too bothersome for now
export type UsersObject = { [key: string]: UserOnCreate };
export type UsersError = { [key: string]: { [userField: string]: Array<string> } };

type Props = StepperStepComponentProps & {
  externalInstitutionId: string;
  readOnly?: boolean;
  subProduct?: Product;
};

export function StepAddManager({
  readOnly,
  externalInstitutionId,
  product,
  forward,
  back,
  subProduct,
}: Props) {
  const { setRequiredLogin } = useContext(UserContext);
  const [_loading, setLoading] = useState(true);
  const [people, setPeople, setPeopleHistory] = useHistoryState<UsersObject>('people_step2', {});
  const [peopleErrors, setPeopleErrors] = useState<UsersError>();
  const [genericError, setGenericError] = useState<boolean>(false);
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
    setGenericError(false);
    onForwardAction();
  };

  const onUserValidateError = (userId: string, errors: { [fieldName: string]: Array<string> }) => {
    setPeopleErrors({
      [userId]: errors,
    });
  };

  const onUserValidateGenericError = () => {
    setGenericError(true);
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
    setGenericError(false);
  };

  return (
    <Grid container direction="column">
      <Grid container item justifyContent="center">
        <Grid item xs={12}>
          <Typography variant="h3" component="h2" align="center" sx={{ lineHeight: '1.2' }}>
            <Trans i18nKey="onboardingStep2.bodyTitle">
              Indica il Legale <br /> Rappresentante
            </Trans>
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={1}>
        <Grid item xs={12}>
          <Typography sx={{ fontWeight: 400 }} variant="body1" component="h2" align="center">
            <Trans
              i18nKey={
                subProduct
                  ? 'onboardingStep2.premiumBodyDescription'
                  : 'onboardingStep2.bodyDescription'
              }
            >
              Inserisci i dati del Legale Rappresentante o del procuratore del tuo ente.
              <br />
              La persona che indicherai sarà firmataria del contratto per
              {`${product?.title}`}.
            </Trans>
          </Typography>
        </Grid>
      </Grid>

      <Grid container item display="flex" justifyContent="center" mt={4}>
        <Grid item xs={8} display="flex" justifyContent="center">
          <PlatformUserForm
            prefix="LEGAL"
            role="MANAGER"
            people={people}
            peopleErrors={peopleErrors}
            allPeople={people}
            setPeople={setPeople}
            readOnly={readOnly}
          />
        </Grid>
      </Grid>

      <Grid item mb={10} mt={4}>
        <OnboardingStepActions
          back={{
            action: onBackAction,
            label: t('onboardingStep2.backLabel'),
            disabled: false,
          }}
          forward={{
            action: () => {
              validateUserData(people.LEGAL, 'LEGAL', externalInstitutionId, subProduct);
            },
            label: t('onboardingStep2.confirmLabel'),
            disabled: objectIsEmpty(people) || !validateUser('LEGAL', people.LEGAL, people),
          }}
        />
      </Grid>
      <SessionModal
        open={genericError}
        title={t('onboarding.outcomeContent.error.title')}
        message={
          <Trans i18nKey="onboarding.outcomeContent.error.description">
            {'A causa di un errore del sistema non è possibile completare la procedura.'} <br />
            {'Ti chiediamo di riprovare più tardi.'}
          </Trans>
        }
        onCloseLabel={t('onboarding.outcomeContent.error.backActionLabel')}
        handleClose={handleCloseGenericErrorModal}
      ></SessionModal>
    </Grid>
  );
}
