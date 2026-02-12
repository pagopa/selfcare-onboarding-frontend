import '@testing-library/jest-dom';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useFormik } from 'formik';
import { expect, Mock, test, vi } from 'vitest';
import {
  institutionTypes,
  mockedAoos,
  mockedPartiesFromInfoCamere,
  mockedProducts,
  mockedUos,
  mockPartyRegistry,
} from '../../../lib/__mocks__/mockApiRequests';
import { OnboardingFormData } from '../../../model/OnboardingFormData';
import { PRODUCT_IDS } from '../../../utils/constants';
import { renderComponentWithProviders } from '../../../utils/test-utils';
import PersonalAndBillingDataSection from '../PersonalAndBillingDataSection';

import {
  isContractingAuthority,
  isGlobalServiceProvider,
  isIdpayMerchantProduct,
  isInsuranceCompany,
  isInteropProduct,
  isIoProduct,
  isIoSignProduct,
  isPaymentServiceProvider,
  isPrivateMerchantInstitution,
  isPrivateOrPersonInstitution,
  isPublicAdministration,
  isPublicServiceCompany,
  isTechPartner,
} from '../../../utils/institutionTypeUtils';

vi.mock('formik', () => ({
  useFormik: vi.fn(),
}));

vi.mock('../../../services/geoTaxonomyServices', () => ({
  getCountriesFromGeotaxonomies: vi.fn(),
  getLocationFromIstatCode: vi.fn(),
  getNationalCountries: vi.fn(),
}));

vi.mock('../../../services/institutionServices', () => ({
  getUoInfoFromRecipientCode: vi.fn(),
}));

vi.mock('../../../services/billingDataServices', () => ({
  verifyTaxCodeInvoicing: vi.fn(),
}));

const mockFormik = {
  initialValues: {
    businessName: '',
    registeredOffice: '',
    zipCode: '',
    digitalAddress: '',
    taxCode: '',
    vatNumber: '',
    recipientCode: '',
    geographicTaxonomies: [],
  },
  validateOnMount: true,
  validate: vi.fn(),
  onSubmit: vi.fn(),
};

(useFormik as Mock).mockReturnValue(mockFormik);

const formik: any = {
  values: {
    businessName: '',
    zipCode: '12345',
  },
  errors: {
    zipCode: 'Invalid zip code',
  },
  setFieldValue: vi.fn(),
  setErrors: vi.fn(),
  setTouched: vi.fn(),
  handleChange: vi.fn(),
};

const mockBaseTextFieldProps = (
  field: keyof OnboardingFormData,
  label: string,
  fontWeight: number = 400,
  fontSize: number = 16
) => {
  const isError = formik.errors && formik.errors[field] && formik.errors[field] !== 'Required';

  return {
    id: field,
    type: 'text',
    value: formik.values[field] || '',
    label,
    error: isError || false,
    helperText: isError ? formik.errors[field] : undefined,
    required: true,
    variant: 'outlined',
    onChange: formik.handleChange,
    sx: { width: '100%' },
    InputProps: {
      style: {
        fontSize,
        fontWeight,
        lineHeight: '24px',
        color: '#5C6F82',
        textAlign: 'start',
        paddingLeft: '16px',
        borderRadius: '4px',
      },
    },
  };
};

