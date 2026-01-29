import { Grid, Paper, TextField, Typography } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { User } from '@pagopa/selfcare-common-frontend/lib/model/User';
import { emailRegexp } from '@pagopa/selfcare-common-frontend/lib/utils/constants';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { StepperStepComponentProps } from '../../../../types';
import { ConfirmOnboardingModal } from '../../../components/modals/ConfirmOnboardingRequest';
import { OnboardingStepActions } from '../../../components/registrationSteps/OnboardingStepActions';
import { UserRequester } from '../../../model/OnboardingFormData';

type Props = {
  forward: (userRequester: UserRequester) => void;
  back?: () => void;
  user: User | null;
  addUser: boolean;
  partyName: string | undefined;
  productName: string | undefined;
} & StepperStepComponentProps;

const StepAddApplicantEmail = ({ forward, back, user, addUser, partyName, productName }: Props) => {
  const { t } = useTranslation();
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [userRequester, setUserRequester] = useState<UserRequester>({
    name: user?.name ?? '',
    surname: user?.surname ?? '',
    email: '',
  });

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUserRequester({ ...userRequester, email: e.target.value });
  };

  const isEmailValid =
    userRequester.email.length === 0 ? false : emailRegexp.test(userRequester.email);

  const onForwardAction = () => {
    setOpenConfirmationModal(true);
  };

  return (
    <Grid container direction="column">
      <Grid container item justifyContent="center">
        <Grid item xs={12}>
          <Typography variant="h3" component="h2" align="center" sx={{ lineHeight: '1.2' }}>
            <Trans i18nKey="stepAddApplicantEmail.title">Indica la tua email</Trans>
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={1}>
        <Grid item xs={12} mb={1}>
          <Typography sx={{ fontWeight: 400 }} variant="body1" component="h2" align="center">
            <Trans i18nKey="stepAddApplicantEmail.description" components={{ 1: <br /> }}>
              {
                'Inserisci la tua email per ricevere una conferma quando la tua richiesta sarà stata elaborata <1/> con successo'
              }
            </Trans>
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={1}>
        <Paper elevation={8} sx={{ borderRadius: theme.spacing(2), p: 4, width: '704px' }}>
          <Grid item container spacing={3}>
            <Grid item xs={6}>
              <TextField
                id={'name-applicant'}
                variant="outlined"
                label={t('stepAddApplicantEmail.applicantName')}
                type={'text'}
                value={userRequester.name}
                sx={{
                  width: '100%',
                  '& .MuiOutlinedInput-root.MuiInputBase-root': {
                    fontWeight: 'fontWeightMedium',
                  },
                }}
                inputProps={{
                  'data-testid': 'name-applicant-test',
                }}
                error={false}
                disabled={true}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id={'surname-applicant'}
                variant="outlined"
                label={t('stepAddApplicantEmail.applicantSurname')}
                type={'text'}
                value={userRequester.surname}
                sx={{
                  width: '100%',
                  '& .MuiOutlinedInput-root.MuiInputBase-root': {
                    fontWeight: 'fontWeightMedium',
                  },
                }}
                inputProps={{
                  'data-testid': 'surname-applicant-test',
                }}
                error={false}
                disabled={true}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id={'email-applicant'}
                variant="outlined"
                label={t('stepAddApplicantEmail.applicantEmail')}
                type={'text'}
                value={userRequester.email}
                sx={{
                  width: '100%',
                  '& .MuiOutlinedInput-root.MuiInputBase-root': {
                    fontWeight: 'fontWeightMedium',
                  },
                }}
                inputProps={{
                  'data-testid': 'email-applicant-test',
                }}
                error={!isEmailValid && userRequester.email.length > 0}
                helperText={
                  !isEmailValid && userRequester.email.length > 0
                    ? t('onboardingFormData.billingDataSection.invalidEmail')
                    : ''
                }
                onChange={(e) => handleEmailChange(e)}
                disabled={false}
              />
            </Grid>
            <Grid item xs={12} mb={2}>
              <OnboardingStepActions
                back={{
                  action: back,
                  label: t('onboardingFormData.backLabel'),
                  disabled: false,
                }}
                forward={{
                  action: onForwardAction,
                  label: t('onboardingFormData.confirmLabel'),
                  disabled: !isEmailValid,
                }}
              />
            </Grid>
            <ConfirmOnboardingModal
              open={openConfirmationModal}
              addUser={addUser}
              partyName={partyName}
              productName={productName}
              handleClose={() => setOpenConfirmationModal(false)}
              onConfirm={() => forward(userRequester)}
            />
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default StepAddApplicantEmail;
