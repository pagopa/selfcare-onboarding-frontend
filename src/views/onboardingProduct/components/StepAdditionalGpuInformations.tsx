import {
    Grid,
    Paper,
    Typography,
    useTheme,
} from '@mui/material';
import { useTranslation, Trans } from 'react-i18next';
import { OnboardingStepActions } from '../../../components/OnboardingStepActions';
import { StepperStepComponentProps } from '../../../../types';

type Props = StepperStepComponentProps & {
    originId?: string;
    origin?: string;
};
export function StepAdditionalGpuInformations({ back }: Props) {
    const { t } = useTranslation();
    const theme = useTheme();

    return (
        <Grid container item sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Grid container sx={{ textAlign: 'center' }}>
                <Grid item xs={12} mb={2}>
                    <Typography variant="h3"> {t('additionalDataPage.title')}</Typography>
                </Grid>
                <Grid item xs={12} mb={4}>
                    <Typography variant="body2" fontSize={'18px'}>
                        <Trans i18nKey="additionalDataPage.subTitle" components={{ 1: <br /> }} />
                    </Typography>
                </Grid>
            </Grid>

            <Paper elevation={8} sx={{ borderRadius: theme.spacing(2), px: 4, pt: 1 }}>
                Content
            </Paper>

            <Grid item mb={10} mt={4}>
                <OnboardingStepActions
                    back={{
                        action: back,
                        label: t('stepAddManager.back'),
                        disabled: false,
                    }}
                    forward={{
                        action: () => console.log('click!'),
                        label: t('stepAddManager.continue'),
                        //   disabled,
                    }}
                />
            </Grid>
        </Grid>
    );
};
