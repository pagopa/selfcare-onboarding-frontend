import { Box, BoxProps, Checkbox, CheckboxProps, Typography } from '@mui/material';
import { ReactNode } from 'react';

type Props = Omit<CheckboxProps, 'inputProps'> & {
  label: string;
  description?: ReactNode;
  containerProps?: BoxProps;
};

const LabeledCheckbox = ({ label, description, containerProps, ...checkboxProps }: Props) => {
  const labelText = <Typography component={'span'}>{label}</Typography>;

  return (
    <Box display="flex" alignItems="center" {...containerProps}>
      <Checkbox {...checkboxProps} inputProps={{ 'aria-label': label }} />
      {description ? (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {labelText}
          {description}
        </Box>
      ) : (
        labelText
      )}
    </Box>
  );
};

export default LabeledCheckbox;
