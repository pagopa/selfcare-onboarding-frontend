import { Grid } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { t } from 'i18next';
import { Dispatch, SetStateAction } from 'react';
import { InstitutionType, PaymentServiceProviderDto } from '../../../../types';
import {
  isContractingAuthority,
  isIdpayMerchantProduct,
  isPagoPaProduct,
  isPaymentServiceProvider,
  isPdndPrivate,
  isPrivateInstitution,
  isPrivateMerchantInstitution,
} from '../../../utils/institutionTypeUtils';
import { CustomTextFieldNotched } from '../../../utils/style-utils';
import { CustomTextField } from '../../steps/StepOnboardingFormData';
import NumberDecimalFormat from '../NumberDecimalFormat';
import { OnboardingControllers } from '../../../hooks/useOnboardingControllers';
import { showCommercialRegisterSection } from '../../../utils/validateFields';

type Props = {
  isInfoCompany: boolean;
  institutionType: InstitutionType;
  productId?: string;
  baseTextFieldProps: any;
  formik: any;
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
  // eslint-disable-next-line complexity
}: Props) => (
  <>
    {showCommercialRegisterSection(
      isInfoCompany,
      institutionType,
      productId
    ) && (
      <>
        <Grid item xs={12}>
          {/* Luogo di iscrizione al Registro delle Imprese facoltativo per institution Type !== 'PA' e 'PSP */}
          <CustomTextFieldNotched
            paddingValue={isContractingAuthority(institutionType) ? '20px' : '24px'}
            {...baseTextFieldProps(
              'businessRegisterPlace',
              isContractingAuthority(institutionType) ||
                isPdndPrivate(institutionType, productId) ||
                isPrivateMerchantInstitution(institutionType, productId)
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
              isPrivateInstitution(institutionType) && isPagoPaProduct(productId)
                ? t('onboardingFormData.billingDataSection.informationCompanies.rea')
                : t('onboardingFormData.billingDataSection.informationCompanies.requiredRea'),
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
              isContractingAuthority(institutionType) || isPdndPrivate(institutionType, productId)
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
              isIdpayMerchantProduct(productId)
                ? t('onboardingFormData.billingDataSection.informationCompanies.shareCapitalHelper')
                : undefined
            }
          />
        </Grid>
      </>
    )}
    {isPaymentServiceProvider(institutionType) && (
      <>
        <Grid item xs={12}>
          {/* n. Iscrizione al Registro delle Imprese */}
          <CustomTextField
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            {...baseTextFieldProps(
              'commercialRegisterNumber',
              t('onboardingFormData.billingDataSection.pspDataSection.commercialRegisterNumber'),
              600,
              theme.palette.text.primary
            )}
            disabled={
              controllers.isDisabled &&
              !!pspData?.businessRegisterNumber &&
              !formik.errors.commercialRegisterNumber
            }
          />
        </Grid>
        <Grid item xs={12}>
          {/* Iscrizione all’Albo */}
          <CustomTextField
            {...baseTextFieldProps(
              'registrationInRegister',
              t('onboardingFormData.billingDataSection.pspDataSection.registrationInRegister'),
              600,
              theme.palette.text.primary
            )}
            disabled={
              controllers.isDisabled &&
              !!pspData?.legalRegisterName &&
              formik.values.legalRegisterNumber !== 'N/A'
            }
          />
        </Grid>
        <Grid item xs={6}>
          {/* Numero dell’Albo */}
          <CustomTextField
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            {...baseTextFieldProps(
              'registerNumber',
              t('onboardingFormData.billingDataSection.pspDataSection.registerNumber'),
              600,
              theme.palette.text.primary
            )}
            disabled={
              controllers.isDisabled &&
              !!pspData?.legalRegisterNumber &&
              !formik.errors.legalRegisterNumber &&
              formik.values.legalRegisterNumber !== 'N/A'
            }
          />
        </Grid>
        <Grid item xs={6}>
          {/* ABI code */}
          <CustomTextField
            {...baseTextFieldProps(
              'abiCode',
              t('onboardingFormData.billingDataSection.pspDataSection.abiCode'),
              600,
              theme.palette.text.primary
            )}
            value={formik.values.abiCode}
            InputLabelProps={{
              shrink: formik.values.abiCode?.length > 0,
            }}
            disabled={controllers.isDisabled && !!pspData?.abiCode && !formik.errors.abiCode}
          />
        </Grid>
      </>
    )}
  </>
);

export default CommercialRegisterData;
