import {
  FormControl,
  FormControlLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  Typography,
  useTheme,
} from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { isArray } from 'lodash';
import {
  IPACatalogParty,
  InstitutionType,
  Product,
  RequestOutcomeMessage,
  StepperStepComponentProps,
} from '../../../types';
import { OnboardingStepActions } from '../registrationSteps/OnboardingStepActions';
import { useHistoryState } from '../../hooks/useHistoryState';
import { description4InstitutionType } from '../../utils/constants';
import { LoadingOverlay } from '../modals/LoadingOverlay';
import { getInstiutionTypesByProduct } from '../../services/onboardingServices';
import { InstitutionOrigins } from '../../model/InstitutionOrigins';

type Props = StepperStepComponentProps & {
  institutionType: InstitutionType;
  fromDashboard: boolean;
  selectedProduct?: Product | null;
  productId?: string;
  setOrigin: Dispatch<SetStateAction<string | undefined>>;
  productAvoidStep: boolean;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setRequiredLogin: Dispatch<SetStateAction<boolean>>;
  setOutcome: Dispatch<SetStateAction<RequestOutcomeMessage | null | undefined>>;
  genericError: RequestOutcomeMessage;
};

export default function StepInstitutionType({
  institutionType,
  fromDashboard,
  selectedProduct,
  productId,
  forward,
  back,
  setOrigin,
  productAvoidStep,
  loading,
  setLoading,
  setRequiredLogin,
  setOutcome,
  genericError,
}: Props) {
  const [selectedValue, setSelectedValue] = useState<InstitutionType>(institutionType);
  const setSelectedHistory = useHistoryState<IPACatalogParty | null>('selected_step1', null)[2];
  const selectedValueRef = useRef<InstitutionType>(selectedValue);
  const [retrivedInstitutionType, setRetrivedInstituionType] = useState<InstitutionOrigins>();
  const { t } = useTranslation();
  const theme = useTheme();

  useEffect(() => {
    void getInstiutionTypesByProduct(
      setLoading,
      productId,
      setRetrivedInstituionType,
      setRequiredLogin,
      setOutcome,
      genericError
    );
  }, [productId]);

  useEffect(() => {
    if (retrivedInstitutionType && productAvoidStep) {
      const firstInstitution = retrivedInstitutionType.origins[0];
      if (firstInstitution) {
        handleChange(firstInstitution.institutionType, firstInstitution.origin);
        forward(firstInstitution.institutionType);
      }
    }
  }, [retrivedInstitutionType, productAvoidStep, selectedProduct?.id]);

  const handleChange = (value: InstitutionType, origin: string | Array<string>) => {
    if (value !== selectedValueRef.current) {
      setSelectedHistory(null);
    }
    setSelectedValue(value);
    const finalOrigin = isArray(origin) ? origin[0] : origin;
    setOrigin(finalOrigin);
  };

  const onForwardAction = () => {
    forward(selectedValue);
  };


  if (loading || !retrivedInstitutionType) {
    return <LoadingOverlay loadingText={t('onboardingStep1.loadingOverlayText')} />;
  }

  return (
    <Grid container display="flex" justifyContent="center" alignItems="center">
      <Grid item xs={12} display="flex" justifyContent="center">
        <Typography variant="h3" align="center" pb={1}>
          <Trans i18nKey="stepInstitutionType.title">
            Seleziona il tipo di ente che <br /> rappresenti
          </Trans>
        </Typography>
      </Grid>
      <Grid item xs={12} display="flex" justifyContent="center">
        <Typography variant="body1" align="center" pb={4}>
          <Trans
            i18nKey="stepInstitutionType.subtitle"
            values={{ productName: selectedProduct?.title }}
            components={{ 1: <strong /> }}
          >
            {`Indica il tipo di ente che aderirà a <1>{{productName}}</1>`}
          </Trans>
        </Typography>
      </Grid>
      <Paper
        elevation={8}
        sx={{ borderRadius: theme.spacing(2), p: 1, width: '580px', height: '100%' }}
      >
        <Grid container item>
          <Grid item xs={12} p={3}>
            <FormControl>
              <RadioGroup name="radio-buttons-group" defaultValue={institutionType}>
                {retrivedInstitutionType?.origins.map((ot) => (
                  <FormControlLabel
                    sx={{ p: '8px' }}
                    key={ot.labelKey}
                    onChange={() => handleChange(ot.institutionType, ot.origin)}
                    value={ot.institutionType}
                    control={
                      <Radio
                        id={ot.labelKey}
                        inputProps={{
                          'aria-label': t(
                            `stepInstitutionType.institutionTypes.${ot.labelKey}.title`
                          ),
                        }}
                      />
                    }
                    label={
                      <>
                        <Typography sx={{ fontWeight: 600, fontSize: '18px', color: '#17324D' }}>
                          {t(`stepInstitutionType.institutionTypes.${ot.labelKey}.title`)}
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 400,
                            fontSize: '14px',
                            color: '#5C6F82',
                          }}
                        >
                          {t(description4InstitutionType(ot.labelKey, ot.institutionType))}
                        </Typography>
                      </>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      <Grid item xs={12} mt={2}>
        <OnboardingStepActions
          back={
            fromDashboard
              ? {
                  action: back,
                  label: t('onboardingStep1.onboarding.onboardingStepActions.backAction'),
                  disabled: false,
                }
              : undefined
          }
          forward={{
            action: onForwardAction,
            label: t('stepInstitutionType.confirmLabel'),
            disabled: !selectedValue,
          }}
        />
      </Grid>
    </Grid>
  );
}
