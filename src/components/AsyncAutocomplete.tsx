import React, { useContext, useState } from 'react';
import debounce from 'lodash/debounce';
import { AxiosError, AxiosResponse } from 'axios';
import { Autocomplete, IconButton, InputAdornment, TextField } from '@mui/material';
import { Box } from '@mui/system';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import { Endpoint } from '../../types';
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome } from '../lib/error-utils';
import { ENV } from '../utils/env';
import { UserContext } from '../lib/context';

type AutocompleteProps = {
  selected: any;
  setSelected: React.Dispatch<React.SetStateAction<any>>;
  placeholder: string;
  endpoint: Endpoint;
  transformFn: any;
  optionKey?: string;
  optionLabel?: string;
};

export function AsyncAutocomplete({
  selected,
  setSelected,
  placeholder,
  endpoint,
  transformFn,
  optionKey,
  optionLabel,
}: AutocompleteProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState<string>('');
  const [options, setOptions] = useState<Array<any>>([]);
  const { setRequiredLogin } = useContext(UserContext);

  const handleSearch = async (query: string) => {
    setIsLoading(true);

    const searchResponse = await fetchWithLogs(
      endpoint,
      {
        method: 'GET',
        params: { limit: ENV.MAX_INSTITUTIONS_FETCH, page: 1, search: query },
      },
      () => setRequiredLogin(true)
    );

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
  const getOptionKey: (option: any) => string =
    optionKey !== undefined ? (o) => o[optionKey] : (o) => o.label ?? o;

  const getOptionLabel: (option: any) => string =
    optionLabel !== undefined ? (o) => o[optionLabel] : (o) => o.label ?? o;

  return (
    <Autocomplete
      id="Parties"
      freeSolo
      value={selected}
      noOptionsText={noOptionsText}
      onChange={(_event, value) => {
        setSelected(value);
        setInput(getOptionLabel(value));
      }}
      options={options}
      loading={isLoading}
      inputValue={input}
      disableClearable={true}
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
        if (reason === 'reset' && selected) {
          setInput(getOptionLabel(selected));
        }
      }}
      filterOptions={(x) => x}
      renderInput={(params) => (
        <TextField
          {...params}
          inputProps={{
            ...params.inputProps,
            style: {
              fontStyle: 'normal',
              fontWeight: 'normal',
              fontSize: '16px',
              lineHeight: '24px',
              color: '#5C6F82',
              textAlign: 'start',
              paddingLeft: '16px',
              textTransform: 'capitalize',
            },
          }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <InputAdornment position="end">
                {!input ? (
                  <SearchOutlinedIcon />
                ) : (
                  <IconButton
                    // color="primary"
                    onClick={() => setInput('')}
                    style={{ marginRight: '-10px' }}
                  >
                    <ClearOutlinedIcon />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
          placeholder={placeholder}
          variant="standard"
        />
      )}
      placeholder={placeholder}
      getOptionLabel={getOptionKey}
      renderOption={(props, option) => (
        <li {...props}>
          <Box
            sx={{
              fontStyle: 'normal',
              fontWeight: 'normal',
              fontSize: '16px',
              lineHeight: '24px',
              color: '#5A768A',
              textTransform: 'capitalize',
            }}
          >
            {getOptionLabel(option)?.toLowerCase()}
          </Box>
        </li>
      )}
    />
  );
}
