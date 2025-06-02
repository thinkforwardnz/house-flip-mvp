
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, DollarSign, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const OfferBuilder = () => {
  const [offerPrice, setOfferPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [financeCondition, setFinanceCondition] = useState('');
  const [limCondition, setLimCondition] = useState('');
  const [buildersReport, setBuildersReport] = useState('');
  const [settlementDate, setSettlementDate] = useState<Date>();

  const handleSubmitOffer = () => {
    console.log('Submitting offer:', {
      offerPrice,
      deposit,
      financeCondition,
      limCondition,
      buildersReport,
      settlementDate
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offer Details */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[#1B5E20]" />
              Offer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="offerPrice" className="text-sm font-medium text-gray-700">
                  Offer Price
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
                  Deposit Amount
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

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Preferred Settlement Date
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
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={settlementDate}
                    onSelect={setSettlementDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-gray-500">Most settlements take 4-6 weeks</p>
            </div>
          </CardContent>
        </Card>

        {/* Conditions */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#1B5E20]" />
              Offer Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Finance Condition
              </Label>
              <Select value={financeCondition} onValueChange={setFinanceCondition}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Select finance condition" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-md">
                  <SelectItem value="none">No Finance Condition</SelectItem>
                  <SelectItem value="14days">14 days finance approval</SelectItem>
                  <SelectItem value="21days">21 days finance approval</SelectItem>
                  <SelectItem value="30days">30 days finance approval</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                LIM Report Condition
              </Label>
              <Select value={limCondition} onValueChange={setLimCondition}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Select LIM condition" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-md">
                  <SelectItem value="none">No LIM Condition</SelectItem>
                  <SelectItem value="7days">7 days LIM review</SelectItem>
                  <SelectItem value="10days">10 days LIM review</SelectItem>
                  <SelectItem value="14days">14 days LIM review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Builder's Report
              </Label>
              <Select value={buildersReport} onValueChange={setBuildersReport}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Select builder's report condition" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-md">
                  <SelectItem value="none">No Builder's Report</SelectItem>
                  <SelectItem value="7days">7 days builder's report</SelectItem>
                  <SelectItem value="10days">10 days builder's report</SelectItem>
                  <SelectItem value="14days">14 days builder's report</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Offer */}
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
