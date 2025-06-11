
import { CustomScraperProperty, FullPropertyResponse } from '../shared/custom-scraper-client.ts';

export interface ProcessedListing {
  source_url: string;
  source_site: string;
  address: string;
  suburb: string | null;
  city: string | null;
  district: string | null;
  price: number;
  summary: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floor_area: number | null;
  land_area: number | null;
  photos: string[] | null;
  listing_date: string | null;
  property_type: string | null;
  parking_spaces: number | null;
  description: string | null;
  market_analysis?: any;
  tags?: string[];
  sale_date?: string | null;
}

function parsePrice(priceString: string): number {
  // Extract numbers from price strings like "Enquiries over $725,000" or "Price by negotiation"
  const matches = priceString.match(/\$?([\d,]+)/);
  if (matches) {
    return parseInt(matches[1].replace(/,/g, ''), 10);
  }
  return 0;
}

function parseArea(areaString: string): number | null {
  // Parse area strings like "60 m2" or "719 m2"
  const matches = areaString.match(/(\d+)/);
  return matches ? parseInt(matches[1], 10) : null;
}

function parseAddress(address: string): { suburb: string | null; city: string | null; district: string | null } {
  // Parse addresses like "70/10 Trieste Way, Paraparaumu, Kapiti Coast"
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
  
  // Common Wellington districts
  if (address.toLowerCase().includes('wellington')) {
    city = 'Wellington';
  } else if (address.toLowerCase().includes('kapiti')) {
    city = 'Wellington';
    district = 'Kapiti Coast';
  } else {
    city = 'Auckland'; // Default fallback
  }

  return { suburb, city, district };
}

function getPropertyFeatureValue(features: Array<{ label: string; value: string }>, label: string): string | null {
  const feature = features.find(f => f.label.toLowerCase().includes(label.toLowerCase()));
  return feature ? feature.value : null;
}

export function processSearchListing(property: CustomScraperProperty): ProcessedListing | null {
  try {
    const addressParts = parseAddress(property.address);
    
    // Build full TradeMe URL
    const fullUrl = property.url.startsWith('http') 
      ? property.url 
      : `https://www.trademe.co.nz/a/${property.url}`;

    const bedroomsStr = getPropertyFeatureValue(property.property_features, 'bedroom');
    const bathroomsStr = getPropertyFeatureValue(property.property_features, 'bathroom');
    const floorAreaStr = getPropertyFeatureValue(property.property_features, 'floor area');
    const landAreaStr = getPropertyFeatureValue(property.property_features, 'land area');
    const parkingStr = getPropertyFeatureValue(property.property_features, 'parking');

    return {
      source_url: fullUrl,
      source_site: 'Trade Me',
      address: property.address,
      suburb: addressParts.suburb,
      city: addressParts.city,
      district: addressParts.district,
      price: parsePrice(property.price),
      summary: property.title,
      bedrooms: bedroomsStr ? parseInt(bedroomsStr, 10) : null,
      bathrooms: bathroomsStr ? parseInt(bathroomsStr, 10) : null,
      floor_area: floorAreaStr ? parseArea(floorAreaStr) : null,
      land_area: landAreaStr ? parseArea(landAreaStr) : null,
      photos: property.main_img ? [property.main_img] : null,
      listing_date: null, // Not available in search results
      property_type: 'House', // Default, could be enhanced
      parking_spaces: parkingStr ? parseInt(parkingStr, 10) : null,
      description: null,
      tags: ['prospecting']
    };
  } catch (error) {
    console.error('Error processing search listing:', error);
    return null;
  }
}

export function processFullProperty(data: FullPropertyResponse): ProcessedListing[] {
  const results: ProcessedListing[] = [];
  
  try {
    const structured = data.structured;
    const addressParts = parseAddress(structured.address);
    
    // Process main property
    const mainProperty: ProcessedListing = {
      source_url: `https://www.trademe.co.nz/a/property/residential/sale/listing/${structured.id}`,
      source_site: 'Trade Me',
      address: structured.address,
      suburb: addressParts.suburb,
      city: addressParts.city,
      district: addressParts.district,
      price: parsePrice(structured.price),
      summary: structured.title,
      bedrooms: parseInt(structured.bedrooms, 10),
      bathrooms: parseInt(structured.bathrooms.replace(' Bath', ''), 10),
      floor_area: parseArea(structured.floor_area),
      land_area: parseArea(structured.land_area),
      photos: structured.images || null,
      listing_date: structured.listing_date,
      property_type: structured.property_type,
      parking_spaces: structured.parking ? parseInt(structured.parking.split(' ')[0], 10) : null,
      description: structured.description,
      market_analysis: {
        property_estimates: structured.property_estimates,
        capital_values: structured.capital_values,
        market_trends: structured.market_trends,
        nearby_sales: structured.nearby_sales
      },
      tags: ['prospecting']
    };
    
    results.push(mainProperty);
    
    // Process nearby sales as separate properties
    if (structured.nearby_sales) {
      for (const sale of structured.nearby_sales) {
        try {
          const saleAddressParts = parseAddress(sale.address);
          
          const saleProperty: ProcessedListing = {
            source_url: sale.listing_url,
            source_site: 'Trade Me',
            address: sale.address,
            suburb: saleAddressParts.suburb,
            city: saleAddressParts.city,
            district: saleAddressParts.district,
            price: parsePrice(sale.sold_price),
            summary: `Sold Property - ${sale.address}`,
            bedrooms: parseInt(sale.bedrooms, 10),
            bathrooms: parseInt(sale.bathrooms, 10),
            floor_area: null,
            land_area: null,
            photos: sale.image_url ? [sale.image_url] : null,
            listing_date: null,
            property_type: 'House',
            parking_spaces: null,
            description: null,
            sale_date: sale.sold_date,
            tags: ['sold']
          };
          
          results.push(saleProperty);
        } catch (error) {
          console.error('Error processing nearby sale:', error);
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error processing full property data:', error);
    return [];
  }
}
