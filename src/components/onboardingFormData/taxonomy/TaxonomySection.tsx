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
} from '@mui/material';
import { AddOutlined, RemoveCircleOutlineOutlined } from '@mui/icons-material';
import { ButtonNaked } from '@pagopa/mui-italia';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { AxiosError, AxiosResponse } from 'axios';
import { fetchWithLogs } from '../../../lib/api-utils';
import { getFetchOutcome } from '../../../lib/error-utils';
import { UserContext } from '../../../lib/context';
import { ENV } from '../../../utils/env';
import { OnboardingInstitutionInfo } from '../../../model/OnboardingInstitutionInfo';
import { GeographicTaxonomy } from '../../../model/GeographicTaxonomies';

export default function TaxonomySection() {
  const { t } = useTranslation();
  const [isNationalAreaVisible, setIsNationalAreaVisible] = useState<boolean>(false);
  const [isLocalAreaVisible, setIsLocalAreaVisible] = useState<boolean>(false);
  const [_isLoading, setIsLoading] = useState(false);
  const { setRequiredLogin } = useContext(UserContext);
  const [optionsSelected, setOptionsSelected] = useState<Array<GeographicTaxonomy>>([
    { code: '', desc: '' },
  ]);
  const [options, setOptions] = useState<Array<OnboardingInstitutionInfo>>([]);
  const [isAddNewAutocompleteEnabled, setIsAddNewAutocompleteEnabled] = useState<boolean>(false);

  // const mockedPreviusValue: Array<GeographicTaxonomy> = [
  //   {
  //     code: '058091',
  //     desc: 'Firenze - Comune',
  //   },
  //   {
  //     code: '014468',
  //     desc: 'Napoli - Comune',
  //   },
  // ];
  // const mockedPreviusValue: Array<GeographicTaxonomy> = [{ code: '100', desc: 'ITALIA' }];
  const mockedPreviusValue: Array<GeographicTaxonomy> = [];

  useEffect(() => {
    if (
      mockedPreviusValue &&
      mockedPreviusValue.length > 0 &&
      mockedPreviusValue[0].code === '100'
    ) {
      setIsNationalAreaVisible(true);
      setOptionsSelected([{ code: '', desc: '' }]);
    } else if (mockedPreviusValue && mockedPreviusValue.length > 0) {
      setIsLocalAreaVisible(true);
      setOptionsSelected(mockedPreviusValue);
      setIsAddNewAutocompleteEnabled(true);
    } else {
      setIsLocalAreaVisible(false);
      setIsNationalAreaVisible(false);
    }
  }, []);

  const isNationalFunction = ({ code, desc }: GeographicTaxonomy) =>
    code === '100' && desc === 'ITALIA' ? true : false;

  const handleRemoveClick = (index: number) => {
    const list = [...optionsSelected];
    // eslint-disable-next-line functional/immutable-data
    list.splice(index, 1);
    setOptionsSelected(list);
  };

  const handleAddClick = () => {
    setOptionsSelected([
      ...optionsSelected,
      {
        code: '',
        desc: '',
      },
    ]);
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

      data = data.map((value: OnboardingInstitutionInfo) => ({ ...value, label: value.desc }));

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
      <RadioGroup>
        <Box display="flex">
          <FormControlLabel
            checked={isNationalAreaVisible}
            value="national"
            control={<Radio disableRipple={true} />}
            label={t('onboardingFormData.taxonomySection.nationalLabel')}
            onChange={() => {
              console.log('onChange national');
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
              console.log('onChange local');
              setIsNationalAreaVisible(false);
              setIsLocalAreaVisible(true);
            }}
          />
        </Box>
      </RadioGroup>
      {/* National Area Visible */}
      {isNationalAreaVisible && (
        <TextField
          sx={{ width: '100%', marginTop: 2 }}
          disabled
          value={t('onboardingFormData.taxonomySection.nationalSection.italy')}
        ></TextField>
      )}
      {/* Local Area Visible */}
      {isLocalAreaVisible && (
        <>
          {optionsSelected
            .filter((val) => !isNationalFunction(val))
            .map((val, i) => (
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
                    <Autocomplete
                      freeSolo
                      disablePortal
                      options={options}
                      sx={{ width: '100%' }}
                      onChange={(event: any, value: any) => handleChange(event, value, i)}
                      value={val.desc}
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
                {optionsSelected.length - 1 === i && (
                  <Box mt={2}>
                    <ButtonNaked
                      disabled={!isAddNewAutocompleteEnabled}
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