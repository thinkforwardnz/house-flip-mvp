
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

export interface Property {
  id: string;
  source_url: string;
  address?: string;
  photos?: string[];
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  floor_area?: number;
  land_area?: number;
}

export interface EnhancedData {
  photos?: string[];
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  floor_area?: number;
  land_area?: number;
}

// Zod schema for Property
export const PropertySchema = z.object({
  id: z.string(),
  source_url: z.string(),
  address: z.string().optional(),
  photos: z.array(z.string()).optional(),
  description: z.string().optional().nullable(),
  bedrooms: z.number().optional().nullable(),
  bathrooms: z.number().optional().nullable(),
  floor_area: z.number().optional().nullable(),
  land_area: z.number().optional().nullable(),
});

// Zod schema for EnhancedData
export const EnhancedDataSchema = z.object({
  photos: z.array(z.string()).optional(),
  description: z.string().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  floor_area: z.number().optional(),
  land_area: z.number().optional(),
});
