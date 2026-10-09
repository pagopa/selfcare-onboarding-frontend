import { Grid, Typography } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { PRODUCT_IDS } from '@pagopa/selfcare-common-frontend/lib/utils/constants';
import { t } from 'i18next';
import { Dispatch, SetStateAction } from 'react';
import { InstitutionType } from '../../../../types';
import { OnboardingControllers } from '../../../hooks/useOnboardingControllers';
import { verifyTaxCodeInvoicing } from '../../../services/billingDataServices';
import { isInsuranceCompany, isIoProduct, isPublicAdministration } from '../../../utils/institutionTypeUtils';
import { CustomTextFieldNotched } from '../../../utils/style-utils';
import { CustomTextField } from '../../steps/StepOnboardingFormData';

type Props = {
  controllers: OnboardingControllers;
  productId?: string;
  subProductId?: string;
  institutionType: InstitutionType;
  onboardingFormData: any;
  taxCodeInvoicingVisible: boolean;
  disableTaxCodeInvoicing: boolean;
  formik: any;
  baseTextFieldProps: any;
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
  // eslint-disable-next-line complexity
}: Props) => (
  <>
    <Grid item xs={12}>
      <Typography component={'span'}>
        {controllers.isInvoiceable &&
          (!isIoProduct(productId) || subProductId === PRODUCT_IDS.IO_PREMIUM) && (
            <Grid item xs={12} mt={3}>
              <CustomTextFieldNotched
                paddingValue={
                  isPublicAdministration(institutionType) || controllers.isAooUo ? '8px' : '0'
                }
                {...baseTextFieldProps(
                  'recipientCode',
                  isPublicAdministration(institutionType) || controllers.isAooUo
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
                disabled={
                  controllers.isPremium &&
                  subProductId !== PRODUCT_IDS.IO_PREMIUM &&
                  formik.values.recipientCode.length >= 6 &&
                  formik.initialValues.recipientCode.length >= 6 &&
                  !formik.errors.recipientCode
                }
                helperText={
                  formik.errors.recipientCode === 'Required'
                    ? undefined
                    : formik.errors.recipientCode
                }
                error={
                  formik.errors.recipientCode === 'Required' ? false : !!formik.errors.recipientCode
                }
              />
              <Typography
                component={'span'}
                sx={{
                  fontSize: '12px!important',
                  fontWeight: 'fontWeightMedium',
                  color: theme.palette.text.secondary,
                }}
              >
                {isPublicAdministration(institutionType) || controllers.isAooUo
                  ? t('onboardingFormData.billingDataSection.sdiCodePaAooUoDescription')
                  : t('onboardingFormData.billingDataSection.recipientCodeDescription')}
              </Typography>
            </Grid>
          )}
        {(onboardingFormData?.uoUniqueCode || isPublicAdministration(institutionType)) &&
          controllers.isInvoiceable &&
          taxCodeInvoicingVisible && (
            <Grid item xs={12} mt={3}>
              <CustomTextField
                {...baseTextFieldProps(
                  'taxCodeInvoicing',
                  t('onboardingFormData.billingDataSection.taxCodeInvoicing'),
                  600,
                  theme.palette.text.primary
                )}
                onChange={(e) => {
                  formik.setFieldValue('taxCodeInvoicing', e.target.value);
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

        {isInsuranceCompany(institutionType) && (
          <Grid item xs={12} marginTop={controllers.isForeignInsurance ? -3 : 0}>
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

export default InvoiceData;
