import React, { useState } from 'react';
import { Theme, Grid, Paper } from '@mui/material';
import { Endpoint } from '../../../types';
import PartyAdvancedSelect from './components/partyAdvancedSearchType/PartyAdvancedSelect';
import AsyncAutocompleteContainer from './components/asyncAutocomplete/AsyncAutocompleteContainer';

type AutocompleteProps = {
  selected: any;
  setSelected: React.Dispatch<React.SetStateAction<any>>;
  endpoint: Endpoint;
  transformFn: any;
  optionKey?: string;
  optionLabel?: string;
  theme: Theme;
  isSearchFieldSelected: boolean;
  setIsSearchFieldSelected: React.Dispatch<React.SetStateAction<boolean>>;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export function Autocomplete({
  selected,
  setSelected,
  endpoint,
  transformFn,
  optionKey,
  optionLabel,
  theme,
  isSearchFieldSelected,
  setIsSearchFieldSelected,
}: AutocompleteProps) {
  const [options, setOptions] = useState<Array<any>>([]);
  const [isBusinessNameSelected, setIsBusinessNameSelected] = useState<boolean>(true);

  const [isTaxCodeSelected, setIsTaxCodeSelected] = useState<boolean>();
  const [input, setInput] = useState<string>('');

  return (
    <Paper
      elevation={8}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '104px',
        maxHeight: '100%',
        minWidth: '480px',
        borderRadius: theme.spacing(2),
      }}
    >
      <Grid container mx={selected ? 4 : undefined}>
        {!selected && (
          <Grid item xs={12} px={4} pt={4}>
            <PartyAdvancedSelect
              setIsBusinessNameSelected={setIsBusinessNameSelected}
              setIsTaxCodeSelected={setIsTaxCodeSelected}
              setOptions={setOptions}
              setInput={setInput}
              setIsSearchFieldSelected={setIsSearchFieldSelected}
              selected={selected}
            />
          </Grid>
        )}
        <AsyncAutocompleteContainer
          optionKey={optionKey}
          optionLabel={optionLabel}
          input={input}
          endpoint={endpoint}
          setOptions={setOptions}
          transformFn={transformFn}
          setInput={setInput}
          setSelected={setSelected}
          isBusinessNameSelected={isBusinessNameSelected}
          setIsBusinessNameSelected={setIsBusinessNameSelected}
          isTaxCodeSelected={isTaxCodeSelected}
          setIsTaxCodeSelected={setIsTaxCodeSelected}
          selected={selected}
          theme={theme}
          options={options}
          isSearchFieldSelected={isSearchFieldSelected}
        />
      </Grid>
    </Paper>
  );
}
