import { PrismaSchemaSectionType } from '../types';

export const ascendingSorter = (
  a: PrismaSchemaSectionType,
  b: PrismaSchemaSectionType
) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);
