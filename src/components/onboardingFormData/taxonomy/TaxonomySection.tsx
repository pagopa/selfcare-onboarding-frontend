import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  IconButton,
  useTheme,
} from '@mui/material';
import { AddOutlined, RemoveCircleOutlineOutlined, ClearOutlined } from '@mui/icons-material';
import { ButtonNaked } from '@pagopa/mui-italia';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
// import ResultsTaxonomyLocalValues from './ResultsTaxonomyLocalValues';
// import SearchTaxonomyLocalValues from './SearchTaxonomyLocalValues';

export default function TaxonomySection() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [isNationalAreaVisible, setIsNationalAreaVisible] = useState<boolean>();
  const [isLocalAreaVisible, setIsLocalAreaVisible] = useState<boolean>();
  const [inputList, setInputList] = useState([{ taxonomyRegion: '' }]);
  const [selectedRegion, _setSelectedRegion] = useState();

  const handleRemoveClick = (index: number) => {
    const list = [...inputList];
    // eslint-disable-next-line functional/immutable-data
    list.splice(index, 1);
    setInputList(list);
  };

  const handleAddClick = () => {
    setInputList([...inputList, { taxonomyRegion: '' }]);
  };

  return (
    <Paper elevation={0} sx={{ p: 5, borderRadius: '16px', my: 4 }}>
      <Grid container item pb={2}>
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
            control={<Radio />}
            label={t('onboardingFormData.taxonomySection.nationalLabel')}
            onChange={() => {
              setIsNationalAreaVisible(true);
              setIsLocalAreaVisible(false);
            }}
            sx={{ mr: 4, ml: 1 }}
          />
          <FormControlLabel
            checked={isLocalAreaVisible}
            value="local"
            control={<Radio />}
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
          {/* <Box sx={{ pt: 2 }} key={i}>
              <SearchTaxonomyLocalValues />
              <ResultsTaxonomyLocalValues />
            </Box> */}
          {/* <Box mt={2}>
            <ButtonNaked
              component="button"
              onClick={handleOpenClick}
              startIcon={<AddOutlinedIcon />}
              sx={{ color: 'primary.main' }}
              weight="default"
              // disabled={!selected}
            >
              {t('onboardingFormData.taxonomySection.localSection.addButtonLabel')}
            </ButtonNaked>
          </Box> */}

          {inputList.map((value, i) => (
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
                  <TextField
                    sx={{
                      width: '100%',
                    }}
                    id="Parties"
                    value={value.taxonomyRegion}
                    // onChange={(e) => handleInputChange(e, i)}
                    label={t('onboardingFormData.taxonomySection.localSection.inputLabel')}
                    variant={'outlined'}
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
                      endAdornment: selectedRegion && (
                        <IconButton
                          onClick={() => {
                            // setInputValue('');
                            //  setSelected('');
                            //  setSelectedHistory(null);
                          }}
                          aria-label="clearIcon"
                        >
                          <ClearOutlined color="primary" />
                        </IconButton>
                      ),
                    }}
                    name="taxonomyRegion"
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
