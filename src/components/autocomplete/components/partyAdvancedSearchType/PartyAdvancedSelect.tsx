import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InstitutionType, PartyData, Product } from '../../../../../types';
import { AooData } from '../../../../model/AooData';
import { UoData } from '../../../../model/UoModel';
import { ENV } from '../../../../utils/env';
import { PRODUCT_IDS } from '../../../../utils/constants';

type Props = {
  setIsBusinessNameSelected: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTaxCodeSelected: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setIsIvassCodeSelected: React.Dispatch<React.SetStateAction<boolean>>;
  setOptions: React.Dispatch<React.SetStateAction<Array<any>>>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setIsSearchFieldSelected: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAooCodeSelected: React.Dispatch<React.SetStateAction<boolean>>;
  setIsUoCodeSelected: React.Dispatch<React.SetStateAction<boolean>>;
  setIsReaCodeSelected: React.Dispatch<React.SetStateAction<boolean>>;
  setCfResult: React.Dispatch<React.SetStateAction<PartyData | undefined>>;
  setAooResult: Dispatch<SetStateAction<AooData | undefined>>;
  setUoResult: Dispatch<SetStateAction<UoData | undefined>>;
  setUoResultHistory: (t: UoData | undefined) => void;
  setAooResultHistory: (t: AooData | undefined) => void;
  isBusinessNameSelected?: boolean;
  isTaxCodeSelected?: boolean;
  isIvassCodeSelected?: boolean;
  isAooCodeSelected?: boolean;
  isUoCodeSelected?: boolean;
  isReaCodeSelected?: boolean;
  product?: Product | null;
  institutionType?: InstitutionType;
  addUser: boolean;
  selectedProduct?: Product;
};

