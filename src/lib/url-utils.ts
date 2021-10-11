import qs from 'query-string';

export function parseSearch(search: string) {
  return qs.parse(search);
}
