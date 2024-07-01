import { Box, Grid, IconButton, Paper, Typography, alpha } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import { withLogin } from '../../../components/withLogin';
import { IPACatalogParty, InstitutionType, StepperStepComponentProps } from '../../../../types';
import { ProductResource } from '../../../model/ProductResource';
import { Autocomplete } from '../../../components/autocomplete/Autocomplete';
import { useHistoryState } from '../../../components/useHistoryState';
import { AooData } from '../../../model/AooData';
import { UoData } from '../../../model/UoModel';
import { OnboardingStepActions } from '../../../components/OnboardingStepActions';
import { OnboardedParty } from '../../../model/OnboardedParty';
import AddUserHeading from '../AddUserHeading';

type Props = {
  institutionType?: InstitutionType;
  selectedProduct?: ProductResource;
} & StepperStepComponentProps;

function StepSearchOnboardedParty({ institutionType, selectedProduct, forward, back }: Props) {
  const { t } = useTranslation();

  const [selected, setSelected, _setSelectedHistory] = useHistoryState<IPACatalogParty | null>(
    'selected_step1',
    null
  );

  const [aooResult, setAooResult, _setAooResultHistory] = useHistoryState<AooData | undefined>(
    'aooSelected_step1',
    undefined
  );
  const [uoResult, setUoResult, _setUoResultHistory] = useHistoryState<UoData | undefined>(
    'aooSelected_step1',
    undefined
  );

  const [disabled, setDisabled] = useState<boolean>(false);

  return (
    <Grid container item>
      <AddUserHeading institutionType={institutionType} />
      <Grid container sx={{ justifyContent: 'center' }}>
        <Grid container item sx={{ justifyContent: 'center', marginBottom: 4 }}>
          <Paper
            elevation={8}
            sx={{
              borderRadius: theme.spacing(2),
              p: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '480px',
              height: '113px',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                paddingLeft: 1,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  width: '48px',
                  height: '48px',
                  backgroundColor: selectedProduct?.logoBgColor
                    ? selectedProduct.logoBgColor
                    : theme.palette.background.paper,
                  boxSizing: 'border-box',
                  padding: theme.spacing(1),
                  borderRadius: theme.spacing(1),
                  '&:after': {
                    content: "''",
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    boxShadow: selectedProduct?.logoBgColor
                      ? `inset 0 0 0 1px ${alpha(theme.palette.common.black, 0.1)}`
                      : `inset 0 0 0 1px ${theme.palette.divider}`,
                    borderRadius: 'inherit',
                  },
                }}
              >
                <img
                  src={selectedProduct?.logo}
                  alt={`${selectedProduct?.title} logo`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'center',
                  }}
                />
              </Box>
              <Box pl={1.5}>
                <Typography
                  sx={{
                    fontWeight: 'fontWeightMedium',
                    fontSize: '18px',
                    color: theme.palette.text.primary,
                  }}
                >
                  {selectedProduct?.title}
                </Typography>
              </Box>
            </Box>
            {selectedProduct && (
              <IconButton onClick={back} aria-label="clearIcon">
                <ClearOutlinedIcon
                  sx={{
                    color: theme.palette.text.primary,
                  }}
                />
              </IconButton>
            )}
          </Paper>
        </Grid>
        <Grid container item sx={{ justifyContent: 'center', width: '480px', height: 'auto' }}>
          <Autocomplete
            endpoint={{ endpoint: 'ONBOARDING_GET_INSTITUTIONS' }}
            externalInstitutionId=""
            isSearchFieldSelected={true}
            transformFn={(data: { items: Array<OnboardedParty> }) =>
              /* removed transformation into lower case in order to send data to BE as obtained from registry
                  // eslint-disable-next-line functional/immutable-data
                  data.items.forEach((i) => (i.description = i.description.toLowerCase()));
                  */
              data.items
            }
            selected={selected as any}
            setSelected={setSelected}
            aooResult={aooResult}
            uoResult={uoResult}
            setAooResult={setAooResult}
            setUoResult={setUoResult}
            setDisabled={setDisabled}
            setIsSearchFieldSelected={() => {}}
            selectedProduct={selectedProduct}
          />
        </Grid>
        <Grid item xs={12} mt={2} mb={5}>
          <OnboardingStepActions
            back={{
              action: back,
              label: t('onboardingStep1.onboarding.onboardingStepActions.backAction'),
              disabled: false,
            }}
            forward={{
              action: () => {
                if (selected) {
                  forward(selected);
                }
              },
              label: t('stepInstitutionType.confirmLabel'),
              disabled,
            }}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}

export default withLogin(StepSearchOnboardedParty);
