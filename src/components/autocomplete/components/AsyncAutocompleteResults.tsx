import { Box, styled } from '@mui/system';
import { PartyAccountItemButton } from '@pagopa/mui-italia/dist/components/PartyAccountItemButton';

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
          <Box py={1} key={getOptionKey(option)} display="flex">
            <PartyAccountItemButton
              partyName={getOptionLabel(option)}
              image={' '}
              action={() => {
                setSelected(option);
                setOptions([]);
              }}
              maxCharactersNumberMultiLine={20}
            />
          </Box>
        ))}
    </CustomBox>
  );
}
