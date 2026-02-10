
import React, { useState, useRef, useEffect } from 'react';
import { chatWithContext } from '../services/geminiService';
import { ChatMessage, DistilledMap } from '../types';

interface ChatTabProps {
  distilledMap: DistilledMap | null;
}

export const ChatTab: React.FC<ChatTabProps> = ({ distilledMap }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !distilledMap) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithContext(input, distilledMap);
      setMessages(prev => [...prev, { role: 'assistant', content: response || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "An error occurred." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="text-center py-12 px-8">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🤖</div>
            <h3 className="font-bold text-gray-800 mb-2">Contextual Assistant</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              I have scanned {distilledMap?.interactiveElements.length || 0} interactive elements. 
              Ask me "How do I..." or "Where is the..." and I'll guide you.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] rounded-2xl p-4 text-xs shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-gray-100 text-gray-800 rounded-bl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl p-4 flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse [animation-delay:-0.3s]" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-gray-50">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={!distilledMap ? "Scanning page..." : "Ask about the page..."}
            disabled={!distilledMap || isLoading}
            className="w-full rounded-2xl border-gray-200 bg-white text-xs px-4 py-3.5 focus:ring-2 focus:ring-indigo-600 transition pr-12 disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !distilledMap}
            className="absolute right-2 top-1.5 bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition shadow-lg disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-90" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
