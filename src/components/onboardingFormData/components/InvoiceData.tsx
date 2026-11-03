import { FormikProps } from 'formik';
import { Grid, Typography } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { t } from 'i18next';
import { Dispatch, SetStateAction } from 'react';
import { OnboardingFormData } from '../../../model/OnboardingFormData';
import { InstitutionType } from '../../../../types';
import { OnboardingControllers } from '../../../hooks/useOnboardingControllers';
import { verifyTaxCodeInvoicing } from '../../../services/billingDataServices';
import { CustomTextField, CustomTextFieldNotched } from '../../../utils/style-utils';
import { BaseTextFieldPropsFn } from '../../steps/StepOnboardingFormData';
import { getInvoiceLayout } from './invoiceDataLayout';

type Props = {
  controllers: OnboardingControllers;
  productId?: string;
  subProductId?: string;
  institutionType: InstitutionType;
  onboardingFormData?: OnboardingFormData;
  taxCodeInvoicingVisible: boolean;
  disableTaxCodeInvoicing: boolean;
  formik: FormikProps<OnboardingFormData>;
  baseTextFieldProps: BaseTextFieldPropsFn;
  setInvalidTaxCodeInvoicing: Dispatch<SetStateAction<boolean>>;
};

const InvoiceData = ({
  controllers,
  productId,
  subProductId,
  institutionType,
  onboardingFormData,
  taxCodeInvoicingVisible,
  disableTaxCodeInvoicing,
  formik,
  baseTextFieldProps,
  setInvalidTaxCodeInvoicing,
}: Props) => {
  const layout = getInvoiceLayout({
    controllers,
    productId,
    subProductId,
    institutionType,
    onboardingFormData,
    taxCodeInvoicingVisible,
    formik,
  });

  return (
    <>
      <Grid item xs={12}>
        <Typography component={'span'}>
          {layout.showRecipientCode && (
            <Grid item xs={12} mt={3}>
              <CustomTextFieldNotched
                paddingValue={layout.isPaOrAooUo ? '8px' : '0'}
                {...baseTextFieldProps(
                  'recipientCode',
                  layout.isPaOrAooUo
                    ? t('onboardingFormData.billingDataSection.sdiCodePaAooUo')
                    : t('onboardingFormData.billingDataSection.sdiCode'),
                  600,
                  theme.palette.text.primary
                )}
                inputProps={{
                  maxLength: 7,
                  style: { textTransform: 'uppercase' },
                  onInput: (event) => {
                    const input = event.target as HTMLInputElement;
                    const cleanedValue = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                    // eslint-disable-next-line functional/immutable-data
                    input.value = cleanedValue;
                  },
                }}
                disabled={layout.isRecipientCodeDisabled}
                helperText={layout.recipientCodeError}
                error={!!layout.recipientCodeError}
              />
              <Typography
                component={'span'}
                sx={{
                  fontSize: '12px!important',
                  fontWeight: 'fontWeightMedium',
                  color: theme.palette.text.secondary,
                }}
              >
                {layout.isPaOrAooUo
                  ? t('onboardingFormData.billingDataSection.sdiCodePaAooUoDescription')
                  : t('onboardingFormData.billingDataSection.recipientCodeDescription')}
              </Typography>
            </Grid>
          )}
          {layout.showTaxCodeInvoicing && (
            <Grid item xs={12} mt={3}>
              <CustomTextField
                {...baseTextFieldProps(
                  'taxCodeInvoicing',
                  t('onboardingFormData.billingDataSection.taxCodeInvoicing'),
                  600,
                  theme.palette.text.primary
                )}
                onChange={(e) => {
                  void formik.setFieldValue('taxCodeInvoicing', e.target.value);
                  if (e.target.value.length === 11) {
                    void verifyTaxCodeInvoicing(e.target.value, formik, setInvalidTaxCodeInvoicing);
                  } else {
                    setInvalidTaxCodeInvoicing(false);
                  }
                }}
                inputProps={{
                  maxLength: 11,
                }}
                disabled={disableTaxCodeInvoicing}
              />
            </Grid>
          )}

          {layout.showOriginId && (
            <Grid item xs={12} marginTop={layout.originIdMarginTop}>
              <CustomTextField
                {...baseTextFieldProps(
                  'originId',
                  t('onboardingFormData.billingDataSection.originId'),
                  600,
                  theme.palette.text.disabled
                )}
                value={formik.values.originId}
                disabled={true}
              />
            </Grid>
          )}
        </Typography>
      </Grid>
    </>
  );
};

export default InvoiceData;
