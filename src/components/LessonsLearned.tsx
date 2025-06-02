
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, ThumbsUp, AlertTriangle, Save } from 'lucide-react';

const LessonsLearned = () => {
  const [whatWorked, setWhatWorked] = useState(`• Thorough property research saved time during due diligence
• Building strong relationships with contractors led to better pricing
• Marketing strategy with professional photos increased buyer interest`);
  
  const [whatToImprove, setWhatToImprove] = useState(`• Need better budget contingency planning for unexpected costs
• Should get building reports earlier in the process
• Communication with agent could be more frequent during listing period`);
  
  const [keyInsights, setKeyInsights] = useState(`• Local market responded well to modern kitchen and bathroom upgrades
• Auction method worked better than tender for this property type
• Weather delays added 2 weeks - factor into future timelines`);

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    console.log('Saving lessons learned...');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-[#FF9800]" />
            Lessons Learned
          </CardTitle>
          {isSaved && (
            <Badge className="bg-[#388E3C]/10 text-[#388E3C] border-[#388E3C]/20">
              Saved!
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* What Worked Well */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ThumbsUp className="h-4 w-4 text-[#388E3C]" />
            <h4 className="font-medium text-gray-900">What Worked Well</h4>
          </div>
          <Textarea
            value={whatWorked}
            onChange={(e) => setWhatWorked(e.target.value)}
            placeholder="Record what strategies, decisions, and approaches were successful..."
            className="min-h-[100px] border-gray-300 focus:border-[#1B5E20] focus:ring-[#1B5E20]"
          />
        </div>

        {/* What to Improve */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-[#FF9800]" />
            <h4 className="font-medium text-gray-900">What to Improve Next Time</h4>
          </div>
          <Textarea
            value={whatToImprove}
            onChange={(e) => setWhatToImprove(e.target.value)}
            placeholder="Note areas for improvement, challenges faced, and lessons for future deals..."
            className="min-h-[100px] border-gray-300 focus:border-[#1B5E20] focus:ring-[#1B5E20]"
          />
        </div>

        {/* Key Insights */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-[#1B5E20]" />
            <h4 className="font-medium text-gray-900">Key Market Insights</h4>
          </div>
          <Textarea
            value={keyInsights}
            onChange={(e) => setKeyInsights(e.target.value)}
            placeholder="Document market trends, buyer preferences, and local insights discovered..."
            className="min-h-[100px] border-gray-300 focus:border-[#1B5E20] focus:ring-[#1B5E20]"
          />
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-200">
          <Button 
            onClick={handleSave}
            className="bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Lessons Learned
          </Button>
        </div>

        {/* Quick Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-2">💡 Pro Tips for Next Deal</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Document decisions and outcomes in real-time</li>
            <li>• Track contractor performance for future reference</li>
            <li>• Note seasonal market patterns and timing insights</li>
            <li>• Keep records of successful marketing strategies</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonsLearned;
