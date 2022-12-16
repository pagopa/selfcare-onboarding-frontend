import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash/debounce';
import { Autocomplete } from '@mui/material';
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
// import { useHistoryState } from '../../useHistoryState';
import { OnboardedInstitutionInfo } from '../../../model/OnboardedInstitutionInfo';
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
  // const [previousSelectedValue, setPreviousSelectedValue] =
  //   useState<Array<OnboardedInstitutionInfo>>([]);
  const [autocompleteFields, setAutocompleteFields] = useState<Array<OnboardedInstitutionInfo>>([]);
  const [_isLoading, setIsLoading] = useState(false);
  const { setRequiredLogin } = useContext(UserContext);
  const [optionsSelected, setOptionsSelected] = useState<Array<OnboardedInstitutionInfo>>([]);
  const [options, setOptions] = useState<Array<OnboardedInstitutionInfo>>([...optionsSelected]);

  const mockedPreviusValue: Array<OnboardedInstitutionInfo> = [
    {
      code: '058091',
      desc: 'Firenze - Comune',
      region: '12',
      province: '058',
      provinceAbbreviation: 'RM',
      country: '100',
      countryAbbreviation: 'IT',
      startDate: new Date('1871-01-15'),
      endDate: undefined,
      enable: true,
    },
    {
      code: '015146',
      desc: 'Napoli - Comune',
      region: '03',
      province: '015',
      provinceAbbreviation: 'MI',
      country: '100',
      countryAbbreviation: 'IT',
      startDate: new Date('1861-03-18'),
      endDate: undefined,
      enable: true,
    },
  ];

  useEffect(() => {
    // TODO: add service -> /{externalInstitutionId}/products/{productId}/onboarded-institution-info --- move mock
    setAutocompleteFields(mockedPreviusValue);
  }, []);

  // TODO: impostare il setOptions di i sia all'add che al remove

  const handleRemoveClick = (index: number) => {
    const list = [...autocompleteFields];
    // eslint-disable-next-line functional/immutable-data
    list.splice(index, 1);
    setAutocompleteFields(list);

    const optionValues = [...options];
    // eslint-disable-next-line functional/immutable-data
    options.splice(index, 1);
    setOptionsSelected(optionValues);
  };

  const handleAddClick = () => {
    setAutocompleteFields([...autocompleteFields, [{ taxonomyRegion: '', id: '' }]]);
    setOptionsSelected((curInputValue) => [...curInputValue, ...[]]);
  };

  const handleChange = (_event: any, value: any, index: number) => {
    const newValues = optionsSelected;
    // eslint-disable-next-line functional/immutable-data
    newValues[index] = value;
    console.log('newValues', newValues);

    setOptionsSelected(newValues);
  };

  const handleSearchInput = (event: any) => {
    const value = event.target.value;
    console.log('value', value);

    if (value.length >= 3) {
      void debounce(handleSearch, 100)(value);
    }
  };
  const handleSearch = async (query: string) => {
    setIsLoading(true);
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

      data = data.map((value: OnboardedInstitutionInfo) => ({ ...value, label: value.desc }));

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
          {autocompleteFields.map((val, i) => {
            console.log('autocompleteField', val);
            const selectedValue = optionsSelected[i];

            console.log('selectedValue', selectedValue);
            return (
              <div key={val.code}>
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
                    value={optionsSelected[i]}
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
                            setOptionsSelected(['']);
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
                      freeSolo
                      disablePortal
                      id="combo-box-demo"
                      options={options}
                      sx={{ width: '100%' }}
                      onChange={(event: any, value: any) => handleChange(event, value, i)}
                      value={selectedValue}
                      renderOption={(props, option) => (
                        <span {...props}>{option.desc ? option.desc : 'test'}</span>
                      )}
                      renderInput={(params) => (
                        <TextField
                          onChange={handleSearchInput}
                          {...params}
                          variant="outlined"
                          label={
                            !optionsSelected?.[i]?.desc
                              ? t('onboardingFormData.taxonomySection.localSection.inputLabel')
                              : ''
                          }
                        />
                      )}
                    />
                  </Box>
                </Box>
                {autocompleteFields.length - 1 === i && (
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
            );
          })}
        </>
      )}
    </Paper>
  );
}
