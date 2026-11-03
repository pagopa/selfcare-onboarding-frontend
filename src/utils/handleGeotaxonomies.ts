import React from 'react';
import { GeographicTaxonomy, nationalValue } from '../model/GeographicTaxonomies';
import { ENV } from './env';

export type GeotaxonomyModalState = { add: boolean; edit: boolean };

export type GeotaxonomyAction = 'forward' | GeotaxonomyModalState;

const editModal = (): GeotaxonomyModalState => ({ add: false, edit: true });
const addModal = (): GeotaxonomyModalState => ({ add: true, edit: false });

const isNational = (geotaxonomies: Array<GeographicTaxonomy>) =>
  geotaxonomies.some((g) => g?.code === nationalValue);

const countMissing = (source: Array<GeographicTaxonomy>, target: Array<GeographicTaxonomy>) =>
  source.filter((s) => !target.some((t) => s?.code === t?.code)).length;

export const resolveGeotaxonomyAction = (
  previous: Array<GeographicTaxonomy>,
  current: Array<GeographicTaxonomy>
): GeotaxonomyAction => {
  if (isNational(previous) !== isNational(current)) {
    return editModal();
  }
  const deltaLength = previous.length - current.length;
  if (deltaLength === 0) {
    return countMissing(previous, current) > 0 ? editModal() : 'forward';
  }
  const onlyAdded = deltaLength < 0 && countMissing(current, previous) === -deltaLength;
  return onlyAdded ? addModal() : editModal();
};

export const handleGeotaxonomies = (
  previousGeotaxononomies: Array<GeographicTaxonomy>,
  institutionAvoidGeotax: boolean,
  formik: { values: { geographicTaxonomies: Array<GeographicTaxonomy> } },
  updateGeotaxonomy: React.Dispatch<GeotaxonomyModalState>,
  onForwardAction: () => void
) => {
  const shouldCheck =
    ENV.GEOTAXONOMY.SHOW_GEOTAXONOMY &&
    previousGeotaxononomies?.length > 0 &&
    !institutionAvoidGeotax;
  const action = shouldCheck
    ? resolveGeotaxonomyAction(previousGeotaxononomies, formik.values.geographicTaxonomies)
    : 'forward';

  if (action === 'forward') {
    onForwardAction();
  } else {
    updateGeotaxonomy(action);
  }
};
