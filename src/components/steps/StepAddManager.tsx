import { FormControlLabel, Grid, Paper, Switch, Typography } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import SessionModal from '@pagopa/selfcare-common-frontend/lib/components/SessionModal';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/lib/hooks/useErrorDispatcher';
import { User } from '@pagopa/selfcare-common-frontend/lib/model/User';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { uniqueId } from 'lodash';
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { InstitutionType, Product, StepperStepComponentProps, UserOnCreate } from '../../../types';
import { useHistoryState } from '../../hooks/useHistoryState';
import { UserContext } from '../../lib/context';
import { objectIsEmpty } from '../../lib/object-utils';
import { OnboardingFormData } from '../../model/OnboardingFormData';
import { searchUserId } from '../../services/managerServices';
import { userValidate } from '../../services/validationServices';
import { isCedProduct } from '../../utils/institutionTypeUtils';
import { PlatformUserForm, validateUser } from '../forms/PlatformUserForm';
import { OnboardingStepActions } from '../registrationSteps/OnboardingStepActions';
import { RolesInformations } from '../shared/RolesInformations';

// Could be an ES6 Set but it's too bothersome for now
export type UsersObject = { [key: string]: UserOnCreate };
export type UsersError = { [key: string]: { [userField: string]: Array<string> } };
export const handleAuthUser = (
  _: ChangeEvent,
  value: boolean,
  people: UsersObject,
  setPeople: Dispatch<SetStateAction<UsersObject>>,
  setIsAuthUser: Dispatch<SetStateAction<boolean>>,
  user: User | null,
  userType: string
) => {
  if (value) {
    setPeople({
      ...people,
      [`${userType}-initial`]: Object.assign({}, user, { email: undefined }),
    });
  } else {
    setPeople({
      ...people,
      [`${userType}-initial`]: Object.assign({}, null, { email: undefined }),
    });
  }
  setIsAuthUser(value);
};

type Props = StepperStepComponentProps & {
  externalInstitutionId: string;
  addUserFlow: boolean;
  readOnly?: boolean;
  subProduct?: Product;
  isTechPartner?: boolean;
  onboardingFormData?: OnboardingFormData;
  selectedParty?: any;
  institutionType?: InstitutionType;
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
}: Props) {
  const { user, setRequiredLogin } = useContext(UserContext);
  const [_loading, setLoading] = useState(true);
  const [people, setPeople, setPeopleHistory] = useHistoryState<UsersObject>('people_step2', {});
  const [peopleErrors, setPeopleErrors] = useState<UsersError>({});
  const [isGenericError, setIsGenericError] = useState<boolean>(false);
  const [isChangedManager, setIsChangedManager] = useState<boolean>(false);
  const [isAuthUserManager, setIsAuthUserManager, setIsAuthUserManagerHistory] = useHistoryState(
    'isAuthUserManager',
    false
  );
  const addError = useErrorDispatcher();
  const requestIdRef = useRef<string>();
  const { t } = useTranslation();
  const premiumFlow = !!subProduct;

  useEffect(() => {
    if (isAuthUserManager) {
      setPeopleErrors(
        Object.fromEntries(
          Object.entries(peopleErrors).filter(([key]) => key !== 'manager-initial')
        )
      );
    }
  }, [isAuthUserManager]);

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

  const onUserValidateError = (userId: string, errors: { [fieldName: string]: Array<string> }) => {
    setPeopleErrors({
      [userId]: errors,
    });
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
      onForwardAction,
      onUserValidateError,
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
    setIsAuthUserManagerHistory(isAuthUserManager);
    setPeopleHistory(people);
  };

  const handleCloseGenericErrorModal = () => {
    setIsGenericError(false);
  };

  return (
    <Grid container display="flex" flexDirection="column" justifyContent="center">
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
              values={{ productTitle: product?.title, subProductTitle: subProduct?.title }}
            >
              {subProduct
                ? `Inserisci i dati del Legale Rappresentante del tuo ente. <1/> La persona che indicherai sarà firmataria del contratto per <3>{{subProductTitle}}<3/>.`
                : addUserFlow
                  ? `La persona indicata firmerà il Modulo di aggiunta per il nuovo Amministratore e lo <1 />autorizzerà ad operare sul prodotto <3>{{productTitle}}</3> per il tuo ente.`
                  : `Inserisci i dati del Legale Rappresentante del tuo ente. <1/> Sarà responsabile della firma del contratto per <3>{{productTitle}}</3> <4/> e avrà il ruolo di Amministratore per questo prodotto nell'Area Riservata.`}
            </Trans>
          </Typography>
        </Grid>
        <Grid item>
          <RolesInformations
            isTechPartner={isTechPartner}
            linkLabel={t('moreInformationOnRoles')}
          />
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={3}>
        <Paper
          elevation={8}
          sx={{ borderRadius: '16px', p: 4, maxWidth: '704px', width: '100%' }}
          role="group"
        >
          {isCedProduct(product?.id) && (
            <Grid item xs={12} display="flex" justifyContent="start">
              <FormControlLabel
                control={
                  <Switch
                    checked={isAuthUserManager}
                    onChange={(event) =>
                      handleAuthUser(
                        event,
                        !isAuthUserManager,
                        people,
                        setPeople,
                        setIsAuthUserManager,
                        user,
                        'manager'
                      )
                    }
                    sx={{ margin: 1 }}
                    data-testid="authUserSwitch-test"
                    aria-labelledby="authUserSwitch-label"
                  />
                }
                label={
                  <Typography variant="body1" id="authUserSwitch-label">
                    {t('stepAddDelegates.formControl.label')}
                  </Typography>
                }
                sx={{
                  alignSelf: 'center',
                  '.MuiSvgIcon-root': { color: theme.palette.primary.main },
                  padding: 2,
                }}
              />
            </Grid>
          )}
          <Grid item xs={12} display="flex" justifyContent="center">
            <PlatformUserForm
              prefix="manager-initial"
              role="MANAGER"
              people={people}
              peopleErrors={peopleErrors}
              allPeople={people}
              setPeople={setPeople}
              readOnly={readOnly}
              readOnlyFields={isAuthUserManager ? ['name', 'surname', 'taxCode'] : []}
              isAuthUser={isAuthUserManager}
              productId={product?.id}
            />
          </Grid>
        </Paper>
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
                void searchUserId(
                  people['manager-initial'].taxCode ?? '',
                  setLoading,
                  setRequiredLogin,
                  addError,
                  validateUserData,
                  people,
                  externalInstitutionId,
                  subProduct,
                  setIsChangedManager,
                  institutionType,
                  selectedParty,
                  onboardingFormData,
                  product
                );
              } else {
                validateUserData(
                  people['manager-initial'],
                  'manager-initial',
                  externalInstitutionId,
                  subProduct
                );
              }
            },
            label: t('stepAddManager.continue'),
            disabled:
              objectIsEmpty(people) ||
              !validateUser('manager-initial', people['manager-initial'], people),
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
        onConfirm={() =>
          validateUserData(
            people['manager-initial'],
            'manager-initial',
            externalInstitutionId,
            subProduct
          )
        }
        handleClose={() => setIsChangedManager(false)}
      />
    </Grid>
  );
}
