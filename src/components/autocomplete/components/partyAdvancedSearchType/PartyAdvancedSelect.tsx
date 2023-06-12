import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectChangeEvent } from '@mui/material/Select';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { InstitutionResource } from '../../../../model/InstitutionResource';
import { AooData } from '../../../../model/AooData';
import { UoData } from '../../../../model/UoModel';

type Props = {
  setIsBusinessNameSelected: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTaxCodeSelected: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setOptions: React.Dispatch<React.SetStateAction<Array<any>>>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setIsSearchFieldSelected: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAooCodeSelected: React.Dispatch<React.SetStateAction<boolean>>;
  setIsUoCodeSelected: React.Dispatch<React.SetStateAction<boolean>>;
  selected: boolean;
  setCfResult: React.Dispatch<React.SetStateAction<InstitutionResource | undefined>>;
  setAooResult: Dispatch<SetStateAction<AooData | undefined>>;
  setUoResult: Dispatch<SetStateAction<UoData | undefined>>;
  setUoResultHistory: (t: UoData | undefined) => void;
  setAooResultHistory: (t: AooData | undefined) => void;
  isBusinessNameSelected?: boolean;
  isTaxCodeSelected?: boolean;
  isAooCodeSelected?: boolean;
  isUoCodeSelected?: boolean;
};

export default function PartyAdvancedSelect({
  setIsBusinessNameSelected,
  setIsTaxCodeSelected,
  setOptions,
  setInput,
  setIsSearchFieldSelected,
  setIsAooCodeSelected,
  setIsUoCodeSelected,
  setCfResult,
  setAooResult,
  setUoResult,
  isBusinessNameSelected,
  isTaxCodeSelected,
  isAooCodeSelected,
  isUoCodeSelected,
  setUoResultHistory,
  setAooResultHistory,
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
    isAooCodeSelected: boolean,
    isUoCodeSelected: boolean
  ) => {
    setIsBusinessNameSelected(isBusinessNameSelected);
    setIsTaxCodeSelected(isTaxCodeSelected);
    setIsAooCodeSelected(isAooCodeSelected);
    setIsUoCodeSelected(isUoCodeSelected);
    setOptions([]);
    setInput('');
    setCfResult(undefined);
    setAooResult(undefined);
    setUoResult(undefined);
    setUoResultHistory(undefined);
    setAooResultHistory(undefined);
  };

  useEffect(() => {
    if (isBusinessNameSelected) {
      setTypeOfSearch('businessName');
    } else if (isTaxCodeSelected) {
      setTypeOfSearch('taxCode');
    } else if (isAooCodeSelected) {
      setTypeOfSearch('aooCode');
    } else if (isUoCodeSelected) {
      setTypeOfSearch('uoCode');
    }
  }, []);

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
        <MenuItem
          id="businessName"
          data-testid="businessName"
          value={'businessName'}
          onClick={() => onSelectValue(true, false, false, false)}
        >
          {t('partyAdvancedSelect.businessName')}
        </MenuItem>
        <MenuItem
          id="taxCode"
          data-testid="taxCode"
          value={'taxCode'}
          onClick={() => onSelectValue(false, true, false, false)}
        >
          {t('partyAdvancedSelect.taxCode')}
        </MenuItem>
        <MenuItem
          id="aooCode"
          data-testid="aooCode"
          value={'aooCode'}
          onClick={() => onSelectValue(false, false, true, false)}
        >
          {t('partyAdvancedSelect.aooCode')}
        </MenuItem>
        <MenuItem
          id="uoCode"
          data-testid="uoCode"
          value={'uoCode'}
          onClick={() => onSelectValue(false, false, false, true)}
        >
          {t('partyAdvancedSelect.uoCode')}
        </MenuItem>
      </Select>
    </FormControl>
  );
}
