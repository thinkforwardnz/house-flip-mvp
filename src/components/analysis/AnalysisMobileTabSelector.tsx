
import React from "react";
import { Select, SelectGroup, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { TabsListProps } from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const MOBILE_TABS = [
  { label: "Overview", value: "overview" },
  { label: "Market Analysis", value: "cma" },
  { label: "Renovation", value: "renovation" },
  { label: "Offer Calculation", value: "offer" },
  { label: "Risk Assessment", value: "risk" },
  { label: "Data Collection", value: "data" },
];

interface AnalysisMobileTabSelectorProps extends TabsListProps {
  tab: string;
  onTabChange: (val: string) => void;
  className?: string;
}

const AnalysisMobileTabSelector = ({ tab, onTabChange, className }: AnalysisMobileTabSelectorProps) => (
  <div className={cn("block md:hidden w-full mb-2", className)}>
    <Select value={tab} onValueChange={onTabChange}>
      <SelectTrigger className="w-full rounded-xl bg-input-bg border border-gray-200 text-navy-dark font-semibold text-base px-3 py-1">
        <SelectValue />
      </SelectTrigger>
      <SelectContent side="bottom" className="z-50 bg-white shadow-md rounded-xl border border-gray-100">
        <SelectGroup>
          {MOBILE_TABS.map(t => (
            <SelectItem 
              value={t.value} 
              key={t.value}
              className="rounded-lg font-medium px-3 py-2"
            >
              {t.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
);

export default AnalysisMobileTabSelector;
