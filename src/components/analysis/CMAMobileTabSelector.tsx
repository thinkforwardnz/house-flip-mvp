import React from "react";
import { Select, SelectGroup, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const CMA_TABS = [
  { label: "Overview", value: "overview" },
  { label: "Subject Property", value: "subject" },
  { label: "Comparables", value: "comparables" },
  { label: "Analysis", value: "analysis" },
];

interface CMAMobileTabSelectorProps {
  activeView: string;
  onViewChange: (val: string) => void;
  className?: string;
}

const CMAMobileTabSelector = ({ activeView, onViewChange, className }: CMAMobileTabSelectorProps) => (
  <div className={cn("block sm:hidden w-full mb-4", className)}>
    <Select value={activeView} onValueChange={onViewChange}>
      <SelectTrigger className="w-full rounded-xl bg-input-bg border border-gray-200 text-navy-dark font-semibold text-base px-3 py-2">
        <SelectValue />
      </SelectTrigger>
      <SelectContent side="bottom" className="z-50 bg-white shadow-md rounded-xl border border-gray-100">
        <SelectGroup>
          {CMA_TABS.map(t => (
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

export default CMAMobileTabSelector;