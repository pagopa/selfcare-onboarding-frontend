import { FormikProps } from 'formik';
import { Grid, Typography } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { Dispatch, useState } from 'react';
import { Trans } from 'react-i18next';
import { OnboardingFormData } from '../../../model/OnboardingFormData';
import { InstitutionType, PaymentServiceProviderDto } from '../../../../types';
import { OnboardingControllers } from '../../../hooks/useOnboardingControllers';
import { CustomTextField } from '../../../utils/style-utils';
import {
  BaseTextFieldPropsFn,
  StepBillingDataHistoryState,
} from '../../steps/StepOnboardingFormData';
import LabeledCheckbox from './LabeledCheckbox';
import { getVatNumberLayout } from './vatNumberDataLayout';

type Props = {
  controllers: OnboardingControllers;
  formik: FormikProps<OnboardingFormData>;
  onboardingFormData?: OnboardingFormData;
  institutionType: InstitutionType;
  productId?: string;
  stepHistoryState: StepBillingDataHistoryState;
  setStepHistoryState: Dispatch<React.SetStateAction<StepBillingDataHistoryState>>;
  baseTextFieldProps: BaseTextFieldPropsFn;
  t: (key: string) => string;
  pspData: PaymentServiceProviderDto | undefined;
};

const VatNumberData = ({
  controllers,
  formik,
  onboardingFormData,
  institutionType,
  productId,
  stepHistoryState,
  setStepHistoryState,
  baseTextFieldProps,
  t,
  pspData,
}: Props) => {
  const [shrinkVatNumber, setShrinkVatNumber] = useState<boolean>(false);
  const layout = getVatNumberLayout({
    controllers,
    values: formik.values,
    institutionType,
    productId,
    onboardingFormData,
    isTaxCodeEquals2PIVA: stepHistoryState.isTaxCodeEquals2PIVA,
    pspData,
  });

  return (
    <>
      {layout.showCheckboxes && (
        <Grid container item spacing={3} xs={12} pl={3} pt={3} mb={layout.checkboxesMarginBottom}>
          {layout.showTaxCodeEquals2PIVA && (
            <Grid item>
              <LabeledCheckbox
                id="taxCodeEquals2VatNumber"
                label={t('onboardingFormData.billingDataSection.taxCodeEquals2PIVAdescription')}
                checked={stepHistoryState.isTaxCodeEquals2PIVA}
                disabled={layout.isTaxCodeEquals2PIVADisabled}
                onChange={(e) => {
                  setStepHistoryState({
                    ...stepHistoryState,
                    isTaxCodeEquals2PIVA: e.target.checked,
                  });
                }}
              />
            </Grid>
          )}
          {layout.showPartyWithoutVatNumber && (
            <Grid item>
              <LabeledCheckbox
                id="party_without_vatnumber"
                label={t('onboardingFormData.billingDataSection.partyWithoutVatNumber')}
                containerProps={{ marginBottom: layout.partyWithoutVatNumberMarginBottom }}
                onChange={(e) => {
                  void formik.setFieldValue('hasVatnumber', !e.target.checked);
                  setStepHistoryState({
                    ...stepHistoryState,
                    isTaxCodeEquals2PIVA: false,
                  });
                }}
                description={
                  <Typography variant={'caption'} sx={{ fontWeight: '400', color: '#5C6F82' }}>
                    <Trans
                      i18nKey="onboardingFormData.billingDataSection.partyWIthoutVatNumberSubtitle"
                      components={{ 1: <br /> }}
                    >
                      {`Indica solo il Codice Fiscale se il tuo ente non agisce nell'esercizio d'impresa,
                arte o professione <1 />(cfr. art. 21, comma 2, lett. f, DPR n. 633/1972)`}
                    </Trans>
                  </Typography>
                }
              />
            </Grid>
          )}
        </Grid>
      )}
      <Grid item xs={12}>
        <Typography component={'span'}>
          {layout.showVatNumber && (
            <CustomTextField
              {...baseTextFieldProps(
                'vatNumber',
                t('onboardingFormData.billingDataSection.vatNumber'),
                600,
                layout.isVatNumberLocked ? theme.palette.text.disabled : theme.palette.text.primary
              )}
              value={formik.values.vatNumber}
              disabled={layout.isVatNumberDisabled}
              onClick={() => setShrinkVatNumber(true)}
              onBlur={() => setShrinkVatNumber(false)}
              InputLabelProps={{
                shrink: Boolean(
                  shrinkVatNumber ||
                  stepHistoryState.isTaxCodeEquals2PIVA ||
                  formik.values.vatNumber
                ),
              }}
            />
          )}
          {layout.showVatNumberGroup && (
            <LabeledCheckbox
              id={'vatNumberGroup'}
              name="vatNumberGroup"
              label={t('onboardingFormData.billingDataSection.vatNumberGroup')}
              containerProps={{ mt: '2px' }}
              checked={formik.values.vatNumberGroup}
              onChange={(_, checked: boolean) =>
                void formik.setFieldValue('vatNumberGroup', checked, true)
              }
              value={formik.values.vatNumberGroup}
              disabled={layout.isVatNumberGroupDisabled}
            />
          )}
        </Typography>
      </Grid>
    </>
  );
};

export default VatNumberData;
