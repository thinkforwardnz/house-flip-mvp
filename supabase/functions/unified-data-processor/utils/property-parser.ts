
// Property data parsing utilities

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
