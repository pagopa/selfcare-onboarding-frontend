import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InstitutionType, PartyData, Product } from '../../../../../types';
import { AooData } from '../../../../model/AooData';
import { AutocompleteOption } from '../../../../model/AutocompleteOption';
import { PDNDBusinessResource } from '../../../../model/PDNDBusinessResource';
import { SelectionEnum, SelectionsState } from '../../../../model/Selection';
import { UoData } from '../../../../model/UoModel';
import { PRODUCT_IDS } from '../../../../utils/constants';
import { ENV } from '../../../../utils/env';
import {
  isConsolidatedEconomicAccountCompany,
  isContractingAuthority,
  isGlobalServiceProvider,
  isIdpayMerchantProduct,
  isInsuranceCompany,
  isPrivateInstitution,
  isPrivateOrPersonInstitution,
  isPrivatePersonInstitution,
  isPublicServiceCompany,
} from '../../../../utils/institutionTypeUtils';

type Props = {
  selections?: SelectionsState;
  setSelected: React.Dispatch<React.SetStateAction<PartyData | null>>;
  handleSelectionChange: (newSelection: SelectionEnum) => void;
  setOptions: React.Dispatch<React.SetStateAction<ReadonlyArray<AutocompleteOption>>>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setIsSearchFieldSelected: React.Dispatch<React.SetStateAction<boolean>>;
  setCfResult: React.Dispatch<React.SetStateAction<PartyData | undefined>>;
  setAooResult: Dispatch<SetStateAction<AooData | undefined>>;
  setUoResult: Dispatch<SetStateAction<UoData | undefined>>;
  setUoResultHistory: (t: UoData | undefined) => void;
  setAooResultHistory: (t: AooData | undefined) => void;
  product?: Product | null;
  institutionType?: InstitutionType;
  addUser: boolean;
  selectedProduct?: Product;
  setMerchantSearchResult?: (value?: PDNDBusinessResource) => void;
};

// Built inside functions: constants.ts imports the views, so PRODUCT_IDS is not ready at load time
const isSubunitProduct = (productId?: string): boolean =>
  [PRODUCT_IDS.INTEROP, PRODUCT_IDS.IO_SIGN, PRODUCT_IDS.SEND_DEV, PRODUCT_IDS.SEND].includes(
    productId ?? ''
  );

const hidesBusinessNameSearch = (addUser: boolean, institutionType?: InstitutionType): boolean =>
  addUser ||
  isPublicServiceCompany(institutionType) ||
  isPrivateInstitution(institutionType) ||
  isPrivatePersonInstitution(institutionType);

const isMerchantPrivateParty = (institutionType?: InstitutionType, productId?: string): boolean =>
  isPrivateOrPersonInstitution(institutionType) && isIdpayMerchantProduct(productId);

const canSearchByPersonalTaxCode = (
  addUser: boolean,
  institutionType: InstitutionType | undefined,
  productId: string | undefined,
  selectedProductId: string | undefined
): boolean =>
  (addUser && selectedProductId === PRODUCT_IDS.IDPAY_MERCHANT) ||
  isMerchantPrivateParty(institutionType, productId);

const hasSubunits = (institutionType?: InstitutionType): boolean =>
  ![
    isContractingAuthority,
    isInsuranceCompany,
    isGlobalServiceProvider,
    isPublicServiceCompany,
    isPrivateInstitution,
    isPrivatePersonInstitution,
    isConsolidatedEconomicAccountCompany,
  ].some((isType) => isType(institutionType));

const canSearchBySubunit = (
  addUser: boolean,
  institutionType: InstitutionType | undefined,
  productId: string | undefined,
  selectedProductId: string | undefined
): boolean =>
  ENV.AOO_UO.SHOW_AOO_UO &&
  ((hasSubunits(institutionType) && isSubunitProduct(productId)) ||
    (addUser && isSubunitProduct(selectedProductId)));

