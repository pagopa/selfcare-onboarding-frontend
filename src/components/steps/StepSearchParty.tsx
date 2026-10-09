import { FormControlLabel, Grid, Typography, useTheme } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import { SessionModal } from '@pagopa/selfcare-common-frontend/lib';
import { Dispatch, ReactElement, SetStateAction, useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { InstitutionType, PartyData, Product, StepperStepComponentProps } from '../../../types';
import { useHistoryState } from '../../hooks/useHistoryState';
import { useMerchantSearchResult } from '../../hooks/useMerchantSearchResult';
import { useSubunitSearch } from '../../hooks/useSubunitSearch';
import { SelectionsState } from '../../model/Selection';
import { handleSearchExternalId } from '../../services/institutionServices';
import { ENV } from '../../utils/env';
import { isIdpayMerchantProduct, isPublicAdministration } from '../../utils/institutionTypeUtils';
import { selected2OnboardingData } from '../../utils/selected2OnboardingData';
import IdPayMerchantAlert from '../alerts/IdPayMerchantAlert';
import InteropGspAlert from '../alerts/InteropGspAlert';
import SendAlert from '../alerts/SendAlert';
import { Autocomplete } from '../autocomplete/Autocomplete';
import SearchPartyLinks from '../links/SearchPartyLinks';
import Loading4Api from '../modals/Loading4Api';
import { LoadingOverlay } from '../modals/LoadingOverlay';
import { OnboardingStepActions } from '../registrationSteps/OnboardingStepActions';
import SearchPartySubtitle from '../SearchPartySubtitle';

type Props = {
  subTitle: string | ReactElement;
  institutionType?: InstitutionType;
  productAvoidStep?: boolean;
  product?: Product | null;
  externalInstitutionId: string;
  subunitTypeByQuery: string;
  subunitCodeByQuery: string;
  selectFilterCategories: () => any;
  setInstitutionType: Dispatch<SetStateAction<InstitutionType | undefined>>;
  addUser: boolean;
} & StepperStepComponentProps;

// eslint-disable-next-line sonarjs/cognitive-complexity, complexity
export function StepSearchParty({
  subTitle,
  forward,
  back,
  institutionType,
  productAvoidStep,
  product,
  externalInstitutionId,
  subunitTypeByQuery,
  subunitCodeByQuery,
  selectFilterCategories,
  setInstitutionType,
  addUser,
}: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const partyExternalIdByQuery = new URLSearchParams(window.location.search).get('partyExternalId');
  const autoSearchFound = useRef(false);
  const [isSearchFieldSelected, setIsSearchFieldSelected] = useState<boolean>(true);
  const [loading, setLoading] = useState(!!partyExternalIdByQuery);
  const [apiLoading, setApiLoading] = useState(false);
  const [selected, setSelected, setSelectedHistory] = useHistoryState<PartyData | null>(
    'selected_step1',
    null
  );
  const [disabled, setDisabled] = useState<boolean>(false);
  const [isAggregator, setIsAggregator] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [filterCategories, setFilterCategories] = useState<string>();

  const [selections, setSelections] = useState<SelectionsState>({
    businessName: true,
    aooCode: false,
    uoCode: false,
    reaCode: false,
    personalTaxCode: false,
    taxCode: false,
    ivassCode: false,
  });

  const {
    merchantSearchResult,
    setMerchantSearchResult,
    disabledStatusCompany,
    clearMerchantStorage,
  } = useMerchantSearchResult(setDisabled, product?.id, selected);

  const { aooResult, setAooResult, uoResult, setUoResult, ecData } = useSubunitSearch({
    productId: product?.id,
    subunitTypeByQuery,
    subunitCodeByQuery,
    filterCategories,
    setApiLoading,
  });

  useEffect(() => {
    if (partyExternalIdByQuery) {
      handleSearchExternalId(partyExternalIdByQuery)
        .then((ipaParty) => {
          if (ipaParty) {
            // setSelected(ipaParty);
            // eslint-disable-next-line functional/immutable-data
            autoSearchFound.current = true;
          }
        })
        .catch((reason) => {
          console.error(reason);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  useEffect(() => {
    if (isSearchFieldSelected || selected) {
      setIsSearchFieldSelected(true);
    } else {
      setIsSearchFieldSelected(false);
    }
  }, [isSearchFieldSelected]);

  useEffect(() => {
    setFilterCategories(selectFilterCategories());
  }, [selectFilterCategories]);

  useEffect(() => {
    if (isIdpayMerchantProduct(product?.id) && merchantSearchResult && disabledStatusCompany) {
      setDisabled(true);
    } else {
      setDisabled(!selected);
    }
  }, [selected, merchantSearchResult, product?.id, disabledStatusCompany]);

  const onForwardAction = () => {
    const dataParty = aooResult || uoResult ? ({ ...selected, ...ecData } as PartyData) : selected;
    const actualInstitutionType =
      isIdpayMerchantProduct(product?.id) &&
      (selections.personalTaxCode ||
        (selections.reaCode && dataParty?.businessTaxId && dataParty.businessTaxId.length > 11))
        ? 'PRV_PF'
        : institutionType;
    setSelectedHistory(selected);
    const onboardingData = selected2OnboardingData(
      dataParty,
      isAggregator,
      actualInstitutionType,
      product?.id
    );

    if (actualInstitutionType !== institutionType) {
      setInstitutionType(actualInstitutionType);
    }

    clearMerchantStorage();

    forward(onboardingData, actualInstitutionType);
  };

  const onBackAction = () => {
    clearMerchantStorage();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    back!();
  };

  const canAggregateProductList = ENV.AGGREGATOR.ELIGIBLE_PRODUCTS.split(',');

  return loading ? (
    <LoadingOverlay loadingText={t('onboardingStep1.loadingOverlayText')} />
  ) : (
    <>
      <Loading4Api open={apiLoading} />
      <Grid container direction="column">
        <Grid container item justifyContent="center">
          <Grid item xs={12}>
            <Typography
              variant="h3"
              component="h2"
              align="center"
              color={theme.palette.text.primary}
            >
              {selected
                ? t('onboardingStep1.onboarding.codyTitleSelected')
                : t('onboardingStep1.onboarding.bodyTitle')}
            </Typography>
          </Grid>
        </Grid>

        <SearchPartySubtitle
          selected={selected}
          product={product}
          institutionType={institutionType}
          subTitle={subTitle}
        />

        <Grid container item sx={{ alignItems: 'center', flexDirection: 'column' }} mt={4} mb={4}>
          <SendAlert product={product} />
          <IdPayMerchantAlert
            product={product}
            merchantSearchResult={merchantSearchResult}
            disabledStatusCompany={disabledStatusCompany}
          />
          <InteropGspAlert product={product} institutionType={institutionType} />
          <Grid item xs={8} md={6} lg={5}>
            <Autocomplete
              selected={selected}
              setSelected={setSelected}
              setDisabled={setDisabled}
              setApiLoading={setApiLoading}
              apiLoading={apiLoading}
              endpoint={{ endpoint: 'ONBOARDING_GET_SEARCH_PARTIES' }}
              transformFn={(data: { items: any }) => data.items}
              optionKey="id"
              optionLabel="description"
              isSearchFieldSelected={isSearchFieldSelected}
              setIsSearchFieldSelected={setIsSearchFieldSelected}
              product={product}
              aooResult={aooResult}
              uoResult={uoResult}
              setAooResult={setAooResult}
              setUoResult={setUoResult}
              externalInstitutionId={externalInstitutionId}
              institutionType={institutionType}
              filterCategories={filterCategories}
              setMerchantSearchResult={setMerchantSearchResult}
              disabledStatusCompany={disabledStatusCompany}
              selections={selections}
              setSelections={setSelections}
              addUser={addUser}
            />
          </Grid>
          {ENV.AGGREGATOR.SHOW_AGGREGATOR &&
            isPublicAdministration(institutionType) &&
            canAggregateProductList.includes(product?.id ?? '') && (
              <Grid item mt={3}>
                <FormControlLabel
                  htmlFor="aggregator-party"
                  control={
                    <Checkbox
                      name="aggregator-party"
                      size="small"
                      checked={isAggregator}
                      onChange={() => setIsAggregator(!isAggregator)}
                      inputProps={{ id: 'aggregator-party' }}
                    />
                  }
                  label={t('onboardingStep1.onboarding.aggregator')}
                />
              </Grid>
            )}
        </Grid>
        <SearchPartyLinks
          institutionType={institutionType}
          product={product}
          onForwardAction={onForwardAction}
        />
        <Grid item mt={2}>
          <OnboardingStepActions
            back={
              !productAvoidStep && isIdpayMerchantProduct(product?.id)
                ? {
                    action: onBackAction,
                    label: t('stepInstitutionType.backLabel'),
                    disabled: false,
                  }
                : undefined
            }
            forward={{
              action: () => {
                if (isAggregator) {
                  setOpen(true);
                } else {
                  onForwardAction();
                }
              },
              label: t('onboardingStep1.onboarding.onboardingStepActions.confirmAction'),
              disabled,
            }}
          />
        </Grid>
        <SessionModal
          open={open}
          title={t('onboardingStep1.onboarding.aggregatorModal.title')}
          message={
            <Trans
              i18nKey={'onboardingStep1.onboarding.aggregatorModal.message'}
              components={{ 1: <strong />, 3: <br /> }}
              values={{ partyName: selected?.description }}
            >
              {`Stai richiedendo l’adesione come ente aggregatore per <1>{{partyName}}</1>.<3 />Per completare l’adesione, dovrai indicare gli enti da aggregare.`}
            </Trans>
          }
          onCloseLabel={t('onboardingStep1.onboarding.aggregatorModal.back')}
          onConfirmLabel={t('onboardingStep1.onboarding.aggregatorModal.forward')}
          handleClose={() => setOpen(false)}
          onConfirm={onForwardAction}
        />
      </Grid>
    </>
  );
}
