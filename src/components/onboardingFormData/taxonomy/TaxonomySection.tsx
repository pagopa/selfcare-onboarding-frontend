import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash/debounce';
import {
  RadioGroup,
  Radio,
  FormControlLabel,
  Paper,
  Grid,
  Typography,
  Box,
  Tooltip,
  TextField,
  // IconButton,
  // useTheme,
} from '@mui/material';
import { AddOutlined, RemoveCircleOutlineOutlined } from '@mui/icons-material';
import { ButtonNaked } from '@pagopa/mui-italia';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { AxiosError, AxiosResponse } from 'axios';
import { Autocomplete } from '@mui/lab';
// import { useHistoryState } from '../../useHistoryState';
import { Geotaxonomy } from '../../../model/Geotaxonomy';
import { fetchWithLogs } from '../../../lib/api-utils';
import { getFetchOutcome } from '../../../lib/error-utils';
import { UserContext } from '../../../lib/context';
import { ENV } from '../../../utils/env';

// import ResultsTaxonomyLocalValues from './ResultsTaxonomyLocalValues';
// import SearchTaxonomyLocalValues from './SearchTaxonomyLocalValues';

export default function TaxonomySection() {
  const { t } = useTranslation();
  // const theme = useTheme();
  const [isNationalAreaVisible, setIsNationalAreaVisible] = useState<boolean>();
  const [isLocalAreaVisible, setIsLocalAreaVisible] = useState<boolean>();
  const [inputList, setInputList] = useState([{ taxonomyRegion: '' }]);
  const [inputValue, setInputValue] = useState<Array<Geotaxonomy>>([]);
  const [_isLoading, setIsLoading] = useState(false);
  const { setRequiredLogin } = useContext(UserContext);
  const [options, setOptions] = useState<Array<Array<Geotaxonomy>>>([]);

  // TODO: impostare il setOptions di i sia all'add che al remove

  const handleRemoveClick = (index: number) => {
    const list = [...inputList];
    // eslint-disable-next-line functional/immutable-data
    list.splice(index, 1);
    setInputList(list);

    const valueList = [...inputValue];
    // eslint-disable-next-line functional/immutable-data
    valueList.splice(index, 1);
    setInputValue(valueList);
  };

  const handleAddClick = () => {
    setInputList([...inputList, { taxonomyRegion: '' }]);
    setInputValue((curInputValue) => [...curInputValue, ...[]]);
  };

  const handleChange = (_event: any, value: any, index: number) => {
    const newValues = inputValue;
    // eslint-disable-next-line functional/immutable-data
    newValues[index] = value;
    console.log('newValues', newValues);

    setInputValue(newValues);
  };

  const handleSearchInput = (event: any) => {
    const value = event.target.value;
    if (value.length >= 3) {
      void debounce(handleSearch, 100)(value);
    }
  };
  const handleSearch = async (query: string) => {
    setIsLoading(true);
    // TODO: far partire dopo 500ms e crealTimeout per non far partire chiamate ogni volta che digito
    const searchGeotaxonomy = await fetchWithLogs(
      {
        endpoint: 'ONBOARDING_GET_GEOTAXONOMY',
      },
      {
        method: 'GET',
        params: { limit: ENV.MAX_INSTITUTIONS_FETCH, page: 1, startsWith: query },
      },
      () => setRequiredLogin(true)
    );
    const outcome = getFetchOutcome(searchGeotaxonomy);
    console.log('outcome', outcome);

    console.log('data', searchGeotaxonomy);
    if (outcome === 'success') {
      // eslint-disable-next-line functional/no-let
      let data = (searchGeotaxonomy as AxiosResponse).data;

      data = data.map((value: Geotaxonomy) => ({ ...value, label: value.desc }));

      setOptions(data);
    } else if ((searchGeotaxonomy as AxiosError).response?.status === 404) {
      setOptions([]);
      console.log('error');
    }

    setIsLoading(false);
  };

  return (
    <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', my: 4 }}>
      <Grid container item pb={3}>
        <Grid item xs={12} display="flex">
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 'fontWeightBold' }}>
              {t('onboardingFormData.taxonomySection.title')}
            </Typography>
          </Box>
          <Box ml={2} display="flex" alignItems="center" sx={{ cursor: 'pointer' }}>
            <Tooltip
              title={t('onboardingFormData.taxonomySection.infoLabel') as string}
              placement="top"
              arrow={true}
            >
              <InfoOutlinedIcon color="primary" fontSize={'small'} />
            </Tooltip>
          </Box>
        </Grid>
      </Grid>
      <RadioGroup
        aria-labelledby="demo-radio-buttons-group-label"
        defaultValue="female"
        name="radio-buttons-group"
      >
        <Box display="flex">
          <FormControlLabel
            checked={isNationalAreaVisible}
            value="national"
            control={<Radio disableRipple={true} />}
            label={t('onboardingFormData.taxonomySection.nationalLabel')}
            onChange={() => {
              setIsNationalAreaVisible(true);
              setIsLocalAreaVisible(false);
            }}
            sx={{ mr: 3, ml: 1 }}
          />
          <FormControlLabel
            checked={isLocalAreaVisible}
            value="local"
            control={<Radio disableRipple={true} />}
            label={t('onboardingFormData.taxonomySection.localLabel')}
            onChange={() => {
              setIsNationalAreaVisible(false);
              setIsLocalAreaVisible(true);
            }}
          />
        </Box>
      </RadioGroup>
      {/* National Area Visible */}
      {isNationalAreaVisible && <> National area</>}
      {/* Local Area Visible */}
      {isLocalAreaVisible && (
        <>
          {inputList.map((_val, i) => (
            <div key={i}>
              <Box display={'flex'} width="100%" mt={2}>
                {i !== 0 && (
                  <Box display="flex" alignItems={'center'}>
                    <ButtonNaked
                      component="button"
                      onClick={() => handleRemoveClick(i)}
                      startIcon={<RemoveCircleOutlineOutlined />}
                      sx={{ color: 'error.dark', size: 'medium' }}
                      weight="default"
                      size="large"
                    />
                  </Box>
                )}
                <Box width="100%">
                  {/* <TextField
                    sx={{
                      width: '100%',
                    }}
                    id="Parties"
                    value={inputValue[i]}
                    // onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                    //   handleChange(event, i)
                    // }
                    label={
                      !selectedRegion
                        ? t('onboardingFormData.taxonomySection.localSection.inputLabel')
                        : ''
                    }
                    inputProps={{
                      style: {
                        fontStyle: 'normal',
                        fontWeight: '700',
                        fontSize: '16px',
                        lineHeight: '24px',
                        color: theme.palette.text.primary,
                        textAlign: 'start',
                        paddingLeft: '8px',
                        textTransform: 'capitalize',
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => {
                            setInputValue(['']);
                            setSelectedRegion(null);
                            setSelectedRegionHistory(null);
                          }}
                          aria-label="clearIcon"
                        >
                          <ClearOutlined color="primary" />
                        </IconButton>
                      ),
                    }}
                    name={`name ${i}`}
                  /> */}

                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    options={options[i]}
                    sx={{ width: 300 }}
                    onChange={(event: any, value: any) => handleChange(event, value, i)}
                    value={inputValue[i]}
                    renderOption={(props, option) => <span {...props}>{option.desc}</span>}
                    renderInput={(params) => (
                      <TextField
                        onChange={handleSearchInput}
                        {...params}
                        variant="outlined"
                        label={
                          !inputValue?.[i]?.desc
                            ? t('onboardingFormData.taxonomySection.localSection.inputLabel')
                            : ''
                        }
                      />
                    )}
                  />
                </Box>
              </Box>
              {inputList.length - 1 === i && (
                <Box mt={2}>
                  <ButtonNaked
                    component="button"
                    onClick={handleAddClick}
                    startIcon={<AddOutlined />}
                    sx={{ color: 'primary.main' }}
                    weight="default"
                  >
                    {t('onboardingFormData.taxonomySection.localSection.addButtonLabel')}
                  </ButtonNaked>
                </Box>
              )}
            </div>
          ))}
        </>
      )}
    </Paper>
  );
}
