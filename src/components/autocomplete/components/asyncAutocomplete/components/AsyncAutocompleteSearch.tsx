import { IconButton, TextField, Theme, Tooltip, Typography, Box } from '@mui/material';
import { styled } from '@mui/system';
import { useTranslation } from 'react-i18next';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { IPACatalogParty } from '../../../../../../types';
import { useHistoryState } from '../../../../useHistoryState';
import { InstitutionResource } from '../../../../../model/InstitutionResource';
import { AooData } from '../../../../../model/AooData';
import { UoData } from '../../../../../model/UoModel';
import { StepBillingDataHistoryState } from '../../../../steps/StepOnboardingFormData';

const CustomTextField = styled(TextField)({
  justifyContent: 'center',
  /* default */
  '.css-1tu8ncx-MuiInputBase-root-MuiInput-root:before': {
    borderBottom: 'none',
  },
  /* hover (double-ampersand needed for specificity reasons. */
  '&& .MuiInput-underline:hover:before': {
    borderBottom: 'none',
  },
  /* focused */
  '.MuiInput-underline:after': {
    borderBottom: 'none',
  },
  '.MuiInput-underline:before': {
    borderBottom: 'none',
  },
});

type Props = {
  theme: Theme;
  selected: any;
  setSelected: React.Dispatch<React.SetStateAction<any>>;
  setInput: Dispatch<SetStateAction<string>>;
  input: string;
  handleChange: (event: any) => void;
  isSearchFieldSelected: boolean;
  isAooCodeSelected?: boolean;
  isUoCodeSelected?: boolean;
  isTaxCodeSelected?: boolean;
  isBusinessNameSelected?: boolean;
  setCfResult: React.Dispatch<React.SetStateAction<InstitutionResource | undefined>>;
  setAooResult: React.Dispatch<React.SetStateAction<AooData | undefined>>;
  setUoResult: React.Dispatch<React.SetStateAction<UoData | undefined>>;
  externalInstitutionId: string;
};

// eslint-disable-next-line sonarjs/cognitive-complexity, complexity
export default function AsyncAutocompleteSearch({
  theme,
  selected,
  setSelected,
  setInput,
  input,
  handleChange,
  isSearchFieldSelected,
  isAooCodeSelected,
  isUoCodeSelected,
  isTaxCodeSelected,
  isBusinessNameSelected,
  setCfResult,
  setAooResult,
  setUoResult,
  externalInstitutionId,
}: Props) {
  const setSelectedHistory = useHistoryState<IPACatalogParty | null>('selected_step1', null)[2];
  const { t } = useTranslation();

  const [stepHistoryState, setStepHistoryState, setStepHistoryStateHistory] =
    useHistoryState<StepBillingDataHistoryState>('onboardingFormData', {
      externalInstitutionId,
      isTaxCodeEquals2PIVA: false,
    });
  const truncatedText = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical' as const,
    width: '100%',
    whiteSpace: 'normal' as const,
  };
  const valueSelected =
    isBusinessNameSelected && selected?.description
      ? selected.description
      : isTaxCodeSelected && selected?.description
      ? selected?.description
      : selected && isAooCodeSelected && selected?.denominazioneAoo
      ? selected?.denominazioneAoo
      : selected && isUoCodeSelected && selected.descrizioneUo
      ? selected?.descrizioneUo
      : input;

  useEffect(() => {
    if (selected && selected?.denominazioneAoo) {
      setInput(selected?.denominazioneAoo);
    } else if (selected && selected?.descrizioneUo) {
      setInput(selected?.descrizioneUo);
    } else {
      setInput(input);
    }
  }, []);

  return (
    <Tooltip arrow title={selected?.description?.length > 20 ? selected?.description : ''}>
      <CustomTextField
        disabled={!isSearchFieldSelected}
        id="Parties"
        sx={{
          width: '100%',
          mx: selected ? 1 : 4,
          '& input#Parties': { display: selected && 'none !important' },
        }}
        onChange={handleChange}
        value={!selected ? valueSelected : ''}
        label={
          !selected
            ? isAooCodeSelected
              ? t('asyncAutocomplete.aooLabel')
              : isUoCodeSelected
              ? t('asyncAutocomplete.uoLabel')
              : t('asyncAutocomplete.serachLabel')
            : ''
        }
        variant={!selected ? 'outlined' : 'standard'}
        inputProps={{
          // maxLength: isTaxCodeSelected ? '11' : undefined,
          style: {
            fontStyle: 'normal',
            fontWeight: '700',
            fontSize: '16px',
            lineHeight: '24px',
            color: theme.palette.text.primary,
            textAlign: 'start',
            paddingLeft: '8px',
            ...(selected && {
              ...truncatedText,
              WebkitLineClamp: 1,
            }),
          },
        }}
        InputProps={{
          startAdornment: selected && (
            <Box width="100%">
              <Typography variant="body1" sx={{ fontWeight: 'fontWeightBold' }}>
                {valueSelected}
              </Typography>
              {(isAooCodeSelected ||
                isUoCodeSelected ||
                selected.denominazioneAoo ||
                selected.descrizioneUo) && (
                <Typography
                  variant="body1"
                  sx={{
                    ...(selected && {
                      ...truncatedText,
                      WebkitLineClamp: 2,
                    }),
                  }}
                >
                  {selected.denominazioneEnte}
                </Typography>
              )}
            </Box>
          ),
          endAdornment: selected && (
            <IconButton
              disabled={!isSearchFieldSelected}
              onClick={() => {
                setInput('');
                setSelected('');
                setSelectedHistory(null);
                setCfResult(undefined);
                setAooResult(undefined);
                setUoResult(undefined);
                setStepHistoryState({
                  ...stepHistoryState,
                  isTaxCodeEquals2PIVA: false,
                });
                setStepHistoryStateHistory({
                  ...stepHistoryState,
                  isTaxCodeEquals2PIVA: false,
                });
              }}
              aria-label="clearIcon"
            >
              <ClearOutlinedIcon
                sx={{
                  color: !isSearchFieldSelected
                    ? theme.palette.text.disabled
                    : theme.palette.text.primary,
                }}
              />
            </IconButton>
          ),
        }}
      />
    </Tooltip>
  );
}
