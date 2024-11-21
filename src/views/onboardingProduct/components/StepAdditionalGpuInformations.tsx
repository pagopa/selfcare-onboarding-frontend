import {
    FormControl,
    FormControlLabel,
    Grid,
    Paper,
    Radio,
    RadioGroup,
    TextField,
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
                    <Typography variant="h3"> {t('additionalGpuDataPage.title')}</Typography>
                </Grid>
                <Grid item xs={12} mb={4}>
                    <Typography variant="body2" fontSize={'18px'}>
                        <Trans i18nKey="additionalGpuDataPage.subTitle" components={{ 1: <br /> }} />
                    </Typography>
                </Grid>
            </Grid>

            <Paper elevation={8} sx={{ borderRadius: theme.spacing(2), p: 4, justifyContent: 'center', width: '70%' }}>
                <Grid container sx={{ textAlign: 'start' }}>
                    <Grid item xs={12} my={1}>
                        <Typography sx={{ fontSize: '18px', fontWeight: 600 }}> {t('additionalGpuDataPage.firstBlock.question.isPartyRegistered')}</Typography>
                    </Grid>
                    <Grid item xs={12} my={1}>
                        <FormControl>
                            <RadioGroup
                                aria-labelledby="demo-controlled-radio-buttons-group"
                                name="controlled-radio-buttons-group"
                                value={''}
                                onChange={() => ''}
                            >
                                <FormControlLabel value="female" control={<Radio />} label={t('additionalGpuDataPage.firstBlock.yes')} />
                                <FormControlLabel value="male" control={<Radio />} label={t('additionalGpuDataPage.firstBlock.no')} />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} my={1}>
                        <Typography sx={{ fontSize: '18px', fontWeight: 600 }}> {t('additionalGpuDataPage.firstBlock.question.subscribedTo')}</Typography>
                    </Grid>
                    <Grid container item xs={12} my={1} sx={{ display: 'flex', flexDirection: 'row' }}>
                        <Grid item xs={8} paddingRight={2}>
                            <FormControl fullWidth>
                                <TextField
                                    id=""
                                    variant="outlined"
                                    label={t('additionalGpuDataPage.firstBlock.placeholder.registerBoardList')}
                                    onChange={() => ''}
                                    // error={!!errors.optionalPartyInformations}
                                    // helperText={errors.optionalPartyInformations || ''}
                                    value={''}
                                    placeholder={t('additionalGpuDataPage.firstBlock.placeholder.registerBoardList')}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl fullWidth>
                                <TextField
                                    id=""
                                    variant="outlined"
                                    label={t('additionalGpuDataPage.firstBlock.placeholder.numberOfSubscription')}
                                    onChange={() => ''}
                                    // error={!!errors.optionalPartyInformations}
                                    // helperText={errors.optionalPartyInformations || ''}
                                    value={''}
                                    placeholder={t('additionalGpuDataPage.firstBlock.placeholder.numberOfSubscription')}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} my={1}>
                        <Typography sx={{ fontSize: '18px', fontWeight: 600 }}> {t('additionalGpuDataPage.firstBlock.question.isPartyProvidingAService')}</Typography>
                    </Grid>
                    <Grid item xs={12} my={1}>
                        <FormControl>
                            <RadioGroup
                                aria-labelledby="demo-controlled-radio-buttons-group"
                                name="controlled-radio-buttons-group"
                                value={''}
                                onChange={() => ''}
                            >
                                <FormControlLabel value="female" control={<Radio />} label={t('additionalGpuDataPage.firstBlock.yes')} />
                                <FormControlLabel value="male" control={<Radio />} label={t('additionalGpuDataPage.firstBlock.no')} />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} my={1}>
                        <Typography sx={{ fontSize: '18px', fontWeight: 600 }}> {t('additionalGpuDataPage.firstBlock.question.gpuRequestAccessFor')}</Typography>
                    </Grid>
                    <Grid item xs={12} my={1}>
                        <FormControl fullWidth>
                            <TextField
                                id=""
                                variant="outlined"
                                label={t('additionalGpuDataPage.firstBlock.placeholder.answer')}
                                onChange={() => ''}
                                // error={!!errors.optionalPartyInformations}
                                // helperText={errors.optionalPartyInformations || ''}
                                value={''}
                                placeholder={t('additionalGpuDataPage.firstBlock.placeholder.answer')}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} my={1}>
                        <Typography sx={{ fontSize: '18px', fontWeight: 600 }}> {t('additionalGpuDataPage.firstBlock.question.frequencyOfPayment')}</Typography>
                    </Grid>
                    <Grid item xs={12} my={1}>
                        <FormControl>
                            <RadioGroup
                                aria-labelledby="demo-controlled-radio-buttons-group"
                                name="controlled-radio-buttons-group"
                                value={''}
                                onChange={() => ''}
                            >
                                <FormControlLabel value="female" control={<Radio />} label={t('additionalGpuDataPage.firstBlock.yes')} />
                                <FormControlLabel value="male" control={<Radio />} label={t('additionalGpuDataPage.firstBlock.no')} />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                </Grid>
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
