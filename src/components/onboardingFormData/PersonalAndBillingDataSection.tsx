import { FormikProps } from 'formik';
import { Grid, Paper } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  InstitutionType,
  PaymentServiceProviderDto,
  StepperStepComponentProps,
} from '../../../types';
import { OnboardingControllers } from '../../hooks/useOnboardingControllers';
import { UserContext } from '../../lib/context';
import { AssistanceContacts } from '../../model/AssistanceContacts';
import { InstitutionLocationData } from '../../model/InstitutionLocationData';
import { OnboardingFormData } from '../../model/OnboardingFormData';
import { getLocationFromIstatCode } from '../../services/geoTaxonomyServices';
import { getUoInfoFromRecipientCode } from '../../services/institutionServices';
import { isInformationCompany, isIoSignProduct } from '../../utils/institutionTypeUtils';
import { BaseTextFieldPropsFn, StepBillingDataHistoryState } from '../steps/StepOnboardingFormData';
import CommercialRegisterData from './components/CommercialRegisterData';
import InvoiceData from './components/InvoiceData';
import PartyGeneralData from './components/PartyGeneralData';
import VatNumberData from './components/VatNumberData';
import SupportEmailData from './components/SupportEmailData';

type Props = StepperStepComponentProps & {
  institutionType: InstitutionType;
  baseTextFieldProps: BaseTextFieldPropsFn;
  stepHistoryState: StepBillingDataHistoryState;
  setStepHistoryState: React.Dispatch<React.SetStateAction<StepBillingDataHistoryState>>;
  formik: FormikProps<OnboardingFormData>;
  onboardingFormData?: OnboardingFormData;
  institutionAvoidGeotax: boolean;
  retrievedIstat?: string;
  productId?: string;
  subProductId?: string;
  controllers: OnboardingControllers;
  setInvalidTaxCodeInvoicing: React.Dispatch<React.SetStateAction<boolean>>;
  recipientCodeStatus?: string;
};

