import { Grid, Typography } from "@mui/material";
import { theme } from "@pagopa/mui-italia";
import { t } from "i18next";
import { isIoSignProduct, isCedProduct, isPrivateInstitution } from "../../../utils/institutionTypeUtils";
import { CustomTextFieldNotched } from "../../../utils/style-utils";
import { InstitutionType } from "../../../../types";
import { OnboardingControllers } from "../../../hooks/useOnboardingControllers";
import { AssistanceContacts } from "../../../model/AssistanceContacts";

type Props = {
    institutionType: InstitutionType;
    productId?: string;
    baseTextFieldProps: any;
    controllers: OnboardingControllers;
    assistanceContacts: AssistanceContacts | undefined;
    institutionAvoidGeotax: boolean;
};

const SupportEmailData = ({
    institutionType,
    productId,
    baseTextFieldProps,
    controllers,
    assistanceContacts,
    institutionAvoidGeotax,
}: Props) => (
  <>
    {!institutionAvoidGeotax &&
      (isIoSignProduct(productId) ||
        (isCedProduct(productId) && isPrivateInstitution(institutionType))) && (
        <Grid item xs={12}>
          <CustomTextFieldNotched
            paddingValue={'14px'}
            {...baseTextFieldProps(
              'supportEmail',
              t(
                `onboardingFormData.billingDataSection.assistanceContact.${isCedProduct(productId) ? 'supportEmailOptional' : 'supportEmail'}`
              ),
              600,
              theme.palette.text.primary
            )}
            disabled={controllers.isDisabled && !!assistanceContacts?.supportEmail}
          />
          {/* descrizione indirizzo mail di supporto */}
          <Typography
            component={'span'}
            sx={{
              fontSize: '12px!important',
              fontWeight: 'fontWeightMedium',
              color: theme.palette.text.secondary,
            }}
          >
            {t('onboardingFormData.billingDataSection.assistanceContact.supportEmailDescriprion')}
          </Typography>
        </Grid>
      )}
  </>
);

export default SupportEmailData;
