import React, { useState } from 'react';
import debounce from 'lodash/debounce';
import { AxiosResponse } from 'axios';
import { Autocomplete, TextField } from '@mui/material';
import { Endpoint } from '../../types';
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome } from '../lib/error-utils';

type AutocompleteProps = {
  selected: any;
  setSelected: React.Dispatch<React.SetStateAction<any>>;
  placeholder: string;
  endpoint: Endpoint;
  transformFn: any;
  labelKey?: string;
};

export function AsyncAutocomplete({
  selected,
  setSelected,
  placeholder,
  endpoint,
  transformFn,
  labelKey,
}: AutocompleteProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState<string>();
  const [options, setOptions] = useState<Array<any>>([]);

  const handleSearch = async (query: string) => {
    setIsLoading(true);

    const searchResponse = await fetchWithLogs(endpoint, {
      method: 'GET',
      params: { limit: 100, page: 1, search: query },
    });

    const outcome = getFetchOutcome(searchResponse);

    if (outcome === 'success') {
      setOptions(transformFn((searchResponse as AxiosResponse).data));
    }
    setIsLoading(false);
  };

  const noOptionsText =
    input !== undefined && input.length >= 3 ? 'No risultati' : 'Digita almeno 3 caratteri';
  const getOptionLabel: (option: any) => string =
    labelKey !== undefined ? (o) => o[labelKey] : (o) => o.label ?? o;

  return (
    <Autocomplete
      id="Parties"
      value={selected}
      noOptionsText={noOptionsText}
      onChange={setSelected}
      options={options}
      loading={isLoading}
      onInputChange={(_event, value, reason) => {
        setInput(value);
        if (reason === 'input' && value.length >= 3) {
          void debounce(handleSearch, 100)(value);
        }
      }}
      filterOptions={(x) => x}
      renderInput={(params) => <TextField {...params} variant="outlined" />}
      placeholder={placeholder}
      getOptionLabel={getOptionLabel}
    />
  );
}
