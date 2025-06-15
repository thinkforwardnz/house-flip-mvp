
// Location parsing utilities for property addresses

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
  } else if (address.toLowerCase().includes('canterbury') || address.toLowerCase().includes('christchurch')) {
    city = 'Christchurch';
  } else {
    city = 'Auckland';
  }

  return { suburb, city, district };
}
