
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, TestTube, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';

export type TestStatus = 'untested' | 'testing' | 'success' | 'failed';

interface ApiConfigInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  isSecret: boolean;
  placeholder?: string;
  helpText: string;
  link?: string;
  onTest: (id: string, value: string) => void;
  testStatus: TestStatus;
}

const ApiConfigInput = ({ id, label, value, onChange, isSecret, placeholder, helpText, link, onTest, testStatus }: ApiConfigInputProps) => {
  const [showSecret, setShowSecret] = useState(false);

  const getStatusIcon = () => {
    switch (testStatus) {
      case 'testing': return <Loader2 className="animate-spin text-blue-500" />;
      case 'success': return <CheckCircle className="text-green-500" />;
      case 'failed': return <XCircle className="text-red-500" />;
      default: return <TestTube className="text-gray-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 items-start">
      <div className="space-y-1">
        <Label htmlFor={id} className="font-semibold text-md text-navy-dark">{label}</Label>
        <p className="text-sm text-gray-500">{helpText}</p>
        {link && (
            <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                Get your key <ExternalLink className="h-3 w-3" />
            </a>
        )}
      </div>
      <div className="md:col-span-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <Input
              id={id}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              type={isSecret && !showSecret ? 'password' : 'text'}
              className="pr-10"
            />
            {isSecret && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-500 hover:text-gray-800"
                onClick={() => setShowSecret(prev => !prev)}
                aria-label={showSecret ? "Hide secret" : "Show secret"}
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            )}
          </div>
          <Button 
            variant="outline" 
            onClick={() => onTest(id, value)} 
            disabled={testStatus === 'testing' || !value}
            className="w-[100px]"
          >
            {getStatusIcon()}
            <span>Test</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApiConfigInput;
