import { Grid, Typography } from '@mui/material';
import SessionModal from '@pagopa/selfcare-common-frontend/components/SessionModal';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { uniqueId } from 'lodash';
import { useContext, useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Product, StepperStepComponentProps, UserOnCreate } from '../../../types';
import { UserContext } from '../../lib/context';
import { objectIsEmpty } from '../../lib/object-utils';
import { userValidate } from '../../utils/api/userValidate';
import { OnboardingStepActions } from '../OnboardingStepActions';
import { PlatformUserForm, validateUser } from '../PlatformUserForm';
import { useHistoryState } from '../useHistoryState';
import { RolesInformations } from '../RolesInformations';

// Could be an ES6 Set but it's too bothersome for now
export type UsersObject = { [key: string]: UserOnCreate };
export type UsersError = { [key: string]: { [userField: string]: Array<string> } };

type Props = StepperStepComponentProps & {
  externalInstitutionId: string;
  addUserFlow: boolean;
  readOnly?: boolean;
  subProduct?: Product;
  isTechPartner?: boolean;
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
            <Trans i18nKey="stepAddManager.title">Indica il Legale Rappresentante</Trans>
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={1}>
        <Grid item xs={12} mb={2}>
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
                ? `Inserisci i dati del Legale Rappresentante o del procuratore del tuo ente. <1/> La persona che indicherai sarà firmataria del contratto per <3/> <strong>Premium<strong/>.`
                : addUserFlow
                ? `La persona indicata firmerà il Modulo di aggiunta per il nuovo Amministratore e lo <1 />autorizzerà ad operare sul prodotto <3>{{productTitle}}</3> per il tuo ente.`
                : `Inserisci i dati del Legale Rappresentante o del procuratore del tuo ente. <1/> Sarà responsabile della firma del contratto per <3>{{productTitle}}</3>. <4/> e avrà il ruolo di Amministratore per questo prodotto nell'Area Riservata.`}
            </Trans>
          </Typography>
        </Grid>
        <Grid item>
          <RolesInformations isTechPartner={isTechPartner} />
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
            addUserFlow={addUserFlow}
          />
        </Grid>
      </Grid>

      <Grid item mb={10} mt={4}>
        <OnboardingStepActions
          back={{
            action: onBackAction,
            label: t('stepAddManager.back'),
            disabled: false,
          }}
          forward={{
            action: () => {
              validateUserData(people.LEGAL, 'LEGAL', externalInstitutionId, subProduct);
            },
            label: t('stepAddManager.continue'),
            disabled:
              objectIsEmpty(people) || !validateUser('LEGAL', people.LEGAL, people, addUserFlow),
          }}
        />
      </Grid>
      <SessionModal
        open={genericError}
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
    </Grid>
  );
}
