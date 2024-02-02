import Add from '@mui/icons-material/Add';
import { Box, Checkbox, FormControlLabel, Grid, Link, Typography, useTheme } from '@mui/material';
import SessionModal from '@pagopa/selfcare-common-frontend/components/SessionModal';
import { omit, uniqueId } from 'lodash';
import { ChangeEvent, useContext, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { StepperStepComponentProps, UserOnCreate } from '../../../../types';
import { ConfirmOnboardingModal } from '../../../components/ConfirmOnboardingRequest';
import { OnboardingStepActions } from '../../../components/OnboardingStepActions';
import { PlatformUserForm, validateUser } from '../../../components/PlatformUserForm';
import { useHistoryState } from '../../../components/useHistoryState';
import { UserContext } from '../../../lib/context';
import { objectIsEmpty } from '../../../lib/object-utils';
import { userValidate } from '../../../utils/api/userValidate';

// Could be an ES6 Set but it's too bothersome for now
export type UsersObject = { [key: string]: UserOnCreate };
export type UsersError = { [key: string]: { [userField: string]: Array<string> } };

type Props = StepperStepComponentProps & {
  legal?: UserOnCreate;
  externalInstitutionId: string;
  partyName: string;
  isTechPartner: boolean;
};

export function OnBoardingProductStepDelegates({
  externalInstitutionId,
  product,
  legal,
  forward,
  back,
  partyName,
  isTechPartner,
}: Props) {
  const { user, setRequiredLogin } = useContext(UserContext);
  const [_loading, setLoading] = useState(true);
  const [peopleErrors, setPeopleErrors] = useState<UsersError>({});
  const [genericError, setGenericError] = useState<boolean>(false);
  const [isAuthUser, setIsAuthUser, setIsAuthUserHistory] = useHistoryState('isAuthUser', false);
  const [people, setPeople, setPeopleHistory] = useHistoryState<UsersObject>('people_step3', {});
  const [delegateFormIds, setDelegateFormIds, setDelegateFormIdsHistory] = useHistoryState<
    Array<string>
  >('delegateFormIds', []);
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (isAuthUser) {
      setPeopleErrors(
        Object.fromEntries(
          Object.entries(peopleErrors).filter(([key]) => key !== 'delegate-initial')
        )
      );
    }
  }, [isAuthUser]);

  const allPeople = legal ? ({ ...people, LEGAL: legal } as UsersObject) : people;

  const validateUsers = (index: number, peopleErrors: UsersError) => {
    const userIds = Object.keys(people);
    if (index === userIds.length) {
      if (Object.keys(peopleErrors).length === 0) {
        // TODO hide modal for PT until copy is changed. Remove if case isTechPartner after copy is changed
        if (isTechPartner) {
          onForwardAction();
        } else {
          setOpenConfirmationModal(true);
        }
      }
      setPeopleErrors(peopleErrors);
      setLoading(false);
    }
    const userId = userIds[index];
    if (!isAuthUser) {
      validateUserData(people[userId], externalInstitutionId, userId, index, peopleErrors);
    } else {
      // TODO hide modal for PT until copy is changed. Remove if case isTechPartner after copy is changed
      if (isTechPartner) {
        onForwardAction();
      } else {
        setOpenConfirmationModal(true);
      }
    }
  };

  const onUserValidateSuccess = (_userId: string, index: number, peopleErrors: UsersError) => {
    validateUsers(index + 1, peopleErrors);
  };

  const onUserValidateError = (
    userId: string,
    errors: { [fieldName: string]: Array<string> },
    index: number,
    peopleErrors: UsersError
  ) => {
    const nextPeopleErrors = {
      ...peopleErrors,
      [userId]: errors,
    };
    validateUsers(index + 1, nextPeopleErrors);
  };

  const onUserValidateGenericError = (_userId: string, index: number, peopleErrors: UsersError) => {
    setGenericError(true);
    validateUsers(index + 1, peopleErrors);
  };

  const validateUserData = (
    user: UserOnCreate,
    externalInstitutionId: string,
    prefix: string,
    index: number,
    peopleErrors: UsersError
  ) => {
    userValidate(
      externalInstitutionId,
      user,
      prefix,
      (userId) => onUserValidateSuccess(userId, index, peopleErrors),
      (userId, errors) => onUserValidateError(userId, errors, index, peopleErrors),
      (userId) => onUserValidateGenericError(userId, index, peopleErrors),
      () => setRequiredLogin(true),
      () => {},
      'ONBOARDING_ADD_DELEGATE'
    ).catch((reason) => reason);
  };

  const addDelegateForm = () => {
    const newId = uniqueId('delegate-');
    setDelegateFormIds([...delegateFormIds, newId]);
    setPeople({
      ...people,
      [newId]: {} as UserOnCreate,
    });
  };

  const buildRemoveDelegateForm = (idToRemove: string) => (_: React.SyntheticEvent) => {
    const filteredDelegateFormIds = delegateFormIds.filter((id) => id !== idToRemove);
    setDelegateFormIds(filteredDelegateFormIds);
    setPeople(omit(people, idToRemove));
  };

  const onForwardAction = () => {
    savePageState();
    forward({ users: [legal].concat(Object.values(people)) });
  };

  const onBackAction = () => {
    savePageState();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    back!();
  };

  const savePageState = () => {
    setIsAuthUserHistory(isAuthUser);
    setPeopleHistory(people);
    setDelegateFormIdsHistory(delegateFormIds);
  };

  const handleAuthUser = (_: ChangeEvent, value: boolean) => {
    if (value) {
      setPeople({
        ...people,
        ['delegate-initial']: Object.assign({}, user, { email: undefined }),
      });
    } else {
      setPeople({
        ...people,
        ['delegate-initial']: Object.assign({}, null, { email: undefined }),
      });
    }
    setIsAuthUser(value);
  };
  const bodyTitle = t('onboardingStep3.bodyTitle');

  const theme = useTheme();
  const peopleCondition =
    objectIsEmpty(people) ||
    Object.keys(people)
      .filter((prefix) => 'LEGAL' !== prefix)
      .some((prefix) => !validateUser(prefix, people[prefix], allPeople, isAuthUser)) ||
    Object.keys(people).length === 3;

  const handleCloseGenericErrorModal = () => {
    setGenericError(false);
  };

  const handleCloseConfirmationModal = () => {
    setOpenConfirmationModal(false);
  };

  return (
    <Grid container direction="column">
      <Grid container item justifyContent="center">
        <Grid item xs={12}>
          <Typography variant="h3" component="h2" align="center">
            {bodyTitle}
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={1}>
        <Grid item xs={8}>
          <Typography variant="body1" align="center">
            <Trans
              i18nKey="onboardingStep3.bodyDescription1"
              values={{ productTitle: product?.title }}
              components={{ 1: <br />, 3: <br /> }}
            >
              {`Puoi aggiungere da uno a tre Amministratori o suoi delegati. <1/> Saranno i responsabili della gestione di {{productTitle}} e presenti nel contratto di <3 />adesione come delegati dal Legale Rappresentante.`}
            </Trans>
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={4}>
        <Grid item xs={4} display="flex" justifyContent="center">
          <FormControlLabel
            control={<Checkbox checked={isAuthUser} onChange={handleAuthUser} />}
            label={
              <Typography variant="body1">{t('onboardingStep3.formControl.label')}</Typography>
            }
            sx={{
              alignSelf: 'center',
              '.MuiSvgIcon-root': { color: theme.palette.primary.main },
            }}
          />
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={4}>
        <Grid item xs={8} display="flex" justifyContent={'center'}>
          <PlatformUserForm
            prefix={'delegate-initial'}
            role="DELEGATE"
            people={people}
            peopleErrors={peopleErrors}
            allPeople={allPeople}
            setPeople={setPeople}
            readOnlyFields={isAuthUser ? ['name', 'surname', 'taxCode'] : []}
            isAuthUser={isAuthUser}
          />
        </Grid>
        {delegateFormIds.map((id) => (
          <Grid item xs={8} mt={4} display="flex" justifyContent={'center'} key={id}>
            <PlatformUserForm
              prefix={id}
              role="DELEGATE"
              people={people}
              peopleErrors={peopleErrors}
              allPeople={allPeople}
              setPeople={setPeople}
              isExtraDelegate={true}
              delegateId={id}
              buildRemoveDelegateForm={buildRemoveDelegateForm}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container item my={4} display="flex" justifyContent="center">
        <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'center' }}>
          {Object.keys(people).length !== 3 && (
            <Link
              component="button"
              disabled={peopleCondition}
              onClick={addDelegateForm}
              sx={{
                textDecoration: 'none',
                cursor: peopleCondition ? 'default' : 'pointer',
                opacity: peopleCondition ? 0.5 : 1,
              }}
            >
              <Box display={'flex'} alignItems={'center'}>
                <Add fontSize="small" color="primary" sx={{ mr: 1 }} />
                <Typography color="primary" sx={{ fontWeight: 'fontWeightBold', fontSize: '18px' }}>
                  {t('onboardingStep3.addUserLink')}
                </Typography>
              </Box>
            </Link>
          )}
        </Grid>
      </Grid>

      <OnboardingStepActions
        back={{ action: onBackAction, label: t('onboardingStep3.backLabel'), disabled: false }}
        forward={{
          action: () => {
            setLoading(true);
            validateUsers(0, {});
          },
          label: t('onboardingStep3.confirmLabel'),
          disabled:
            objectIsEmpty(people) ||
            Object.keys(people)
              .filter((prefix) => 'LEGAL' !== prefix)
              .some((prefix) => !validateUser(prefix, people[prefix], allPeople, isAuthUser)),
        }}
      />

      <ConfirmOnboardingModal
        open={openConfirmationModal}
        partyName={partyName}
        productName={product?.title}
        handleClose={handleCloseConfirmationModal}
        onConfirm={onForwardAction}
      />
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
      />
    </Grid>
  );
}
