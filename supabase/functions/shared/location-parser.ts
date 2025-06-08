
// Location parsing utility for extracting suburbs and districts from addresses
export interface LocationInfo {
  suburb: string | null;
  district: string | null;
  city: string | null;
}

// Known suburb to district mappings for New Zealand
const SUBURB_TO_DISTRICT: { [key: string]: string } = {
  // Wellington Region - Lower Hutt City
  'Petone': 'Lower Hutt City',
  'Eastbourne': 'Lower Hutt City',
  'Wainuiomata': 'Lower Hutt City',
  'Stokes Valley': 'Lower Hutt City',
  'Naenae': 'Lower Hutt City',
  'Taita': 'Lower Hutt City',
  'Pomare': 'Lower Hutt City',
  'Epuni': 'Lower Hutt City',
  'Waterloo': 'Lower Hutt City',
  'Hutt Central': 'Lower Hutt City',
  'Belmont': 'Lower Hutt City',
  'Woburn': 'Lower Hutt City',
  
  // Wellington Region - Upper Hutt City
  'Te Marua': 'Upper Hutt City',
  'Brown Owl': 'Upper Hutt City',
  'Birchville': 'Upper Hutt City',
  'Heretaunga': 'Upper Hutt City',
  'Pinehaven': 'Upper Hutt City',
  'Silverstream': 'Upper Hutt City',
  'Totara Park': 'Upper Hutt City',
  'Elderslea': 'Upper Hutt City',
  'Trentham': 'Upper Hutt City',
  'Wallaceville': 'Upper Hutt City',
  
  // Wellington Region - Porirua City
  'Titahi Bay': 'Porirua City',
  'Elsdon': 'Porirua City',
  'Takapuwahia': 'Porirua City',
  'Cannons Creek': 'Porirua City',
  'Waitangirua': 'Porirua City',
  'Ascot Park': 'Porirua City',
  'Ranui Heights': 'Porirua City',
  'Paremata': 'Porirua City',
  'Plimmerton': 'Porirua City',
  'Pukerua Bay': 'Porirua City',
  
  // Wellington Region - Wellington City
  'Kelburn': 'Wellington City',
  'Thorndon': 'Wellington City',
  'Te Aro': 'Wellington City',
  'Mount Victoria': 'Wellington City',
  'Oriental Bay': 'Wellington City',
  'Newtown': 'Wellington City',
  'Island Bay': 'Wellington City',
  'Berhampore': 'Wellington City',
  'Brooklyn': 'Wellington City',
  'Vogeltown': 'Wellington City',
  'Aro Valley': 'Wellington City',
  'Mount Cook': 'Wellington City',
  'Hataitai': 'Wellington City',
  'Roseneath': 'Wellington City',
  'Seatoun': 'Wellington City',
  'Miramar': 'Wellington City',
  'Kilbirnie': 'Wellington City',
  'Lyall Bay': 'Wellington City',
  'Karori': 'Wellington City',
  'Northland': 'Wellington City',
  'Wadestown': 'Wellington City',
  'Johnsonville': 'Wellington City',
  'Tawa': 'Wellington City',
  'Churton Park': 'Wellington City',
  
  // Wellington Region - Kapiti Coast District
  'Paraparaumu': 'Kapiti Coast District',
  'Paraparaumu Beach': 'Kapiti Coast District',
  'Waikanae': 'Kapiti Coast District',
  'Waikanae Beach': 'Kapiti Coast District',
  'Raumati South': 'Kapiti Coast District',
  'Raumati Beach': 'Kapiti Coast District',
  'Paekakariki': 'Kapiti Coast District',
  'Otaki': 'Kapiti Coast District',
  'Otaki Beach': 'Kapiti Coast District',
  'Te Horo': 'Kapiti Coast District',
  'Te Horo Beach': 'Kapiti Coast District',
  'Manakau': 'Kapiti Coast District',
  'Lindale': 'Kapiti Coast District',
  'Maungakotare': 'Kapiti Coast District',
  'Nikau': 'Kapiti Coast District',
  'Pekapeka': 'Kapiti Coast District',
  'Peka Peka': 'Kapiti Coast District',
  
  // Wellington Region - Wairarapa
  'Martinborough': 'South Wairarapa District',
  'Featherston': 'South Wairarapa District',
  'Greytown': 'South Wairarapa District',
  'Lake Ferry': 'South Wairarapa District',
  'Pirinoa': 'South Wairarapa District',
  'Carterton': 'Carterton District',
  'Clareville': 'Carterton District',
  'Dalefield': 'Carterton District',
  'Masterton': 'Masterton District',
  'Lansdowne': 'Masterton District',
  'Solway': 'Masterton District',
  'Riverside': 'Masterton District',
  'Renall Street': 'Masterton District',
  'Opaki': 'Masterton District',
};

