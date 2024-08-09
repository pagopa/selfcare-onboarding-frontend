import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useFormik } from 'formik';
import React from 'react';
import { OnboardingFormData } from '../../../model/OnboardingFormData';
import { renderComponentWithProviders } from '../../../utils/test-utils';
import PersonalAndBillingDataSection from '../PersonalAndBillingDataSection';
import {
  institutionTypes,
  mockPartyRegistry,
  mockedProducts,
  mockedAoos,
  mockedUos,
  mockedPartiesFromInfoCamere,
} from '../../../lib/__mocks__/mockApiRequests';

jest.mock('formik', () => ({
  useFormik: jest.fn(),
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
  validate: jest.fn(),
  onSubmit: jest.fn(),
};

(useFormik as jest.Mock).mockReturnValue(mockFormik);

const formik = {
  values: {
    businessName: '',
    zipCode: '12345',
  },
  errors: {
    zipCode: 'Invalid zip code',
  },
  setFieldValue: jest.fn(),
  setErrors: jest.fn(),
  setTouched: jest.fn(),
  handleChange: jest.fn(),
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
  const conditionsMap = {};
  let onboardingFormData;
  let productId;

  mockedProducts.forEach((product) => {
    institutionTypes.forEach((institutionType) => {
      if (!componentRendered) {
        productId = product.id;

        switch (productId) {
          case 'prod-pn':
            onboardingFormData = mockedAoos[0];
          case 'prod-io-sign':
            onboardingFormData = mockedUos[0];
          case 'prod-interop':
            onboardingFormData = mockedPartiesFromInfoCamere;
          default:
            onboardingFormData = mockPartyRegistry.items[0];
        }

        const institutionAvoidGeotax = ['PT', 'SA', 'AS'].includes(institutionType);

        const isInsuranceCompany = institutionType === 'AS';
        const isForeignInsurance = onboardingFormData?.registerType?.includes('Elenco II');
        const isPremium = !!product.parentId;
        const isDisabled =
          isPremium ||
          (origin === 'IPA' && institutionType !== 'PA' && institutionType !== 'PSP') ||
          institutionType === 'PA';
        const isInvoiceable =
          institutionType !== 'SA' &&
          institutionType !== 'PT' &&
          institutionType !== 'AS' &&
          productId !== 'prod-interop';
        const isInformationCompany =
          (institutionType === 'GSP' || institutionType === 'SCP') &&
          (productId === 'prod-io' || productId === 'prod-io-sign' || productId === 'prod-interop');

        conditionsMap[`${productId}-${institutionType}`] = {
          isPremium,
          isInvoiceable,
          isInformationCompany,
          isForeignInsurance,
          institutionAvoidGeotax,
          isInsuranceCompany,
        };

        renderComponentWithProviders(
          <PersonalAndBillingDataSection
            productId={productId}
            origin={onboardingFormData?.origin}
            institutionType={institutionType}
            baseTextFieldProps={mockBaseTextFieldProps}
            stepHistoryState={{
              externalInstitutionId: '',
              isTaxCodeEquals2PIVA: false,
            }}
            setStepHistoryState={jest.fn()}
            formik={formik}
            isPremium={isPremium}
            isInformationCompany={isInformationCompany}
            isForeignInsurance={isForeignInsurance}
            institutionAvoidGeotax={institutionAvoidGeotax}
            onboardingFormData={onboardingFormData}
            isInvoiceable={isInvoiceable}
            isDisabled={isDisabled}
            setInvalidTaxCodeInvoicing={jest.fn()}
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
      isInsuranceCompany,
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
    const vatNumber = screen.queryByText('Partita IVA');
    const commercialRegisterNumber = screen.queryByText(
      'Luogo di iscrizione al Registro delle Imprese (facoltativo)'
    );
    const rea = screen.queryByText('REA');
    const sdiCode = screen.queryByText('Codice univoco o SDI') as HTMLInputElement;
    const taxCodeSfe = screen.queryByText('Codice Fiscale SFE') as HTMLInputElement;
    const shareCapital = screen.queryByText('Capitale sociale (facoltativo)');
    const visibleCitizenMail = screen.queryByText('Indirizzo email visibile ai cittadini');
    const visibleCitizenMailOptional = screen.queryByText(
      'Indirizzo email visibile ai cittadini (facoltativo)'
    );

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

    if (isInvoiceable) {
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

    if (institutionAvoidGeotax) {
      expect(visibleCitizenMail).not.toBeInTheDocument();
    } else {
      expect(
        productId === 'prod-io' ? visibleCitizenMail : visibleCitizenMailOptional
      ).toBeInTheDocument();
    }

    const isTaxCodeEquals2PIVA = document.getElementById('taxCodeEquals2VatNumber');
    expect(isTaxCodeEquals2PIVA).toBeFalsy();
    const hasVatNumber = document.getElementById('party_without_vatnumber');
    expect(hasVatNumber).toBeTruthy();
  });
});