test('Test: Rendered PersonalAndBillingDataSection component with all possible business cases', () => {
  let componentRendered = false;
  const conditionsMap = {} as any;
  let onboardingFormData: any;
  let productId: string;

  mockedProducts.forEach((product) => {
    institutionTypes.forEach((institutionType) => {
      if (!componentRendered) {
        productId = product.id;

        switch (productId) {
          case PRODUCT_IDS.SEND:
            onboardingFormData = mockedAoos[0];
            break;
          case PRODUCT_IDS.IO_SIGN:
            onboardingFormData = mockedUos[0];
            break;
          case PRODUCT_IDS.INTEROP:
            onboardingFormData = mockedPartiesFromInfoCamere;
            break;
          default:
            onboardingFormData = mockPartyRegistry.items[0];
        }

        const institutionAvoidGeotax = ['PT', 'SA', 'AS'].includes(institutionType);

        const isForeignInsurance = onboardingFormData?.registerType?.includes('Elenco II');
        const isPremium = !!product.parentId;
        const isDisabled =
          isPremium ||
          (origin === 'IPA' &&
            !isPublicAdministration(institutionType) &&
            !isPaymentServiceProvider(institutionType)) ||
          isPublicAdministration(institutionType);
        const isInvoiceable =
          !isContractingAuthority(institutionType) &&
          !isTechPartner(institutionType) &&
          !isInsuranceCompany(institutionType) &&
          !isInteropProduct(productId);
        const isInformationCompany =
          (isGlobalServiceProvider(institutionType) || isPublicServiceCompany(institutionType)) &&
          (isIoProduct(productId) || isIoSignProduct(productId) || isInteropProduct(productId));
        const isFromIPA = origin === 'IPA';
        const isAooUo = !!(onboardingFormData?.uoUniqueCode ?? onboardingFormData?.aooUniqueCode);

        conditionsMap[`${productId}-${institutionType}`] = {
          isPremium,
          isInvoiceable,
          isInformationCompany,
          isForeignInsurance,
          institutionAvoidGeotax,
          isInsuranceCompany: isInsuranceCompany(institutionType),
          isPrivateParty:
            isInteropProduct(productId) && isPrivateMerchantInstitution(institutionType),
          isPrivateMerchantInstitution:
            isIdpayMerchantProduct(productId) && isPrivateOrPersonInstitution(institutionType),
        };

        const mockControllers = {
          isPremium,
          isPaymentServiceProvider: isPaymentServiceProvider(institutionType),
          isPdndPrivate:
            isInteropProduct(productId) && isPrivateMerchantInstitution(institutionType),
          isPrivateMerchantInstitution: isPrivateMerchantInstitution(institutionType),
          isInformationCompany,
          isInvoiceable,
          isForeignInsurance,
          isProdFideiussioni: false,
          isDisabled,
          isCityEditable: undefined,
          isVatRegistrated: undefined,
          isFromIPA,
          isContractingAuthority: isContractingAuthority(institutionType),
          isInsuranceCompany: isInsuranceCompany(institutionType),
          isAooUo,
        };

        renderComponentWithProviders(
          <PersonalAndBillingDataSection
            productId={productId}
            institutionType={institutionType}
            baseTextFieldProps={mockBaseTextFieldProps}
            stepHistoryState={{
              externalInstitutionId: '',
              isTaxCodeEquals2PIVA: false,
            }}
            setStepHistoryState={vi.fn()}
            formik={formik}
            institutionAvoidGeotax={institutionAvoidGeotax}
            onboardingFormData={onboardingFormData}
            controllers={mockControllers}
            setInvalidTaxCodeInvoicing={vi.fn()}
            countries={undefined}
            setCountries={vi.fn()}
          />
        );

        componentRendered = true;
      }
    });
  });

  Object.keys(conditionsMap).forEach(async (key) => {
    const {
      isInvoiceable,
      isInformationCompany,
      isForeignInsurance,
      institutionAvoidGeotax,
      isPrivateParty,
      isPrivateMerchantInstitution,
    } = conditionsMap[key];

    const centralParty = screen.queryByText('Ente centrale');
    const aooDenomination = screen.queryByText('Denominazione AOO');
    const aooUniqueCode = screen.queryByText('Codice Univoco AOO');
    const uoDenomination = screen.queryByText('Denominazione UO');
    const uoUniqueCode = screen.queryByText('Denominazione UO');

    const businessName = screen.queryByText('Ragione sociale');
    const fullLegalAddress = screen.queryByText('Indirizzo e numero civico della sede legale');
    const zipCode = screen.getByText('CAP');
    const city = document.getElementById(
      isForeignInsurance ? 'city' : 'city-select'
    ) as HTMLInputElement;
    const county = screen.getByText('Provincia');
    const country = screen.queryByText('Nazione');
    const pec = screen.getByText('Indirizzo PEC');
    const taxCode = screen.queryByText('Codice Fiscale');
    const taxCodeEc = screen.queryByText('Codice Fiscale ente centrale');
    const commercialRegisterNumber = screen.queryByText(
      'Luogo di iscrizione al Registro delle Imprese (facoltativo)'
    );
    const rea = screen.queryByText('REA');
    const sdiCode = screen.queryByText('Codice univoco o SDI') as HTMLInputElement;
    const taxCodeSfe = screen.queryByText('Codice Fiscale SFE') as HTMLInputElement;
    const iban = screen.queryByText('IBAN');
    const confirmIban = screen.queryByText('Conferma IBAN');
    const holder = screen.queryByText('Intestatario');
    const shareCapital = screen.queryByText('Capitale sociale (facoltativo)');
    const visibleCitizenMail = screen.queryByText('Indirizzo email visibile ai cittadini');

    if (onboardingFormData?.aooUniqueCode) {
      expect(businessName).not.toBeInTheDocument();
      expect(centralParty).toBeInTheDocument();
      expect(aooDenomination).toBeInTheDocument();
      expect(aooUniqueCode).toBeInTheDocument();
      expect(taxCode).not.toBeInTheDocument();
      expect(taxCodeEc).toBeInTheDocument();
    } else if (onboardingFormData?.uoUniqueCode) {
      expect(businessName).not.toBeInTheDocument();
      expect(centralParty).toBeInTheDocument();
      expect(uoDenomination).toBeInTheDocument();
      expect(uoUniqueCode).toBeInTheDocument();
      expect(taxCode).not.toBeInTheDocument();
      expect(taxCodeEc).toBeInTheDocument();
    } else {
      expect(centralParty).not.toBeInTheDocument();
      expect(aooDenomination).not.toBeInTheDocument();
      expect(aooUniqueCode).not.toBeInTheDocument();
      expect(uoDenomination).not.toBeInTheDocument();
      expect(uoUniqueCode).not.toBeInTheDocument();
      expect(businessName).toBeInTheDocument();
      expect(taxCode).toBeInTheDocument();
      expect(taxCodeEc).not.toBeInTheDocument();
    }
    expect(fullLegalAddress).toBeInTheDocument();

    expect(city).toBeInTheDocument();
    if (isForeignInsurance) {
      expect(zipCode).not.toBeInTheDocument();
      expect(county).not.toBeInTheDocument();
      expect(country).toBeInTheDocument();
    } else {
      expect(zipCode).toBeInTheDocument();
      expect(county).toBeInTheDocument();
      expect(country).not.toBeInTheDocument();
    }

    expect(pec).toBeInTheDocument();

    if (isInvoiceable && !isIoProduct(productId)) {
      expect(sdiCode).toBeInTheDocument();
      fireEvent.change(document.getElementById('recipientCode') as HTMLInputElement, {
        target: { value: 'A1B2C3' },
      });
      await waitFor(() => expect(taxCodeSfe as HTMLInputElement).toBeInTheDocument());

      fireEvent.change(document.getElementById('recipientCode') as HTMLInputElement, {
        target: { value: 'AABBC1' },
      });
      await waitFor(() => expect(taxCodeSfe as HTMLInputElement).not.toBeInTheDocument());

      fireEvent.change(document.getElementById('recipientCode') as HTMLInputElement, {
        target: { value: '2A3B4C' },
      });
      await waitFor(() => expect(taxCodeSfe as HTMLInputElement).not.toBeInTheDocument());

      fireEvent.change(document.getElementById('recipientCode') as HTMLInputElement, {
        target: { value: '' },
      });
      await waitFor(() => expect(taxCodeSfe as HTMLInputElement).not.toBeInTheDocument());
    } else {
      expect(sdiCode).not.toBeInTheDocument();
      expect(taxCodeSfe).not.toBeInTheDocument();
    }

    if (isInformationCompany) {
      expect(commercialRegisterNumber).toBeInTheDocument();
      expect(rea).toBeInTheDocument();
      expect(shareCapital).toBeInTheDocument();
    } else {
      expect(commercialRegisterNumber).not.toBeInTheDocument();
      expect(rea).not.toBeInTheDocument();
      expect(shareCapital).not.toBeInTheDocument();
    }

    if (isPrivateMerchantInstitution) {
      expect(iban).toBeInTheDocument();
      expect(confirmIban).toBeInTheDocument();
      expect(holder).toBeInTheDocument();
    } else {
      expect(iban).not.toBeInTheDocument();
      expect(confirmIban).not.toBeInTheDocument();
      expect(holder).not.toBeInTheDocument();
    }

    if (!institutionAvoidGeotax && isIoSignProduct(productId)) {
      expect(visibleCitizenMail).toBeInTheDocument();
    }

    const isTaxCodeEquals2PIVA = document.getElementById('taxCodeEquals2VatNumber');
    expect(isTaxCodeEquals2PIVA).toBeFalsy();
    const hasVatNumber = document.getElementById('party_without_vatnumber');
    expect(hasVatNumber).toBeTruthy();

    if (isPrivateParty) {
      expect(businessName).toBeDisabled();
      expect(pec).toBeDisabled();
      expect(taxCode).toBeDisabled();
      expect(commercialRegisterNumber).toBeInTheDocument();
      expect(rea).toBeInTheDocument();
      expect(shareCapital).toBeInTheDocument();
    }
  });
});
