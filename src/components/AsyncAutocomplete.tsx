import React, { useState } from 'react';
import debounce from 'lodash/debounce';
import { AxiosError, AxiosResponse } from 'axios';
import { Autocomplete, TextField } from '@mui/material';
import { Box } from '@mui/system';
import { Endpoint } from '../../types';
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome } from '../lib/error-utils';
// import logo from '../assets/comune-milano-logo.svg';

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
    } else if ((searchResponse as AxiosError).response?.status === 404) {
      setOptions([]);
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
      freeSolo
      value={selected}
      noOptionsText={noOptionsText}
      onChange={(_event, value) => setSelected(value)}
      options={options}
      loading={isLoading}
      onInputChange={(_event, value, reason) => {
        setInput(value);

        if (reason === 'input') {
          setSelected(null);
          if (value.length >= 3) {
            void debounce(handleSearch, 100)(value);
          }
        }
        if (reason === 'clear') {
          setSelected(null);
        }
      }}
      filterOptions={(x) => x}
      renderInput={(params) => (
        <TextField
          {...params}
          inputProps={{
            style: {
              fontFamily: 'Titillium Web',
              fontStyle: 'normal',
              fontWeight: 'normal',
              fontSize: '16px',
              lineHeight: '24px',
              color: '#C1C9D2',
              textAlign: 'start',
              paddingLeft: '16px',
            },
            ...params.inputProps,
          }}
          variant="standard"
        />
      )}
      placeholder={placeholder}
      getOptionLabel={getOptionLabel}
      renderOption={(props, option) => (
        <li {...props}>
          {/* <Box sx={{ width: 50 }}>
            <img src={logo}></img>
          </Box> */}
          <Box
            sx={{
              fontFamily: 'Titillium Web',
              fontStyle: 'normal',
              fontWeight: 'normal',
              fontSize: '16px',
              lineHeight: '24px',
              color: '#5A768A',
              textTransform: 'capitalize',
            }}
          >
            {option.description?.toLowerCase()}
          </Box>
        </li>
      )}
    />
  );
}
