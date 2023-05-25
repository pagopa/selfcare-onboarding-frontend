import React, { useState } from 'react';
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
  setAooResult: React.Dispatch<React.SetStateAction<AooData | undefined>>;
  setUoResult: React.Dispatch<React.SetStateAction<UoData | undefined>>;
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
  };

  return (
    <FormControl fullWidth size="small">
      <InputLabel id="advancedSearch">{t('partyAdvancedSelect.advancedSearchLabel')}</InputLabel>
      <Select
        labelId="advancedSearch"
        id="demo-simple-select"
        value={typeOfSearch}
        label={t('partyAdvancedSelect.advancedSearchLabel')}
        onChange={handleTypeSearchChange}
      >
        <MenuItem value={'businessName'} onClick={() => onSelectValue(true, false, false, false)}>
          {t('partyAdvancedSelect.businessName')}
        </MenuItem>
        <MenuItem value={'taxCode'} onClick={() => onSelectValue(false, true, false, false)}>
          {t('partyAdvancedSelect.taxCode')}
        </MenuItem>
        <MenuItem value={'aooCode'} onClick={() => onSelectValue(false, false, true, false)}>
          {t('partyAdvancedSelect.aooCode')}
        </MenuItem>
        <MenuItem value={'uoCode'} onClick={() => onSelectValue(false, false, false, true)}>
          {t('partyAdvancedSelect.uoCode')}
        </MenuItem>
      </Select>
    </FormControl>
  );
}
