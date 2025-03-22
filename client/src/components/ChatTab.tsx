
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { User, BookOpenText, Send, Loader2, Bot, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatTab() {
  const { toast } = useToast();
  const initialMessage: Message = { 
    role: 'assistant', 
    content: 'Hello! I\'m your AI study assistant. Ask me questions about your document or select a suggested topic below.' 
  };
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions] = useState<string[]>([
    "Explain the key concepts in this document",
    "Summarize the main points",
    "What are the most important terms to remember?",
    "Create a quiz about this content",
    "How can I better understand this material?"
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // In a real implementation, this would connect to your backend
      // For now, we'll simulate a response
      setTimeout(() => {
        const randomResponses = [
          "I've analyzed the document, and the key concepts include quantitative analysis, theoretical models, and empirical evidence.",
          "Based on your document, I'd recommend focusing on these main points: 1) Methodology, 2) Results interpretation, and 3) Applications.",
          "Let me help you understand this material better. The most important aspect is understanding how the theories connect to real-world applications.",
          "Great question! The document discusses several approaches to problem-solving, with an emphasis on critical thinking and systematic analysis.",
          "I've created a summary of the document. It covers the introduction to the topic, methodology used, key findings, and conclusions with implications for future research."
        ];
        
        const responseIndex = Math.floor(Math.random() * randomResponses.length);
        const assistantMessage: Message = {
          role: 'assistant', 
          content: randomResponses[responseIndex]
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="h-full flex flex-col rounded-lg bg-white overflow-hidden">
      <div className="bg-primary text-white p-4 flex items-center space-x-2">
        <Bot className="h-5 w-5" />
        <h3 className="font-medium">AI Study Assistant</h3>
      </div>
      
      <ScrollArea className="flex-1 p-4 h-[400px]">
        <div className="space-y-4 pb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full mr-2 ${
                  msg.role === 'user' ? 'bg-primary ml-2' : 'bg-gray-200'
                }`}>
                  {msg.role === 'user' ? 
                    <User className="h-4 w-4 text-white" /> : 
                    <Sparkles className="h-4 w-4 text-primary" />
                  }
                </div>
                <div className={`p-3 rounded-lg whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      
      {suggestedQuestions.length > 0 && !isLoading && messages.length < 3 && (
        <div className="px-4 py-2 bg-gray-50 border-t">
          <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                className="text-xs bg-white text-primary border border-primary/30 rounded-full px-3 py-1 hover:bg-primary/5 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2 items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your document..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            size="icon"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
