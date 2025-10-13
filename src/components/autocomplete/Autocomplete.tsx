import { Grid, Paper, Typography } from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { theme } from '@pagopa/mui-italia';
import { useTranslation } from 'react-i18next';
import { Endpoint, InstitutionType, PartyData, Product } from '../../../types';
import { AooData } from '../../model/AooData';
import { InstitutionResource } from '../../model/InstitutionResource';
import { UoData } from '../../model/UoModel';
import { useHistoryState } from '../useHistoryState';
import { SelectionEnum, SelectionsState } from '../../model/Selection';
import AsyncAutocompleteContainer from './components/asyncAutocomplete/AsyncAutocompleteContainer';
import PartyAdvancedSelect from './components/partyAdvancedSearchType/PartyAdvancedSelect';

type AutocompleteProps = {
  selected: any;
  setSelected: React.Dispatch<React.SetStateAction<any>>;
  endpoint: Endpoint;
  transformFn: any;
  optionKey?: string;
  optionLabel?: string;
  isSearchFieldSelected: boolean;
  setIsSearchFieldSelected: React.Dispatch<React.SetStateAction<boolean>>;
  product?: Product | null;
  aooResult?: AooData;
  uoResult?: UoData;
  setAooResult: Dispatch<SetStateAction<AooData | undefined>>;
  setUoResult: Dispatch<SetStateAction<UoData | undefined>>;
  externalInstitutionId: string;
  institutionType?: InstitutionType;
  setDisabled: Dispatch<SetStateAction<boolean>>;
  setApiLoading?: Dispatch<SetStateAction<boolean>>;
  apiLoading?: boolean;
  selectedProduct?: Product;
  filterCategories?: string;
  setIsPresentInAtecoWhiteList?: Dispatch<SetStateAction<boolean>>;
  setMerchantSearchResult?: Dispatch<SetStateAction<any>>;
  disabledStatusCompany?: boolean;
  selections: SelectionsState;
  setSelections: Dispatch<SetStateAction<SelectionsState>>;
  addUser: boolean;
};

export function Autocomplete({
  selected,
  setSelected,
  endpoint,
  transformFn,
  optionKey,
  optionLabel,
  isSearchFieldSelected,
  product,
  aooResult,
  uoResult,
  setAooResult,
  setUoResult,
  setIsSearchFieldSelected,
  externalInstitutionId,
  institutionType,
  setDisabled,
  setApiLoading,
  apiLoading,
  selectedProduct,
  filterCategories,
  setIsPresentInAtecoWhiteList,
  setMerchantSearchResult,
  disabledStatusCompany,
  selections,
  setSelections,
  addUser = window.location.pathname.includes('add-user'),
}: AutocompleteProps) {
  const { t } = useTranslation();
  const [options, setOptions] = useState<Array<InstitutionResource>>([]);
  const [cfResult, setCfResult] = useState<PartyData>();

  const selectOnly = (field: SelectionEnum) => {
    setSelections({
      businessName: field === 'businessName',
      aooCode: field === 'aooCode',
      uoCode: field === 'uoCode',
      reaCode: field === 'reaCode',
      personalTaxCode: field === 'personalTaxCode',
      taxCode: field === 'taxCode',
      ivassCode: field === 'ivassCode',
    });
  };
  const handleSelectionChange = (newSelection: SelectionEnum) => {
    selectOnly(newSelection);
  };
  const [input, setInput] = useState<string>('');

  const setAooResultHistory = useHistoryState<AooData | undefined>(
    'aooSelected_step1',
    undefined
  )[2];
  const setUoResultHistory = useHistoryState<UoData | undefined>('uoSelected_step1', undefined)[2];

  useEffect(() => {
    if (addUser) {
      setSelections({ ...selections, businessName: false });
    }
  }, []);

  return (
    <Paper
      elevation={8}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '104px',
        maxHeight: '100%',
        minWidth: '480px',
        borderRadius: theme.spacing(2),
      }}
    >
      <Grid container mr={selected ? '18px' : undefined} ml={selected ? '28px' : undefined}>
        {!selected && (
          <Grid item xs={12} px={4} pt={4}>
            {addUser && (
              <Typography sx={{ fontWeight: '700', fontSize: '14px' }} mb={3}>
                {t('onboardingStep1.onboarding.bodyTitle').toUpperCase()}
              </Typography>
            )}
            <PartyAdvancedSelect
              selections={selections}
              setSelected={setSelected}
              handleSelectionChange={handleSelectionChange}
              setOptions={setOptions}
              setInput={setInput}
              setIsSearchFieldSelected={setIsSearchFieldSelected}
              addUser={addUser}
              setAooResult={setAooResult}
              setUoResult={setUoResult}
              setCfResult={setCfResult}
              setUoResultHistory={setUoResultHistory}
              setAooResultHistory={setAooResultHistory}
              product={product}
              institutionType={institutionType}
              selectedProduct={selectedProduct}
            />
          </Grid>
        )}
        <AsyncAutocompleteContainer
          selections={selections}
          optionKey={optionKey}
          optionLabel={optionLabel}
          input={input}
          endpoint={endpoint}
          setOptions={setOptions}
          transformFn={transformFn}
          setInput={setInput}
          setSelected={setSelected}
          selected={selected}
          theme={theme}
          options={options}
          isSearchFieldSelected={isSearchFieldSelected}
          setCfResult={setCfResult}
          cfResult={cfResult}
          product={product}
          setAooResult={setAooResult}
          setUoResult={setUoResult}
          aooResult={aooResult}
          uoResult={uoResult}
          setUoResultHistory={setUoResultHistory}
          setAooResultHistory={setAooResultHistory}
          externalInstitutionId={externalInstitutionId}
          institutionType={institutionType}
          setDisabled={setDisabled}
          addUser={addUser}
          selectedProduct={selectedProduct}
          filterCategories={filterCategories}
          setIsPresentInAtecoWhiteList={setIsPresentInAtecoWhiteList}
          setMerchantSearchResult={setMerchantSearchResult}
          setApiLoading={setApiLoading}
          apiLoading={apiLoading}
          disabledStatusCompany={disabledStatusCompany}
        />
      </Grid>
    </Paper>
  );
}