export default function PartyAdvancedSelect({
  selections,
  setSelected,
  handleSelectionChange,
  setIsSearchFieldSelected,
  setOptions,
  setInput,
  setCfResult,
  setAooResult,
  setUoResult,
  setUoResultHistory,
  setAooResultHistory,
  product,
  institutionType,
  addUser,
  selectedProduct,
  setMerchantSearchResult,
}: Props) {
  const { t } = useTranslation();

  const [typeOfSearch, setTypeOfSearch] = useState('businessName');

  const handleTypeSearchChange = (event: SelectChangeEvent) => {
    onSelectValue(event.target.value as SelectionEnum);
    setIsSearchFieldSelected(true);
  };
  const onSelectValue = (selectedOption: SelectionEnum) => {
    handleSelectionChange(selectedOption);
    setInput('');
    setOptions([]);
    setCfResult(undefined);
    setAooResult(undefined);
    setUoResult(undefined);
    setUoResultHistory(undefined);
    setAooResultHistory(undefined);
    setMerchantSearchResult?.(undefined);
  };

  useEffect(() => {
    // Set taxCode as default when businessName is not available as an option
    // (for SCP, PRV, PRV_PF institution types, businessName is never shown in menuItems)
    if (hidesBusinessNameSearch(addUser, institutionType)) {
      onSelectValue(SelectionEnum.taxCode);
    } else {
      onSelectValue(SelectionEnum.businessName);
    }
  }, []);

  useEffect(() => {
    const selectedKey = Object.keys(selections ?? []).find(
      (key) => selections && selections[key as keyof SelectionsState]
    );
    if (selectedKey) {
      setTypeOfSearch(selectedKey);
      setInput('');
      setSelected(null);
      setCfResult(undefined);
      setMerchantSearchResult?.(undefined);
    }
  }, [selections]);

  const menuItems = [
    !hidesBusinessNameSearch(addUser, institutionType) && (
      <MenuItem
        key="businessName"
        id="businessName"
        data-testid="businessName"
        value={SelectionEnum.businessName}
      >
        {t('partyAdvancedSelect.businessName')}
      </MenuItem>
    ),
    isInsuranceCompany(institutionType) ? (
      <MenuItem
        key="ivassCode"
        id="ivassCode"
        data-testid="ivassCode"
        value={SelectionEnum.ivassCode}
      >
        {t('partyAdvancedSelect.ivassCode')}
      </MenuItem>
    ) : (
      <MenuItem key="taxCode" id="taxCode" data-testid="taxCode" value={SelectionEnum.taxCode}>
        {t('partyAdvancedSelect.taxCode')}
      </MenuItem>
    ),
    isMerchantPrivateParty(institutionType, product?.id) && (
      <MenuItem key="reaCode" id="reaCode" data-testid="reaCode" value={SelectionEnum.reaCode}>
        {t('partyAdvancedSelect.reaCode')}
      </MenuItem>
    ),
    canSearchByPersonalTaxCode(addUser, institutionType, product?.id, selectedProduct?.id) && (
      <MenuItem
        key="personalTaxCode"
        id="personalTaxCode"
        data-testid="personalTaxCode"
        value={SelectionEnum.personalTaxCode}
      >
        {t('partyAdvancedSelect.personalTaxCode')}
      </MenuItem>
    ),
    canSearchBySubunit(addUser, institutionType, product?.id, selectedProduct?.id) && [
      <MenuItem key="aooCode" id="aooCode" data-testid="aooCode" value={SelectionEnum.aooCode}>
        {t('partyAdvancedSelect.aooCode')}
      </MenuItem>,
      <MenuItem key="uoCode" id="uoCode" data-testid="uoCode" value={SelectionEnum.uoCode}>
        {t('partyAdvancedSelect.uoCode')}
      </MenuItem>,
    ],
  ]
    .flat()
    .filter(Boolean);

  return (
    <FormControl fullWidth size="small">
      <InputLabel id="advancedSearch">{t('partyAdvancedSelect.advancedSearchLabel')}</InputLabel>
      <Select
        labelId="advancedSearch"
        id="party-type-select"
        data-testid="party-type-select"
        value={typeOfSearch}
        label={t('partyAdvancedSelect.advancedSearchLabel')}
        onChange={handleTypeSearchChange}
      >
        {menuItems}
      </Select>
    </FormControl>
  );
}
