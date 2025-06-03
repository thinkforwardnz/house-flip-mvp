
import { PropertyData } from './types.ts';
import { flipKeywords } from './config.ts';

export function calculateFlipPotential(property: PropertyData): number {
  let score = 50; // Base score
  
  const description = (property.summary || '').toLowerCase();
  
  // Check for flip keywords
  for (const keyword of flipKeywords) {
    if (description.includes(keyword.toLowerCase())) {
      score += 15;
    }
  }
  
  // Bonus for older properties with land
  if (property.land_area && property.land_area > 600) score += 10;
  if (property.bedrooms && property.bedrooms <= 2 && property.land_area && property.land_area > 400) score += 15; // Addition potential
  
  // Price-based scoring (lower price = higher potential in Wellington)
  if (property.price < 700000) score += 20;
  else if (property.price < 900000) score += 10;
  
  return Math.min(score, 100);
}
