
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, DollarSign, FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const OfferBuilder = () => {
  const [offerPrice, setOfferPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [settlementDate, setSettlementDate] = useState<Date>();
  const [possessionDate, setPossessionDate] = useState<Date>();
  
  // Critical Conditions
  const [dueDiligenceCondition, setDueDiligenceCondition] = useState('');
  const [financeCondition, setFinanceCondition] = useState('');
  const [financeType, setFinanceType] = useState('');
  
  // Property Investigation Conditions
  const [limCondition, setLimCondition] = useState('');
  const [buildersReport, setBuildersReport] = useState('');
  const [titleReview, setTitleReview] = useState('');
  const [valuationCondition, setValuationCondition] = useState('');
  const [insuranceCondition, setInsuranceCondition] = useState('');
  
  // Chattels and Inclusions
  const [includedChattels, setIncludedChattels] = useState('');
  const [excludedItems, setExcludedItems] = useState('');
  
  // Additional Conditions
  const [customConditions, setCustomConditions] = useState('');

  const handleSubmitOffer = () => {
    console.log('Submitting comprehensive offer:', {
      offerPrice,
      deposit,
      settlementDate,
      possessionDate,
      dueDiligenceCondition,
      financeCondition,
      financeType,
      limCondition,
      buildersReport,
      titleReview,
      valuationCondition,
      insuranceCondition,
      includedChattels,
      excludedItems,
      customConditions
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Offer Details */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#2563EB]" />
            Offer Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="offerPrice" className="text-sm font-medium text-gray-700">
                Offer Price *
              </Label>
              <Input
                id="offerPrice"
                type="number"
                placeholder="650,000"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                className="border-gray-300"
              />
              <p className="text-xs text-gray-500">Enter your offer amount in dollars</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit" className="text-sm font-medium text-gray-700">
                Deposit Amount *
              </Label>
              <Input
                id="deposit"
                type="number"
                placeholder="65,000"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                className="border-gray-300"
              />
              <p className="text-xs text-gray-500">Typically 10% of offer price</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Settlement Date *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-gray-300",
                      !settlementDate && "text-gray-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {settlementDate ? format(settlementDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border border-gray-200 shadow-md z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={settlementDate}
                    onSelect={setSettlementDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-gray-500">When ownership transfers</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Possession Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-gray-300",
                      !possessionDate && "text-gray-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {possessionDate ? format(possessionDate, "PPP") : <span>Same as settlement</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border border-gray-200 shadow-md z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={possessionDate}
                    onSelect={setPossessionDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-gray-500">When you can move in (if different)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Conditions */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-[#FF9800]" />
            Critical Conditions
          </CardTitle>
          <p className="text-sm text-gray-600">Essential conditions for property protection</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Due Diligence Condition *
            </Label>
            <Select value={dueDiligenceCondition} onValueChange={setDueDiligenceCondition}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Select due diligence timeframe" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-md z-50">
                <SelectItem value="5days">5 working days</SelectItem>
                <SelectItem value="10days">10 working days (recommended)</SelectItem>
                <SelectItem value="15days">15 working days</SelectItem>
                <SelectItem value="20days">20 working days</SelectItem>
                <SelectItem value="none">No due diligence condition</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Time to investigate all aspects of the property</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Finance Condition
              </Label>
              <Select value={financeCondition} onValueChange={setFinanceCondition}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Select finance condition" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-md z-50">
                  <SelectItem value="none">No Finance Condition (Cash Purchase)</SelectItem>
                  <SelectItem value="14days">14 days finance approval</SelectItem>
                  <SelectItem value="21days">21 days finance approval</SelectItem>
                  <SelectItem value="30days">30 days finance approval</SelectItem>
                  <SelectItem value="45days">45 days finance approval</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Finance Type
              </Label>
              <Select value={financeType} onValueChange={setFinanceType}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Type of finance approval" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-md z-50">
                  <SelectItem value="preapproval">Pre-approval required</SelectItem>
                  <SelectItem value="fullapproval">Full approval required</SelectItem>
                  <SelectItem value="existing">Existing pre-approval</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Investigation Conditions */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#2563EB]" />
            Property Investigation Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                LIM Report Condition
              </Label>
              <Select value={limCondition} onValueChange={setLimCondition}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Select LIM condition" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-md z-50">
                  <SelectItem value="none">No LIM Condition</SelectItem>
                  <SelectItem value="5days">5 working days LIM review</SelectItem>
                  <SelectItem value="10days">10 working days LIM review</SelectItem>
                  <SelectItem value="15days">15 working days LIM review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Builder's/Building Report
              </Label>
              <Select value={buildersReport} onValueChange={setBuildersReport}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Select building inspection" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-md z-50">
                  <SelectItem value="none">No Building Report</SelectItem>
                  <SelectItem value="7days">7 days building report</SelectItem>
                  <SelectItem value="10days">10 days building report</SelectItem>
                  <SelectItem value="14days">14 days building report</SelectItem>
                  <SelectItem value="pest">Building + Pest Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Title/Legal Review
              </Label>
              <Select value={titleReview} onValueChange={setTitleReview}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Select title review period" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-md z-50">
                  <SelectItem value="none">No Title Review</SelectItem>
                  <SelectItem value="5days">5 working days</SelectItem>
                  <SelectItem value="10days">10 working days</SelectItem>
                  <SelectItem value="lawyer">Subject to lawyer approval</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Valuation Condition
              </Label>
              <Select value={valuationCondition} onValueChange={setValuationCondition}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Select valuation requirement" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-md z-50">
                  <SelectItem value="none">No Valuation Required</SelectItem>
                  <SelectItem value="bank">Bank valuation satisfactory</SelectItem>
                  <SelectItem value="independent">Independent valuation required</SelectItem>
                  <SelectItem value="minimum">Valuation at or above offer price</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Insurance Condition
            </Label>
            <Select value={insuranceCondition} onValueChange={setInsuranceCondition}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Select insurance requirement" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-md z-50">
                <SelectItem value="none">No Insurance Condition</SelectItem>
                <SelectItem value="obtain">Ability to obtain satisfactory insurance</SelectItem>
                <SelectItem value="existing">Existing insurance transferable</SelectItem>
                <SelectItem value="special">Special insurance requirements</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Chattels and Inclusions */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Chattels & Inclusions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="includedChattels" className="text-sm font-medium text-gray-700">
              Included Chattels/Items
            </Label>
            <Textarea
              id="includedChattels"
              placeholder="e.g., Fixed floor coverings, light fittings, curtains, dishwasher, garden shed..."
              value={includedChattels}
              onChange={(e) => setIncludedChattels(e.target.value)}
              className="border-gray-300 min-h-[100px]"
            />
            <p className="text-xs text-gray-500">List all items to be included in the sale</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excludedItems" className="text-sm font-medium text-gray-700">
              Excluded Items
            </Label>
            <Textarea
              id="excludedItems"
              placeholder="e.g., Personal belongings, specific artwork, outdoor furniture..."
              value={excludedItems}
              onChange={(e) => setExcludedItems(e.target.value)}
              className="border-gray-300"
            />
            <p className="text-xs text-gray-500">List any items specifically excluded from the sale</p>
          </div>
        </CardContent>
      </Card>

      {/* Additional Conditions */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Additional Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customConditions" className="text-sm font-medium text-gray-700">
              Custom Conditions
            </Label>
            <Textarea
              id="customConditions"
              placeholder="Add any additional conditions specific to this property..."
              value={customConditions}
              onChange={(e) => setCustomConditions(e.target.value)}
              className="border-gray-300 min-h-[100px]"
            />
            <p className="text-xs text-gray-500">Any other conditions you want to include in your offer</p>
          </div>
        </CardContent>
      </Card>

      {/* Submit Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
        <Button variant="outline" className="border-gray-300 text-gray-600">
          Save Draft
        </Button>
        <Button 
          onClick={handleSubmitOffer}
          className="bg-[#FF9800] hover:bg-[#FF9800]/90 text-white"
        >
          Submit Offer
        </Button>
      </div>
    </div>
  );
};

export default OfferBuilder;
