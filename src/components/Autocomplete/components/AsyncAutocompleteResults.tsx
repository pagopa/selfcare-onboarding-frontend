import { Typography } from '@mui/material';
import { Box, styled } from '@mui/system';
import { ReactComponent as PartyIcon } from '../../../assets/onboarding_party_icon.svg';

const CustomBox = styled(Box)({
  /* width */
  '::-webkit-scrollbar': {
    width: '6px',
  },
  /* Track */
  '::-webkit-scrollbar-track': {
    boxShadow: 'inset 0 0 5px #F2F6FA',
    borderRadius: '20px',
  },
  /* Handle */
  '::-webkit-scrollbar-thumb': {
    background: '#0073E6',
    backgroundClip: 'padding-box',
    borderRadius: '20px',
  },

  /* Handle on hover */
  '::-webkit-scrollbar-thumb:hover': {
    background: '#0073E6',
  },
});

type Props = {
  setSelected: React.Dispatch<React.SetStateAction<any>>;
  options: Array<any>;
  setOptions: React.Dispatch<React.SetStateAction<any>>;
  isLoading: boolean;
  getOptionLabel: (option: any) => string;
  getOptionKey: (option: any) => string;
};

export default function AsyncAutocompleteResults({
  setSelected,
  options,
  setOptions,
  isLoading,
  getOptionLabel,
  getOptionKey,
}: Props) {
  return (
    <CustomBox my={2} {...options} width="80%" maxHeight="200px" overflow="auto">
      {!isLoading &&
        options.map((option) => (
          <Box
            py={1}
            key={getOptionKey(option)}
            sx={{
              fontStyle: 'normal',
              fontWeight: 'normal',
              fontSize: '16px',
              lineHeight: '24px',
              color: '#5A768A',
              textTransform: 'capitalize',
            }}
          >
            <Box display="flex">
              <Box pr={1}>
                <PartyIcon width={50} />
              </Box>
              <Box display="flex" alignItems="center">
                <Typography
                  onClick={() => {
                    setSelected(option);
                    setOptions([]);
                  }}
                  variant="sidenav"
                  sx={{ fontWeight: '700', cursor: 'pointer' }}
                >
                  {getOptionLabel(option)?.toLowerCase()}
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}
    </CustomBox>
  );
}
