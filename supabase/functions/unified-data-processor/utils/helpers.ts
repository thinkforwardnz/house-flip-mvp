
export function buildTradeeMeSearchUrl(filters: any): string {
  const baseUrl = 'https://www.trademe.co.nz/a/property/residential/sale/wellington';
  const params = new URLSearchParams();
  
  if (filters.minPrice) params.append('price_min', filters.minPrice.toString());
  if (filters.maxPrice) params.append('price_max', filters.maxPrice.toString());
  if (filters.minBeds) params.append('bedrooms_min', filters.minBeds.toString());
  if (filters.suburb) params.append('suburb', filters.suburb);
  
  return `${baseUrl}?${params.toString()}`;
}

export function parseAddress(address: string): { suburb: string | null; city: string | null; district: string | null } {
  const parts = address.split(',').map(part => part.trim());
  
  let suburb = null;
  let city = null;
  let district = null;

  if (parts.length >= 2) {
    suburb = parts[1];
  }
  if (parts.length >= 3) {
    district = parts[2];
  }
  
  if (address.toLowerCase().includes('wellington')) {
    city = 'Wellington';
  } else if (address.toLowerCase().includes('kapiti')) {
    city = 'Wellington';
    district = 'Kapiti Coast';
  } else {
    city = 'Auckland';
  }

  return { suburb, city, district };
}

export function parsePrice(priceString: string): number {
  const matches = priceString.match(/\$?([\d,]+)/);
  if (matches) {
    return parseInt(matches[1].replace(/,/g, ''), 10);
  }
  return 0;
}

export function getPropertyFeatureValue(features: Array<{ label: string; value: string }>, label: string): string | null {
  if (!features) return null;
  const feature = features.find(f => f.label.toLowerCase().includes(label.toLowerCase()));
  return feature ? feature.value : null;
}
