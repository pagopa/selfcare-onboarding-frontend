import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { FormControl, InputLabel, MenuItem } from '@mui/material';

type Props = {
  setIsBusinessNameSelected: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setIsTaxCodeSelected: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setOptions: React.Dispatch<React.SetStateAction<Array<any>>>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
};

export default function PartyAdvancedSelect({
  setIsBusinessNameSelected,
  setIsTaxCodeSelected,
  setOptions,
  setInput,
}: Props) {
  const { t } = useTranslation();

  const [typeOfSearch, setTypeOfSearch] = useState('');

  const handleTypeSearchChange = (event: SelectChangeEvent) => {
    setTypeOfSearch(event.target.value as string);
  };
  const onSelectValue = (isTaxCodeSelected: boolean, IsBusinessNameSelected: boolean) => {
    setIsBusinessNameSelected(IsBusinessNameSelected);
    setIsTaxCodeSelected(isTaxCodeSelected);
    setOptions([]);
    setInput('');
  };
  return (
    <FormControl fullWidth size="small">
      <InputLabel id="advancedSearch">{t('Cerca per')}</InputLabel>
      <Select
        labelId="advancedSearch"
        id="demo-simple-select"
        value={typeOfSearch}
        label={t('Cerca per')}
        onChange={handleTypeSearchChange}
      >
        <MenuItem value={'businessName'} onClick={() => onSelectValue(false, true)}>
          {t('Ragione Sociale')}
        </MenuItem>
        <MenuItem value={'taxCode'} onClick={() => onSelectValue(true, false)}>
          {t('Codice Fiscale dell’ente')}
        </MenuItem>
        <MenuItem value={'ipaCode'}>{t('Codice IPA')}</MenuItem>
      </Select>
    </FormControl>
  );
}
