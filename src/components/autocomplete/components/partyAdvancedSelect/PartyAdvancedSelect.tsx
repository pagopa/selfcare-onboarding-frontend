import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { FormControl, InputLabel, MenuItem } from '@mui/material';

type Props = {
  setIsBusinessNameSelected: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setIsTaxCodeSelected: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setOptions: React.Dispatch<React.SetStateAction<Array<any>>>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setIsSearchFieldSelected: React.Dispatch<React.SetStateAction<boolean>>;
  isSearchFieldSelected?: boolean;
  selected: boolean;
};

export default function PartyAdvancedSelect({
  setIsBusinessNameSelected,
  setIsTaxCodeSelected,
  setOptions,
  setInput,
  setIsSearchFieldSelected,
  isSearchFieldSelected,
  selected,
}: Props) {
  const { t } = useTranslation();

  const [typeOfSearch, setTypeOfSearch] = useState('');

  const handleTypeSearchChange = (event: SelectChangeEvent) => {
    setTypeOfSearch(event.target.value as string);
    setIsSearchFieldSelected(true);
  };
  const onSelectValue = (isTaxCodeSelected: boolean, IsBusinessNameSelected: boolean) => {
    setIsBusinessNameSelected(IsBusinessNameSelected);
    setIsTaxCodeSelected(isTaxCodeSelected);
    setOptions([]);
    setInput('');
  };

  useEffect(() => {
    if (isSearchFieldSelected || selected) {
      setIsSearchFieldSelected(true);
    } else {
      setIsSearchFieldSelected(false);
    }
  }, [isSearchFieldSelected]);
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
        <MenuItem value={'businessName'} onClick={() => onSelectValue(false, true)}>
          {t('partyAdvancedSelect.businessName')}
        </MenuItem>
        <MenuItem value={'taxCode'} onClick={() => onSelectValue(true, false)}>
          {t('partyAdvancedSelect.taxCode')}
        </MenuItem>
        <MenuItem value={'ipaCode'}> {t('partyAdvancedSelect.ipaCode')}</MenuItem>
      </Select>
    </FormControl>
  );
}
