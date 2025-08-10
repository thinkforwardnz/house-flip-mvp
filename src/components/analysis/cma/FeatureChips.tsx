import React from 'react';
import { Bed, Bath, Ruler, Square, Car } from 'lucide-react';

interface FeatureChipsProps {
  bedrooms?: number | null;
  bathrooms?: number | null;
  floor_area?: number | null; // m²
  land_area?: number | null;  // m²
  parking?: string | null;
}

const Chip: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-sm text-foreground">
    <span className="h-4 w-4 text-muted-foreground">{icon}</span>
    <span className="whitespace-nowrap">{label}</span>
  </span>
);

const FeatureChips: React.FC<FeatureChipsProps> = ({ bedrooms, bathrooms, floor_area, land_area, parking }) => {
  const chips: { icon: React.ReactNode; label: string }[] = [];

  if (bedrooms != null) chips.push({ icon: <Bed className="h-4 w-4" />, label: `${bedrooms} ${bedrooms === 1 ? 'Bed' : 'Beds'}` });
  if (bathrooms != null) chips.push({ icon: <Bath className="h-4 w-4" />, label: `${bathrooms} ${bathrooms === 1 ? 'Bath' : 'Baths'}` });
  if (floor_area != null) chips.push({ icon: <Ruler className="h-4 w-4" />, label: `${floor_area}m² Floor` });
  if (land_area != null) chips.push({ icon: <Square className="h-4 w-4" />, label: `${land_area}m² Land` });
  if (parking) chips.push({ icon: <Car className="h-4 w-4" />, label: parking });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 overflow-x-auto">
      {chips.map((c, idx) => (
        <Chip key={idx} icon={c.icon} label={c.label} />
      ))}
    </div>
  );
};

export default FeatureChips;