export default function PersonalAndBillingDataSection({
  institutionType,
  baseTextFieldProps,
  stepHistoryState,
  setStepHistoryState,
  formik,
  onboardingFormData,
  institutionAvoidGeotax,
  retrievedIstat,
  productId,
  subProductId,
  controllers,
  setInvalidTaxCodeInvoicing,
  recipientCodeStatus,
}: Props) {
  const { t } = useTranslation();
  const { setRequiredLogin } = useContext(UserContext);

  const [shrinkRea, setShrinkRea] = useState<boolean>(false);
  const [institutionLocationData, setInstitutionLocationData] = useState<InstitutionLocationData>();

  const [disableTaxCodeInvoicing, setDisableTaxCodeInvoicing] = useState<boolean>(false);
  const [taxCodeInvoicingVisible, setTaxCodeInvoicingVisible] = useState<boolean>(false);
  const [assistanceContacts, setAssistanceContacts] = useState<AssistanceContacts>();
  const [pspData, setPspData] = useState<PaymentServiceProviderDto>();

  const isInfoCompany = isInformationCompany(formik.values.origin, institutionType, productId);

  useEffect(() => {
    const shareCapitalIsNan = isNaN(Number(formik.values.shareCapital));
    if (shareCapitalIsNan) {
      void formik.setFieldValue('shareCapital', undefined);
    }
    if (formik.values.shareCapital) {
      setShrinkRea(true);
    } else {
      setShrinkRea(false);
    }
  }, [formik.values.shareCapital]);

  useEffect(() => {
    if (assistanceContacts?.supportEmail && isIoSignProduct(productId)) {
      void formik.setFieldValue('supportEmail', assistanceContacts.supportEmail);
    }
  }, [assistanceContacts]);

  useEffect(() => {
    if (pspData) {
      void formik.setFieldValue('commercialRegisterNumber', pspData.businessRegisterNumber);
      void formik.setFieldValue(
        'registrationInRegister',
        pspData.legalRegisterName === 'N/A' ? '' : pspData.legalRegisterName
      );
      void formik.setFieldValue(
        'registerNumber',
        pspData.legalRegisterNumber === 'N/A' ? '' : pspData.legalRegisterNumber
      );
      void formik.setFieldValue('abiCode', pspData.abiCode);
      void formik.setFieldValue('vatNumberGroup', pspData.vatNumberGroup);
    }
  }, [pspData]);

  useEffect(() => {
    if (institutionLocationData?.city) {
      void formik.setFieldValue('country', institutionLocationData.country);
      void formik.setFieldValue('county', institutionLocationData.county);
      void formik.setFieldValue('city', institutionLocationData.city);
    }
  }, [institutionLocationData]);

  useEffect(() => {
    if (controllers.isPremium) {
      setAssistanceContacts({
        supportEmail: formik.values.supportEmail,
      });
      setPspData({
        businessRegisterNumber: formik.values.commercialRegisterNumber ?? '',
        legalRegisterName: formik.values.registrationInRegister ?? '',
        legalRegisterNumber: formik.values.registerNumber ?? '',
        vatNumberGroup: formik.values.vatNumberGroup ?? false,
        abiCode: formik.values.abiCode ?? '',
      });
      setInstitutionLocationData({
        country: formik.values.country ?? '',
        county: formik.values.county ?? '',
        city: formik.values.city ?? '',
      });
    }
  }, [controllers.isPremium]);

  useEffect(() => {
    if (!controllers.isPremium && (controllers.isFromIPA || controllers.isAooUo)) {
      const istatCode = onboardingFormData?.istatCode ?? retrievedIstat;
      void getLocationFromIstatCode(setInstitutionLocationData, setRequiredLogin, istatCode);
    }
  }, [controllers.isPremium, controllers.isFromIPA, controllers.isAooUo]);

  useEffect(() => {
    if (controllers.isForeignInsurance) {
      void formik.setFieldValue('isForeignInsurance', true);
      void formik.setFieldValue('zipCode', undefined);
      void formik.setFieldValue('city', undefined);
      void formik.setFieldValue('county', undefined);
      void formik.setFieldValue('country', undefined);
    } else {
      void formik.setFieldValue('isForeignInsurance', false);
      void formik.setFieldValue('hasVatnumber', true);
    }
  }, [controllers.isForeignInsurance]);

  useEffect(() => {
    if (onboardingFormData?.aooUniqueCode) {
      void formik.setFieldValue('recipientCode', undefined);
    }
  }, [onboardingFormData?.aooUniqueCode]);

  useEffect(() => {
    const recipientCode = formik.values.recipientCode;
    if (recipientCode && recipientCode.length >= 6 && recipientCodeStatus === 'ACCEPTED') {
      void getUoInfoFromRecipientCode(
        recipientCode,
        setDisableTaxCodeInvoicing,
        formik
      );
      setTaxCodeInvoicingVisible(true);
    } else {
      void formik.setFieldValue('taxCodeInovoicing', undefined);
      setDisableTaxCodeInvoicing(false);
      setTaxCodeInvoicingVisible(false);
    }
  }, [formik.values.recipientCode, recipientCodeStatus]);

  useEffect(() => {
    if (stepHistoryState.isTaxCodeEquals2PIVA) {
      void formik.setFieldValue('vatNumber', formik.values.taxCode);
    } else {
      void formik.setFieldValue('vatNumber', '');
    }
  }, [stepHistoryState.isTaxCodeEquals2PIVA]);

  return (
    <Paper
      elevation={8}
      sx={{ borderRadius: theme.spacing(2), p: 4, maxWidth: '704px', width: '100%' }}
    >
      <Grid item container spacing={3}>
        <PartyGeneralData
          controllers={controllers}
          origin={formik.values.origin}
          onboardingFormData={onboardingFormData}
          baseTextFieldProps={baseTextFieldProps}
          institutionType={institutionType}
          isInfoCompany={isInfoCompany}
          formik={formik}
          productId={productId}
          setInstitutionLocationData={setInstitutionLocationData}
          setRequiredLogin={setRequiredLogin}
        />
        <VatNumberData
          controllers={controllers}
          formik={formik}
          onboardingFormData={onboardingFormData}
          institutionType={institutionType}
          productId={productId}
          stepHistoryState={stepHistoryState}
          setStepHistoryState={setStepHistoryState}
          baseTextFieldProps={baseTextFieldProps}
          t={t}
          pspData={pspData}
        />
        <InvoiceData
          controllers={controllers}
          productId={productId}
          subProductId={subProductId}
          institutionType={institutionType}
          onboardingFormData={onboardingFormData}
          taxCodeInvoicingVisible={taxCodeInvoicingVisible}
          disableTaxCodeInvoicing={disableTaxCodeInvoicing}
          formik={formik}
          baseTextFieldProps={baseTextFieldProps}
          setInvalidTaxCodeInvoicing={setInvalidTaxCodeInvoicing}
        />
        <CommercialRegisterData
          isInfoCompany={isInfoCompany}
          institutionType={institutionType}
          productId={productId}
          baseTextFieldProps={baseTextFieldProps}
          formik={formik}
          setShrinkRea={setShrinkRea}
          shrinkRea={shrinkRea}
          controllers={controllers}
          pspData={pspData}
        />
        <SupportEmailData
          institutionType={institutionType}
          productId={productId}
          baseTextFieldProps={baseTextFieldProps}
          controllers={controllers}
          assistanceContacts={assistanceContacts}
          institutionAvoidGeotax={institutionAvoidGeotax}
        />
      </Grid>
    </Paper>
  );
}
