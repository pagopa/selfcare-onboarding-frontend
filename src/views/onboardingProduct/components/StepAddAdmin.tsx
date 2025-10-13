import Add from '@mui/icons-material/Add';
import { Box, Checkbox, FormControlLabel, Grid, Link, Typography, useTheme } from '@mui/material';
import SessionModal from '@pagopa/selfcare-common-frontend/lib/components/SessionModal';
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
import { RolesInformations } from '../../../components/RolesInformations';

// Could be an ES6 Set but it's too bothersome for now
export type UsersObject = { [key: string]: UserOnCreate };
export type UsersError = { [key: string]: { [userField: string]: Array<string> } };

type Props = StepperStepComponentProps & {
  legal?: UserOnCreate;
  externalInstitutionId: string;
  partyName: string;
  isTechPartner: boolean | undefined;
  addUserFlow: boolean;
  isAggregator?: boolean;
};

export function StepAddAdmin({
  externalInstitutionId,
  product,
  legal,
  forward,
  back,
  partyName,
  isTechPartner,
  addUserFlow,
  isAggregator,
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

  const allPeople = legal ? ({ ...people, ['manager-initial']: legal } as UsersObject) : people;

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
      if (isTechPartner || isAggregator) {
        onForwardAction();
      } else {
        setOpenConfirmationModal(true);
      }
    }
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
      () => validateUsers(index + 1, peopleErrors),
      (userId, errors) => onUserValidateError(userId, errors, index, peopleErrors),
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

  const theme = useTheme();
  const peopleCondition =
    objectIsEmpty(people) ||
    Object.keys(people)
      .filter((prefix) => 'manager-initial' !== prefix)
      .some(
        (prefix) => !validateUser(prefix, people[prefix], allPeople, addUserFlow, isAuthUser)
      ) ||
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
            {t('stepAddDelegates.title')}
          </Typography>
        </Grid>
      </Grid>

      <Grid
        container
        item
        sx={{ justifyContent: 'center', justifyItems: 'center', display: 'grid' }}
        mt={1}
      >
        <Grid item xs={12} mb={1}>
          <Typography variant="body1" color={theme.palette.text.primary} align="center">
            {isTechPartner ? (
              <Trans i18nKey="stepAddDelegates.description.flow.pt" components={{ 1: <br /> }}>
                {`Puoi aggiungere da uno a tre Amministratori o suoi delegati.<1/> 
              Si occuperanno della gestione degli utenti e dei prodotti per conto degli enti.`}
              </Trans>
            ) : addUserFlow ? (
              <Trans
                i18nKey="stepAddDelegates.description.flow.addNewUser"
                components={{ 1: <br />, 3: <br /> }}
              >
                {`Puoi aggiungere un Amministratore o un suo delegato. Puoi inserire anche la persona che <1 />hai già indicato come Legale Rappresentante. Se aggiungi una persona già presente con un <3 />ruolo diverso per questo prodotto, verrà inserita come Amministratore.`}
              </Trans>
            ) : (
              <Trans
                i18nKey="stepAddDelegates.description.flow.onboarding"
                values={{ productTitle: product?.title }}
                components={{ 1: <br />, 3: <strong />, 4: <br /> }}
              >
                {`Puoi aggiungere da uno a tre Amministratori o suoi delegati. <1/> Saranno i responsabili della gestione di <3>{{productTitle}}</3> e presenti nel contratto di <4 />adesione come delegati dal Legale Rappresentante.`}
              </Trans>
            )}
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <RolesInformations
            isTechPartner={isTechPartner}
            linkLabel={t('moreInformationOnRoles')}
          />
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={3}>
        <Grid item xs={4} display="flex" justifyContent="center">
          <FormControlLabel
            control={<Checkbox checked={isAuthUser} onChange={handleAuthUser} />}
            label={
              <Typography variant="body1">{t('stepAddDelegates.formControl.label')}</Typography>
            }
            sx={{
              alignSelf: 'center',
              '.MuiSvgIcon-root': { color: theme.palette.primary.main },
            }}
          />
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={3}>
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
            addUserFlow={addUserFlow}
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
              addUserFlow={addUserFlow}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container item my={addUserFlow ? 0 : 4} display="flex" justifyContent="center">
        <Grid item xs={6} sx={{ display: addUserFlow ? 'none' : 'flex', justifyContent: 'center' }}>
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
                  {t('stepAddDelegates.addUserLink')}
                </Typography>
              </Box>
            </Link>
          )}
        </Grid>
      </Grid>

      <OnboardingStepActions
        addUserFlow={addUserFlow}
        back={{ action: onBackAction, label: t('stepAddDelegates.backLabel'), disabled: false }}
        forward={{
          action: () => {
            setLoading(true);
            validateUsers(0, {});
          },
          label: t('stepAddDelegates.confirmLabel'),
          disabled:
            objectIsEmpty(people) ||
            Object.keys(people)
              .filter((prefix) => 'manager-initial' !== prefix)
              .some(
                (prefix) =>
                  !validateUser(prefix, people[prefix], allPeople, addUserFlow, isAuthUser)
              ),
        }}
      />

      <ConfirmOnboardingModal
        open={openConfirmationModal}
        addUser={addUserFlow}
        partyName={partyName}
        productName={product?.title}
        handleClose={handleCloseConfirmationModal}
        onConfirm={onForwardAction}
      />
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