export function parseLocationFromAddress(address: string, fallbackCity?: string): LocationInfo {
  console.log('Parsing location from address:', address);
  
  if (!address) {
    return { suburb: null, district: null, city: fallbackCity || null };
  }

  // Clean up the address
  const cleanAddress = address.trim();
  
  // Extract potential suburb from address
  // Common patterns: "123 Street Name, Suburb, City" or "123 Street Name, Suburb"
  const addressParts = cleanAddress.split(',').map(part => part.trim());
  
  let suburb: string | null = null;
  let city: string | null = fallbackCity || null;
  let district: string | null = null;

  // If we have multiple parts, the suburb is usually the second-to-last or last meaningful part
  if (addressParts.length >= 2) {
    // Try the second part as suburb (most common pattern)
    const potentialSuburb = addressParts[1];
    
    // Check if this looks like a suburb (not a street number or generic term)
    if (potentialSuburb && !potentialSuburb.match(/^\d+$/) && potentialSuburb.length > 2) {
      suburb = potentialSuburb;
    }
    
    // If we have 3+ parts, the last might be city
    if (addressParts.length >= 3) {
      const lastPart = addressParts[addressParts.length - 1];
      if (lastPart && lastPart.length > 2) {
        city = lastPart;
      }
    }
  }

  // Handle cases where suburb contains district name
  if (suburb) {
    // Check for exact suburb match first
    if (SUBURB_TO_DISTRICT[suburb]) {
      district = SUBURB_TO_DISTRICT[suburb];
    } else {
      // Check for partial matches for generic district names
      if (suburb.includes('Lower Hutt')) {
        district = 'Lower Hutt City';
        if (suburb === 'Lower Hutt') {
          suburb = 'Lower Hutt'; // Keep as is for generic case
        }
      } else if (suburb.includes('Upper Hutt')) {
        district = 'Upper Hutt City';
        if (suburb === 'Upper Hutt') {
          suburb = 'Upper Hutt';
        }
      } else if (suburb.includes('Porirua')) {
        district = 'Porirua City';
        if (suburb === 'Porirua') {
          suburb = 'Porirua';
        }
      } else if (suburb.includes('Wellington') && suburb !== 'Wellington') {
        district = 'Wellington City';
      } else if (suburb.includes('Paraparaumu') || suburb.includes('Waikanae') || suburb.includes('Kapiti')) {
        district = 'Kapiti Coast District';
      }
    }
  }

  // Fallback district mapping based on city
  if (!district && city) {
    if (city.toLowerCase() === 'auckland') {
      district = 'Auckland Council';
    } else if (city.toLowerCase() === 'christchurch') {
      district = 'Christchurch City';
    } else if (city.toLowerCase() === 'wellington') {
      district = 'Wellington City';
    }
  }

  const result = { suburb, district, city };
  console.log('Parsed location result:', result);
  
  return result;
}

export function extractDistrictFromSuburb(suburb: string | null): string | null {
  if (!suburb) return null;
  
  // Direct mapping
  if (SUBURB_TO_DISTRICT[suburb]) {
    return SUBURB_TO_DISTRICT[suburb];
  }
  
  // Pattern matching for cases where suburb contains district name
  const suburbLower = suburb.toLowerCase();
  
  if (suburbLower.includes('lower hutt')) return 'Lower Hutt City';
  if (suburbLower.includes('upper hutt')) return 'Upper Hutt City';
  if (suburbLower.includes('porirua')) return 'Porirua City';
  if (suburbLower.includes('wellington')) return 'Wellington City';
  if (suburbLower.includes('paraparaumu') || suburbLower.includes('waikanae') || suburbLower.includes('kapiti')) return 'Kapiti Coast District';
  if (suburbLower.includes('masterton')) return 'Masterton District';
  if (suburbLower.includes('carterton')) return 'Carterton District';
  if (suburbLower.includes('martinborough') || suburbLower.includes('greytown') || suburbLower.includes('featherston')) return 'South Wairarapa District';
  if (suburbLower.includes('auckland')) return 'Auckland Council';
  if (suburbLower.includes('christchurch')) return 'Christchurch City';
  
  return null;
}
