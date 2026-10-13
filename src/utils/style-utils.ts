import { TextField } from '@mui/material';
import { styled } from '@mui/system';
import { theme } from '@pagopa/mui-italia';

interface CustomTextFieldNochedProps {
  paddingValue?: string;
}

export const CustomNumberField = styled(TextField)({
  'input::-webkit-inner-spin-button': {
    WebkitAppearance: 'none',
    margin: 0,
  },
  '.MuiInputLabel-asterisk': {
    display: 'none',
  },
});

export const autocompletePaperStyle = {
  paper: {
    sx: {
      '&::-webkit-scrollbar': {
        width: 4,
      },
      '&::-webkit-scrollbar-track': {
        boxShadow: `inset 10px 10px  #E6E9F2`,
        marginY: '3px',
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#0073E6',
        borderRadius: '16px',
      },
      overflowY: 'auto',
      maxHeight: '200px',
      boxShadow:
        '0px 6px 30px 5px rgba(0, 43, 85, 0.10), 0px 16px 24px 2px rgba(0, 43, 85, 0.05), 0px 8px 10px -5px rgba(0, 43, 85, 0.10)',
    },
  },
};

export const CustomTextField = styled(TextField)({
  '.MuiInputLabel-asterisk': {
    display: 'none',
  },
});

export const CustomTextFieldNotched = styled(TextField)<CustomTextFieldNochedProps>(
  ({ paddingValue }) => ({
    '.MuiInputLabel-asterisk': {
      display: 'none',
    },
    '& .MuiInputLabel-root': {
      whiteSpace: 'normal',
      overflow: 'visible',
    },
    '& .MuiOutlinedInput-notchedOutline legend': {
      paddingRight: '0',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline legend': {
      paddingRight: paddingValue ?? '0',
    },
    '& .MuiInputLabel-shrink + .MuiInputBase-root .MuiOutlinedInput-notchedOutline legend': {
      paddingRight: paddingValue ?? '0',
    },
  })
);

export const fieldColor = (disabled: boolean) =>
  disabled ? theme.palette.text.disabled : theme.palette.text.primary;
