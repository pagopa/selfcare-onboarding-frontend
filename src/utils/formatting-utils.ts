export const formatCity = (city: string): string =>
  city
    .charAt(0)
    .toUpperCase()
    .concat(city.substring(1).toLowerCase().replace('- comune', '').trim());
