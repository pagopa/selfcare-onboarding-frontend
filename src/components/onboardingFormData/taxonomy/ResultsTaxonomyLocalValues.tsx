import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import { Geotaxonomy } from '../../../model/Geotaxonomy';

// const CustomBox = styled(Box)({
//   /* width */
//   '::-webkit-scrollbar': {
//     width: '6px',
//   },
//   /* Track */
//   '::-webkit-scrollbar-track': {
//     boxShadow: 'inset 0 0 5px #F2F6FA',
//     borderRadius: '20px',
//   },
//   /* Handle */
//   '::-webkit-scrollbar-thumb': {
//     background: '#0073E6',
//     backgroundClip: 'padding-box',
//     borderRadius: '20px',
//   },
//   /* Handle on hover */
//   '::-webkit-scrollbar-thumb:hover': {
//     background: '#0073E6',
//   },
// });

type Props = {
  options: Array<Geotaxonomy>;
};

export default function ResultsTaxonomyLocalValues({ options }: Props) {
  return (
    <Box>
      <Typography>
        {options.map((value) => (
          <h1 key={value.code}>{value.desc}</h1>
        ))}
      </Typography>

      {/* <CustomBox my={2} {...options} width="80%" maxHeight="200px" overflow="auto">
      {!isLoading &&
        options.map((option) => (
          <Box
            py={1}
            key={getOptionKey(option)}
            display="flex"
            onKeyDownCapture={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setSelected(option);
                setOptions([]);
              }
            }}
          >
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
    </CustomBox> */}
    </Box>
  );
}
