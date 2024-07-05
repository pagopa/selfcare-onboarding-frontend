import {
  Grid,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
  useTheme,
} from '@mui/material';
import { ButtonNaked } from '@pagopa/mui-italia';
import AddIcon from '@mui/icons-material/Add';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  title: React.ReactNode;
  label: string;
  field:
  | 'isEstabilishedRegulatoryProvision'
  | 'fromBelongsRegulatedMarket'
  | 'isFromIPA'
  | 'isConcessionaireOfPublicService';
  errorText: string;
  onRadioChange: (field: any, value: any) => void;
  onTextFieldChange: (open: boolean, field: string, value: string) => void;
  isIPA?: boolean;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export function RadioWithTextField({
  title,
  label,
  field,
  errorText,
  onRadioChange,
  onTextFieldChange,
  isIPA,
}: Props) {
  const theme = useTheme();
  const { t } = useTranslation();

  const [openTextField, setOpenTextField] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean | null>(null);
  const fieldIsFromIPA = field === 'isFromIPA';

  // const handleChangeCheckEvent = (e: React.ChangeEvent<HTMLInputElement>): any => setChecked(!e.currentTarget.checked);

  useEffect(() => {
    if (openTextField) {
      onTextFieldChange(true, field, '');
    } else {
      onTextFieldChange(false, field, '');
    }
  }, [openTextField]);

  useEffect(() => {
    if (fieldIsFromIPA && typeof isIPA !== 'undefined') {
      setChecked(isIPA);
    }
  }, [isIPA, fieldIsFromIPA]);

  return (
    <Grid item sx={{ width: '620px' }}>
      <FormControl>
        <FormLabel
          id={`${field}-choice`}
          sx={{
            marginTop: 3,
            fontSize: '18px',
            fontWeight: 'fontWeightMedium',
            '&.Mui-focused': {
              color: theme.palette.text.primary,
            },
          }}
        >
          {title}
        </FormLabel>
        <RadioGroup sx={{ marginY: 2, paddingLeft: 1 }}>
          <FormControlLabel
            value={true}
            control={
              <Radio
                size="small"
              />
            }
            checked={fieldIsFromIPA ? checked === true : undefined}
            disabled={fieldIsFromIPA && isIPA}
            // onChange={() => handleChangeCheckEvent}
            onClick={(e) => {
              if (fieldIsFromIPA && isIPA) {
                e.preventDefault();
                return;
              }
              setChecked(true);
              onRadioChange(field, true);
              if (fieldIsFromIPA) {
                setOpenTextField(true);
              }
            }}
            label={t('additionalDataPage.options.yes')}
          />
          <FormControlLabel
            value={false}
            control={
              <Radio
                size="small"
              />
            }
            checked={fieldIsFromIPA ? checked === false : undefined}
            disabled={fieldIsFromIPA && isIPA}
            // onChange={() => handleChangeCheckEvent}
            onClick={(e) => {
              if (fieldIsFromIPA && isIPA) {
                e.preventDefault();
                return;
              }
              setChecked(false);
              onRadioChange(field, false);
              if (!fieldIsFromIPA && openTextField) {
                setOpenTextField(true);
              } else {
                setOpenTextField(false);
              }
            }}
            label={t('additionalDataPage.options.no')}
          />
        </RadioGroup>
      </FormControl>
      <Grid item xs={12} mb={fieldIsFromIPA ? 0 : 3} display="flex" flexDirection="row">
        {openTextField ? (
          <>
            {field !== 'isFromIPA' && (
              <IconButton
                onClick={() => setOpenTextField(false)}
                sx={{
                  '&:hover': {
                    background: 'none',
                  },
                  marginRight: 1,
                  marginLeft: '-10px',
                }}
              >
                <RemoveCircleOutlineOutlinedIcon
                  fontSize="small"
                  sx={{ color: theme.palette.error.dark }}
                />
              </IconButton>
            )}
            <TextField
              variant="outlined"
              label={label}
              helperText={
                errorText !== ''
                  ? errorText
                  : fieldIsFromIPA
                    ? ''
                    : t('additionalDataPage.allowedCharacters')
              }
              fullWidth
              sx={{
                color: theme.palette.text.secondary,
                marginBottom: fieldIsFromIPA ? 3 : 0,
              }}
              inputProps={{ maxLength: fieldIsFromIPA ? 16 : 300 }}
              onChange={(e: any) => {
                onTextFieldChange(true, field, e.target.value);
              }}
              error={errorText !== ''}
            />
          </>
        ) : field !== 'isFromIPA' ? (
          <ButtonNaked
            component={'button'}
            startIcon={<AddIcon />}
            size="small"
            color="primary"
            sx={{ fontWeight: 'fontWeightBold' }}
            onClick={() => setOpenTextField(true)}
          >
            {t('additionalDataPage.addNote')}
          </ButtonNaked>
        ) : undefined}
      </Grid>
    </Grid>
  );
}
