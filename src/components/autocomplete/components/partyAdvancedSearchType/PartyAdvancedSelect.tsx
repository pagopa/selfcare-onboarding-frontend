import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InstitutionType, PartyData, Product } from '../../../../../types';
import { AooData } from '../../../../model/AooData';
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
  setSelected: React.Dispatch<React.SetStateAction<any>>;
  handleSelectionChange: (newSelection: SelectionEnum) => void;
  setOptions: React.Dispatch<React.SetStateAction<Array<any>>>;
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
  setIsPresentInAtecoWhiteList?: (value: boolean) => void;
  setMerchantSearchResult?: Dispatch<SetStateAction<any>>;
};

// eslint-disable-next-line complexity
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
  setIsPresentInAtecoWhiteList,
  setMerchantSearchResult,
}: Props) {
  const { t } = useTranslation();

  const [typeOfSearch, setTypeOfSearch] = useState('businessName');

  const handleTypeSearchChange = (event: SelectChangeEvent) => {
    handleSelectionChange(event.target.value as SelectionEnum);
    setIsSearchFieldSelected(true);
  };
  const onSelectValue = (selectedOption: SelectionEnum) => {
    handleSelectionChange(selectedOption);
    setOptions([]);
    setCfResult(undefined);
    setAooResult(undefined);
    setUoResult(undefined);
    setUoResultHistory(undefined);
    setAooResultHistory(undefined);
    setIsPresentInAtecoWhiteList?.(true);
    setMerchantSearchResult?.(undefined);
  };

  useEffect(() => {
    // Set taxCode as default when businessName is not available as an option
    // (for SCP, PRV, PRV_PF institution types, businessName is never shown in menuItems)
    if (
      addUser ||
      isPublicServiceCompany(institutionType) ||
      isPrivateInstitution(institutionType) ||
      isPrivatePersonInstitution(institutionType)
    ) {
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
      setIsPresentInAtecoWhiteList?.(true);
      setMerchantSearchResult?.(undefined);
    }
  }, [selections]);

  const menuItems = [
    !addUser &&
      !isPublicServiceCompany(institutionType) &&
      !isPrivateInstitution(institutionType) &&
      !isPrivatePersonInstitution(institutionType) && (
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
    isPrivateOrPersonInstitution(institutionType) &&
      isIdpayMerchantProduct(product?.id) && [
        <MenuItem key="reaCode" id="reaCode" data-testid="reaCode" value={SelectionEnum.reaCode}>
          {t('partyAdvancedSelect.reaCode')}
        </MenuItem>,
        <MenuItem
          key="personalTaxCode"
          id="personalTaxCode"
          data-testid="personalTaxCode"
          value={SelectionEnum.personalTaxCode}
        >
          {t('partyAdvancedSelect.personalTaxCode')}
        </MenuItem>,
      ],
    ((ENV.AOO_UO.SHOW_AOO_UO &&
      !isContractingAuthority(institutionType) &&
      !isInsuranceCompany(institutionType) &&
      !isGlobalServiceProvider(institutionType) &&
      !isPublicServiceCompany(institutionType) &&
      !isPrivateInstitution(institutionType) &&
      !isPrivatePersonInstitution(institutionType) &&
      !isConsolidatedEconomicAccountCompany(institutionType) &&
      [PRODUCT_IDS.INTEROP, PRODUCT_IDS.IO_SIGN, PRODUCT_IDS.SEND_DEV, PRODUCT_IDS.SEND].includes(
        product?.id ?? ''
      )) ||
      (addUser &&
        ENV.AOO_UO.SHOW_AOO_UO &&
        [PRODUCT_IDS.INTEROP, PRODUCT_IDS.IO_SIGN, PRODUCT_IDS.SEND_DEV, PRODUCT_IDS.SEND].includes(
          selectedProduct?.id ?? ''
        ))) && [
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
