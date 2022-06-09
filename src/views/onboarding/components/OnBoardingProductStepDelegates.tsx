import React, { ChangeEvent, useContext } from 'react';
import {
  Checkbox,
  FormControlLabel,
  IconButton,
  Link,
  Grid,
  Typography,
  useTheme,
} from '@mui/material';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import { omit, uniqueId } from 'lodash';
// import { Box } from '@mui/system';
import { useTranslation, Trans } from 'react-i18next';
import useLoading from '@pagopa/selfcare-common-frontend/hooks/useLoading';
import { objectIsEmpty } from '../../../lib/object-utils';
import { StepperStepComponentProps, UserOnCreate } from '../../../../types';
import { UserContext } from '../../../lib/context';
import { OnboardingStepActions } from '../../../components/OnboardingStepActions';
import { PlatformUserForm, validateUser } from '../../../components/PlatformUserForm';
import { useHistoryState } from '../../../components/useHistoryState';

// Could be an ES6 Set but it's too bothersome for now
export type UsersObject = { [key: string]: UserOnCreate };

type Props = StepperStepComponentProps & {
  legal: UserOnCreate;
};

export function OnBoardingProductStepDelegates({ product, legal, forward, back }: Props) {
  const validateUserData = async (taxCode: string, name: string, surname: string) => {
    await fetchWithLogs(
      {
        endpoint: 'ONBOARDING_USER_VALIDATION',
        endpointParams: { taxCode: people[prefix].taxCode },
      },
      {
        method: 'POST',
        data: {
          taxCode: people[prefix].taxCode,
          name: people[prefix].name,
          surname: people[prefix].surname,
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
      setOutcome(buildNotBasicProduct(productTitle, productId, history));
      return false;
    } else {
      return true;
    }
  };

  const { user } = useContext(UserContext);
  const [isAuthUser, setIsAuthUser, setIsAuthUserHistory] = useHistoryState('isAuthUser', false);
  const [people, setPeople, setPeopleHistory] = useHistoryState<UsersObject>('people_step3', {});
  const [delegateFormIds, setDelegateFormIds, setDelegateFormIdsHistory] = useHistoryState<
    Array<string>
  >('delegateFormIds', []);
  const { t } = useTranslation();

  const allPeople = { ...people, LEGAL: legal };

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

  const fetchValidateUser = (taxCode: string, name: string, surname: string) => {
    validateUserData(taxCode, partyId)
      .then((userRegistry) => {
        void formik.setValues(
          {
            ...formik.values,
            name:
              userRegistry?.name ??
              (formik.values.certifiedName ? initialFormData.name : formik.values.name),
            surname:
              userRegistry?.surname ??
              (formik.values.certifiedSurname ? initialFormData.surname : formik.values.surname),
            email:
              userRegistry?.email ??
              (formik.values.certifiedMail ? initialFormData.email : formik.values.email),
            confirmEmail: '',
            certifiedName:
              userRegistry?.certifiedName ??
              (formik.values.certifiedName
                ? initialFormData.certifiedName
                : formik.values.certifiedName),
            certifiedSurname:
              userRegistry?.certifiedSurname ??
              (formik.values.certifiedSurname
                ? initialFormData.certifiedSurname
                : formik.values.certifiedSurname),
          },
          true
        );
      })
      .catch((errors) =>
        addError({
          id: 'FETCH_TAX_CODE',
          blocking: false,
          error: errors,
          techDescription: `An error occurred while fetching Tax Code of Product ${taxCode}`,
          toNotify: true,
        })
      )
      .finally(() => setLoadingFetchTaxCode(false));
  };

  const onForwardAction = () => {
    validateUserData();
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
  const bodyDescription1 = t('onboardingStep3.bodyDescription1');
  const bodyDescription2 = (
    <Trans i18nKey="onboardingStep3.bodyDescription2">
      {'La persona che indicherai sarà responsabile della gestione di'} <br />
      {{ productTitle: product?.title }}
    </Trans>
  );
  const theme = useTheme();
  const peopleCondition =
    objectIsEmpty(people) ||
    Object.keys(people)
      .filter((prefix) => 'LEGAL' !== prefix)
      .some((prefix) => !validateUser(prefix, people[prefix], allPeople)) ||
    Object.keys(people).length === 3;

  return (
    <Grid
      container
      // mt={16}
      direction="column"
    >
      <Grid container item justifyContent="center">
        <Grid item xs={12}>
          <Typography variant="h3" component="h2" align="center">
            {bodyTitle}
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={1}>
        <Grid item xs={12}>
          <Typography variant="body1" align="center">
            {bodyDescription1}
            <br />
            {bodyDescription2}
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
        <Grid item xs={8} sx={{ boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.06)' }}>
          <PlatformUserForm
            prefix={'delegate-initial'}
            role="DELEGATE"
            people={people}
            allPeople={allPeople}
            setPeople={setPeople}
            readOnlyFields={isAuthUser ? ['name', 'surname', 'taxCode'] : []}
          />
        </Grid>

        {delegateFormIds.map((id) => (
          <React.Fragment key={id}>
            <Grid item xs={10} justifyContent="center" mt={6} mb={3}>
              <Typography align="center" variant="h4" data-testid="extra-delegate">
                {t('onboardingStep3.addUserLabel')}
              </Typography>
            </Grid>
            <Grid
              item
              xs={8}
              sx={{ boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.06)', position: 'relative' }}
            >
              <PlatformUserForm
                prefix={id}
                role="DELEGATE"
                people={people}
                allPeople={allPeople}
                setPeople={setPeople}
              />
              <IconButton
                color="primary"
                onClick={buildRemoveDelegateForm(id)}
                style={{ position: 'absolute', top: '2px', right: '2px', zIndex: 100 }}
              >
                <ClearOutlinedIcon />
              </IconButton>
            </Grid>
          </React.Fragment>
        ))}
      </Grid>

      {/* <Box sx={{ textAlign: 'center' }} > */}

      <Grid container item my={4} display="flex" justifyContent="center">
        <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'center' }}>
          {Object.keys(people).length !== 3 && (
            <Link
              component="button"
              disabled={peopleCondition}
              onClick={addDelegateForm}
              sx={{
                fontSize: 'htmlFontSize',
                lineHeight: '24px',
                fontFamily: '"Titillium Web", "sans-serif"',
                textDecoration: 'none',
                cursor: peopleCondition ? 'default' : 'pointer',
                color: theme.palette.primary.main,
                opacity: peopleCondition ? 0.5 : 1,
              }}
            >
              {t('onboardingStep3.addUserLink')}
            </Link>
          )}
        </Grid>
      </Grid>
      <OnboardingStepActions
        back={{ action: onBackAction, label: t('onboardingStep3.backLabel'), disabled: false }}
        forward={{
          action: onForwardAction,
          label: t('onboardingStep3.confirmLabel'),
          disabled:
            objectIsEmpty(people) ||
            Object.keys(people)
              .filter((prefix) => 'LEGAL' !== prefix)
              .some((prefix) => !validateUser(prefix, people[prefix], allPeople)),
        }}
      />
      {/* </Box> */}
    </Grid>
  );
}
