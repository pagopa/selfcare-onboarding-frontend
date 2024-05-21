import React from 'react';
import { GeographicTaxonomy, nationalValue } from '../model/GeographicTaxonomies';
import { ENV } from './env';

/* eslint-disable sonarjs/cognitive-complexity */
export const handleGeotaxonomies = (
  previousGeotaxononomies: Array<GeographicTaxonomy>,
  institutionAvoidGeotax: boolean,
  formik: any,
  updateGeotaxonomy: React.Dispatch<{
    add: boolean;
    edit: boolean;
  }>,
  onForwardAction: () => void
) => {
  if (
    ENV.GEOTAXONOMY.SHOW_GEOTAXONOMY &&
    previousGeotaxononomies &&
    previousGeotaxononomies.length > 0 &&
    !institutionAvoidGeotax
  ) {
    const changedNational2Local =
      previousGeotaxononomies.some((rv) => rv?.code === nationalValue) &&
      !formik.values.geographicTaxonomies.some((gv: any) => gv?.code === nationalValue);
    const changedToLocal2National =
      !previousGeotaxononomies.some((rv) => rv?.code === nationalValue) &&
      formik.values.geographicTaxonomies.some((gv: any) => gv?.code === nationalValue);

    if (changedNational2Local || changedToLocal2National) {
      updateGeotaxonomy({ add: false, edit: true });
    } else {
      const deltaLength =
        previousGeotaxononomies.length - formik.values.geographicTaxonomies.length;
      // eslint-disable-next-line functional/no-let
      let array1 = previousGeotaxononomies;
      // eslint-disable-next-line functional/no-let
      let array2 = formik.values.geographicTaxonomies;
      if (deltaLength < 0) {
        array2 = previousGeotaxononomies;
        array1 = formik.values.geographicTaxonomies;
      }
      const arrayDifferences = array1.filter((elementarray1) =>
        array2.some((elementArray2: any) => elementarray1?.code === elementArray2?.code)
          ? false
          : true
      );
      if (deltaLength === 0) {
        if (arrayDifferences.length > 0) {
          updateGeotaxonomy({ add: false, edit: true });
        } else {
          onForwardAction();
        }
      } else if (arrayDifferences.length === Math.abs(deltaLength)) {
        if (deltaLength > 0) {
          updateGeotaxonomy({ add: false, edit: true });
        } else {
          updateGeotaxonomy({ add: true, edit: false });
        }
      } else if (deltaLength > 0) {
        updateGeotaxonomy({ add: false, edit: true });
      } else if (deltaLength < 0) {
        updateGeotaxonomy({ add: false, edit: true });
      } else {
        onForwardAction();
      }
    }
  } else {
    onForwardAction();
  }
};
