
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, X, Send, Bot, User, HelpCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm your AI property mentor. I can help with renovation planning, market analysis, due diligence, and general NZ property investment advice. What would you like to know?",
      timestamp: new Date(),
      suggestions: [
        "What should I check in a LIM report?",
        "How do I calculate renovation ROI?",
        "What are key due diligence steps?",
        "Market timing advice for Auckland"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response with NZ property context
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase();
    let response = "";
    let suggestions: string[] = [];

    if (input.includes('lim') || input.includes('land information')) {
      response = "A LIM report is crucial for NZ property purchases. Key things to check: \n\n• Zoning and permitted uses\n• Building consents and code compliance\n• Flood zones and natural hazards\n• Outstanding notices or compliance issues\n• Property boundaries and easements\n\nRed flags include unconsented work, flooding history, or outstanding compliance orders.";
      suggestions = ["What about building reports?", "Due diligence timeline help", "Valuation tips"];
    } else if (input.includes('roi') || input.includes('return')) {
      response = "Calculate renovation ROI using: \n\nROI = (After Renovation Value - Purchase Price - Renovation Costs) / Total Investment × 100\n\nFor NZ flips, aim for 15-25% ROI minimum. Factor in:\n• Holding costs (rates, insurance)\n• Finance costs\n• Real estate fees (typically 2-4%)\n• Marketing costs\n• Contingency (10-15% of reno budget)";
      suggestions = ["Budget planning tips", "Market timing advice", "Renovation priorities"];
    } else if (input.includes('due diligence')) {
      response = "NZ due diligence essentials (typically 10-15 working days):\n\n✓ LIM report review\n✓ Building/pest inspection\n✓ Finance pre-approval\n✓ Insurance confirmation\n✓ Title search\n✓ Zoning/council plans check\n✓ Market comparable analysis\n\nDon't rush - use the full due diligence period to avoid costly mistakes.";
      suggestions = ["Finance approval tips", "Building inspection checklist", "Settlement preparation"];
    } else if (input.includes('market') || input.includes('timing')) {
      response = "NZ property market timing considerations:\n\n• Spring (Sep-Nov) typically has more listings\n• Summer (Dec-Feb) can have premium prices\n• Avoid major holidays for settlements\n• Watch RBNZ policy announcements\n• Monitor local council developments\n\nFocus on property fundamentals over perfect timing - good deals exist year-round.";
      suggestions = ["Property selection criteria", "Negotiation strategies", "Renovation timing"];
    } else {
      response = "I can help with various aspects of NZ property investment:\n\n• Due diligence and legal requirements\n• Renovation planning and budgeting\n• Market analysis and timing\n• Finance and insurance guidance\n• Compliance and council processes\n\nWhat specific area would you like guidance on?";
      suggestions = ["LIM report guidance", "ROI calculations", "Due diligence checklist", "Market insights"];
    }

    return {
      id: Date.now().toString(),
      type: 'ai',
      content: response,
      timestamp: new Date(),
      suggestions
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Widget */}
      {isOpen && (
        <Card className="fixed bottom-20 right-4 w-80 sm:w-96 h-[500px] bg-white border border-gray-200 shadow-lg z-50 flex flex-col">
          <CardHeader className="bg-[#1B5E20] text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Property Mentor
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-1 h-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-green-100">Get instant property investment guidance</p>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user' 
                      ? 'bg-[#1B5E20] text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="flex items-start gap-2">
                      {message.type === 'ai' && <Bot className="h-4 w-4 mt-0.5 text-[#1B5E20]" />}
                      {message.type === 'user' && <User className="h-4 w-4 mt-0.5" />}
                      <div className="text-sm whitespace-pre-line">{message.content}</div>
                    </div>
                    
                    {/* Suggestions */}
                    {message.suggestions && (
                      <div className="mt-3 space-y-2">
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="block w-full text-left text-xs bg-white/20 hover:bg-white/30 rounded px-2 py-1 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-[#1B5E20]" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about property investment, renovations, due diligence..."
                  className="resize-none min-h-[40px] max-h-[80px] text-sm border-gray-300 focus:border-[#1B5E20] focus:ring-[#1B5E20]"
                  rows={1}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-white px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-40 rounded-full w-14 h-14 shadow-lg transition-all duration-200 ${
          isOpen 
            ? 'bg-gray-600 hover:bg-gray-700' 
            : 'bg-[#1B5E20] hover:bg-[#1B5E20]/90'
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <div className="relative">
            <MessageSquare className="h-6 w-6 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF9800] rounded-full flex items-center justify-center">
              <HelpCircle className="h-2 w-2 text-white" />
            </div>
          </div>
        )}
      </Button>

      {/* Mobile: Hint Badge */}
      {!isOpen && (
        <div className="fixed bottom-20 right-4 z-30 sm:hidden">
          <Badge className="bg-[#FF9800] text-white text-xs whitespace-nowrap">
            Get help →
          </Badge>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
