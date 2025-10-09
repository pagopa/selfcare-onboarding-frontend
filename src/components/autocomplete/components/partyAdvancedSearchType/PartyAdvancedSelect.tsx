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
};

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
  };

  useEffect(() => {
    if (
      addUser ||
      ((product?.id === PRODUCT_IDS.INTEROP || product?.id === PRODUCT_IDS.IDPAY_MERCHANT) &&
        (institutionType === 'SCP' || institutionType === 'PRV'))
    ) {
      onSelectValue(SelectionEnum.taxCode);
      // setTypeOfSearch(SelectionEnum.taxCode);
    } else {
      onSelectValue(SelectionEnum.businessName);
      // setTypeOfSearch(SelectionEnum.businessName);
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
    }
  }, [selections]);

  const menuItems = [
    !addUser && institutionType !== 'SCP' && institutionType !== 'PRV' && (
      <MenuItem
        key="businessName"
        id="businessName"
        data-testid="businessName"
        value={SelectionEnum.businessName}
      >
        {t('partyAdvancedSelect.businessName')}
      </MenuItem>
    ),
    institutionType === 'AS' ? (
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
    institutionType === 'PRV' &&
      product?.id === PRODUCT_IDS.IDPAY_MERCHANT && [
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
      institutionType !== 'SA' &&
      institutionType !== 'AS' &&
      institutionType !== 'GSP' &&
      institutionType !== 'SCP' &&
      institutionType !== 'PRV' &&
      institutionType !== 'SCEC' &&
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
