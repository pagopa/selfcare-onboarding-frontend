import React, { ChangeEvent, useContext, useState } from 'react';
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
import { AxiosError, AxiosResponse } from 'axios';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { objectIsEmpty } from '../../../lib/object-utils';
import { StepperStepComponentProps, UserOnCreate } from '../../../../types';
import { UserContext } from '../../../lib/context';
import { OnboardingStepActions } from '../../../components/OnboardingStepActions';
import { PlatformUserForm, validateUser } from '../../../components/PlatformUserForm';
import { useHistoryState } from '../../../components/useHistoryState';
import { ValidateErrorType } from '../Onboarding';
import { fetchWithLogs } from '../../../lib/api-utils';
import { getFetchOutcome } from '../../../lib/error-utils';

// Could be an ES6 Set but it's too bothersome for now
export type UsersObject = { [key: string]: UserOnCreate };
export type UsersError = { [key: string]: { [userField: string]: Array<string> } };

type Props = StepperStepComponentProps & {
  legal: UserOnCreate;
};

export function OnBoardingProductStepDelegates({ product, legal, forward, back }: Props) {
  const { user, setRequiredLogin } = useContext(UserContext);
  const [errorField, setErrorField] = useState<UsersError>();
  const [isAuthUser, setIsAuthUser, setIsAuthUserHistory] = useHistoryState('isAuthUser', false);
  const [people, setPeople, setPeopleHistory] = useHistoryState<UsersObject>('people_step3', {});
  const [delegateFormIds, setDelegateFormIds, setDelegateFormIdsHistory] = useHistoryState<
    Array<string>
  >('delegateFormIds', []);
  const [_validateError, setValidateError] = useState<ValidateErrorType>();
  const { t } = useTranslation();

  const allPeople = { ...people, LEGAL: legal };

  const validateUserData = async (taxCode: string, name: string, surname: string) => {
    const resultValidation = await fetchWithLogs(
      {
        endpoint: 'ONBOARDING_USER_VALIDATION',
        endpointParams: { taxCode },
      },
      {
        method: 'POST',
        data: {
          taxCode,
          name,
          surname,
        },
      },
      () => setRequiredLogin(true)
    );

    const result = getFetchOutcome(resultValidation);

    if (result === 'success') {
      setValidateError(undefined);
      onForwardAction();
    } else if (result === 'error' && (resultValidation as AxiosError).response?.status === 409) {
      setValidateError('conflictError');
      const error = (resultValidation as AxiosResponse).data;
      setErrorField(error);
      trackEvent('STEP_DELEGATE_CONFLICT_ERROR', {
        product_id: product?.id,
        error_field: errorField,
      });
    } else {
      onForwardAction();
      setValidateError(undefined);
    }
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
            peopleErrors={errorField}
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
                peopleErrors={errorField}
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
      {console.log(errorField)}
      <OnboardingStepActions
        back={{ action: onBackAction, label: t('onboardingStep3.backLabel'), disabled: false }}
        forward={{
          action: () =>
            validateUserData(
              people.userField?.taxCode,
              people.userField?.name,
              people.userField?.surname
            ),
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
