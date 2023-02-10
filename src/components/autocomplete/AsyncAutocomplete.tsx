import React, { useState } from 'react';
import { Theme, Grid, Paper } from '@mui/material';
import { Endpoint } from '../../../types';
import PartyAdvancedSelect from './components/partyAdvancedSelect/PartyAdvancedSelect';
import AsyncAutocompleteContainer from './components/asyncAutocomplete/AsyncAutocompleteContainer';

type AutocompleteProps = {
  selected: any;
  setSelected: React.Dispatch<React.SetStateAction<any>>;
  endpoint: Endpoint;
  transformFn: any;
  optionKey?: string;
  optionLabel?: string;
  theme: Theme;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export function AsyncAutocomplete({
  selected,
  setSelected,
  endpoint,
  transformFn,
  optionKey,
  optionLabel,
  theme,
}: AutocompleteProps) {
  const [input, setInput] = useState<string>('');
  const [options, setOptions] = useState<Array<any>>([]);
  const [isBusinessNameSelected, setIsBusinessNameSelected] = useState<boolean>();
  const [isTaxCodeSelected, setIsTaxCodeSelected] = useState<boolean>();
  const [isSearchFieldSelected, setIsSearchFieldSelected] = useState<boolean>(false);

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
              isSearchFieldSelected={isSearchFieldSelected}
              isSelected={selected}
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
          setIsSearchFieldSelected={setIsSearchFieldSelected}
        />
      </Grid>
    </Paper>
  );
}
