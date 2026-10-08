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
import { StepBillingDataHistoryState } from '../steps/StepOnboardingFormData';
import CommercialRegisterData from './components/CommercialRegisterData';
import InvoiceData from './components/InvoiceData';
import PartyGeneralData from './components/PartyGeneralData';
import VatNumberData from './components/VatNumberData';
import SupportEmailData from './components/SupportEmailData';

type Props = StepperStepComponentProps & {
  institutionType: InstitutionType;
  baseTextFieldProps: any;
  stepHistoryState: StepBillingDataHistoryState;
  setStepHistoryState: React.Dispatch<React.SetStateAction<StepBillingDataHistoryState>>;
  formik: any;
  onboardingFormData?: OnboardingFormData;
  institutionAvoidGeotax: boolean;
  retrievedIstat?: string;
  productId?: string;
  subProductId?: string;
  controllers: OnboardingControllers;
  setInvalidTaxCodeInvoicing: React.Dispatch<React.SetStateAction<boolean>>;
  recipientCodeStatus?: string;
};

// eslint-disable-next-line sonarjs/cognitive-complexity, complexity
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
    const shareCapitalIsNan = isNaN(formik.values.shareCapital);
    if (shareCapitalIsNan) {
      formik.setFieldValue('shareCapital', undefined);
    }
    if (formik.values.shareCapital) {
      setShrinkRea(true);
    } else {
      setShrinkRea(false);
    }
  }, [formik.values.shareCapital]);

  useEffect(() => {
    if (assistanceContacts?.supportEmail && isIoSignProduct(productId)) {
      formik.setFieldValue('supportEmail', assistanceContacts.supportEmail);
    }
  }, [assistanceContacts]);

  useEffect(() => {
    if (pspData) {
      formik.setFieldValue('commercialRegisterNumber', pspData.businessRegisterNumber);
      formik.setFieldValue(
        'registrationInRegister',
        pspData.legalRegisterName === 'N/A' ? '' : pspData.legalRegisterName
      );
      formik.setFieldValue(
        'registerNumber',
        pspData.legalRegisterNumber === 'N/A' ? '' : pspData.legalRegisterNumber
      );
      formik.setFieldValue('abiCode', pspData.abiCode);
      formik.setFieldValue('vatNumberGroup', pspData.vatNumberGroup);
    }
  }, [pspData]);

  useEffect(() => {
    if (institutionLocationData?.city) {
      formik.setFieldValue('country', institutionLocationData.country);
      formik.setFieldValue('county', institutionLocationData.county);
      formik.setFieldValue('city', institutionLocationData.city);
    }
  }, [institutionLocationData]);

  useEffect(() => {
    if (controllers.isPremium) {
      setAssistanceContacts({
        supportEmail: formik.values.supportEmail,
      });
      setPspData({
        businessRegisterNumber: formik.values.businessRegisterNumber,
        legalRegisterName: formik.values.legalRegisterName,
        legalRegisterNumber: formik.values.legalRegisterNumber,
        vatNumberGroup: formik.values.vatNumberGroup,
        abiCode: formik.values.abiCode,
      });
      setInstitutionLocationData({
        country: formik.values.country,
        county: formik.values.county,
        city: formik.values.city,
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
      formik.setFieldValue('isForeignInsurance', true);
      formik.setFieldValue('zipCode', undefined);
      formik.setFieldValue('city', undefined);
      formik.setFieldValue('county', undefined);
      formik.setFieldValue('country', undefined);
    } else {
      formik.setFieldValue('isForeignInsurance', false);
      formik.setFieldValue('hasVatnumber', true);
    }
  }, [controllers.isForeignInsurance]);

  useEffect(() => {
    if (onboardingFormData?.aooUniqueCode) {
      formik.setFieldValue('recipientCode', undefined);
    }
  }, [onboardingFormData?.aooUniqueCode]);

  useEffect(() => {
    if (formik.values.recipientCode?.length >= 6 && recipientCodeStatus === 'ACCEPTED') {
      void getUoInfoFromRecipientCode(
        formik.values.recipientCode,
        setDisableTaxCodeInvoicing,
        formik
      );
      setTaxCodeInvoicingVisible(true);
    } else {
      formik.setFieldValue('taxCodeInovoicing', undefined);
      setDisableTaxCodeInvoicing(false);
      setTaxCodeInvoicingVisible(false);
    }
  }, [formik.values.recipientCode, recipientCodeStatus]);

  useEffect(() => {
    if (stepHistoryState.isTaxCodeEquals2PIVA) {
      formik.setFieldValue('vatNumber', formik.values.taxCode);
    } else {
      formik.setFieldValue('vatNumber', '');
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
