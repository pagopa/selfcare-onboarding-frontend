import { Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { themeNext } from '@pagopa/mui-italia';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  maxWidth?: number;
};

// The mui-italia "MI" components rely on the design tokens provided only by themeNext
export function ContractUpdateLayout({ children, maxWidth = 936 }: Props) {
  return (
    <ThemeProvider theme={themeNext}>
      <Box sx={{ width: '100%', maxWidth, mx: 'auto', px: { xs: 2, md: 0 }, textAlign: 'left' }}>
        {children}
      </Box>
    </ThemeProvider>
  );
}