export default function PartyAdvancedSelect({
  setIsBusinessNameSelected,
  setIsTaxCodeSelected,
  setIsIvassCodeSelected,
  setOptions,
  setInput,
  setIsSearchFieldSelected,
  setIsAooCodeSelected,
  setIsUoCodeSelected,
  setIsReaCodeSelected,
  setCfResult,
  setAooResult,
  setUoResult,
  isBusinessNameSelected,
  isTaxCodeSelected,
  isIvassCodeSelected,
  isAooCodeSelected,
  isUoCodeSelected,
  isReaCodeSelected,
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
    setTypeOfSearch(event.target.value as string);
    setIsSearchFieldSelected(true);
  };
  const onSelectValue = (
    isBusinessNameSelected: boolean,
    isTaxCodeSelected: boolean,
    isIvassCodeSelected: boolean,
    isAooCodeSelected: boolean,
    isUoCodeSelected: boolean,
    isReaCodeSelected: boolean
  ) => {
    setIsBusinessNameSelected(isBusinessNameSelected);
    setIsTaxCodeSelected(isTaxCodeSelected);
    setIsIvassCodeSelected(isIvassCodeSelected);
    setIsAooCodeSelected(isAooCodeSelected);
    setIsUoCodeSelected(isUoCodeSelected);
    setIsReaCodeSelected(isReaCodeSelected);
    setOptions([]);
    setInput('');
    setCfResult(undefined);
    setAooResult(undefined);
    setUoResult(undefined);
    setUoResultHistory(undefined);
    setAooResultHistory(undefined);
  };

  useEffect(() => {
    if (
      (product?.id === PRODUCT_IDS.INTEROP || product?.id === PRODUCT_IDS.IDPAY_MERCHANT) &&
      (institutionType === 'SCP' || institutionType === 'PRV')
    ) {
      onSelectValue(false, true, false, false, false, false);
      setTypeOfSearch('taxCode');
    }
  }, []);

  useEffect(() => {
    if (isBusinessNameSelected) {
      setTypeOfSearch('businessName');
    } else if (isTaxCodeSelected) {
      setTypeOfSearch('taxCode');
    } else if (isAooCodeSelected) {
      setTypeOfSearch('aooCode');
    } else if (isUoCodeSelected) {
      setTypeOfSearch('uoCode');
    } else if (isIvassCodeSelected) {
      setTypeOfSearch('ivassCode');
    } else if (isReaCodeSelected) {
      setTypeOfSearch('reaCode');
    } else {
      setTypeOfSearch('');
    }
  }, []);

  useEffect(() => {
    if (
      addUser ||
      ((product?.id === PRODUCT_IDS.INTEROP || product?.id === PRODUCT_IDS.IDPAY_MERCHANT) &&
        (institutionType === 'SCP' || institutionType === 'PRV'))
    ) {
      setTypeOfSearch('taxCode');
      setIsTaxCodeSelected(true);
    } else {
      setTypeOfSearch('businessName');
      setIsBusinessNameSelected(true);
    }
  }, []);

  const filteredByProducts = (product?: Product) =>
    product &&
    (product.id === PRODUCT_IDS.INTEROP ||
      product.id === PRODUCT_IDS.IO_SIGN ||
      product.id === PRODUCT_IDS.SEND_DEV ||
      product.id === PRODUCT_IDS.SEND);

  const optionsAvailable4InstitutionType =
    institutionType !== 'SA' && institutionType !== 'AS' && institutionType !== 'GSP';

  const menuItems = [
    {
      id: 'aooCode',
      ['data-testid']: 'aooCode',
      value: 'aooCode',
      onClick: () => onSelectValue(false, false, false, true, false, false),
      label: t('partyAdvancedSelect.aooCode'),
    },
    {
      id: 'uoCode',
      ['data-testid']: 'uoCode',
      value: 'uoCode',
      onClick: () => onSelectValue(false, false, false, false, true, false),
      label: t('partyAdvancedSelect.uoCode'),
    },
  ];

  return (
    <FormControl fullWidth size="small">
      <InputLabel id="advancedSearch">{t('partyAdvancedSelect.advancedSearchLabel')}</InputLabel>
      <Select
        labelId="advancedSearch"
        id="party-type-select"
        value={typeOfSearch}
        label={t('partyAdvancedSelect.advancedSearchLabel')}
        onChange={handleTypeSearchChange}
      >
        {!addUser && institutionType !== 'SCP' && institutionType !== 'PRV' && (
          <MenuItem
            id="businessName"
            data-testid="businessName"
            value={'businessName'}
            onClick={() => onSelectValue(true, false, false, false, false, false)}
          >
            {t('partyAdvancedSelect.businessName')}
          </MenuItem>
        )}
        {institutionType === 'AS' ? (
          <MenuItem
            id="ivassCode"
            data-testid="ivassCode"
            value={'ivassCode'}
            onClick={() => onSelectValue(false, false, true, false, false, false)}
          >
            {t('partyAdvancedSelect.ivassCode')}
          </MenuItem>
        ) : (
          <MenuItem
            id="taxCode"
            data-testid="taxCode"
            value={'taxCode'}
            onClick={() => onSelectValue(false, true, false, false, false, false)}
          >
            {t('partyAdvancedSelect.taxCode')}
          </MenuItem>
        )}

        {institutionType === 'PRV' && product?.id === PRODUCT_IDS.IDPAY_MERCHANT && (
          <MenuItem
            id="reaCode"
            data-testid="reaCode"
            value={'reaCode'}
            onClick={() => onSelectValue(false, false, false, false, false, true)}
          >
            {t('partyAdvancedSelect.reaCode')}
          </MenuItem>
        )}

        {((ENV.AOO_UO.SHOW_AOO_UO &&
          optionsAvailable4InstitutionType &&
          institutionType !== 'SCP' &&
          institutionType !== 'PRV' &&
          filteredByProducts(product as Product)) ||
          (addUser && ENV.AOO_UO.SHOW_AOO_UO && filteredByProducts(selectedProduct))) &&
          menuItems.map((item) => (
            <MenuItem
              key={item.id}
              id={item.id}
              data-testid={item['data-testid']}
              value={item.value}
              onClick={item.onClick}
            >
              {item.label}
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
}
