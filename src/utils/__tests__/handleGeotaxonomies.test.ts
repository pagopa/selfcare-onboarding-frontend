import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GeographicTaxonomy, nationalValue } from '../../model/GeographicTaxonomies';
import { ENV } from '../env';
import { handleGeotaxonomies, resolveGeotaxonomyAction } from '../handleGeotaxonomies';

const national: GeographicTaxonomy = { code: nationalValue, desc: 'ITALIA' };
const milano: GeographicTaxonomy = { code: '015146', desc: 'MILANO - COMUNE' };
const roma: GeographicTaxonomy = { code: '058091', desc: 'ROMA - COMUNE' };
const torino: GeographicTaxonomy = { code: '001272', desc: 'TORINO - COMUNE' };
const napoli: GeographicTaxonomy = { code: '063049', desc: 'NAPOLI - COMUNE' };

const originalShowGeotaxonomy = ENV.GEOTAXONOMY.SHOW_GEOTAXONOMY;

const run = (
  previous: Array<GeographicTaxonomy>,
  current: Array<GeographicTaxonomy>,
  institutionAvoidGeotax = false
) => {
  const updateGeotaxonomy = vi.fn();
  const onForwardAction = vi.fn();
  handleGeotaxonomies(
    previous,
    institutionAvoidGeotax,
    { values: { geographicTaxonomies: current } },
    updateGeotaxonomy,
    onForwardAction
  );
  return { updateGeotaxonomy, onForwardAction };
};

describe('handleGeotaxonomies', () => {
  beforeEach(() => {
    ENV.GEOTAXONOMY.SHOW_GEOTAXONOMY = true;
  });

  afterEach(() => {
    ENV.GEOTAXONOMY.SHOW_GEOTAXONOMY = originalShowGeotaxonomy;
  });

  it('forwards when geotaxonomies are disabled', () => {
    ENV.GEOTAXONOMY.SHOW_GEOTAXONOMY = false;
    const { updateGeotaxonomy, onForwardAction } = run([milano], [roma]);
    expect(onForwardAction).toHaveBeenCalledTimes(1);
    expect(updateGeotaxonomy).not.toHaveBeenCalled();
  });

  it('forwards when the institution avoids geotaxonomies', () => {
    const { updateGeotaxonomy, onForwardAction } = run([milano], [roma], true);
    expect(onForwardAction).toHaveBeenCalledTimes(1);
    expect(updateGeotaxonomy).not.toHaveBeenCalled();
  });

  it('forwards when there are no previous geotaxonomies', () => {
    const { updateGeotaxonomy, onForwardAction } = run([], [roma]);
    expect(onForwardAction).toHaveBeenCalledTimes(1);
    expect(updateGeotaxonomy).not.toHaveBeenCalled();
  });

  it.each([
    ['national to local', [national], [milano], { add: false, edit: true }],
    ['local to national', [milano, roma], [national], { add: false, edit: true }],
    [
      'same length with a different element',
      [milano, roma],
      [milano, torino],
      { add: false, edit: true },
    ],
    ['elements removed', [milano, roma, torino], [milano], { add: false, edit: true }],
    ['elements added', [milano], [milano, roma, torino], { add: true, edit: false }],
    [
      'elements removed and replaced',
      [milano, roma, torino],
      [torino, napoli],
      { add: false, edit: true },
    ],
    ['elements added and replaced', [milano], [roma, torino], { add: false, edit: true }],
  ])('opens the modal when %s', (_label, previous, current, expected) => {
    const { updateGeotaxonomy, onForwardAction } = run(previous, current);
    expect(updateGeotaxonomy).toHaveBeenCalledTimes(1);
    expect(updateGeotaxonomy).toHaveBeenCalledWith(expected);
    expect(onForwardAction).not.toHaveBeenCalled();
  });

  it.each([
    ['nothing changed', [milano, roma], [milano, roma]],
    ['only the order changed', [milano, roma], [roma, milano]],
    ['national is unchanged', [national], [national]],
  ])('forwards when %s', (_label, previous, current) => {
    const { updateGeotaxonomy, onForwardAction } = run(previous, current);
    expect(onForwardAction).toHaveBeenCalledTimes(1);
    expect(updateGeotaxonomy).not.toHaveBeenCalled();
  });
});

describe('resolveGeotaxonomyAction', () => {
  it.each([
    ['national is kept', [national], [national], 'forward'],
    ['the same locals are kept in another order', [milano, roma], [roma, milano], 'forward'],
    ['national becomes local', [national], [milano], { add: false, edit: true }],
    ['local becomes national', [milano], [national], { add: false, edit: true }],
    ['a local is replaced', [milano], [roma], { add: false, edit: true }],
    ['locals are only removed', [milano, roma], [roma], { add: false, edit: true }],
    ['locals are only added', [milano], [milano, roma], { add: true, edit: false }],
    ['locals are added and replaced', [milano], [roma, torino], { add: false, edit: true }],
  ])('when %s', (_label, previous, current, expected) => {
    expect(resolveGeotaxonomyAction(previous, current)).toEqual(expected);
  });
});
