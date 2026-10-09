import { Box, Checkbox, Grid, Typography } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { Dispatch, useState } from 'react';
import { Trans } from 'react-i18next';
import { InstitutionType, PaymentServiceProviderDto } from '../../../../types';
import { OnboardingControllers } from '../../../hooks/useOnboardingControllers';
import {
  isFideiussioniGuaranteeProduct,
  isFideiussioniProduct,
  isInsuranceCompany,
  isPaymentServiceProvider,
  isPrivateMerchantInstitution,
} from '../../../utils/institutionTypeUtils';
import { CustomTextField } from '../../../utils/style-utils';
import { StepBillingDataHistoryState } from '../../steps/StepOnboardingFormData';

type Props = {
  controllers: OnboardingControllers;
  formik: any;
  onboardingFormData?: any;
  institutionType: InstitutionType;
  productId?: string;
  stepHistoryState: StepBillingDataHistoryState;
  setStepHistoryState: Dispatch<React.SetStateAction<StepBillingDataHistoryState>>;
  baseTextFieldProps?: any;
  t: (key: string) => string;
  pspData: PaymentServiceProviderDto | undefined;
};

const VatNumberData = ({
  controllers,
  formik,
  onboardingFormData,
  institutionType,
  productId,
  stepHistoryState,
  setStepHistoryState,
  baseTextFieldProps,
  t,
  pspData,
  // eslint-disable-next-line complexity
}: Props) => {
  const [shrinkVatNumber, setShrinkVatNumber] = useState<boolean>(false);

  return (
    <>
      {!controllers.isForeignInsurance && (
        <Grid
          container
          item
          spacing={3}
          xs={12}
          pl={3}
          pt={
            !controllers.isForeignInsurance ||
            (formik.values.hasVatnumber && onboardingFormData?.taxCode !== '')
              ? 3
              : 0
          }
          mb={
            !formik.values.hasVatnumber &&
            controllers.isInvoiceable &&
            isInsuranceCompany(institutionType)
              ? -3
              : 0
          }
        >
          {formik.values.hasVatnumber &&
            (!isInsuranceCompany(institutionType) ||
              (onboardingFormData?.taxCode && onboardingFormData?.taxCode !== '')) &&
            !isPrivateMerchantInstitution(institutionType, productId) && (
              <Grid item>
                <Box display="flex" alignItems="center">
                  <Checkbox
                    id="taxCodeEquals2VatNumber"
                    checked={stepHistoryState.isTaxCodeEquals2PIVA}
                    disabled={controllers.isPremium || formik.values.taxCode.length !== 11}
                    inputProps={{
                      'aria-label': t(
                        'onboardingFormData.billingDataSection.taxCodeEquals2PIVAdescription'
                      ),
                    }}
                    onChange={(e) => {
                      setStepHistoryState({
                        ...stepHistoryState,
                        isTaxCodeEquals2PIVA: e.target.checked,
                      });
                    }}
                  />
                  <Typography component={'span'}>
                    {t('onboardingFormData.billingDataSection.taxCodeEquals2PIVAdescription')}
                  </Typography>
                </Box>
              </Grid>
            )}
          {!isFideiussioniProduct(productId) &&
            !isFideiussioniGuaranteeProduct(productId) &&
            !isPrivateMerchantInstitution(institutionType, productId) && (
              <Grid item>
                <Box
                  display="flex"
                  alignItems="center"
                  marginBottom={!formik.values.hasVatnumber && controllers.isInvoiceable ? -2 : 0}
                >
                  <Checkbox
                    id="party_without_vatnumber"
                    inputProps={{
                      'aria-label': t(
                        'onboardingFormData.billingDataSection.partyWithoutVatNumber'
                      ),
                    }}
                    onChange={(e) => {
                      formik.setFieldValue('hasVatnumber', !e.target.checked);
                      setStepHistoryState({
                        ...stepHistoryState,
                        isTaxCodeEquals2PIVA: false,
                      });
                    }}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography component={'span'}>
                      {t('onboardingFormData.billingDataSection.partyWithoutVatNumber')}
                    </Typography>
                    <Typography variant={'caption'} sx={{ fontWeight: '400', color: '#5C6F82' }}>
                      <Trans
                        i18nKey="onboardingFormData.billingDataSection.partyWIthoutVatNumberSubtitle"
                        components={{ 1: <br /> }}
                      >
                        {`Indica solo il Codice Fiscale se il tuo ente non agisce nell'esercizio d'impresa,
                arte o professione <1 />(cfr. art. 21, comma 2, lett. f, DPR n. 633/1972)`}
                      </Trans>
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
        </Grid>
      )}
      <Grid item xs={12}>
        <Typography component={'span'}>
          {formik.values.hasVatnumber && !controllers.isForeignInsurance && (
            <CustomTextField
              {...baseTextFieldProps(
                'vatNumber',
                t('onboardingFormData.billingDataSection.vatNumber'),
                600,
                stepHistoryState.isTaxCodeEquals2PIVA || controllers.isPremium
                  ? theme.palette.text.disabled
                  : theme.palette.text.primary
              )}
              value={formik.values.vatNumber}
              disabled={
                stepHistoryState.isTaxCodeEquals2PIVA ||
                controllers.isPremium ||
                isPrivateMerchantInstitution(institutionType, productId)
              }
              onClick={() => setShrinkVatNumber(true)}
              onBlur={() => setShrinkVatNumber(false)}
              InputLabelProps={{
                shrink:
                  shrinkVatNumber ||
                  stepHistoryState.isTaxCodeEquals2PIVA ||
                  formik.values.vatNumber,
              }}
            />
          )}
          {isPaymentServiceProvider(institutionType) && formik.values.hasVatnumber && (
            <Box display="flex" alignItems="center" mt="2px">
              {/* Checkbox la aprtita IVA è di gruppo */}
              <Checkbox
                id={'vatNumberGroup'}
                name="vatNumberGroup"
                inputProps={{
                  'aria-label': t('onboardingFormData.billingDataSection.vatNumberGroup'),
                }}
                checked={formik.values.vatNumberGroup}
                onChange={(_, checked: boolean) =>
                  formik.setFieldValue('vatNumberGroup', checked, true)
                }
                value={formik.values.vatNumberGroup}
                disabled={controllers.isPremium && !!pspData?.vatNumberGroup}
              />
              <Typography component={'span'}>
                {t('onboardingFormData.billingDataSection.vatNumberGroup')}
              </Typography>
            </Box>
          )}
        </Typography>
      </Grid>
    </>
  );
};

export default VatNumberData;
