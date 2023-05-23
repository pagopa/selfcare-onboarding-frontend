import React, { useState } from 'react';

import { Grid, Paper, Theme } from '@mui/material';

import { Endpoint, Product } from '../../../types';
import { AooData } from '../../model/AooData';
import { InstitutionResource } from '../../model/InstitutionResource';
import { UoData } from '../../model/UoModel';
import AsyncAutocompleteContainer from './components/asyncAutocomplete/AsyncAutocompleteContainer';
import PartyAdvancedSelect from './components/partyAdvancedSearchType/PartyAdvancedSelect';

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
  product?: Product | null;
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
  product,
  setIsSearchFieldSelected,
}: AutocompleteProps) {
  const [options, setOptions] = useState<Array<InstitutionResource>>([]);
  const [cfResult, setCfResult] = useState<InstitutionResource>();
  const [aooResult, setAooResult] = useState<AooData>();
  const [uoResult, setUoResult] = useState<UoData>();

  console.log('aooResult', aooResult);
  console.log('aooResult', uoResult);

  const [isBusinessNameSelected, setIsBusinessNameSelected] = useState<boolean>(true);
  const [isAooCodeSelected, setIsAooCodeSelected] = useState<boolean>(false);
  const [isUoCodeSelected, setIsUoCodeSelected] = useState<boolean>(false);

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
              setIsTaxCodeSelected={setIsTaxCodeSelected}
              setIsBusinessNameSelected={setIsBusinessNameSelected}
              setIsAooCodeSelected={setIsAooCodeSelected}
              setIsUoCodeSelected={setIsUoCodeSelected}
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
          setCfResult={setCfResult}
          cfResult={cfResult}
          product={product}
          isAooCodeSelected={isAooCodeSelected}
          isUoCodeSelected={isUoCodeSelected}
          setAooResult={setAooResult}
          setUoResult={setUoResult}
          aooResult={aooResult}
          uoResult={uoResult}
        />
      </Grid>
    </Paper>
  );
}
