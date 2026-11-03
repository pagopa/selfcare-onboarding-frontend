import { FormikProps } from 'formik';
import { Grid } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { t } from 'i18next';
import { Dispatch, SetStateAction } from 'react';
import { OnboardingFormData } from '../../../model/OnboardingFormData';
import { InstitutionType, PaymentServiceProviderDto } from '../../../../types';
import { CustomTextField, CustomTextFieldNotched } from '../../../utils/style-utils';
import NumberDecimalFormat from '../NumberDecimalFormat';
import { OnboardingControllers } from '../../../hooks/useOnboardingControllers';
import { BaseTextFieldPropsFn } from '../../steps/StepOnboardingFormData';
import { getCommercialRegisterLayout } from './commercialRegisterDataLayout';
import PspRegisterFields from './PspRegisterFields';

type Props = {
  isInfoCompany: boolean;
  institutionType: InstitutionType;
  productId?: string;
  baseTextFieldProps: BaseTextFieldPropsFn;
  formik: FormikProps<OnboardingFormData>;
  setShrinkRea: Dispatch<SetStateAction<boolean>>;
  shrinkRea: boolean;
  controllers: OnboardingControllers;
  pspData: PaymentServiceProviderDto | undefined;
};

const CommercialRegisterData = ({
  isInfoCompany,
  institutionType,
  productId,
  baseTextFieldProps,
  formik,
  setShrinkRea,
  shrinkRea,
  controllers,
  pspData,
}: Props) => {
  const layout = getCommercialRegisterLayout({
    isInfoCompany,
    institutionType,
    productId,
    isDisabled: controllers.isDisabled,
    pspData,
    errors: formik.errors,
  });

  return (
    <>
      {layout.showCommercialRegister && (
        <>
          <Grid item xs={12}>
            {/* Luogo di iscrizione al Registro delle Imprese facoltativo per institution Type !== 'PA' e 'PSP */}
            <CustomTextFieldNotched
              paddingValue={layout.isContractingAuthority ? '20px' : '24px'}
              {...baseTextFieldProps(
                'businessRegisterPlace',
                layout.isRegisterPlaceRequired
                  ? t(
                      'onboardingFormData.billingDataSection.informationCompanies.requiredCommercialRegisterNumber'
                    )
                  : t(
                      'onboardingFormData.billingDataSection.informationCompanies.commercialRegisterNumber'
                    ),
                600,
                theme.palette.text.primary
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomTextField
              placeholder={'RM-123456'}
              {...baseTextFieldProps(
                'rea',
                layout.isReaRequired
                  ? t('onboardingFormData.billingDataSection.informationCompanies.requiredRea')
                  : t('onboardingFormData.billingDataSection.informationCompanies.rea'),
                600,
                theme.palette.text.primary
              )}
            />
          </Grid>
          <Grid item xs={6}>
            {/* capitale sociale facoltativo per institution Type !== 'PA' e 'PSP */}
            <CustomTextField
              name={'shareCapital'}
              {...baseTextFieldProps(
                'shareCapital',
                layout.isShareCapitalRequired
                  ? t(
                      'onboardingFormData.billingDataSection.informationCompanies.requiredShareCapital'
                    )
                  : t('onboardingFormData.billingDataSection.informationCompanies.shareCapital'),
                600,
                theme.palette.text.primary
              )}
              onClick={() => setShrinkRea(true)}
              onBlur={() => {
                if (!formik.values.shareCapital) {
                  setShrinkRea(false);
                }
              }}
              InputLabelProps={{ shrink: shrinkRea }}
              InputProps={{
                inputComponent: NumberDecimalFormat,
              }}
              helperText={
                layout.showShareCapitalHelper
                  ? t(
                      'onboardingFormData.billingDataSection.informationCompanies.shareCapitalHelper'
                    )
                  : undefined
              }
            />
          </Grid>
        </>
      )}
      {layout.showPspFields && (
        <PspRegisterFields
          baseTextFieldProps={baseTextFieldProps}
          formik={formik}
          disabledFields={layout.pspFieldsDisabled}
        />
      )}
    </>
  );
};

export default CommercialRegisterData;
