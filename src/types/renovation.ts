
export interface RenovationOption {
  selected: boolean;
  cost: number;
  value_add_percent: number;
  description?: string;
}

export interface RenovationSelections {
  kitchen?: RenovationOption;
  bathroom?: RenovationOption;
  flooring?: RenovationOption;
  painting?: RenovationOption;
  add_bedroom?: RenovationOption;
  [key: string]: RenovationOption | undefined;
}

export const DEFAULT_RENOVATION_OPTIONS: Record<string, Omit<RenovationOption, 'selected'>> = {
  kitchen: {
    cost: 25000,
    value_add_percent: 6,
    description: 'Complete kitchen renovation with new appliances, cabinets, and countertops'
  },
  bathroom: {
    cost: 15000,
    value_add_percent: 4,
    description: 'Full bathroom renovation including fixtures, tiling, and vanity'
  },
  flooring: {
    cost: 8000,
    value_add_percent: 2.5,
    description: 'Replace flooring throughout the property'
  },
  painting: {
    cost: 5000,
    value_add_percent: 1.5,
    description: 'Interior and exterior painting'
  },
  add_bedroom: {
    cost: 35000,
    value_add_percent: 20,
    description: 'Add an additional bedroom with closet and proper egress'
  }
};
