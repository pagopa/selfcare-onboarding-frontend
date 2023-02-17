import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectChangeEvent } from '@mui/material/Select';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

type Props = {
  setIsBusinessNameSelected: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTaxCodeSelected: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setOptions: React.Dispatch<React.SetStateAction<Array<any>>>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setIsSearchFieldSelected: React.Dispatch<React.SetStateAction<boolean>>;
  selected: boolean;
};

export default function PartyAdvancedSelect({
  setIsBusinessNameSelected,
  setIsTaxCodeSelected,
  setOptions,
  setInput,
  setIsSearchFieldSelected,
}: Props) {
  const { t } = useTranslation();

  const [typeOfSearch, setTypeOfSearch] = useState('businessName');

  const handleTypeSearchChange = (event: SelectChangeEvent) => {
    setTypeOfSearch(event.target.value as string);
    setIsSearchFieldSelected(true);
  };
  const onSelectValue = (isBusinessNameSelected: boolean, isTaxCodeSelected: boolean) => {
    setIsBusinessNameSelected(isBusinessNameSelected);
    setIsTaxCodeSelected(isTaxCodeSelected);
    setOptions([]);
    setInput('');
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
        <MenuItem value={'businessName'} onClick={() => onSelectValue(true, false)}>
          {t('partyAdvancedSelect.businessName')}
        </MenuItem>
        <MenuItem value={'taxCode'} onClick={() => onSelectValue(false, true)}>
          {t('partyAdvancedSelect.taxCode')}
        </MenuItem>
        <MenuItem value={'ipaCode'}> {t('partyAdvancedSelect.ipaCode')}</MenuItem>
      </Select>
    </FormControl>
  );
}
